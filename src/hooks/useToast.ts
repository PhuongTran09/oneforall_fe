import { useMemo } from 'react'
import { dismissToast, showToast } from '../components/feedback/toastStore'

export { showToast, dismissToast } from '../components/feedback/toastStore'
export type { ToastInput, ToastType } from '../components/feedback/toastStore'



export function useToast() {
  return useMemo(() => ({ showToast, dismiss: dismissToast }), [])
}
