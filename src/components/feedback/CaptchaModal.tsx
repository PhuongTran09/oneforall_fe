import { useEffect, useRef } from 'react'
import { ShieldCheck, X } from 'lucide-react'
import { Button } from '../common/Button'
import { breakCaptcha, fulfillCaptchaToken, useCaptchaChallenge } from '../../services/captchaStore'
import { loadTurnstile, type TurnstileApi } from '../../services/turnstile'
import { env } from '../../utils/env'
import { getTheme } from '../../utils/theme'
import { t } from '../../i18n/langStore'
import { useExitFade } from '../../hooks/useExitFade'

/** Turnstile opens when the backend requires verification during session setup or after a 403. */
export function CaptchaModal() {
  const challengeId = useCaptchaChallenge()
  const holder = useRef<HTMLDivElement>(null)

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
          // action KHÔNG gửi: BE chỉ so action khi TURNSTILE_EXPECTED_ACTION được khai, và
          // giá trị phải khớp widget trên Dashboard — để trống là an toàn nhất.
          callback: fulfillCaptchaToken,
          // Mã lỗi là chẩn đoán DUY NHẤT đọc được từ iPhone: 110200 = trình duyệt chặn cookie
          // của bên thứ ba (Cài đặt > Safari > Chặn tất cả cookie). Vứt nó đi thì user chỉ còn
          // "vui lòng thử lại" và không ai biết vì sao.
          'error-callback': (code) => breakCaptcha(t('captcha.error', { code: code ?? 'unknown' })),
          'expired-callback': () => breakCaptcha(t('captcha.expired')),
          'timeout-callback': () => breakCaptcha(t('captcha.expired')),
        })
      })
      .catch(() => {
        if (!cancelled) breakCaptcha(t('captcha.error'))
      })

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeCaptcha()
    }
    document.addEventListener('keydown', onKey)

    return () => {
      cancelled = true
      document.removeEventListener('keydown', onKey)
      // remove() chỉ dọn DOM: challenge đã settle thì promise không còn chủ để nhận token.
      if (api && widgetId) api.remove(widgetId)
    }
  }, [challengeId])

  // Chiều ra: giữ panel 180ms cho fade-out chạy xong (widget đã bị remove() ở cleanup của
  // effect trên, nên khung trống chỉ tồn tại đúng lúc đang biến mất).
  const { show, closing } = useExitFade(challengeId !== null)

  if (!show) return null

  return (
    // KHÔNG bọc widget trong backdrop-filter hay transform 3D (.card-3d): iOS WebKit đưa
    // iframe cross-origin vào lớp composite đó và mất hit-test — panel hiện mà bấm không ăn.
    <div
      className={`fixed inset-0 z-[78] flex items-center justify-center p-4 bg-black/80 ${
        closing ? 'out-fade' : 'in-backdrop'
      }`}
      onClick={closeCaptcha}
    >
      <div
        onClick={(event) => event.stopPropagation()}
        role="alertdialog"
        aria-modal="true"
        aria-label={t('captcha.title')}
        className={`relative w-full max-w-sm p-6 bg-surface border border-brand/30 clip-corner-lg ${
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

/** User đóng panel: request đang chờ chết với thông báo, không treo vô hạn. */
function closeCaptcha(): void {
  breakCaptcha(t('captcha.cancelled'))
}
