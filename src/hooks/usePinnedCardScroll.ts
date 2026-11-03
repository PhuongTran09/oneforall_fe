import { useEffect, useLayoutEffect, useRef, useState } from 'react'
























const WIDE_MEDIA = '(min-width: 64rem) and (min-height: 36rem)'
const REDUCE_MEDIA = '(prefers-reduced-motion: reduce)'







const NATIVE_TIMELINE =
  typeof CSS !== 'undefined' &&
  typeof CSS.supports === 'function' &&
  CSS.supports('animation-timeline', 'view()')

const clamp01 = (value: number): number => (value < 0 ? 0 : value > 1 ? 1 : value)

export function usePinnedCardScroll() {
  const rootRef = useRef<HTMLDivElement>(null)



  const [enabled, setEnabled] = useState(
    () =>
      typeof window.matchMedia === 'function' &&
      window.matchMedia(WIDE_MEDIA).matches &&
      !window.matchMedia(REDUCE_MEDIA).matches,
  )

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return
    const wide = window.matchMedia(WIDE_MEDIA)
    const reduce = window.matchMedia(REDUCE_MEDIA)
    const sync = () => setEnabled(wide.matches && !reduce.matches)
    wide.addEventListener('change', sync)
    reduce.addEventListener('change', sync)
    return () => {
      wide.removeEventListener('change', sync)
      reduce.removeEventListener('change', sync)
    }
  }, [])





  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root) return
    const stage = root.querySelector<HTMLElement>('.pin-stage')
    const viewport = root.querySelector<HTMLElement>('.pin-viewport')
    const track = root.querySelector<HTMLElement>('.pin-track')



    if (!enabled || !viewport || !track || !stage) {
      track?.style.removeProperty('transform')
      root.style.removeProperty('--pin-stage-h')
      root.style.removeProperty('--pin-stick-start')
      root.style.setProperty('--pin-shift', '0px')
      root.style.setProperty('--pin-x', '0')
      return
    }

    let shift = 0







    let stickyTop = 0
    let stale = true
    let raf = 0


    let drawn = -1

    const measure = () => {


      track.style.removeProperty('transform')
      stickyTop = Number.parseFloat(getComputedStyle(stage).top) || 0





      root.style.removeProperty('--pin-stage-h')
      const stageHeight = Math.ceil(stage.getBoundingClientRect().height)
      root.style.setProperty('--pin-stage-h', `${stageHeight}px`)

      const cards = track.children
      const width = viewport.getBoundingClientRect().width
      shift =
        cards.length < 2
          ? 0
          : Math.max(
              0,
              cards[cards.length - 1].getBoundingClientRect().right -
                cards[0].getBoundingClientRect().left -
                width,
            )
      root.style.setProperty('--pin-shift', `${shift.toFixed(2)}px`)
      root.style.setProperty(
        '--pin-stick-start',
        `${Math.max(0, window.innerHeight - stickyTop).toFixed(2)}px`,
      )
      drawn = -1
      stale = false
    }

    const draw = () => {
      raf = 0
      if (stale) measure()
      if (NATIVE_TIMELINE) return
      const progress = shift > 0 ? clamp01((stickyTop - root.getBoundingClientRect().top) / shift) : 0
      if (progress === drawn) return
      drawn = progress
      track.style.transform = `translate3d(${(-progress * shift).toFixed(2)}px, 0, 0)`
      root.style.setProperty('--pin-x', progress.toFixed(4))
    }

    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(draw)
    }
    const onLayoutChange = () => {
      stale = true
      schedule()
    }

    measure()

    if (!NATIVE_TIMELINE) window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', onLayoutChange)
    let ro: ResizeObserver | undefined
    if (typeof ResizeObserver === 'function') {
      ro = new ResizeObserver(onLayoutChange)
      ro.observe(viewport)
    }
    let mo: MutationObserver | undefined
    if (typeof MutationObserver === 'function') {
      mo = new MutationObserver(onLayoutChange)
      mo.observe(track, { childList: true, subtree: true, characterData: true })
    }
    schedule()

    return () => {
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', onLayoutChange)
      ro?.disconnect()
      mo?.disconnect()
      if (raf) cancelAnimationFrame(raf)
      track.style.removeProperty('transform')
      root.style.removeProperty('--pin-stage-h')
      root.style.removeProperty('--pin-stick-start')
      root.style.setProperty('--pin-shift', '0px')
      root.style.setProperty('--pin-x', '0')
    }
  }, [enabled])

  return { rootRef, enabled }
}
