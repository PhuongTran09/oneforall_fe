import { ADS } from '../config/ads'
import { hasConsented, needsCookieDecision, useConsent } from '../components/consent/consentStorage'
import { isAdFreeNow, useEntitlements } from './entitlementsStore'
import { useAuth } from './authStore'
import type { UserMe } from './api/types'


export type AdsDecision = 'load' | 'wait' | 'off'


export function adsDecision(me: UserMe | null, planKnown: boolean): AdsDecision {


  if (isAdFreeNow(me)) return 'off'
  if (!planKnown) return 'wait'
  if (hasConsented('advertising')) return 'load'
  return needsCookieDecision() ? 'wait' : 'off'
}


export function useAdsDecision(): AdsDecision {
  const { ready, session } = useAuth()
  const { me } = useEntitlements()
  useConsent()


  return adsDecision(me, ready && (session === null || me !== null))
}

let blocked = false


export function stopAds(reason: 'pro-or-denied' | 'disabled'): void {
  if (blocked) return
  blocked = true
  if (import.meta.env.DEV) console.debug(`[ads] nạp bị chặn: ${reason}`)
}

let socialBarInjected = false

function loadOnce(src: string): boolean {
  if (blocked || socialBarInjected || !src) return false
  if (document.querySelector(`script[src="${src}"]`)) {
    socialBarInjected = true
    return false
  }
  const el = document.createElement('script')
  el.async = true
  el.src = src
  document.head.appendChild(el)
  socialBarInjected = true
  return true
}

export function loadSocialBar(): boolean {
  if (!ADS.socialBar.enabled) return false
  return loadOnce(ADS.socialBar.src)
}

export function openSmartlinkTab(decision: AdsDecision): void {
  if (!ADS.smartlink.enabled || decision !== 'load') return
  window.open(ADS.smartlink.url, '_blank', 'noopener,noreferrer')
}
