import { useSyncExternalStore } from 'react'
import { getSupabase, isSupabaseConfigured } from './supabase'
import type { Session } from '@supabase/supabase-js'

interface AuthState {
  session: Session | null
  ready: boolean
}

let state: AuthState = { session: null, ready: !isSupabaseConfigured }
const listeners = new Set<() => void>()

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

// Bootstrap một lần: lấy phiên hiện tại + nghe đổi phiên (Google redirect, OTP, logout).
if (isSupabaseConfigured) {
  const auth = getSupabase().auth
  auth.getSession().then(({ data }) => setState({ session: data.session, ready: true }))
  auth.onAuthStateChange((_event, session) => setState({ session, ready: true }))
}

export function useAuth() {
  return useSyncExternalStore(subscribe, getSnapshot)
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

/** Gửi mã OTP tới email — Supabase tự đăng ký nếu email chưa tồn tại. */
export async function sendOtp(email: string): Promise<void> {
  const { error } = await getSupabase().auth.signInWithOtp({ email })
  if (error) throw error
}

export async function verifyOtp(email: string, token: string): Promise<void> {
  const { error } = await getSupabase().auth.verifyOtp({ email, token, type: 'email' })
  if (error) throw error
}

export async function signOut(): Promise<void> {
  await getSupabase().auth.signOut()
}
