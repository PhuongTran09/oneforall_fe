import { useEffect, type ReactNode } from 'react'
import { ToastViewport } from './ToastViewport'
import { clearAllToasts } from './toastStore'

export type { ToastInput, ToastType } from './toastStore'

// ToastProvider chỉ mount viewport một lần cho toàn app (store singleton trong toastStore):
// một hàng đợi duy nhất, không spawn toast mới khi remount/re-render, StrictMode-safe.
export function ToastProvider({ children }: { children: ReactNode }) {
  useEffect(() => () => clearAllToasts(), [])

  return (
    <>
      {children}
      <ToastViewport />
    </>
  )
}
