import { useSyncExternalStore } from 'react'
import { t } from '../i18n/langStore'
import { env } from '../utils/env'
import { getAccessToken } from './authStore'


type Slot = {
  resolve: (token: string) => void
  reject: (error: Error) => void
}

let nextId = 1
let active: { id: number; slot: Slot } | null = null
const queue: Slot[] = []
const listeners = new Set<() => void>()

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


function getSnapshot(): number | null {
  return active?.id ?? null
}


export function setCaptchaRequiredByBackend(required: boolean): void {
  requiredByBackend = required
}

export function captchaRequiredByBackend(): boolean {
  return requiredByBackend
}


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


const WARM_TTL_MS = 120_000
let warm: { token: string; at: number } | null = null


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


export function takeWarmCaptchaToken(): string | null {
  const entry = warm
  warm = null
  return entry && Date.now() - entry.at < WARM_TTL_MS ? entry.token : null
}


export function fulfillCaptchaToken(token: string): void {
  const current = active
  const next = queue.shift()
  active = next ? { id: nextId++, slot: next } : null
  emit()
  current?.slot.resolve(token)
}


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
