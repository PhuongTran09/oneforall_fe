import { useSyncExternalStore } from 'react'
import { vi, type Dict } from './dict.vi'
import { en } from './dict.en'
import { canonicalToolPath } from '../config/seoTools'

export type Lang = 'vi' | 'en'

const STORAGE_KEY = 'ofa-lang'
const DICTS: Record<Lang, Dict> = { vi, en }

let state: Lang = 'vi'
const listeners = new Set<() => void>()

function persist(lang: Lang) {
  try {
    localStorage.setItem(STORAGE_KEY, lang)
  } catch {
    // storage blocked → pref chỉ sống trong phiên
  }
}

export function getSavedLangPref(): Lang | null {
  try {
    const v = localStorage.getItem(STORAGE_KEY)
    return v === 'vi' || v === 'en' ? v : null
  } catch {
    return null
  }
}

function setLang(next: Lang) {
  if (next === state) return
  state = next
  document.documentElement.lang = next
  listeners.forEach((l) => l())
}

function subscribe(l: () => void) {
  listeners.add(l)
  return () => listeners.delete(l)
}

function getSnapshot(): Lang {
  return state
}

export function getLang(): Lang {
  return state
}

function lookup(dict: unknown, key: string): string | undefined {
  let cur: unknown = dict
  for (const part of key.split('.')) {
    if (cur && typeof cur === 'object' && part in (cur as Record<string, unknown>)) {
      cur = (cur as Record<string, unknown>)[part]
    } else {
      return undefined
    }
  }
  return typeof cur === 'string' ? cur : undefined
}

/** hasKey('errors.network') — chỉ nhìn dict của ngôn ngữ đang dùng, để không rơi về câu tiếng */
export function hasKey(key: string): boolean {
  return lookup(DICTS[state], key) !== undefined
}

/** t('nav.home') hoặc t('params.minMax', { min: 1, max: 10 }) — gọi được ngoài React. */
export function t(key: string, params?: Record<string, string | number>): string {
  let raw = lookup(DICTS[state], key) ?? lookup(DICTS.vi, key)
  if (raw === undefined) {
    if (import.meta.env.DEV) console.warn(`[i18n] missing key: ${key}`)
    raw = key
  }
  if (!params) return raw
  return raw.replace(/\{(\w+)\}/g, (m, name: string) =>
    name in params ? String(params[name]) : m,
  )
}

export function useI18n() {
  const lang = useSyncExternalStore(subscribe, getSnapshot)
  return { lang, t }
}

/** VI không prefix, EN prefix /en. */
export function stripLocale(pathname: string): { lang: Lang; path: string } {
  if (pathname === '/en' || pathname.startsWith('/en/')) {
    return { lang: 'en', path: pathname.slice(3) || '/' }
  }
  return { lang: 'vi', path: pathname }
}

export function withLocale(path: string, lang: Lang = state): string {
  const localizedPath =
    lang === 'vi' ? path : path === '/' ? '/en' : `/en${path.startsWith('/') ? path : `/${path}`}`
  return canonicalToolPath(localizedPath)
}

/** Gọi trước render (anti-flash): sync lang từ URL hiện tại vào store + <html lang>. */
export function initLang() {
  setLang(stripLocale(window.location.pathname).lang)
}

/** LangRouteSync gọi mỗi lần pathname đổi; persist pref = locale đang xem. */
export function syncLangFromPath(pathname: string): Lang {
  const lang = stripLocale(pathname).lang
  setLang(lang)
  persist(lang)
  return lang
}
