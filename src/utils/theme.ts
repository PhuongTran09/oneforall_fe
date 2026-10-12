export type Theme = 'dark' | 'light'

const STORAGE_KEY = 'ofa-theme'

export function getTheme(): Theme {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'light' ? 'light' : 'dark'
  } catch {
    return 'dark'
  }
}

export function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme
}

export function toggleTheme(): Theme {
  const next: Theme = getTheme() === 'dark' ? 'light' : 'dark'
  applyTheme(next)
  try {
    localStorage.setItem(STORAGE_KEY, next)
  } catch {
    // shortcut: storage blocked (private mode) -> theme applies for this pageview only, upgrade if persistence matters
  }
  return next
}
