import { getTheme, setTheme, type Theme } from './theme'

let wiping = false

/**
 * Đổi theme kèm dải pixel quét từ đầu trang xuống.
 * View Transition chụp lại hai theme nên nội dung vẫn hiện trong lúc quét;
 * CSS `theme-wipe-reveal` lo phần animation. Browser không có API này -> đổi tức thì.
 */
export function toggleThemeWithWipe(): Theme {
  if (wiping) return getTheme()
  const next: Theme = getTheme() === 'dark' ? 'light' : 'dark'

  if (!document.startViewTransition || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    setTheme(next)
    return next
  }

  wiping = true
  document.startViewTransition(() => setTheme(next)).finished.finally(() => {
    wiping = false
  })
  return next
}
