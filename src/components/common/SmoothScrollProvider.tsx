import { useEffect, type ReactNode } from 'react'
import type Lenis from 'lenis'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { setLenisInstance } from '../../hooks/useSmoothScroll'
import { HEADER_OFFSET } from '../../utils/scrollMotion'

export interface SmoothScrollProviderProps {
  children: ReactNode

  duration?: number

  wheelMultiplier?: number
}



const EASE_OUT_QUINT = (t: number): number => 1 - (1 - t) ** 5





















export function SmoothScrollProvider({
  children,
  duration = 0.9,
  wheelMultiplier = 1,
}: SmoothScrollProviderProps) {
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    if (reducedMotion) return
    let disposed = false
    let lenis: Lenis | null = null



    void import('lenis').then(({ default: LenisClass }) => {
      if (disposed) return
      lenis = new LenisClass({
        autoRaf: true,
        duration,
        easing: EASE_OUT_QUINT,
        wheelMultiplier,



        anchors: { offset: HEADER_OFFSET },


        syncTouch: false,



        stopInertiaOnNavigate: true,
      })
      setLenisInstance(lenis)
    })

    return () => {
      disposed = true
      setLenisInstance(null)
      lenis?.destroy()
    }
  }, [reducedMotion, duration, wheelMultiplier])

  return <>{children}</>
}
