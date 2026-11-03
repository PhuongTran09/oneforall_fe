import { getTheme, setTheme, type Theme } from './theme'

let wiping = false






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
