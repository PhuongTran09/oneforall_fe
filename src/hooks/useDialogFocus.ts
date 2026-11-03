import { useEffect, useLayoutEffect, useRef, type RefObject } from 'react'

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])'

const DIALOG_SELECTOR = '[role="dialog"], [role="alertdialog"]'











function coveredInPaint(panel: HTMLElement): boolean {
  const r = panel.getBoundingClientRect()
  if (r.width === 0 || r.height === 0) return false
  const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2)
  return !!hit && !panel.contains(hit)
}

export interface DialogFocusOptions {

  panelRef: RefObject<HTMLElement | null>





  open: boolean | number | string
  onEscape: () => void
}







export function useDialogFocus({ panelRef, open, onEscape }: DialogFocusOptions) {





  const escapeRef = useRef(onEscape)
  useLayoutEffect(() => {
    escapeRef.current = onEscape
  })

  const genRef = useRef(0)
  const openerRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!open) return
    const initial = panelRef.current
    if (!initial) return
    const gen = ++genRef.current




    const active = document.activeElement
    if (active instanceof HTMLElement && active !== document.body && !active.closest(DIALOG_SELECTOR)) {
      openerRef.current = active
    }






    if (!coveredInPaint(initial)) initial.focus({ preventScroll: true })

    const onKey = (e: KeyboardEvent) => {
      if (coveredInPaint(initial)) return
      if (e.key === 'Escape') {
        escapeRef.current()
        return
      }
      if (e.key !== 'Tab') return


      const panel = panelRef.current
      if (!panel) return
      const items = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (el) => el.offsetParent !== null,
      )
      if (items.length === 0) return
      const first = items[0]
      const last = items[items.length - 1]
      const active = document.activeElement


      const outside = !panel.contains(active)


      const onPanel = active === panel
      if (e.shiftKey && (active === first || outside || onPanel)) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && (active === last || outside)) {
        e.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      restore(openerRef, genRef, gen, initial)
    }
  }, [open, panelRef])
}













function restore(
  openerRef: RefObject<HTMLElement | null>,
  genRef: RefObject<number>,
  gen: number,
  own: HTMLElement,
) {
  queueMicrotask(() => {
    if (genRef.current !== gen) return
    const active = document.activeElement
    if (active instanceof HTMLElement) {
      const host = active.closest(DIALOG_SELECTOR)
      if (host && host !== own) return
    }
    const opener = openerRef.current
    openerRef.current = null


    if (opener && document.contains(opener)) {
      opener.focus({ preventScroll: true })
      return
    }



    const rest = [...document.querySelectorAll(DIALOG_SELECTOR)].filter(
      (el) => el !== own && document.contains(el),
    )
    const target = (rest[rest.length - 1] as HTMLElement | undefined) ?? document.getElementById('main-content')
    target?.focus({ preventScroll: true })
  })
}
