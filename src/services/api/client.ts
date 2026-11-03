import { env } from '../../utils/env'
import { getAccessToken } from '../authStore'
import { reportBackend } from '../backendStatusStore'
import { captchaRequiredByBackend, requestCaptchaToken, takeWarmCaptchaToken } from '../captchaStore'
import {
  ApiClientError,
  type FastApiErrorResponse,
  type RequestOptions,
} from './types'

const REQUEST_TIMEOUT_MS = 30000


const UPLOAD_MIN_BYTES_PER_SECOND = 100_000
const UPLOAD_TIMEOUT_MAX_MS = 600_000

function uploadBudgetMs(formData: FormData): number {
  let bytes = 0
  for (const value of formData.values()) {
    if (value instanceof Blob) bytes += value.size
  }
  const transferMs = Math.ceil((bytes / UPLOAD_MIN_BYTES_PER_SECOND) * 1000)
  return Math.min(UPLOAD_TIMEOUT_MAX_MS, REQUEST_TIMEOUT_MS + transferMs)
}


const GATEWAY_DOWN_STATUSES = new Set([502, 503, 504])

export function resolveUrl(endpoint: string, params?: RequestOptions['params']): string {
  const base = env.apiBaseUrl.replace(/\/+$/, '')
  let path = endpoint.trim()


  if (base && path.startsWith(base)) {
    path = path.slice(base.length)
  }

  if (!path.startsWith('/')) {
    path = `/${path}`
  }

  const fullPath = `${base}${path}`

  if (!params) {
    return fullPath
  }

  const searchParams = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value))
    }
  }

  const queryString = searchParams.toString()
  return queryString ? `${fullPath}?${queryString}` : fullPath
}

async function parseResponseData<T>(response: Response): Promise<T> {
  if (response.status === 204 || response.status === 205 || response.status === 304) {
    return null as unknown as T
  }

  const text = await response.text()
  if (!text) {
    return null as unknown as T
  }

  const contentType = response.headers.get('content-type') || ''
  if (contentType.includes('application/json')) {
    return JSON.parse(text) as T
  }
  return text as unknown as T
}

function extractFastApiErrorMessage(errorData: unknown, statusText: string): string {
  if (typeof errorData === 'object' && errorData !== null) {
    const payload = errorData as FastApiErrorResponse
    if (typeof payload.detail === 'string') {
      return payload.detail
    }
    if (Array.isArray(payload.detail)) {
      const messages = payload.detail.map((err) => {
        const field = err.loc ? err.loc.join('.') : 'field'
        return `${field}: ${err.msg}`
      })
      return messages.join('; ')
    }
    if (typeof payload.message === 'string') {
      return payload.message
    }
  }
  return statusText || 'Request failed'
}

function isCaptchaChallenge(error: unknown): boolean {
  if (!(error instanceof ApiClientError) || error.status !== 403) return false
  const detail = (error.details as { detail?: unknown } | undefined)?.detail
  return (detail as { code?: unknown } | undefined)?.code === 'captcha_required'
}

function withCaptchaToken(init: RequestInit, token: string): RequestInit {
  const body = init.body
  if (body instanceof FormData) {
    body.set('cf_token', token)
    return init
  }
  if (typeof body === 'string') {
    try {
      const parsed = JSON.parse(body) as unknown
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        return { ...init, body: JSON.stringify({ ...(parsed as object), cf_token: token }) }
      }
    } catch {
      // body là chuỗi thô: không có chỗ nhét token, retry nguyên trạng.
    }
  }
  return init
}

export class ApiClient {
  private async request<T>(
    endpoint: string,
    init: RequestInit,
    options?: RequestOptions,
  ): Promise<T> {
    if (options?.captcha === 'proactive' && !getAccessToken() && captchaRequiredByBackend()) {
      init = withCaptchaToken(init, takeWarmCaptchaToken() ?? (await requestCaptchaToken()))
    }
    try {
      return await this.send<T>(endpoint, init, options)
    } catch (error) {
      if (!isCaptchaChallenge(error)) throw error
      const token = await requestCaptchaToken()
      return this.send<T>(endpoint, withCaptchaToken(init, token), options)
    }
  }

  private async send<T>(
    endpoint: string,
    init: RequestInit,
    options?: RequestOptions,
  ): Promise<T> {
    const url = resolveUrl(endpoint, options?.params)

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), options?.timeoutMs ?? REQUEST_TIMEOUT_MS)

    let relayAbort: (() => void) | undefined
    if (options?.signal) {
      relayAbort = () => controller.abort()
      options.signal.addEventListener('abort', relayAbort, { once: true })
    }

    const headers = new Headers(init.headers)
    if (!headers.has('Accept')) {
      headers.set('Accept', 'application/json')
    }
    const token = getAccessToken()
    if (token && !headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${token}`)
    }

    try {
      let response: Response
      try {
        response = await fetch(url, {
          ...init,
          headers,
          signal: controller.signal,
          credentials: 'include',
        })
      } catch (err) {
        if ((err as Error)?.name !== 'AbortError') reportBackend('down')
        throw err
      }
      const answeredByApp = (response.headers.get('content-type') ?? '').includes('application/json')
      reportBackend(GATEWAY_DOWN_STATUSES.has(response.status) && !answeredByApp ? 'down' : 'up')

      if (!response.ok) {
        let errorData: unknown
        try {
          errorData = await parseResponseData<unknown>(response)
        } catch {
          errorData = null
        }

        const message = extractFastApiErrorMessage(errorData, response.statusText)
        throw new ApiClientError(response.status, response.statusText, message, errorData)
      }

      return await parseResponseData<T>(response)
    } finally {
      clearTimeout(timeoutId)
      if (relayAbort && options?.signal) {
        options.signal.removeEventListener('abort', relayAbort)
      }
    }
  }

  public get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET', ...options }, options)
  }

  public post<T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<T> {
    const isFormData = body instanceof FormData
    const headers = new Headers(options?.headers)

    let requestBody: BodyInit | null | undefined
    if (isFormData) {
      requestBody = body
    } else if (body !== undefined) {
      headers.set('Content-Type', 'application/json')
      requestBody = JSON.stringify(body)
    }

    return this.request<T>(
      endpoint,
      {
        method: 'POST',
        headers,
        body: requestBody,
        ...options,
      },
      options,
    )
  }

  public put<T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<T> {
    const headers = new Headers(options?.headers)
    headers.set('Content-Type', 'application/json')

    return this.request<T>(
      endpoint,
      {
        method: 'PUT',
        headers,
        body: body !== undefined ? JSON.stringify(body) : undefined,
        ...options,
      },
      options,
    )
  }

  public patch<T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<T> {
    const headers = new Headers(options?.headers)
    headers.set('Content-Type', 'application/json')

    return this.request<T>(
      endpoint,
      {
        method: 'PATCH',
        headers,
        body: body !== undefined ? JSON.stringify(body) : undefined,
        ...options,
      },
      options,
    )
  }

  public delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE', ...options }, options)
  }

  public upload<T>(endpoint: string, formData: FormData, options?: RequestOptions): Promise<T> {
    return this.request<T>(
      endpoint,
      {
        method: 'POST',
        body: formData,
        ...options,
      },
      { timeoutMs: uploadBudgetMs(formData), ...options },
    )
  }
}

export const apiClient = new ApiClient()
