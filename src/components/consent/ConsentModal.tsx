import { CookiePreferences } from './CookiePreferences'
import { TermsConsent } from './TermsConsent'
import { Button } from '../common/Button'
import { LocaleLink } from '../../i18n/LocaleLink'
import { t } from '../../i18n/langStore'
import { useExitFade } from '../../hooks/useExitFade'
import {
  closeConsentModal,
  needsCookieDecision,
  openConsentModal,
  saveCookieChoices,
  useConsent,
} from './consentStorage'

// Thanh cookie nằm đáy, render một lần ở MainLayout nên không bị mở lại khi chuyển route.
// Không có nút đóng: đóng prompt không phải là đồng ý — người dùng phải chọn một phương án
// cookie. Trước đây đây là modal phủ toàn màn hình và đè lên AuthModal (z-50), khiến form
// đăng nhập nằm sau lớp tối; ở dạng thanh thì hai thứ dùng được cùng lúc.
export function ConsentModal() {
  const { modalOpen, view } = useConsent()
  const visible = modalOpen || needsCookieDecision()
  // Chiều ra: thanh trượt xuống 180ms sau khi user chọn xong thay vì biến mất tức thì.
  const { show, closing } = useExitFade(visible)

  if (!show) return null

  const custom = view === 'custom'

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[70]">
      <div
        className={`cookie-bar ${
          closing ? 'in-out pointer-events-none' : 'in-bar-up pointer-events-auto'
        } mx-auto max-w-6xl border-t border-[rgba(255,59,48,0.35)] bg-surface/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-12px_32px_rgba(0,0,0,0.45)] backdrop-blur-sm sm:px-6`}
        role="region"
        aria-labelledby="consent-title"
      >
        {/* Hai màn hình cookie là hai node khác nhau, nên mỗi lần hiện ra đều chạy .in-fade
            thay vì nhảy cóc giữa "Cài đặt cookie" và hàng nút chọn. */}
        {custom ? (
          <div className="in-fade mx-auto max-w-2xl">
            <h2 id="consent-title" className="text-sm font-bold text-ink tracking-tight">
              {t('consent.cookieSettings')}
            </h2>
            <p className="mt-1 mb-3 text-xs leading-relaxed text-slate-400">
              {t('consent.cookieSettingsDesc')}
            </p>
            <div className="max-h-[55vh] overflow-y-auto scrollbar-none pr-1">
              <CookiePreferences />
            </div>
            <button
              type="button"
              onClick={() => (needsCookieDecision() ? openConsentModal('main') : closeConsentModal())}
              className="mt-3 text-xs font-medium text-slate-400 transition-colors hover:text-ink"
            >
              {t('consent.back')}
            </button>
          </div>
        ) : (
          <div className="in-fade">
            <h2 id="consent-title" className="text-sm font-bold text-ink tracking-tight">
              {t('consent.welcome')}
            </h2>
            <div className="mt-2 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between lg:gap-8">
              <div className="min-w-0">
                <p className="text-xs leading-relaxed text-slate-300">
                  {t('consent.introPre')}{' '}
                  <LocaleLink to="/terms" className="text-brand hover:underline font-medium">
                    {t('common.terms')}
                  </LocaleLink>{' '}
                  {t('consent.introMid')}{' '}
                  <LocaleLink to="/privacy" className="text-brand hover:underline font-medium">
                    {t('common.privacy')}
                  </LocaleLink>
                  .
                </p>
                <div className="mt-2">
                  <TermsConsent />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:justify-end">
                <Button variant="glow" size="sm" onClick={() => saveCookieChoices({ analytics: true, advertising: true })}>
                  {t('consent.acceptAll')}
                </Button>
                {/* Chỉ còn hai nút: "Customize" lên thành nút viền thật, vì sau khi bỏ nút từ
                    chối nhanh đây là đường duy nhất để tắt cookie analytics/quảng cáo. */}
                <Button variant="outline" size="sm" onClick={() => openConsentModal('custom')}>
                  {t('consent.customize')}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
