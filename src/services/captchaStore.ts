import { useSyncExternalStore } from 'react'
import { t } from '../i18n/langStore'
import { env } from '../utils/env'

/**
 * Challenge Turnstile theo yêu cầu — cùng mô hình singleton với errorPopupStore/toastStore:
 * module thuần gọi được ngoài React, modal chỉ render khi có request đang chờ.
 *
 * BE (chống spam GĐ1) là nguồn duy nhất của câu hỏi "bao giờ cần ải": POST /anonymous/session
 * — route FE vốn đã gọi trước MỌI lần tạo job — trả `captcha_required`. Khi flag bật, request
 * tạo job xin token TRƯỚC khi gửi (đỡ phải upload vài trăm MB rồi mới ăn 403). Lưới dự phòng
 * vẫn còn: flag lấy lúc xin phiên nên có thể trễ khi BE chạy ngưỡng > 0, và request gặp
 * 403 `captcha_required` vẫn mở panel rồi retry MỘT lần với token.
 *
 * Token là single-use (BE giữ sha256 của token đã tiêu trong `anon_captcha._consumed_tokens`),
 * nên hai request đua nhau KHÔNG được dùng chung một token — request thứ hai sẽ ăn 403 replay.
 * Mỗi request bị gate có challenge RIÊNG và xếp hàng: panel vẫn chỉ có MỘT cái vì modal render
 * theo `active.id`, hết challenge này tới challenge kế tiếp.
 */
type Slot = {
  resolve: (token: string) => void
  reject: (error: Error) => void
}

let nextId = 1
let active: { id: number; slot: Slot } | null = null
const queue: Slot[] = []
const listeners = new Set<() => void>()
// BE trả lời qua `captcha_required` của /anonymous/session — FE không tự đoán chính sách.
let requiredByBackend = false

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
  return active?.id ?? null
}

/** BE nói phiên ẩn danh hiện tại phải kèm token ở MỌI job — xem anonymousSessionApi. */
export function setCaptchaRequiredByBackend(required: boolean): void {
  requiredByBackend = required
}

export function captchaRequiredByBackend(): boolean {
  return requiredByBackend
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
  let resolve!: (token: string) => void
  let reject!: (error: Error) => void
  const promise = new Promise<string>((settle, fail) => {
    resolve = settle
    reject = fail
  })
  const slot: Slot = { resolve, reject }
  if (active) queue.push(slot)
  else active = { id: nextId++, slot }
  emit()
  return promise
}

/**
 * Modal báo đã có token cho challenge hiện tại: trả đúng MỘT request chủ, rồi mở ngay
 * challenge cho người kế hàng (widget mới, token mới).
 * shortcut: request xếp hàng không có deadline riêng — nó chờ tới lượt rồi mới chạy timeout
 * HTTP của chính mình; nâng cấp khi có route gửi nhiều request gate cùng lúc.
 */
export function fulfillCaptchaToken(token: string): void {
  const current = active
  const next = queue.shift()
  active = next ? { id: nextId++, slot: next } : null
  emit()
  current?.slot.resolve(token)
}

/**
 * Modal không lấy được token (Cloudflare từ chối, token hết hạn, user đóng, script lỗi).
 * Cả hàng cùng chết theo: Cloudflare vừa nói không thì mở thêm widget chỉ để nhận lại lỗi đó.
 */
export function breakCaptcha(message: string): void {
  const current = active
  const waiting = queue.splice(0, queue.length)
  active = null
  emit()
  const error = new Error(message)
  current?.slot.reject(error)
  waiting.forEach((slot) => slot.reject(error))
}

export function useCaptchaChallenge(): number | null {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
}
