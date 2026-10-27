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

/** Upload timeout scales with file size; the 10-minute cap is total time, not an idle timeout. */
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

// Ba status mà proxy/CDN đứng trước API trả khi chính API không đáp được.
const GATEWAY_DOWN_STATUSES = new Set([502, 503, 504])

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
  // 204/205/304 không có body, nhưng FastAPI vẫn gắn `content-type: application/json`
  // (đã reproduce với uvicorn + DELETE status_code=204): gọi response.json() ở đó ném
  // SyntaxError "Unexpected end of JSON input" — requester THÀNH CÔNG (204) lại hiện ra
  // như lỗi. Vì vậy: không body thì trả null, và parse từ text thay vì json().
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

/** 403 mang mã `captcha_required` của BE (app/services/anon_captcha.py) = cần giải ải. */
function isCaptchaChallenge(error: unknown): boolean {
  if (!(error instanceof ApiClientError) || error.status !== 403) return false
  const detail = (error.details as { detail?: unknown } | undefined)?.detail
  return (detail as { code?: unknown } | undefined)?.code === 'captcha_required'
}

/**
 * Gắn token vào body của request đã gửi: BE đọc `cf_token` từ form-data HOẶC JSON body
 * (image.py:49-64). `set` chứ không `append` để một body gửi lại hai lần không mang hai token.
 */
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
  // shortcut: request không body mà bị chặn ải thì retry sẽ ăn 403 tiếp (UI báo lỗi
  // captcha). Không route nào gate ải ở tình trạng đó — /image|media|convert-file đều là
  // FormData. Upgrade khi có endpoint GET bị gate.
  return init
}

export class ApiClient {
  /**
   * Hai đường vào của một ải Turnstile, cùng một điểm duy nhất:
   * - CHỦ ĐỘNG: BE đã báo `captcha_required` lúc xin phiên ẩn danh → xin token TRƯỚC khi gửi,
   *   người dùng giải ải rồi hãy tải tệp lên (upload vài trăm MB ăn 403 là phí băng thông của
   *   cả hai phía).
   * - PHẢN ỨNG: 403 `{"detail": {"code": "captcha_required"}}` (app/services/anon_captcha.py)
   *   → mở panel xác minh rồi retry ĐÚNG MỘT lần với token gắn vào body.
   * Không vòng lặp: 403 lần thứ hai (token hỏng/hết hạn/mới mà BE đã tiêu) phải ném thẳng cho
   * UI, vì tự động hỏi lại sinh ra đúng cái bão request mà ải này chặn.
   */
  private async request<T>(
    endpoint: string,
    init: RequestInit,
    options?: RequestOptions,
  ): Promise<T> {
    // Bearer quyết định: user đăng nhập không bao giờ đi qua ải (BE cũng không hỏi họ).
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
          // Phiên ẩn danh GĐ1 là cookie HttpOnly (`ofs_anon`) mà JS không đọc được: browser
          // chỉ gửi nó khi request tự khai credentials. Mặc định 'same-origin' = API trên
          // host khác (api.oneforall.io.vn vs FE) không kèm cookie → mọi job ẩn danh 401.
          // BE phải đặt BACKEND_CORS_ORIGINS là danh sách tường minh (không '*') thì
          // allow_credentials mới bật, nếu không mọi request bị CORS chặn.
          credentials: 'include',
        })
      } catch (err) {
        // AbortError = timeout nội bộ (30s cho call JSON, trần theo dung lượng cho upload)
        // hoặc caller hủy — một cú upload nặng trên mạng chậm cũng ra hình này, nên không được
        // tính là hạ tầng chết. Ngoài ra mới là fetch chết thật (BE sập, proxy chết, laptop
        // offline).
        if ((err as Error)?.name !== 'AbortError') reportBackend('down')
        throw err
      }
      // Backend đã trả lời HTTP thì còn sống — kể cả 5xx. 502/503/504 chỉ là "hạ tầng
      // sập" khi KẺ TRẢ LỜI không phải app ta: proxy/Cloudflare trả HTML error page,
      // còn FastAPI luôn trả JSON {"detail": ...}, tức app còn sống và vừa tự báo lỗi
      // của chính nó (vd /media/url-info khi oEmbed của TikTok drop connection, hoặc
      // 503 overload-guard từ chối nhận thêm job).
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
      { timeoutMs: uploadBudgetMs(formData), ...options },
    )
  }
}

// Instance dùng chung cho toàn bộ ứng dụng
export const apiClient = new ApiClient()
