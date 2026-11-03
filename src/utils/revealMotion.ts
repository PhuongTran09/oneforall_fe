


const NOOP = () => {}








export const REVEAL_EDGE = 12
export const REVEAL_ROOT_MARGIN = `0px 0px ${REVEAL_EDGE}% 0px`

export function initReveal(): () => void {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return NOOP
  if (typeof IntersectionObserver === 'undefined') return NOOP

  const fold = window.innerHeight * (1 + REVEAL_EDGE / 100)
  const targets = Array.from(
    document.querySelectorAll<HTMLElement>('[data-reveal], [data-reveal-items]'),
  ).filter((el) => el.getBoundingClientRect().top > fold)
  if (targets.length === 0) return NOOP

  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue
        entry.target.classList.add('is-in')
        io.unobserve(entry.target)
      }
    },
    { root: null, rootMargin: REVEAL_ROOT_MARGIN, threshold: 0 },
  )

  for (const el of targets) io.observe(el)
  return () => io.disconnect()
}
