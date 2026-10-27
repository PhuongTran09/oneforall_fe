import { useSyncExternalStore } from 'react'
import { t } from '../i18n/langStore'
import { env } from '../utils/env'
import { getAccessToken } from './authStore'

/** Challenge Turnstile theo yêu cầu — cùng mô hình singleton với errorPopupStore/toastStore: */
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

/** Mở panel xác minh và chờ token. Cửa này đóng khi FE chưa được cấu hình (cờ tắt/site key */
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

/** Token đã giải sẵn lúc người dùng kéo/chọn tệp. Turnstile thụ token vài phút và BE tính */
const WARM_TTL_MS = 120_000
let warm: { token: string; at: number } | null = null

/** Mở ải SỚM ngay khi có tệp thay vì đợi bấm "Bắt đầu xử lý": upload vài trăm MB rồi mới ăn */
export function warmCaptchaToken(): void {
  if (!requiredByBackend || warm || getAccessToken()) return
  void requestCaptchaToken().then(
    (token) => {
      warm = { token, at: Date.now() }
    },
    () => {
      warm = null
    },
  )
}

/** Ăn token đã giải sẵn; null khi chưa có hoặc đã quá WARM_TTL_MS. */
export function takeWarmCaptchaToken(): string | null {
  const entry = warm
  warm = null
  return entry && Date.now() - entry.at < WARM_TTL_MS ? entry.token : null
}

/** Resolve the active challenge, then open the next queued request with a fresh token. */
export function fulfillCaptchaToken(token: string): void {
  const current = active
  const next = queue.shift()
  active = next ? { id: nextId++, slot: next } : null
  emit()
  current?.slot.resolve(token)
}

/** Modal không lấy được token (Cloudflare từ chối, token hết hạn, user đóng, script lỗi). */
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
