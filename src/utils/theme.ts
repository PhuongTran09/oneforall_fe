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

export function setTheme(theme: Theme) {
  applyTheme(theme)
  try {
    localStorage.setItem(STORAGE_KEY, theme)
  } catch {
    // shortcut: storage blocked (private mode) -> theme applies for this pageview only, upgrade if persistence matters
  }
}
