import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { onScrollFrame, type ScrollFrame } from '../../utils/scrollMotion'

/**
 * Thanh tiến trình cuộn 2px dính mép trên. Không có state: mỗi frame chỉ ghi một
 * `transform` lên ref, nên cuộn không kéo theo re-render cả cây — và vì nó nằm
 * ngoài <main> nên không bị content-visibility của section nào chặn vẽ.
 *
 * Trang chưa cuộn được (ô tool một màn hình) thì tỷ lệ luôn 0 → thanh vô hình,
 * không phải thêm logic "ẩn/hiện".
 */
export function ScrollProgress() {
  const barRef = useRef<HTMLDivElement>(null)
  const { pathname } = useLocation()

  useEffect(() => {
    const draw = (frame: ScrollFrame): void => {
      const bar = barRef.current
      if (!bar) return
      // max 0 khi trang ngắn hơn khung nhìn; lấy hết khoảng cuộn thật nên tỷ lệ
      // khớp đúng chỗ người dùng đứng, không phải ước lượng theo số section.
      const ratio = frame.max > 0 ? Math.min(1, Math.max(0, frame.y / frame.max)) : 0
      bar.style.transform = `scaleX(${ratio.toFixed(4)})`
    }
    // Đăng ký lại theo pathname: đổi route thì trình duyệt đưa về đầu trang mà chưa
    // chắc có sự kiện scroll, thanh cũ sẽ giữ nguyên vạch của trang vừa rời đi.
    return onScrollFrame(draw)
  }, [pathname])

  return (
    <div className="scroll-progress" aria-hidden="true">
      <div ref={barRef} className="scroll-progress-bar" />
    </div>
  )
}
