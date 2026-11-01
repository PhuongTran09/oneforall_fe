import { useSyncExternalStore } from 'react'
import type Lenis from 'lenis'

/**
 * Con trỏ Lenis của cả trang — một scroller gốc duy nhất nên để ở module, đúng kiểu
 * authStore/captchaStore: ai cần thì subscribe, không ai phải render lại vì nó.
 */
let instance: Lenis | null = null
const listeners = new Set<() => void>()

/** Provider gán lúc tạo và xoá lúc destroy; không đi qua state để khỏi cascade render. */
export function setLenisInstance(next: Lenis | null): void {
  instance = next
  for (const notify of listeners) notify()
}

/**
 * null = cuộn mượt đang tắt (prefers-reduced-motion, hoặc BE của hiệu ứng chưa mount)
 * → caller rơi về `window.scrollTo`.
 */
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

/**
 * Bản đọc-one-lần cho code nằm ngoài React (effect restore cuộn, nút cuộn tới section):
 * ở đó không được gọi hook, và cũng chẳng cần subscribe — chỉ cần biết lúc này có Lenis
 * hay không. Vẫn null khi prefers-reduced-motion, nên luôn phải có nhánh fallback.
 */
export function getLenisInstance(): Lenis | null {
  return instance
}
