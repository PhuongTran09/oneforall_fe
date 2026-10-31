import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { AlertTriangle, X } from 'lucide-react'
import { Button } from '../common/Button'
import { t } from '../../i18n/langStore'
import { useExitFade } from '../../hooks/useExitFade'

export interface ConfirmModalProps {
  isOpen: boolean
  title: string
  message?: string
  onConfirm: () => void
  onClose: () => void
}

// Popup xác nhận trước hành động thay đổi trạng thái (xóa / hủy / đăng xuất),
// thay window.confirm — cùng ngôn ngữ thiết kế với các modal khác của site.
export function ConfirmModal({ isOpen, title, message, onConfirm, onClose }: ConfirmModalProps) {
  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [isOpen, onClose])

  // Chiều ra: node ở lại 180ms (đúng bằng .in-out) để fade-out chạy xong mới bị gỡ.
  const { show, closing } = useExitFade(isOpen)

  if (!show) return null

  // Portal ra body: lớp phủ `fixed` ăn theo containing block của tổ tiên gần nhất
  // có transform, mà .card-3d (JobProgress, History) luôn có `perspective(...)` —
  // ở lại trong card thì backdrop chỉ phủ đúng cái card và bị che bởi sibling.
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
        className={`relative w-full max-w-sm p-6 bg-surface border border-[rgba(255,59,48,0.35)] clip-corner-lg card-3d ${
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

        <div className="flex items-start gap-3 mb-5 pr-6">
          <div className="w-11 h-11 shrink-0 flex items-center justify-center bg-brand/10 border border-brand/30 text-brand clip-corner-btn">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="min-w-0 space-y-1">
            <h3 className="text-base font-bold text-ink leading-snug">{title}</h3>
            {message && <p className="text-sm text-slate-400 leading-relaxed">{message}</p>}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2.5">
          <Button variant="secondary" fullWidth size="md" onClick={onClose}>
            {t('confirm.no')}
          </Button>
          <Button variant="primary" fullWidth size="md" onClick={onConfirm}>
            {t('confirm.continue')}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  )
}
