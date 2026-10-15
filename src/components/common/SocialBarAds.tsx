import { useEffect } from 'react'
import { ADS } from '../../config/ads'
import { loadSocialBar, stopAds, useAdsDecision } from '../../services/adScripts'

/**
 * Điểm nạp script quảng cáo bên thứ ba DUY NHẤT trong app, mount một lần ở
 * MainLayout (ngoài route) — không component nào khác được chèn <script>, và đổi
 * route/đổi locale không phải lý do để nạp lại.
 *
 * Component không render gì: việc của nó là quyết định nạp. 'off' thì chặn luôn
 * các lượt nạp trễ của phiên này; xem adScripts.ts về lý do không tự gỡ node mà
 * Adsterra đã chèn. Popunder KHÔNG có điểm nạp nào: cờ env một mình không được
 * phép nối một script bind click toàn trang vào app (xem config/ads.ts).
 */
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
