import { ADS } from '../config/ads'
import { hasConsented, needsCookieDecision, useConsent } from '../components/consent/consentStorage'
import { isAdFreeNow, useEntitlements } from './entitlementsStore'
import { useAuth } from './authStore'
import type { UserMe } from './api/types'

/**
 * Bộ nạp script quảng cáo bên thứ ba — TẬP TRUNG, một chỗ duy nhất chèn <script>.
 *
 * Quyết định nạp là 3 trạng thái, không phải boolean: 'wait' (chưa xác định được
 * gói, hoặc người dùng chưa quyết định cookie — còn cơ hội ở lượt accept sau) khác
 * với 'off' (Pro, hoặc đã từ chối — không nạp trong cả page session này).
 *
 * shortcut: Adsterra không tài liệu hoá API gỡ banner. Đo 10/2026 trên chính
 * script Social Bar (89 KB): chèn DOM bằng createElement/appendChild (không
 * document.write -> hợp SPA/Vite), giữ ~11 setInterval + 1 MutationObserver trên
 * body, lưu frequency cap vào localStorage/sessionStorage. Vì vậy: đã nạp rồi thì
 * KHÔNG gỡ node của nó (DOM surgery không được bảo đảm), mất eligibility giữa
 * phiên chỉ chặn các lượt nạp còn lại và có hiệu lực đầy đủ từ lần tải trang kế
 * tiếp; người dùng vẫn có nút đóng của riêng Social Bar. Nâng cấp khi Adsterra
 * cung cấp API destroy được tài liệu hoá.
 */
export type AdsDecision = 'load' | 'wait' | 'off'

/**
 * 'wait' khi đã đăng nhập mà /users/me chưa về: nạp trước rồi phát hiện Pro là tự
 * lừa, vì script một khi nằm trong trang thì không có cách gỡ được bảo đảm.
 * 'off' là chốt của người dùng/publisher; 'wait' thì chưa.
 */
export function adsDecision(me: UserMe | null, planKnown: boolean): AdsDecision {
  // Pro = không quảng cáo. Nguồn xác nhận là BE qua /users/me (plan_policy.ads=false),
  // cộng bản cache ofa-plan vì /users/me về muộn hơn HTML.
  if (isAdFreeNow(me)) return 'off'
  if (!planKnown) return 'wait'
  if (hasConsented('advertising')) return 'load'
  return needsCookieDecision() ? 'wait' : 'off'
}

/** Một định nghĩa duy nhất về quyền hiện quảng cáo, dùng cho cả CTA lẫn điểm nạp script. */
export function useAdsDecision(): AdsDecision {
  const { ready, session } = useAuth()
  const { me } = useEntitlements()
  useConsent()
  // Chưa xác định xong phiên thì chưa biết có token hay không; có token mà me chưa về
  // thì chưa biết gói. /users/me lỗi persistent => không nạp, fail-closed phía privacy.
  return adsDecision(me, ready && (session === null || me !== null))
}

let blocked = false

/** Chặn mọi lượt nạp còn lại của page session (Pro / rút consent / tắt format). */
export function stopAds(reason: 'pro-or-denied' | 'disabled'): void {
  if (blocked) return
  blocked = true
  if (import.meta.env.DEV) console.debug(`[ads] nạp bị chặn: ${reason}`)
}

// Script bên thứ ba chỉ được phép có MỘT điểm nạp trong app -> latch một lần.
let socialBarInjected = false

/**
 * Nạp một lần cho cả vòng đời trang: latch module + kiểm tra tag đã tồn tại trong
 * DOM. Che cả StrictMode double-invoke, re-render, đổi route/đổi locale — script
 * bên thứ ba nạp lần hai là thêm một banner và thêm một batch heartbeat.
 */
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
