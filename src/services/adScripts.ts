import { ADS } from '../config/ads'
import { hasConsented, needsCookieDecision, useConsent } from '../components/consent/consentStorage'
import { isAdFreeNow, useEntitlements } from './entitlementsStore'
import { useAuth } from './authStore'
import type { UserMe } from './api/types'

/** Central ad-script loader; loaded scripts stay mounted because Adsterra has no documented destroy API. */
export type AdsDecision = 'load' | 'wait' | 'off'

/** Keep ads on hold until account status is known; loaded scripts cannot be reliably removed. */
export function adsDecision(me: UserMe | null, planKnown: boolean): AdsDecision {
  // Pro = không quảng cáo. Nguồn xác nhận là BE qua /users/me (plan_policy.ads=false),
  // cộng bản cache ofa-plan vì /users/me về muộn hơn HTML.
  if (isAdFreeNow(me)) return 'off'
  if (!planKnown) return 'wait'
  if (hasConsented('advertising')) return 'load'
  return needsCookieDecision() ? 'wait' : 'off'
}

/** Một định nghĩa duy nhất về quyền hiện quảng cáo, dùng cho mọi điểm mở tab/điểm nạp script. */
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

/**
 * Điểm mở tab smartlink DUY NHẤT: theo cú bấm "Bắt đầu xử lý"/"Bắt đầu tải" hợp lệ
 * (chủ site yêu cầu 10/2026, nới thành MỖI lượt 10/2026). Gọi ĐỒNG BỘ trong user
 * gesture, trước await đầu tiên — giống openAffiliateTab; popup bị chặn thì
 * window.open trả null, luồng xử lý vẫn chạy. `decision` bắt buộc truyền vào để
 * không mở cho user Pro hoặc chưa đồng ý cookie quảng cáo.
 *
 * Không còn cooldown lẫn "hai lượt một tab": nút bấm đã disabled suốt lượt xử lý
 * (`isLoading` ở UrlInputForm/FileUploader) nên nhấn đúp không tạo được hai job,
 * và trình duyệt đã tự chặn window.open ngoài gesture.
 */
export function openSmartlinkTab(decision: AdsDecision): void {
  if (!ADS.smartlink.enabled || decision !== 'load') return
  window.open(ADS.smartlink.url, '_blank', 'noopener,noreferrer')
}
