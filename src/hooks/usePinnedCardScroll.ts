import { useEffect, useLayoutEffect, useRef, useState } from 'react'

/**
 * Horizontal pinned card scroll: dải card nằm trong một hộp `position: sticky` cao tối
 * thiểu một màn hình, hộp cha cao thêm đúng bằng bề rộng tràn của dải. Cuộn dọc qua hộp
 * cha thì sticky tự bám — mỗi px dọc dịch dải một px ngang, hết px là nhả ghim.
 *
 * Vì phần "bám" là sticky thật của trình duyệt chứ không phải JS giữ toạ độ bằng `fixed`,
 * nên cuộn bánh xe nhanh, cuộn bằng phím, kéo thanh cuộn hay `scrollIntoView` đều ra cùng
 * một vị trí. Quãng dịch thì có hai bản:
 *   - bản timeline (Chrome/Edge/Safari 26+): CSS nội suy `transform` theo chính khung
 *     hình vẽ, JS chỉ đo ba số lúc layout đổi — không độ trễ một frame, main thread rảnh.
 *   - bản JS (browser chưa có `animation-timeline`): rAF đọc rect rồi viết transform.
 * Hai bản chọn nhau bằng đúng một điều kiện hỗ trợ, JS và CSS thấy như nhau.
 *
 * Điều kiện chạy: từ 1024px, cửa sổ cao từ 576px, và hệ điều hành không yêu cầu giảm
 * chuyển động. Không đạt thì `[data-pin]` không tồn tại, mọi rule trong index.css tắt
 * theo, markup về đúng lưới grid gốc (card 3–4 không bao giờ bị cắt mất).
 */

/**
 * Mốc `lg` của dự án — dưới mức này giữ lưới grid, pin cả màn hình trên điện thoại là tự sát.
 * Kèm `min-height`: cửa sổ thấp (1366×768 khi zoom, cửa sổ thu dọc, toolbar ăn mất chiều cao)
 * thì màn ghim không đủ chỗ cho tiêu đề + dải card + vạch tiến trình, thà để lưới_static.
 */
const WIDE_MEDIA = '(min-width: 64rem) and (min-height: 36rem)'
const REDUCE_MEDIA = '(prefers-reduced-motion: reduce)'

/**
 * Bản mượt: scroll-driven animation. Trình duyệt nội suy `transform` ngay tại khung hình
 * vẽ, lấy số cuộn của chính khung hình đó — không có độ trễ một frame, không đụng main
 * thread. CSS bật animation trong `@supports (animation-timeline: view())`; ở đây JS cần
 * biết để đừng làmซ้ำ (và đừng viết `--pin-x`, biến chỉ dành cho bản JS).
 */
const NATIVE_TIMELINE =
  typeof CSS !== 'undefined' &&
  typeof CSS.supports === 'function' &&
  CSS.supports('animation-timeline', 'view()')

const clamp01 = (value: number): number => (value < 0 ? 0 : value > 1 ? 1 : value)

