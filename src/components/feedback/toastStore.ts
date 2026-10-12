import { useSyncExternalStore } from 'react'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface ToastInput {
  type: ToastType
  message: string
  durationMs?: number
}

export interface ToastEntry {
  id: number
  type: ToastType
  message: string
  durationMs: number
  leaving: boolean
}

const DEFAULT_DURATION: Record<ToastType, number> = {
  success: 4000,
  info: 4000,
  warning: 6000,
  error: 8000,
}

const MAX_VISIBLE = 4
const LEAVE_MS = 180
// Toast trùng (cùng type+message) trong cửa sổ này sẽ bị gộp làm một.
const DEDUPE_MS = 4000

let nextId = 1
let toasts: ToastEntry[] = []
const timers = new Map<number, ReturnType<typeof setTimeout>>()
const lastShownAt = new Map<string, number>()
const listeners = new Set<() => void>()

function emit() {
  toasts = [...toasts]
  listeners.forEach((l) => l())
}

function removeToast(id: number) {
  timers.delete(id)
  toasts = toasts.filter((t) => t.id !== id)
  emit()
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

function getSnapshot() {
  return toasts
}

export function dismissToast(id: number) {
  if (!timers.has(id)) return
  clearTimeout(timers.get(id))
  // Chạy animation biến mất rồi mới gỡ khỏi DOM.
  timers.set(
    id,
    setTimeout(() => removeToast(id), LEAVE_MS),
  )
  toasts = toasts.map((t) => (t.id === id ? { ...t, leaving: true } : t))
  emit()
}

export function showToast(input: ToastInput): void {
  if (!input.message) return
  const key = `${input.type}|${input.message}`
  const now = Date.now()
  // Đang hiển thị cùng type+message hoặc mới đóng trong 4s → gộp, không nhảy đôi.
  if (toasts.some((t) => `${t.type}|${t.message}` === key)) return
  if (now - (lastShownAt.get(key) ?? 0) < DEDUPE_MS) return
  lastShownAt.set(key, now)

  const durationMs = input.durationMs ?? DEFAULT_DURATION[input.type]
  const entry: ToastEntry = { id: nextId++, type: input.type, message: input.message, durationMs, leaving: false }
  toasts = [...toasts, entry]

  // Giữ tối đa MAX_VISIBLE toast "sống": gỡ ngay toast cũ nhất khi vượt.
  const live = toasts.filter((t) => !t.leaving)
  if (live.length > MAX_VISIBLE) {
    for (const t of live.slice(0, live.length - MAX_VISIBLE)) removeToast(t.id)
  }

  timers.set(
    entry.id,
    setTimeout(() => dismissToast(entry.id), durationMs),
  )
  emit()
}

// Dọn hết timer khi cả app unmount (StrictMode/dev teardown) — không để sót timeout trôi nổi.
export function clearAllToasts() {
  timers.forEach((t) => clearTimeout(t))
  timers.clear()
  toasts = []
  emit()
}

export function useToasts(): ToastEntry[] {
  return useSyncExternalStore(subscribe, getSnapshot)
}
