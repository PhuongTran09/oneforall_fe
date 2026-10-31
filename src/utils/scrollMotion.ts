/* Máy chạy cuộn chung cho mọi hiệu ứng dựa trên tiến trình cuộn (thanh tiến trình,
   parallax). Một listener scroll + một resize cho cả trang, gộp qua rAF: thêm hiệu
   ứng không nghĩa là thêm listener, và mỗi khung hình chỉ đọc số đo document một
   lần trước khi bất kỳ ai ghi style — không tự buộc trình duyệt layout lại giữa
   frame. */

export interface ScrollFrame {
  /** Số px đã cuộn. */
  y: number
  /** Số px cuộn hết mức có thể; 0 khi trang không tràn màn hình. */
  max: number
  /** Chiều cao khung nhìn. */
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
    // scrollHeight của documentElement mới là chiều dài thật của cả trang; body
    // có thể ngắn hơn khi trang có phần tử định vị tuyệt đối.
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

/**
 * Vẽ theo tiến trình cuộn. Callback chạy ngay một lượt để khung hình đầu đã đúng
 * (chưa cuộn thì progress 0), rồi mới tới các lượt cuộn sau. Trả hàm huỷ đăng.
 */
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

interface ParallaxItem {
  el: HTMLElement
  /** Số px dịch tối đa khi section cuộn qua hết. */
  shift: number
  /** Vị trí/chiều cao trong không gian document, đo lúc section vào khung nhìn. */
  top: number
  height: number
}

/**
 * Parallax nhẹ cho các lớp nền trang sức (lưới + quầng sáng sau hero). Chỉ lớp nền,
 * không áp cho card/chữ: dịch cả nội dung thì người đọc bị trôi dòng.
 *
 * Dịch chuyển tính theo section chứ không theo viewport và bắt đầu từ 0, nên khung
 * hình đầu tiên (chưa cuộn) hiển thị đúng nguyên bản thiết kế. Ghi vào thuộc tính
 * `translate` độc lập chứ không ghi `transform`: mấy lớp này đã có transform riêng
 * (glow dịch 50% để canh giữa), ghi đè là mất chỗ đứng.
 *
 * Tóm lại là tắt trên máy cảm ứng (touch không có hover, vẽ thêm một lớp composite
 * mỗi frame là đắt hơn cái nó mang lại) và tắt theo prefers-reduced-motion.
 */
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
      // 0 khi đầu section còn ngang đầu trang, 1 khi section đã cuộn qua hết.
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
          // Đo lại mỗi lần vào khung nhìn: section phía trên có thể vừa đổi chiều cao
          // (số liệu live, ảnh về muộn), số đo cũ sẽ làm hiệu ứng lệch pha.
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
