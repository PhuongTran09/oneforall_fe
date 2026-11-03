import { useSyncExternalStore } from 'react'
import type Lenis from 'lenis'





let instance: Lenis | null = null
const listeners = new Set<() => void>()


export function setLenisInstance(next: Lenis | null): void {
  instance = next
  for (const notify of listeners) notify()
}





export function useSmoothScroll(): Lenis | null {
  return useSyncExternalStore(
    (onStoreChange) => {
      listeners.add(onStoreChange)
      return () => {
        listeners.delete(onStoreChange)
      }
    },
    () => instance,
    () => null,
  )
}






export function getLenisInstance(): Lenis | null {
  return instance
}
