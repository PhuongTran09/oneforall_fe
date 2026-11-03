import { ToastItem } from './ToastItem'
import { dismissToast, useToasts, type ToastType } from './toastStore'
import { t } from '../../i18n/langStore'


function isUrgent(type: ToastType) {
  return type === 'error' || type === 'warning'
}





















export function ToastViewport() {
  const toasts = useToasts()
  const urgent = toasts.filter((toast) => isUrgent(toast.type))
  const calm = toasts.filter((toast) => !isUrgent(toast.type))

  return (
    <div className="fixed top-16 left-3 right-3 min-[768px]:top-20 min-[768px]:left-auto min-[768px]:right-4 min-[768px]:w-[380px] z-[80] pointer-events-none">
      <div
        role="alert"
        aria-live="assertive"
        aria-atomic="false"
        aria-label={t('toast.alertRegion')}


        className="flex flex-col gap-2.5 [&:not(:empty)]:mb-2.5"
      >
        {urgent.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDismiss={dismissToast} />
        ))}
      </div>
      <div
        role="status"
        aria-live="polite"
        aria-atomic="false"
        aria-label={t('toast.region')}
        className="flex flex-col gap-2.5"
      >
        {calm.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDismiss={dismissToast} />
        ))}
      </div>
    </div>
  )
}
