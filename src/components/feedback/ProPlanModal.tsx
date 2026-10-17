import { useEffect, useRef, useState } from 'react'
import { X, Check, Sparkles, Mail, CreditCard, AlertTriangle } from 'lucide-react'
import { Button } from '../common/Button'
import { t } from '../../i18n/langStore'
import { isAdFree, useEntitlements } from '../../services/entitlementsStore'
import {
  buildReturnUrl,
  checkoutMarker,
  paymentsApi,
  PREMIUM_PLAN_ID,
} from '../../services/api/paymentsApi'
import { submitAutoCheckout } from '../../utils/checkoutForm'
import { describeError } from '../../utils/apiError'

// Cùng địa chỉ support mà Footer/ToolFooterActions dùng.
const CONTACT_URL =
  'https://mail.google.com/mail/?view=cm&fs=1&to=support@oneforall.io.vn&su=Nang%20cap%20goi%20Pro%20One ForAll'

const FEATURE_KEYS = [
  'pricing.proF1',
  'pricing.proF2',
  'pricing.proF3',
  'pricing.proF4',
  'pricing.proF5',
  'pricing.proF6',
] as const

export interface ProPlanModalProps {
  isOpen: boolean
  onClose: () => void
}

// Bảng gói Pro hiển thị cho user ĐÃ đăng nhập khi bấm CTA nâng cấp / badge gói.
export function ProPlanModal({ isOpen, onClose }: ProPlanModalProps) {
  const { me } = useEntitlements()
  // Đang dùng gói thì BE từ chối tạo đơn (409) — modal báo thẳng thay vì để người dùng bấm.
  const active = isAdFree(me)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // `busy` là state nên hai cú click cùng tick đều thấy closure cũ; ref mới chặn được
  // hành vi double-click tạo hai đơn SePay với hai order_code.
  const busyRef = useRef(false)

  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    // Back từ trang thanh toán SePay: tab sống lại từ bfcache nên modal vẫn còn và nút
    // vẫn ở trạng thái "đang chuyển hướng" — phải mở lại quyền bấm.
    const onPageShow = (event: PageTransitionEvent) => {
      if (!event.persisted) return
      busyRef.current = false
      setBusy(false)
    }
    document.addEventListener('keydown', onKey)
    window.addEventListener('pageshow', onPageShow)
    return () => {
      document.removeEventListener('keydown', onKey)
      window.removeEventListener('pageshow', onPageShow)
    }
  }, [isOpen, onClose])

  const fail = (message: string) => {
    busyRef.current = false
    setBusy(false)
    setError(message)
  }

  const onPay = async () => {
    if (busyRef.current) return
    busyRef.current = true
    setBusy(true)
    setError(null)
    try {
      const res = await paymentsApi.create({
        plan_id: PREMIUM_PLAN_ID,
        // Ba URL nằm trong chuỗi ký HMAC → dựng từ cùng một hàm với trang nhận kết quả.
        return_url: buildReturnUrl(''),
        cancel_url: buildReturnUrl('cancel'),
        error_url: buildReturnUrl('error'),
      })
      const fields = res.checkout_fields ?? {}
      if (!res.checkout_url || Object.keys(fields).length === 0) {
        // BE đồng ý tạo đơn nhưng không trả form đã ký: không có gì để POST, giữ người dùng ở lại.
        fail(t('pay.unavailable'))
        return
      }
      checkoutMarker.save({ paymentId: res.payment_id, orderCode: res.order_code })
      submitAutoCheckout(res.checkout_url, fields)
      // Thành công là rời trang này → giữ nguyên trạng thái busy, không reset.
    } catch (err) {
      fail(describeError(err).message)
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm in-backdrop"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md p-6 sm:p-8 bg-surface border border-[rgba(255,59,48,0.35)] clip-corner-lg card-3d in-up"
        role="dialog"
        aria-modal="true"
        aria-label={t('pricing.proCta')}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-ink hover:bg-elev transition-colors clip-corner-btn"
          aria-label={t('common.close')}
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold bg-page border border-[rgba(255,59,48,0.35)] text-brand badge-angular">
            <Sparkles className="w-3.5 h-3.5" />
            {t('pricing.proBadge')}
          </div>
          <h3 className="text-2xl font-bold text-ink tracking-tight">Professional</h3>
          <div className="flex items-baseline justify-center gap-1.5">
            <span className="text-4xl font-bold text-brand-gradient tabular-nums">
              {t('pricing.proPrice')}
            </span>
            <span className="text-sm text-soft">{t('pricing.period')}</span>
          </div>
          <p className="text-sm text-slate-400">{t('pricing.proDesc')}</p>
        </div>

        <ul className="space-y-2.5 mb-5">
          {FEATURE_KEYS.map((key) => (
            <li key={key} className="flex items-start gap-2.5 text-sm text-slate-200">
              <Check className="w-4 h-4 shrink-0 mt-0.5 text-brand-2" />
              {t(key)}
            </li>
          ))}
        </ul>

        {error && (
          <div className="mb-4 p-3 bg-brand/10 border border-brand/30 text-brand-2 text-xs leading-relaxed clip-corner-card space-y-3">
            <p className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="secondary" size="sm" onClick={onPay}>
                {t('pay.retry')}
              </Button>
              <a
                href={CONTACT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-ink underline"
              >
                {t('proModal.contact')}
              </a>
            </div>
          </div>
        )}

        {active ? (
          <div className="flex items-center gap-2 p-3 bg-page border border-[rgba(255,59,48,0.35)] text-sm text-ink clip-corner-card">
            <Check className="w-4 h-4 shrink-0 text-brand-2" />
            <span>{t('pay.alreadyActive')}</span>
          </div>
        ) : (
          <Button
            variant="glow"
            fullWidth
            size="md"
            isLoading={busy}
            leftIcon={<CreditCard className="w-4 h-4" />}
            onClick={onPay}
          >
            {busy ? t('pay.redirecting') : t('pay.cta')}
          </Button>
        )}
        <Button
          variant="ghost"
          fullWidth
          size="sm"
          className="mt-2"
          leftIcon={<Mail className="w-4 h-4" />}
          onClick={() => window.open(CONTACT_URL, '_blank', 'noopener')}
        >
          {t('proModal.contact')}
        </Button>
      </div>
    </div>
  )
}
