import { useEffect, useRef } from 'react'
import { ShieldCheck, X } from 'lucide-react'
import { Button } from '../common/Button'
import { breakCaptcha, fulfillCaptchaToken, useCaptchaChallenge } from '../../services/captchaStore'
import { loadTurnstile, type TurnstileApi } from '../../services/turnstile'
import { env } from '../../utils/env'
import { getTheme } from '../../utils/theme'
import { t } from '../../i18n/langStore'
import { useExitFade } from '../../hooks/useExitFade'
import { useDialogFocus } from '../../hooks/useDialogFocus'


export function CaptchaModal() {
  const challengeId = useCaptchaChallenge()
  const holder = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)







  useDialogFocus({ panelRef, open: challengeId ?? false, onEscape: closeCaptcha })

  useEffect(() => {
    if (challengeId === null) return

    let cancelled = false
    let api: TurnstileApi | null = null
    let widgetId: string | null = null

    void loadTurnstile()
      .then((turnstile) => {
        api = turnstile
        if (cancelled || !holder.current) return
        widgetId = turnstile.render(holder.current, {
          sitekey: env.turnstileSiteKey,
          theme: getTheme(),
          size: 'flexible',


          callback: fulfillCaptchaToken,



          'error-callback': (code) => breakCaptcha(t('captcha.error', { code: code ?? 'unknown' })),
          'expired-callback': () => breakCaptcha(t('captcha.expired')),
          'timeout-callback': () => breakCaptcha(t('captcha.expired')),
        })
      })
      .catch(() => {
        if (!cancelled) breakCaptcha(t('captcha.error'))
      })

    return () => {
      cancelled = true

      if (api && widgetId) api.remove(widgetId)
    }
  }, [challengeId])



  const { show, closing } = useExitFade(challengeId !== null)

  if (!show) return null

  return (


    <div
      className={`fixed inset-0 z-[78] flex items-center justify-center p-4 bg-black/80 ${
        closing ? 'out-fade' : 'in-backdrop'
      }`}
      onClick={closeCaptcha}
    >
      <div
        onClick={(event) => event.stopPropagation()}
        ref={panelRef}
        role="alertdialog"
        aria-modal="true"
        aria-label={t('captcha.title')}
        tabIndex={-1}
        className={`relative w-full max-w-sm p-6 bg-surface border border-brand/30 clip-corner-lg outline-none ${
          closing ? 'in-out' : 'in-up'
        }`}
      >
        <button
          type="button"
          onClick={closeCaptcha}
          className="absolute top-3.5 right-3.5 p-1.5 text-slate-400 hover:text-ink hover:bg-elev transition-colors clip-corner-btn"
          aria-label={t('common.close')}
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-start gap-3 mb-4 pr-6">
          <div className="w-11 h-11 shrink-0 flex items-center justify-center bg-brand/10 border border-brand/30 text-brand clip-corner-btn">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div className="min-w-0 space-y-1">
            <h3 className="text-base font-bold text-ink leading-snug">{t('captcha.title')}</h3>
            <p className="text-sm text-slate-400 leading-relaxed">{t('captcha.desc')}</p>
          </div>
        </div>





        <div ref={holder} className="min-h-[65px] flex items-center justify-center" />

        <p className="mt-3 text-xs text-slate-400 leading-relaxed">{t('captcha.loading')}</p>

        <div className="mt-5">
          <Button variant="secondary" onClick={closeCaptcha}>
            {t('captcha.cancel')}
          </Button>
        </div>
      </div>
    </div>
  )
}

function closeCaptcha(): void {
  breakCaptcha(t('captcha.cancelled'))
}