export function usePinnedCardScroll() {
  const rootRef = useRef<HTMLDivElement>(null)

  // Đọc thẳng vào state khởi tạo (như useReducedMotion): setEnabled đồng bộ trong effect
  // body là một lần render thừa ngay khi mount.
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

  // useLayoutEffect chứ không phải useEffect: measure() viết --pin-stage-h/--pin-shift,
  // tức là quyết định chiều cao hộp cha và mốc nhả ghim. Chạy sau paint thì một khung
  // hình đầu hộp còn ngắn — reload ngay tại #how-it-works là thấy dải đứng chờ rồi bất
  // ngờ dài ra.
  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root) return
    const stage = root.querySelector<HTMLElement>('.pin-stage')
    const viewport = root.querySelector<HTMLElement>('.pin-viewport')
    const track = root.querySelector<HTMLElement>('.pin-track')

    // Tắt hiệu ứng giữa chừng (thu nhỏ cửa sổ, đổi tuỳ chọn hệ điều hành): trả DOM về
    // nguyên trạng, để lại transform là dải card đứng lệch mãi trong layout grid.
    if (!enabled || !viewport || !track || !stage) {
      track?.style.removeProperty('transform')
      root.style.removeProperty('--pin-stage-h')
      root.style.removeProperty('--pin-stick-start')
      root.style.setProperty('--pin-shift', '0px')
      root.style.setProperty('--pin-x', '0')
      return
    }

    let shift = 0
    /**
     * Ngưỡng dính ghim của stage — chính là `top:` đang áp dụng, đọc lại một lượt cùng lúc
     * đo độ tràn. Phải trừ nó chứ không lấy top của root làm 0: stage bắt đầu bám khi root
     * còn cách mép trên đúng chừng ấy px, quãng bám vì thế kết thúc ở root.top = stickyTop
     * - shift. Quên stickyTop thì progress mới tới 0,94 là dải đã bị nhả, miếng cuối của
     * card chót nằm ngoài khung nhìn vĩnh viễn.
     */
    let stickyTop = 0
    let stale = true
    let raf = 0
    // Tiến trình đã vẽ. Trang dài ~13.000px trong khi dải chỉ bám vài trăm px, nên ngoài
    // đoạn đó progress luôn luôn 0 — khỏi ghi style vô ích mỗi khung hình cuộn.
    let drawn = -1

    const measure = () => {
      // Gỡ transform trước khi đo: rect của card đã bị dịch đi thì số đo ngắn hơn thật,
      // mỗi lần đo là một lần lệch thêm — chính cái giật mà người dùng thấy.
      track.style.removeProperty('transform')
      stickyTop = Number.parseFloat(getComputedStyle(stage).top) || 0

      // Chiều cao thật của màn ghim: min-height lấy từ --pin-stage-h, nên phải xoá số đo
      // cũ để stage quay về giá trị calc(100dvh - top) của CSS rồi mới đo — không xoá là
      // nó đóng băng ở con số của lần đo trước, đổi cỡ cửa sổ không co lại nữa. Số này rồi
      // đi cả vào chiều cao hộp cha, tức là quãng đường nhả ghim.
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
      // Cùng một số cho cả chiều cao hộp (CSS) lẫn quãng dịch (JS) — hai nơi tính khác
      // nhau là nhả ghim sớm/muộn một nhịp.
      root.style.setProperty('--pin-shift', `${shift.toFixed(2)}px`)
      // Mốc bắt đầu bám, đo từ lúc .pin-root nhô vào mép dưới khung nhìn. Cùng --pin-shift,
      // hai số này là toàn bộ những gì timeline cần: CSS tự nội suy, JS không việc mỗi frame.
      root.style.setProperty(
        '--pin-stick-start',
        `${Math.max(0, window.innerHeight - stickyTop).toFixed(2)}px`,
      )
      // Đo lại là shift đổi, cùng một progress giờ là một số px khác — buộc vẽ lại.
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

    // Bản timeline: không nghe scroll chút nào — main thread rảnh hoàn toàn khi cuộn.
    if (!NATIVE_TIMELINE) window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', onLayoutChange)
    // Đổi ngôn ngữ/font về muộn/thanh cuộn xuất hiện làm hộp đổi bề rộng mà không có
    // sự kiện resize nào: ResizeObserver của layout là chỗ dựa duy nhất đáng tin.
    let ro: ResizeObserver | undefined
    if (typeof ResizeObserver === 'function') {
      ro = new ResizeObserver(onLayoutChange)
      ro.observe(viewport)
    }
    /**
     * ResizeObserver chỉ báo khi hộp `.pin-viewport` đổi kích thước, mà hộp đó thì
     * rộng theo khung grid ngoài (không đổi khi dải card ngắn lại) và cao theo card dài
     * nhất (không đổi khi chỉ bớt card). Nên thêm/bớt card, hoặc bản dịch khiến cả dải
     * ngắn đi mà chiều cao y nguyên, là trường hợp RO đứng yên còn `shift` thì sai —
     * sai theo cả hai hướng: dải bị cắt, hoặc hộp cha cao thừa một quãng ghim trống.
     * childList + characterData trên track bắt đúng thay đổi chỉ nằm bên trong dải.
     */
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
