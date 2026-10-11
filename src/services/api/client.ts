import { env } from '../../utils/env'
import {
  ApiClientError,
  type FastApiErrorResponse,
  type RequestOptions,
} from './types'

const REQUEST_TIMEOUT_MS = 30000

export function resolveUrl(endpoint: string, params?: RequestOptions['params']): string {
  const base = env.apiBaseUrl.replace(/\/+$/, '')
  let path = endpoint.trim()

  // Chuẩn hóa đường dẫn: nếu endpoint đã chứa prefix base (ví dụ /api) thì không thêm lặp lại
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
  const contentType = response.headers.get('content-type') || ''
  if (contentType.includes('application/json')) {
    return (await response.json()) as T
  }
  const text = await response.text()
  return text as unknown as T
}

function extractFastApiErrorMessage(errorData: unknown, statusText: string): string {
  if (typeof errorData === 'object' && errorData !== null) {
    const payload = errorData as FastApiErrorResponse
    if (typeof payload.detail === 'string') {
      return payload.detail
    }
    if (Array.isArray(payload.detail)) {
      // Format lỗi validation chuẩn từ FastAPI Pydantic
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

export class ApiClient {
  private async request<T>(
    endpoint: string,
    init: RequestInit,
    options?: RequestOptions,
  ): Promise<T> {
    const url = resolveUrl(endpoint, options?.params)

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

    // Kết hợp signal nếu caller cung cấp signal riêng
    let relayAbort: (() => void) | undefined
    if (options?.signal) {
      relayAbort = () => controller.abort()
      options.signal.addEventListener('abort', relayAbort, { once: true })
    }

    const headers = new Headers(init.headers)
    if (!headers.has('Accept')) {
      headers.set('Accept', 'application/json')
    }

    try {
      const response = await fetch(url, {
        ...init,
        headers,
        signal: controller.signal,
      })

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

  /**
   * Hỗ trợ upload tệp tin (FormData) cho các tính năng image/video/convert
   */
  public upload<T>(endpoint: string, formData: FormData, options?: RequestOptions): Promise<T> {
    return this.request<T>(
      endpoint,
      {
        method: 'POST',
        body: formData,
        ...options,
      },
      options,
    )
  }
}

// Instance dùng chung cho toàn bộ ứng dụng
export const apiClient = new ApiClient()
