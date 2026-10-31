import { useEffect, useState } from 'react'
import { OctagonAlert, X } from 'lucide-react'
import { Button } from '../common/Button'
import { dismissErrorPopup, useErrorPopups } from './errorPopupStore'
import { t } from '../../i18n/langStore'
import { useExitFade } from '../../hooks/useExitFade'

// Popup lỗi toàn cục: mọi nơi trong app gọi showErrorPopup(message) thay vì
// banner/toast tự biến mất — user buộc phải xác nhận nên không lỡ mất thông báo.
// z-[75]: trên AuthModal (z-50) và ConsentModal (z-70), dưới toast (z-80).
export function ErrorPopupViewport() {
  const queue = useErrorPopups()
  const head = queue[0] ?? null
  const { show, closing } = useExitFade(head !== null)

  // Queue rỗng là React gỡ panel ngay, nên phải giữ lại thông báo vừa tắt: các frame
  // fade-out vẽ đúng nội dung cũ thay vì một khoảng không.
  const [last, setLast] = useState(head)
  if (head !== null && head !== last) setLast(head)
  const current = head ?? last

  useEffect(() => {
    if (!head) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && dismissErrorPopup(head.id)
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [head])

  if (!show || !current) return null

  return (
    <div
      className={`fixed inset-0 z-[75] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm ${
        closing ? 'out-fade' : 'in-backdrop'
      }`}
      onClick={() => dismissErrorPopup(current.id)}
    >
      <div
        // queue không remount panel → không có key thì popup thứ 2, 3 hiện ra
        // không hiệu ứng gì
        key={current.id}
        onClick={(e) => e.stopPropagation()}
        role="alertdialog"
        aria-modal="true"
        aria-label={current.title ?? t('errorPopup.title')}
        className={`relative w-full max-w-sm p-6 bg-surface border border-[rgba(255,59,48,0.35)] clip-corner-lg card-3d ${
          closing ? 'in-out' : 'in-up'
        }`}
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
            <OctagonAlert className="w-6 h-6" />
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
