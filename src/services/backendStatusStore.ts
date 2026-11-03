import { useSyncExternalStore } from 'react'







let down = false
const listeners = new Set<() => void>()

export function reportBackend(reach: 'up' | 'down'): void {
  const next = reach === 'down'
  if (next === down) return
  down = next
  listeners.forEach((listener) => listener())
}


export function isBackendDown(): boolean {
  return down
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

function getSnapshot() {
  return down
}

export function useBackendStatus(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot)
}
