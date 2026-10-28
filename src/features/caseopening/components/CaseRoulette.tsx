import { useEffect, useRef } from 'react'
import type { StripCell } from '../types'
import { SPIN_EASING, computeStopOffset, spinSchedule, type SpinPlan } from '../utils/roulette'
import { ItemTile } from './ItemTile'

export interface CaseRouletteProps {
  cells: StripCell[]
  imageUrls: Record<string, string>
  /** Vị trí ô trúng thưởng trên strip — đã biết trước khi quay. */
  targetIndex: number
  /** Tăng lên mỗi lượt; 0 = chưa quay lần nào (chỉ preview tĩnh). */
  spinId: number
  spinning: boolean
  durationMs: number
  onDone: () => void
  /** Báo lịch quay (các ô qua kim + lúc phanh dừng), đúng lúc track bắt đầu chạy. */
  onSpinScheduled?: (plan: SpinPlan) => void
}

/**
 * Track chỉ dịch bằng một CSS transition duy nhất: JS viết transform một lần rồi
 * chờ transitionend, không có frame nào re-render React.
 */
export function CaseRoulette({ cells, imageUrls, targetIndex, spinId, spinning, durationMs, onDone, onSpinScheduled }: CaseRouletteProps) {
  const viewportRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const doneRef = useRef(onDone)
  const scheduledRef = useRef(onSpinScheduled)
  useEffect(() => {
    doneRef.current = onDone
  }, [onDone])
  useEffect(() => {
    scheduledRef.current = onSpinScheduled
  }, [onSpinScheduled])

  useEffect(() => {
    const track = trackRef.current
    const viewport = viewportRef.current
    if (!track || !viewport || spinId === 0) return

    const first = track.children[0] as HTMLElement | undefined
    const second = track.children[1] as HTMLElement | undefined
    if (!first) return
    const pitch = second ? second.offsetLeft - first.offsetLeft : first.offsetWidth
    const offset = computeStopOffset(targetIndex, pitch, viewport.clientWidth)

    track.style.transition = 'none'
    track.style.transform = 'translateX(0px)'
    // Ép reflow để trình duyệt chốt điểm xuất phát trước khi bật transition.
    void track.offsetWidth
    const raf = requestAnimationFrame(() => {
      track.style.transition = `transform ${durationMs}ms ${SPIN_EASING}`
      track.style.transform = `translateX(${-offset}px)`
      scheduledRef.current?.(spinSchedule(offset, pitch, viewport.clientWidth, durationMs))
    })
    return () => cancelAnimationFrame(raf)
  }, [durationMs, spinId, targetIndex])

  return (
    <div className="relative w-full">
      <div
        ref={viewportRef}
        className="case-roulette overflow-x-hidden"
        data-spinning={spinning ? 'true' : 'false'}
      >
        <div
          ref={trackRef}
          className="case-roulette-track flex gap-2 sm:gap-3 px-2"
          onTransitionEnd={(e) => {
            if (e.target === trackRef.current && e.propertyName === 'transform') doneRef.current()
          }}
        >
          {cells.map((cell) => (
            <div key={cell.key} className="shrink-0">
              <ItemTile
                name={cell.name}
                color={cell.color}
                rarityColor={cell.rarityColor}
                imageUrl={cell.imageAssetId ? imageUrls[cell.imageAssetId] : undefined}
                size="md"
              />
            </div>
          ))}
        </div>
      </div>
      <div className="case-needle" aria-hidden="true" />
    </div>
  )
}
