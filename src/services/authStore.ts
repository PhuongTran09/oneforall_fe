import { useSyncExternalStore } from 'react'
import { getSupabase, isSupabaseConfigured } from './supabase'
import { withLocale } from '../i18n/langStore'
import type { Session } from '@supabase/supabase-js'

interface AuthState {
  session: Session | null
  ready: boolean
  /** Phiên recovery hợp lệ đang hoạt động (PASSWORD_RECOVERY trong phiên này). */
  recovery: boolean
}

// Cờ recovery sống trong sessionStorage: PASSWORD_RECOVERY chỉ phát 1 lần lúc
// tiêu thụ hash — reload giữa trang reset vẫn phải giữ form đổi mật khẩu khả dụng.
const RECOVERY_KEY = 'ofa-recovery'

function readRecoveryFlag(): boolean {
  try {
    return sessionStorage.getItem(RECOVERY_KEY) === '1'
  } catch {
    return false
  }
}

function writeRecoveryFlag(on: boolean) {
  try {
    if (on) sessionStorage.setItem(RECOVERY_KEY, '1')
    else sessionStorage.removeItem(RECOVERY_KEY)
  } catch {
    // storage blocked → recovery chỉ sống trong bộ nhớ
  }
}

let state: AuthState = { session: null, ready: !isSupabaseConfigured, recovery: false }
const listeners = new Set<() => void>()

type AuthEventListener = (event: string, session: Session | null) => void
const eventListeners = new Set<AuthEventListener>()

function setState(next: AuthState) {
  state = next
  listeners.forEach((l) => l())
}

function subscribe(l: () => void) {
  listeners.add(l)
  return () => {
    listeners.delete(l)
  }
}

function getSnapshot(): AuthState {
  return state
}

// Bootstrap MỘT lần duy nhất (module singleton — không subscription trùng lặp):
// onAuthStateChange luôn phát INITIAL_SESSION hoặc SIGNED_OUT khi khởi động,
// nên ready chỉ bật sau khi phiên đầu tiên được xác định → UI không nhấp nháy.
if (isSupabaseConfigured) {
  const auth = getSupabase().auth
  state = { ...state, recovery: readRecoveryFlag() }
  auth.onAuthStateChange((event, session) => {
    if (event === 'PASSWORD_RECOVERY') writeRecoveryFlag(true)
    if (event === 'SIGNED_OUT') writeRecoveryFlag(false)
    const recovery = event === 'PASSWORD_RECOVERY' ? true : session ? readRecoveryFlag() : false
    // Phải lưu session TRƯỚC khi phát event: listener (vd. entitlementsStore) gọi API
    // ngay tại đây và apiClient đọc token từ state này — đảo ngược thứ tự là request
    // đầu tiên của phiên gửi đi không có Authorization → 401 → fetch lại mỗi lần focus tab.
    setState({ session, ready: true, recovery })
    eventListeners.forEach((l) => l(event, session))
  })
  // Fallback: nếu supabase-js không phát sự kiện khởi tạo (edge case), vẫn mở khóa UI.
  auth
    .getSession()
    .then(({ data }) => {
      if (!state.ready) setState({ session: data.session, ready: true, recovery: readRecoveryFlag() })
    })
    .catch(() => setState({ ...state, ready: true }))
}

/**
 * GoTrue trả lỗi qua URL hash khi verify link/OTP fail
 * (vd. #error=access_denied&error_code=otp_expired&error_description=...).
 * Đọc ngay lúc module khởi tạo — trước khi supabase-js kịp xoá hash.
 */
