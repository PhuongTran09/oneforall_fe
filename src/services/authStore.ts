import { useSyncExternalStore } from 'react'
import { loadSupabase, isSupabaseConfigured } from './supabase'
import { withLocale } from '../i18n/langStore'
import type { Session } from '@supabase/supabase-js'

interface AuthState {
  session: Session | null
  ready: boolean

  recovery: boolean
}



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
    // Cờ recovery chỉ giữ UI qua một lần F5; mất cờ thì người dùng làm lại thao tác
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





function hasStoredSession(): boolean {
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)
      if (k?.startsWith('sb-') && k.includes('auth-token')) return true
    }
  } catch {
    return false
  }
  return false
}






function urlMayCarryAuth(): boolean {
  return window.location.search !== '' || window.location.hash !== ''
}

let bootstrapped: Promise<void> | null = null








function ensureAuthBoot(): Promise<void> {
  bootstrapped ??= (async () => {
    const auth = (await loadSupabase()).auth
    state = { ...state, recovery: readRecoveryFlag() }
    auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') writeRecoveryFlag(true)
      if (event === 'SIGNED_OUT') writeRecoveryFlag(false)
      const recovery = event === 'PASSWORD_RECOVERY' ? true : session ? readRecoveryFlag() : false



      setState({ session, ready: true, recovery })
      eventListeners.forEach((l) => l(event, session))
    })

    auth
      .getSession()
      .then(({ data }) => {
        if (!state.ready) setState({ session: data.session, ready: true, recovery: readRecoveryFlag() })
      })
      .catch(() => setState({ ...state, ready: true }))
  })().catch(() => setState({ ...state, ready: true }))
  return bootstrapped
}

if (isSupabaseConfigured) {
  if (hasStoredSession() || urlMayCarryAuth()) void ensureAuthBoot()



  else setState({ ...state, ready: true })
}


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


export function subscribeAuthEvent(listener: AuthEventListener): () => void {
  eventListeners.add(listener)
  return () => {
    eventListeners.delete(listener)
  }
}


export function getAccessToken(): string | null {
  return state.session?.access_token ?? null
}

export async function signInWithGoogle(): Promise<void> {
  await ensureAuthBoot()
  const supabase = await loadSupabase()
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: `${window.location.origin}${window.location.pathname}` },
  })
  if (error) throw error
}

export async function signUp(email: string, password: string): Promise<boolean> {
  await ensureAuthBoot()
  const supabase = await loadSupabase()
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: `${window.location.origin}${window.location.pathname}` },
  })
  if (error) throw error
  return !data.session
}

export async function resendSignupOtp(email: string): Promise<void> {
  await ensureAuthBoot()
  const supabase = await loadSupabase()
  const { error } = await supabase.auth.resend({ type: 'signup', email })
  if (error) throw error
}

export async function signInWithPassword(email: string, password: string): Promise<void> {
  await ensureAuthBoot()
  const supabase = await loadSupabase()
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
}

export async function sendLoginOtp(email: string): Promise<void> {
  await ensureAuthBoot()
  const supabase = await loadSupabase()
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { shouldCreateUser: false },
  })
  if (error) throw error
}

export async function verifyLoginOtp(email: string, token: string): Promise<void> {
  await ensureAuthBoot()
  const supabase = await loadSupabase()
  const { error } = await supabase.auth.verifyOtp({ email, token, type: 'email' })
  if (error) throw error
}

export async function requestPasswordReset(email: string): Promise<void> {
  await ensureAuthBoot()
  const redirectTo = `${window.location.origin}${withLocale('/auth/reset-password')}`
  const supabase = await loadSupabase()
  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo })
  if (error) throw error
}

export function hasRecoverySession(): boolean {
  return state.recovery && state.session != null
}

export async function updatePassword(newPassword: string): Promise<void> {
  await ensureAuthBoot()
  const supabase = await loadSupabase()
  const { error } = await supabase.auth.updateUser({ password: newPassword })
  if (error) throw error
  writeRecoveryFlag(false)
  setState({ ...state, recovery: false })
}

export async function signOut(): Promise<void> {
  await ensureAuthBoot()
  const supabase = await loadSupabase()
  writeRecoveryFlag(false)
  setState({ ...state, recovery: false })
  await supabase.auth.signOut()
}
