import { useEffect } from 'react'
import { X, Check, Sparkles, Mail } from 'lucide-react'
import { Button } from '../common/Button'
import { t } from '../../i18n/langStore'

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
  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [isOpen, onClose])

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

        <div className="p-3 bg-page border border-edge text-xs text-soft leading-relaxed clip-corner-card mb-4">
          {t('proModal.note')}
        </div>

        <Button
          variant="glow"
          fullWidth
          size="md"
          leftIcon={<Mail className="w-4 h-4" />}
          onClick={() => window.open(CONTACT_URL, '_blank', 'noopener')}
        >
          {t('proModal.contact')}
        </Button>
      </div>
    </div>
  )
}
