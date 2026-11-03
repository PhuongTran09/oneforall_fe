import { useSyncExternalStore } from 'react'
import { termsVi } from '../../content/legal/terms.vi'
import { privacyVi } from '../../content/legal/privacy.vi'






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
    // JSON hỏng hoặc storage bị chặn: coi như chưa từng consent, mặc định necessary=true
  }
  return base
}

let state: ConsentState = { record: loadRecord(), modalOpen: false, view: 'main' }
const listeners = new Set<() => void>()

function persist(record: ConsentRecord) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(record))
  } catch {
    // Private mode / hết quota: consent có hiệu lực ngay trong phiên, chỉ phải hỏi lại lần sau
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


export function setTermsAccepted(accepted: boolean) {
  const terms: ConsentRecord['terms'] = accepted
    ? { acceptedAt: new Date().toISOString(), version: TERMS_VERSION }
    : { acceptedAt: null, version: null }
  setState({}, { ...state.record, terms })
}


export function saveCookieChoices(choices: CookieChoices) {
  const cookies = { ...state.record.cookies, ...choices, decidedAt: new Date().toISOString(), version: COOKIE_VERSION }
  setState({ modalOpen: false, view: 'main' }, { ...state.record, cookies })
}

export function useConsent(): ConsentState {
  return useSyncExternalStore(subscribe, getSnapshot)
}
