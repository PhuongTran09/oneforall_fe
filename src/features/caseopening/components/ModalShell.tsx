import { useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { t } from '../../../i18n/langStore'
import { useExitFade } from '../../../hooks/useExitFade'

export interface ModalShellProps {
  isOpen: boolean
  title: string
  onClose: () => void
  children: ReactNode
  footer?: ReactNode
  widthClass?: string
}

/**
 * Shell cho các form dài (sửa item, cấu hình hòm). Portal ra body vì mọi `.card-3d`
 * cha đều có `perspective()` — nằm trong card thì backdrop chỉ phủ cái card.
 */
export function ModalShell({ isOpen, title, onClose, children, footer, widthClass = 'max-w-2xl' }: ModalShellProps) {
  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [isOpen, onClose])

  // Chiều ra: node ở lại 180ms (đúng bằng .in-out) để fade-out chạy xong mới bị gỡ.
  const { show, closing } = useExitFade(isOpen)

  if (!show) return null

  return createPortal(
    <div
      className={`fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm ${
        closing ? 'out-fade' : 'in-backdrop'
      }`}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`relative w-full ${widthClass} max-h-[88vh] flex flex-col p-5 sm:p-6 bg-surface border border-[rgba(255,59,48,0.35)] clip-corner-lg card-3d ${
          closing ? 'in-out' : 'in-up'
        }`}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3.5 right-3.5 p-1.5 text-slate-400 hover:text-ink hover:bg-elev transition-colors clip-corner-btn"
          aria-label={t('common.close')}
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-base font-bold text-ink leading-snug pr-8 mb-4">{title}</h3>

        <div className="flex-1 min-h-0 overflow-y-auto pr-1 space-y-4">{children}</div>

        {footer && <div className="pt-4 mt-4 border-t border-edge flex flex-col sm:flex-row gap-2.5">{footer}</div>}
      </div>
    </div>,
    document.body,
  )
}
