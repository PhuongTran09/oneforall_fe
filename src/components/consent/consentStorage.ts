import { useSyncExternalStore } from 'react'
import { termsVi } from '../../content/legal/terms.vi'
import { privacyVi } from '../../content/legal/privacy.vi'

// Nguồn consent duy nhất cho toàn app: một store module-level + useSyncExternalStore.
// Không có state React độc lập nào khác về consent (spec: "Không tạo nhiều consent state độc lập").
// localStorage chỉ lưu QUYẾT ĐỊNH (kèm version + timestamp) — không dùng nó làm bằng chứng
// pháp lý cho việc đồng ý điều khoản; đó là trách nhiệm của chủ dự án (Consent Mode v2, log server...).

const STORAGE_KEY = 'ofa-consent'

export const TERMS_VERSION = termsVi.lastUpdated
export const COOKIE_VERSION = privacyVi.lastUpdated

export interface CookieChoices {
  analytics: boolean
  advertising: boolean
}

export interface ConsentRecord {
  terms: { acceptedAt: string | null; version: string | null }
  cookies: {
    necessary: true
    analytics: boolean
    advertising: boolean
    decidedAt: string | null
    version: string
  }
}

export type ConsentView = 'main' | 'custom'

interface ConsentState {
  record: ConsentRecord
  // Trạng thái modal chỉ ở bộ nhớ: đóng/mở UI không phải quyết định đồng ý.
  modalOpen: boolean
  view: ConsentView
}

function defaultRecord(): ConsentRecord {
  return {
    terms: { acceptedAt: null, version: null },
    cookies: { necessary: true, analytics: false, advertising: false, decidedAt: null, version: COOKIE_VERSION },
  }
}

function loadRecord(): ConsentRecord {
  const base = defaultRecord()
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return base
    const parsed = JSON.parse(raw) as Partial<ConsentRecord>
    if (parsed?.terms && parsed?.cookies) {
      return {
        terms: { acceptedAt: parsed.terms.acceptedAt ?? null, version: parsed.terms.version ?? null },
        cookies: { ...base.cookies, ...parsed.cookies, necessary: true },
      }
    }
  } catch {
    // Dữ liệu hỏng/thiếu → coi như chưa quyết định, hỏi lại.
  }
  return base
}

let state: ConsentState = { record: loadRecord(), modalOpen: false, view: 'main' }
const listeners = new Set<() => void>()

function persist(record: ConsentRecord) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(record))
  } catch {
    // shortcut: trình duyệt chặn storage (private mode) → consent chỉ sống trong phiên, hỏi lại lần sau
  }
}

function setState(next: Partial<ConsentState>, record?: ConsentRecord) {
  if (record) {
    persist(record)
    state = { ...state, record, ...next }
  } else {
    state = { ...state, ...next }
  }
  listeners.forEach((l) => l())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function getSnapshot(): ConsentState {
  return state
}



export function hasAcceptedTerms(): boolean {
  return state.record.terms.acceptedAt !== null && state.record.terms.version === TERMS_VERSION
}

export function hasConsented(category: 'analytics' | 'advertising'): boolean {
  const c = state.record.cookies
  return c.decidedAt !== null && c.version === COOKIE_VERSION && c[category]
}

// Chưa quyết định cookie, hoặc chính sách cookie đã đổi version → phải hiện lại modal.
export function needsCookieDecision(): boolean {
  const c = state.record.cookies
  return c.decidedAt === null || c.version !== COOKIE_VERSION
}



export function openConsentModal(view: ConsentView = 'main') {
  setState({ modalOpen: true, view })
}

export function closeConsentModal() {
  setState({ modalOpen: false, view: 'main' })
}

// Kiểm/bỏ kiểm checkbox điều khoản — thao tác tường minh của người dùng, không mặc định.
export function setTermsAccepted(accepted: boolean) {
  const terms: ConsentRecord['terms'] = accepted
    ? { acceptedAt: new Date().toISOString(), version: TERMS_VERSION }
    : { acceptedAt: null, version: null }
  setState({}, { ...state.record, terms })
}

// Ghi quyết định cookie (từ "Chấp nhận tất cả", "Chỉ cần thiết", hoặc lưu tùy chỉnh).
export function saveCookieChoices(choices: CookieChoices) {
  const cookies = { ...state.record.cookies, ...choices, decidedAt: new Date().toISOString(), version: COOKIE_VERSION }
  setState({ modalOpen: false, view: 'main' }, { ...state.record, cookies })
}

export function useConsent(): ConsentState {
  return useSyncExternalStore(subscribe, getSnapshot)
}
