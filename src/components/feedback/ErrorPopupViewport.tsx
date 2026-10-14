import { useEffect } from 'react'
import { AlertOctagon, X } from 'lucide-react'
import { Button } from '../common/Button'
import { dismissErrorPopup, useErrorPopups } from './errorPopupStore'
import { t } from '../../i18n/langStore'

// Popup lỗi toàn cục: mọi nơi trong app gọi showErrorPopup(message) thay vì
// banner/toast tự biến mất — user buộc phải xác nhận nên không lỡ mất thông báo.
// z-[75]: trên AuthModal (z-50) và ConsentModal (z-70), dưới toast (z-80).
export function ErrorPopupViewport() {
  const queue = useErrorPopups()
  const current = queue[0] ?? null

  useEffect(() => {
    if (!current) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && dismissErrorPopup(current.id)
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [current])

  if (!current) return null

  return (
    <div
      className="fixed inset-0 z-[75] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={() => dismissErrorPopup(current.id)}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        role="alertdialog"
        aria-modal="true"
        aria-label={current.title ?? t('errorPopup.title')}
        className="relative w-full max-w-sm p-6 bg-surface border border-[rgba(255,59,48,0.35)] clip-corner-lg card-3d"
      >
        <button
          type="button"
          onClick={() => dismissErrorPopup(current.id)}
          className="absolute top-3.5 right-3.5 p-1.5 text-slate-400 hover:text-ink hover:bg-elev transition-colors clip-corner-btn"
          aria-label={t('common.close')}
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-start gap-3 mb-5 pr-6">
          <div className="w-11 h-11 shrink-0 flex items-center justify-center bg-brand/10 border border-brand/30 text-brand clip-corner-btn">
            <AlertOctagon className="w-6 h-6" />
          </div>
          <div className="min-w-0 space-y-1">
            <h3 className="text-base font-bold text-ink leading-snug">{current.title ?? t('errorPopup.title')}</h3>
            <p className="text-sm text-slate-400 leading-relaxed">{current.message}</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2.5">
          {current.onRetry && (
            <Button
              variant="secondary"
              fullWidth
              size="md"
              onClick={() => {
                dismissErrorPopup(current.id)
                current.onRetry?.()
              }}
            >
              {t('errorPopup.retry')}
            </Button>
          )}
          <Button variant="primary" fullWidth size="md" onClick={() => dismissErrorPopup(current.id)}>
            {t('errorPopup.ok')}
          </Button>
        </div>
      </div>
    </div>
  )
}
