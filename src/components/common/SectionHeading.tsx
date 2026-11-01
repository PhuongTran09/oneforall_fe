import { Fragment, useEffect, useRef, type CSSProperties } from 'react'
import { REVEAL_ROOT_MARGIN } from '../../utils/revealMotion'

export interface SectionHeadingProps {
  badge?: string
  title: string
  desc?: string
  className?: string
}

/**
 * Trả ref để gắn class 'is-in' đúng một lần khi tiêu đề lọt vào khung hình — cùng
 * nhịp rootMargin với initReveal(), và không đụng state nên không render lại.
 */
function useWordsInView<T extends HTMLElement>() {
  const ref = useRef<T>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (typeof IntersectionObserver === 'undefined') {
      el.classList.add('is-in')
      return
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          el.classList.add('is-in')
          io.unobserve(el)
        }
      },
      { root: null, rootMargin: REVEAL_ROOT_MARGIN, threshold: 0 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return ref
}

/**
 * Nhịp dựng chữ tính bằng số học nguyên ở đây, không bằng min()/max()/chia trong CSS:
 * `calc(560ms / max(1, …))` hợp lệ theo spec nhưng engine nào không chia được cho min/max
 * thì `--word-step` thành vô hiệu. CSS chỉ còn phép nhân `var(--i) * var(--word-step)`.
 */
const STEP_MAX_MS = 80
const STEP_SPAN_MS = 560

/** Mô tả chạy luôn cùng nhịp với từ đầu tiên, không chờ tiêu đề dựng xong. */
function revealRhythm(count: number) {
  return { step: Math.round(Math.min(STEP_MAX_MS, STEP_SPAN_MS / Math.max(1, count - 1))) }
}

/**
 * Header chung cho mọi section trang chủ — trước đây 6 section chép lại cùng một khối
 * (badge + h2 + mô tả + mb-14), mỗi lần đổi kiểu là phải sửa 6 nơi.
 */
export function SectionHeading({ badge, title, desc, className = '' }: SectionHeadingProps) {
  const headingRef = useWordsInView<HTMLHeadingElement>()
  const words = title.split(' ')
  const { step } = revealRhythm(words.length)

  return (
    <div className={`text-center max-w-2xl mx-auto mb-10 sm:mb-14 space-y-3 ${className}`}>
      {badge && (
        <div className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold bg-surface border border-[rgba(255,59,48,0.35)] text-brand badge-angular">
          {badge}
        </div>
      )}
      {/* --word-step đặt trên h2: mọi <span class="reveal-word"> là con của nó. */}
      <h2
        ref={headingRef}
        className="reveal-heading text-2xl sm:text-3xl font-extrabold text-ink tracking-tight"
        style={{ '--word-step': `${step}ms` } as CSSProperties}
      >
        {words.map((word, i) => (
          <Fragment key={`${word}-${i}`}>
            <span className="reveal-word" style={{ '--i': i } as CSSProperties}>
              {word}
            </span>{' '}
          </Fragment>
        ))}
      </h2>
      {desc && (
        <p className="reveal-desc text-slate-300 text-xs sm:text-base leading-relaxed">{desc}</p>
      )}
    </div>
  )
}
