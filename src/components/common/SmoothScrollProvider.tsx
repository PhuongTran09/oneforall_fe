import { useEffect, type ReactNode } from 'react'
import type Lenis from 'lenis'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { setLenisInstance } from '../../hooks/useSmoothScroll'
import { HEADER_OFFSET } from '../../utils/scrollMotion'

export interface SmoothScrollProviderProps {
  children: ReactNode
  /** Giây cho một lượt cuộn bánh xe. Dài quá thì người dùng thấy tay rời khỏi trang. */
  duration?: number
  /** 1 = đúng lượng px Chrome báo. Windows/Dell tăng tốc con trỏ thì hạ xuống 0.8. */
  wheelMultiplier?: number
}

// 1 - (1-t)^5: nhả mạnh đầu, dàn đều đuôi — cùng họ đường cong với cubic-bezier(0.16, 1,
// 0.3, 1) mà .stagger/reveal-up dùng trong index.css, để hai hệ không lệch pha.
const EASE_OUT_QUINT = (t: number): number => 1 - (1 - t) ** 5

/**
 * Cuộn mượt toàn cục. Mount một lần ở gốc cây (trong <BrowserRouter>, ngoài <Routes>).
 *
 * `autoRaf: true` là mấu chốt về FPS: Lenis tự mở/đóng vòng requestAnimationFrame và chỉ
 * chạy lúc còn quán tính.Provider KHÔNG viết tay `const raf = (t) => { lenis.raf(t);
 * requestAnimationFrame(raf) }` — vòng thường trực đó tỉnh cả khi không ai cuộn, mà app
 * này đã có sẵn một rAF chung cho parallax (utils/scrollMotion.ts).
 *
 * Lenis ghi scrollTop của document THẬT (không transform cái gì), nên mọi thứ đang nghe
 * cuộn trong app vẫn chạy nguyên: onScrollFrame, `position: sticky`, IntersectionObserver
 * của revealMotion. Không phải nối gì thêm.
 *
 * Hai thứ phải nhớ khi bật:
 *  - `html { scroll-behavior: smooth }` đã được khoá bằng `html.lenis { scroll-behavior: auto }`
 *    trong index.css — hai bộ làm mượt cùng chạy là mỗi cú nhảy đi hai nhịp.
 *  - Vùng cuộn bên trong (modal, bảng danh sách, cột phải của SplitWorkspace) cần
 *    `data-lenis-prevent`, nếu không bánh xe ở đó bị Lenis cướp và kéo cả trang.
 *
 * prefers-reduced-motion: không khởi tạo Lenis gì cả — về cuộn tức thì của hệ điều hành.
 */
export function SmoothScrollProvider({
  children,
  duration = 0.9,
  wheelMultiplier = 1,
}: SmoothScrollProviderProps) {
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    if (reducedMotion) return
    let disposed = false
    let lenis: Lenis | null = null
    // Lenis là tăng cường cuộn, không phải nội dung: động vào nó không làm thay đổi một pixel
    // nào của cú sơn đầu. Nhập tĩnh thì nó bị inline thẳng vào entry — chunk mà MỌI route,
    // kể cả trang landing, phải tải và parse trước khi sơn.
    void import('lenis').then(({ default: LenisClass }) => {
      if (disposed) return
      lenis = new LenisClass({
        autoRaf: true,
        duration,
        easing: EASE_OUT_QUINT,
        wheelMultiplier,
        // Nhảy theo #hash đi qua đường Lenis thay vì cắt cổ, và trừ 73px header sticky —
        // mặc định của anchors là 0 nên bấm "Khám phá" ở hero đáp sát mép trên, tiêu đề
        // section nằm dưới navbar.
        anchors: { offset: HEADER_OFFSET },
        // Cảm ứng giữ cuộn gốc của hệ điều hành: iOS/Android đã có quán tính riêng, bọc thêm
        // một lớp nội suy nữa là đơ theo từng khung hình.
        syncTouch: false,
        // Bấm <Link> đổi pathname là đích mới; mặc định của Lenis thì cục quán tính đang bay
        // vẫn còn và tiếp tục đẩy trang sau khi MainLayout đã đưa về đầu trang — người dùng
        // thấy trang mới tuột xuống một nhịp.
        stopInertiaOnNavigate: true,
      })
      setLenisInstance(lenis)
    })

    return () => {
      disposed = true
      setLenisInstance(null)
      lenis?.destroy()
    }
  }, [reducedMotion, duration, wheelMultiplier])

  return <>{children}</>
}
