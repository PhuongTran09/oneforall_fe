import { CookiePreferences } from './CookiePreferences'
import { TermsConsent } from './TermsConsent'
import { Button } from '../common/Button'
import { LocaleLink } from '../../i18n/LocaleLink'
import { t } from '../../i18n/langStore'
import {
  closeConsentModal,
  needsCookieDecision,
  openConsentModal,
  saveCookieChoices,
  useConsent,
} from './consentStorage'

// Modal consent lần truy cập. Render một lần ở MainLayout nên không bị mở lại
// khi chuyển route. Không có nút đóng: đóng modal không phải là đồng ý —
// người dùng phải chọn một trong các phương án cookie.
export function ConsentModal() {
  const { modalOpen, view } = useConsent()
  const visible = modalOpen || needsCookieDecision()

  if (!visible) return null

  const custom = view === 'custom'

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm in-backdrop">
      <div
        className="relative w-full max-w-md p-6 sm:p-8 bg-surface border border-[rgba(255,59,48,0.35)] clip-corner-lg card-3d in-up"
        role="dialog"
        aria-modal="true"
        aria-labelledby="consent-title"
      >
        {custom ? (
          <>
            <h2 id="consent-title" className="text-xl font-bold text-ink tracking-tight mb-1">
              {t('consent.cookieSettings')}
            </h2>
            <p className="mb-5 text-sm text-slate-400">
              {t('consent.cookieSettingsDesc')}
            </p>
            <CookiePreferences />
            <button
              type="button"
              onClick={() => (needsCookieDecision() ? openConsentModal('main') : closeConsentModal())}
              className="mt-4 text-xs font-medium text-slate-400 hover:text-ink transition-colors"
            >
              {t('consent.back')}
            </button>
          </>
        ) : (
          <>
            <h2 id="consent-title" className="text-xl font-bold text-ink tracking-tight mb-2">
              {t('consent.welcome')}
            </h2>
            <p className="mb-4 text-sm leading-relaxed text-slate-300">
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

            <div className="mb-5">
              <TermsConsent />
            </div>

            <div className="space-y-2.5">
              <Button variant="glow" fullWidth size="md" onClick={() => saveCookieChoices({ analytics: true, advertising: true })}>
                {t('consent.acceptAll')}
              </Button>
              <Button variant="outline" fullWidth size="md" onClick={() => saveCookieChoices({ analytics: false, advertising: false })}>
                {t('consent.necessaryOnly')}
              </Button>
              <Button variant="ghost" fullWidth size="md" onClick={() => openConsentModal('custom')}>
                {t('consent.customize')}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
