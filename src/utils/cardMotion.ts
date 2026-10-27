/* Pointer tilt updates CSS variables only on hover; touch and reduced-motion users stay static. */
const MAX_TILT_DEG = 5

export function initCardMotion(): void {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  document.addEventListener('pointerover', (event) => {
    if (event.pointerType !== 'mouse') return
    const el = (event.target as Element).closest?.('.card-tilt')
    if (!(el instanceof HTMLElement)) return
    if (el.dataset.tiltBound || el.closest('[data-disabled],[aria-disabled="true"]')) return
    el.dataset.tiltBound = '1'

    const onMove = (moveEvent: PointerEvent) => {
      const rect = el.getBoundingClientRect()
      const x = (moveEvent.clientX - rect.left) / rect.width
      const y = (moveEvent.clientY - rect.top) / rect.height
      el.style.setProperty('--ry', `${(x - 0.5) * MAX_TILT_DEG}deg`)
      el.style.setProperty('--rx', `${(0.5 - y) * MAX_TILT_DEG}deg`)
      el.style.setProperty('--gx', `${x * 100}%`)
      el.style.setProperty('--gy', `${y * 100}%`)
    }

    const onLeave = () => {
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerleave', onLeave)
      delete el.dataset.tiltBound
      for (const prop of ['--rx', '--ry', '--gx', '--gy']) el.style.removeProperty(prop)
    }

    el.addEventListener('pointermove', onMove)
    el.addEventListener('pointerleave', onLeave)
  })
}
