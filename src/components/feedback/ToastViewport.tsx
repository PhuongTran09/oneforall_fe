import { ToastItem } from './ToastItem'
import { dismissToast, useToasts } from './toastStore'
import { t } from '../../i18n/langStore'

// Desktop: góc trên phải, dưới Navbar. Mobile: dải ngang trên cùng, auto-dismiss nên
// không che lâu các nút thao tác. position:fixed → không làm shift layout trang.
// z-80: nằm trên AuthModal (z-50) và ConsentModal (z-70).
export function ToastViewport() {
  const toasts = useToasts()

  return (
    <div
      aria-live="polite"
      aria-label={t('toast.region')}
      className="fixed top-16 left-3 right-3 min-[768px]:top-20 min-[768px]:left-auto min-[768px]:right-4 min-[768px]:w-[380px] z-[80] flex flex-col gap-2.5 pointer-events-none"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={dismissToast} />
      ))}
    </div>
  )
}
