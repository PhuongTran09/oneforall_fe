import { useEffect, type ReactNode } from 'react'
import { ToastViewport } from './ToastViewport'
import { clearAllToasts } from './toastStore'

export type { ToastInput, ToastType } from './toastStore'



export function ToastProvider({ children }: { children: ReactNode }) {
  useEffect(() => () => clearAllToasts(), [])

  return (
    <>
      {children}
      <ToastViewport />
    </>
  )
}
