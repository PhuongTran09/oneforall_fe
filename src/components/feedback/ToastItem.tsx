import { AlertTriangle, CheckCircle2, Info, X, XCircle } from 'lucide-react'
import type { ToastEntry } from './toastStore'
import { t } from '../../i18n/langStore'

const STYLES = {
  success: { Icon: CheckCircle2, accent: '#22c55e', role: 'status' as const, titleKey: 'toast.success' },
  error: { Icon: XCircle, accent: '#ff3b30', role: 'alert' as const, titleKey: 'toast.error' },
  warning: { Icon: AlertTriangle, accent: '#f59e0b', role: 'alert' as const, titleKey: 'toast.warning' },
  info: { Icon: Info, accent: '#3b82f6', role: 'status' as const, titleKey: 'toast.info' },
}

export function ToastItem({ toast, onDismiss }: { toast: ToastEntry; onDismiss: (id: number) => void }) {
  const { Icon, accent, role, titleKey } = STYLES[toast.type]

  return (
    <div
      role={role}
      className={`toast-item clip-corner-card pointer-events-auto flex items-start gap-2.5 p-3 bg-surface border border-edge ${
        toast.leaving ? 'toast-leave' : 'toast-enter'
      }`}
      style={{ borderLeft: `3px solid ${accent}` }}
    >
      <Icon className="w-5 h-5 shrink-0" style={{ color: accent }} aria-hidden="true" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-ink">{t(titleKey)}</p>
        <p className="text-xs sm:text-sm mt-0.5 leading-relaxed text-slate-300">{toast.message}</p>
      </div>
      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        aria-label={t('toast.dismiss')}
        className="-mt-1.5 -mr-1.5 shrink-0 p-1.5 text-slate-400 hover:text-ink transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#FF3B30] clip-corner-btn"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}
