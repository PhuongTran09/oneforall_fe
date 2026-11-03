import { useRef, useState } from 'react'
import { OctagonAlert, X } from 'lucide-react'
import { Button } from '../common/Button'
import { dismissErrorPopup, useErrorPopups } from './errorPopupStore'
import { t } from '../../i18n/langStore'
import { useExitFade } from '../../hooks/useExitFade'
import { useDialogFocus } from '../../hooks/useDialogFocus'




export function ErrorPopupViewport() {
  const queue = useErrorPopups()
  const head = queue[0] ?? null
  const { show, closing } = useExitFade(head !== null)



  const [last, setLast] = useState(head)
  if (head !== null && head !== last) setLast(head)
  const current = head ?? last

  const panelRef = useRef<HTMLDivElement>(null)


  useDialogFocus({
    panelRef,







    open: show ? (current?.id ?? false) : false,
    onEscape: () => head && dismissErrorPopup(head.id),
  })

  if (!show || !current) return null

  return (
    <div
      className={`fixed inset-0 z-[75] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm ${
        closing ? 'out-fade' : 'in-backdrop'
      }`}
      onClick={() => dismissErrorPopup(current.id)}
    >
      <div
        key={current.id}
        onClick={(e) => e.stopPropagation()}
        ref={panelRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="error-popup-title"
        aria-describedby="error-popup-message"
        tabIndex={-1}
        className={`relative w-full max-w-sm p-6 bg-surface border border-[rgba(255,59,48,0.35)] clip-corner-lg card-3d outline-none ${
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
            <h3 id="error-popup-title" className="text-base font-bold text-ink leading-snug">
              {current.title ?? t('errorPopup.title')}
            </h3>
            <p id="error-popup-message" className="text-sm text-slate-400 leading-relaxed">
              {current.message}
            </p>
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
