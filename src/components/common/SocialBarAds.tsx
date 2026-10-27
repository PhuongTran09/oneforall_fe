import { useEffect } from 'react'
import { ADS } from '../../config/ads'
import { loadSocialBar, stopAds, useAdsDecision } from '../../services/adScripts'

/** Single ad script entry point, mounted once in MainLayout so route changes never reload it. */
export function SocialBarAds() {
  const decision = useAdsDecision()

  useEffect(() => {
    if (!ADS.socialBar.enabled) {
      stopAds('disabled')
      return
    }
    if (decision === 'off') {
      stopAds('pro-or-denied')
      return
    }
    if (decision === 'wait') return
    loadSocialBar()
  }, [decision])

  return null
}
