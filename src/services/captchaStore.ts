import { useSyncExternalStore } from 'react'
import { t } from '../i18n/langStore'
import { env } from '../utils/env'

/**
 * Challenge Turnstile theo yêu cầu — cùng mô hình singleton với errorPopupStore/toastStore:
 * module thuần gọi được ngoài React, modal chỉ render khi có request đang chờ.
 *
 * BE (GĐ1 chống spam) chỉ hỏi xác minh khi heuristic nổ — một phiên ẩn danh tạo >=3 job
 * trong 10 phút — nên widget KHÔNG nằm sẵn trong trang: request gặp 403 `captcha_required`
 * mới mở panel, lấy token, rồi retry MỘT lần. Token là single-use (BE giữ dấu vết token đã
 * tiêu), vì vậy một challenge chỉ có duy nhất một promise và hai request đua nhau cùng chờ
 * chung một panel chứ không mở hai cái.
 */
type Pending = {
  id: number
  promise: Promise<string>
  resolve: (token: string) => void
  reject: (error: Error) => void
}

let nextId = 1
let pending: Pending | null = null
const listeners = new Set<() => void>()

function emit() {
  listeners.forEach((listener) => listener())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

/** id của challenge đang mở (null = không có panel nào). */
function getSnapshot(): number | null {
  return pending?.id ?? null
}

/**
 * Mở panel xác minh và chờ token. Cửa này đóng khi FE chưa được cấu hình (cờ tắt/site key
 * trống) là chủ đích fail-closed: không có ải thì không có token, request cứ chết với thông
 * báo thay vì tự động cho qua.
 */
export function requestCaptchaToken(): Promise<string> {
  if (!env.turnstileEnabled || !env.turnstileSiteKey) {
    return Promise.reject(new Error(t('captcha.unavailable')))
  }
  if (!pending) {
    let resolve!: (token: string) => void
    let reject!: (error: Error) => void
    const promise = new Promise<string>((settle, fail) => {
      resolve = settle
      reject = fail
    })
    pending = { id: nextId++, promise, resolve, reject }
    emit()
  }
  return pending.promise
}

/** Modal báo đã có token: trả cho MỌI request đang chờ challenge này. */
export function fulfillCaptchaToken(token: string): void {
  const current = pending
  pending = null
  emit()
  current?.resolve(token)
}

/** Modal không lấy được token (Cloudflare từ chối, token hết hạn, user đóng, script lỗi). */
export function breakCaptcha(message: string): void {
  const current = pending
  pending = null
  emit()
  current?.reject(new Error(message))
}

export function useCaptchaChallenge(): number | null {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
}