function readUrlAuthError(): { code: string; description: string } | null {
  try {
    const hash = window.location.hash.replace(/^#/, '')
    const params = new URLSearchParams(hash)
    const code = params.get('error_code') ?? params.get('error')
    if (!code) return null
    return { code, description: params.get('error_description') ?? '' }
  } catch {
    return null
  }
}

export const initialAuthUrlError: { code: string; description: string } | null = isSupabaseConfigured
  ? readUrlAuthError()
  : null

export function useAuth() {
  return useSyncExternalStore(subscribe, getSnapshot)
}

/** Đăng ký listener sự kiện Auth (vd. PASSWORD_RECOVERY) — trả về hàm hủy. */
export function subscribeAuthEvent(listener: AuthEventListener): () => void {
  eventListeners.add(listener)
  return () => {
    eventListeners.delete(listener)
  }
}

/** Access token hiện tại để ApiClient gắn vào Authorization header; null khi chưa đăng nhập. */
export function getAccessToken(): string | null {
  return state.session?.access_token ?? null
}

export async function signInWithGoogle(): Promise<void> {
  const { error } = await getSupabase().auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: `${window.location.origin}${window.location.pathname}` },
  })
  if (error) throw error
}

/**
 * Đăng ký bằng email + mật khẩu.
 * Trả về true nếu Supabase bật xác minh email (user phải bấm link trong email),
 * false nếu phiên có ngay (tắt xác minh) — KHÔNG tự coi tài khoản đã xác minh khi chưa có session.
 */
export async function signUp(email: string, password: string): Promise<boolean> {
  const { data, error } = await getSupabase().auth.signUp({
    email,
    password,
    options: { emailRedirectTo: `${window.location.origin}${window.location.pathname}` },
  })
  if (error) throw error
  return !data.session
}

/** Gửi lại email xác minh đăng ký (audience 'signup' — link hoặc code tùy cấu hình). */
export async function resendSignupOtp(email: string): Promise<void> {
  const { error } = await getSupabase().auth.resend({ type: 'signup', email })
  if (error) throw error
}

/** Xác minh OTP đăng ký — type bắt buộc là 'signup', không dùng chung với login/recovery. */
export async function verifySignupOtp(email: string, token: string): Promise<void> {
  const { error } = await getSupabase().auth.verifyOtp({ email, token, type: 'signup' })
  if (error) throw error
}

/** Đăng nhập bằng email + mật khẩu. */
export async function signInWithPassword(email: string, password: string): Promise<void> {
  const { error } = await getSupabase().auth.signInWithPassword({ email, password })
  if (error) throw error
}

/** Gửi mã OTP đăng nhập qua email (signInWithOtp → verify type 'email'). */
export async function sendLoginOtp(email: string): Promise<void> {
  const { error } = await getSupabase().auth.signInWithOtp({ email })
  if (error) throw error
}

/** Xác minh OTP đăng nhập — type 'email' (magic link/OTP), khác luồng signup. */
export async function verifyLoginOtp(email: string, token: string): Promise<void> {
  const { error } = await getSupabase().auth.verifyOtp({ email, token, type: 'email' })
  if (error) throw error
}

/** Yêu cầu liên kết đặt lại mật khẩu, redirect về route reset-password của frontend. */
export async function requestPasswordReset(email: string): Promise<void> {
  const redirectTo = `${window.location.origin}${withLocale('/auth/reset-password')}`
  const { error } = await getSupabase().auth.resetPasswordForEmail(email, { redirectTo })
  if (error) throw error
}

/**
 * Phiên recovery hợp lệ: supabase-js KHÔNG set recovery_sent trên session trả về
 * từ link recovery — nguồn sự thật là sự kiện PASSWORD_RECOVERY (cờ sessionStorage
 * để sống qua reload). Không cho đổi mật khẩu khi chưa có.
 */
export function hasRecoverySession(): boolean {
  return state.recovery && state.session != null
}

/** Đổi mật khẩu bằng updateUser — chỉ hợp lệ trong phiên recovery; xong là xóa cờ. */
export async function updatePassword(newPassword: string): Promise<void> {
  const { error } = await getSupabase().auth.updateUser({ password: newPassword })
  if (error) throw error
  writeRecoveryFlag(false)
  setState({ ...state, recovery: false })
}

export async function signOut(): Promise<void> {
  writeRecoveryFlag(false)
  setState({ ...state, recovery: false })
  await getSupabase().auth.signOut()
}
