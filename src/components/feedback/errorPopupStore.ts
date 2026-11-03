import { useSyncExternalStore } from 'react'
import { t } from '../../i18n/langStore'
import { isBackendDown } from '../../services/backendStatusStore'

export interface ErrorPopupInput {
  message: string
  title?: string

  onRetry?: () => void
}

export interface ErrorPopupEntry extends ErrorPopupInput {
  id: number
}



let nextId = 1
let queue: ErrorPopupEntry[] = []
const listeners = new Set<() => void>()

function emit() {
  queue = [...queue]
  listeners.forEach((l) => l())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

function getSnapshot() {
  return queue
}

export function showErrorPopup(input: ErrorPopupInput): void {
  if (!input.message) return

  if (queue.some((e) => e.message === input.message)) return




  if (isBackendDown() && [t('errors.unavailable'), t('errors.network')].includes(input.message)) return
  queue = [...queue, { id: nextId++, ...input }]
  emit()
}

export function dismissErrorPopup(id: number) {
  queue = queue.filter((e) => e.id !== id)
  emit()
}

export function useErrorPopups(): ErrorPopupEntry[] {
  return useSyncExternalStore(subscribe, getSnapshot)
}
