import { useMemo } from 'react'
import { dismissToast, showToast } from '../components/feedback/toastStore'

export { showToast, dismissToast } from '../components/feedback/toastStore'
export type { ToastInput, ToastType } from '../components/feedback/toastStore'

// Hàng đợi toast là store module — hook này chỉ là wrapper theo API trong spec.
// Util/component ngoài React có thể import thẳng `showToast` từ toastStore.
export function useToast() {
  return useMemo(() => ({ showToast, dismiss: dismissToast }), [])
}
