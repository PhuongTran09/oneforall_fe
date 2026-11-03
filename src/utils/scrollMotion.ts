




import { getLenisInstance } from '../hooks/useSmoothScroll'

export interface ScrollFrame {

  y: number

  max: number

  viewport: number
}

type Subscriber = (frame: ScrollFrame) => void

const NOOP = () => {}
const subscribers = new Set<Subscriber>()
let pending = 0

const clamp = (value: number, min: number, max: number): number =>
  value < min ? min : value > max ? max : value

function readFrame(): ScrollFrame {
  const viewport = window.innerHeight
  return {
    y: window.scrollY,
    viewport,


    max: Math.max(0, document.documentElement.scrollHeight - viewport),
  }
}

function emit(): void {
  pending = 0
  const frame = readFrame()
  for (const draw of subscribers) draw(frame)
}

function schedule(): void {
  if (pending || subscribers.size === 0) return
  pending = requestAnimationFrame(emit)
}





export function onScrollFrame(draw: Subscriber): () => void {
  if (typeof window === 'undefined' || typeof requestAnimationFrame !== 'function') return NOOP
  if (subscribers.size === 0) {
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
  }
  subscribers.add(draw)
  draw(readFrame())

  return () => {
    subscribers.delete(draw)
    if (subscribers.size > 0) return
    window.removeEventListener('scroll', schedule)
    window.removeEventListener('resize', schedule)
    if (pending) cancelAnimationFrame(pending)
    pending = 0
  }
}





export const HEADER_OFFSET = -73






export function scrollToSection(id: string): void {
  const el = document.getElementById(id)
  if (!el) return
  const lenis = getLenisInstance()
  if (lenis) {
    lenis.scrollTo(el, { offset: HEADER_OFFSET })
    return
  }
  el.scrollIntoView({ behavior: 'smooth' })
}

interface ParallaxItem {
  el: HTMLElement

  shift: number

  top: number
  height: number
}













export function initParallax(): () => void {
  if (typeof window === 'undefined') return NOOP
  if (typeof IntersectionObserver === 'undefined') return NOOP
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return NOOP
  if (!window.matchMedia('(pointer: fine)').matches) return NOOP

  const nodes = Array.from(document.querySelectorAll<HTMLElement>('[data-parallax]'))
  if (nodes.length === 0) return NOOP

  const items: ParallaxItem[] = nodes.map((el) => ({
    el,
    shift: clamp(Number(el.dataset.parallax) || 32, -80, 80),
    top: 0,
    height: 1,
  }))

  const measure = (item: ParallaxItem): void => {
    const rect = item.el.getBoundingClientRect()
    item.top = rect.top + window.scrollY
    item.height = Math.max(1, rect.height)
  }
  const measureAll = (): void => {
    for (const item of items) measure(item)
  }

  const active = new Set<ParallaxItem>()
  const draw = (frame: ScrollFrame): void => {
    for (const item of active) {

      const progress = clamp((frame.y - item.top) / item.height, 0, 1)
      item.el.style.translate = `0 ${(progress * item.shift).toFixed(1)}px`
    }
  }

  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const item = items.find((candidate) => candidate.el === entry.target)
        if (!item) continue
        if (entry.isIntersecting) {
          measure(item)
          active.add(item)
        } else {
          active.delete(item)
          item.el.style.translate = ''
        }
      }
    },
    { rootMargin: '25% 0px 25% 0px', threshold: 0 },
  )

  measureAll()
  for (const item of items) io.observe(item.el)
  const onResize = (): void => measureAll()
  window.addEventListener('resize', onResize)
  const unsubscribe = onScrollFrame(draw)

  return () => {
    unsubscribe()
    window.removeEventListener('resize', onResize)
    io.disconnect()
    active.clear()
    for (const item of items) item.el.style.translate = ''
  }
}
