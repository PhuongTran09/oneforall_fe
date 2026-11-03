import { useEffect, useState } from 'react'









export function useExitFade(visible: boolean, ms = 180): { show: boolean; closing: boolean } {
  const [held, setHeld] = useState(false)
  const [wasVisible, setWasVisible] = useState(visible)




  if (wasVisible !== visible) {
    setWasVisible(visible)
    setHeld(!visible)
  }

  useEffect(() => {
    if (!held) return
    const id = window.setTimeout(() => setHeld(false), ms)
    return () => window.clearTimeout(id)
  }, [held, ms])

  return { show: visible || held, closing: held && !visible }
}








export function useOpenSeq(visible: boolean, value?: unknown): number {
  const [seq, setSeq] = useState(0)
  const [last, setLast] = useState({ visible, value })

  if (last.visible !== visible || (visible && last.value !== value)) {
    setLast({ visible, value })
    if (visible) setSeq((n) => n + 1)
  }

  return seq
}
