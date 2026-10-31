import { useEffect, useState } from 'react'

/**
 * React gỡ node ngay khi điều kiện mở chuyển sang false, nên chiều RA của overlay không
 * có animation: mọi thứ biến mất cái "bụp". Hook giữ node lại đúng `ms` (bằng thời lượng
 * class `out-*`) rồi mới thả.
 *
 * Hẹn giờ bằng timeout chứ không nghe `animationend`: guard prefers-reduced-motion đặt
 * `animation: none` nên sự kiện đó không bao giờ bắn, node kẹt lại trên DOM vĩnh viễn.
 */
export function useExitFade(visible: boolean, ms = 180): { show: boolean; closing: boolean } {
  const [held, setHeld] = useState(false)
  const [wasVisible, setWasVisible] = useState(visible)

  // Lật `held` ngay trong lần render thấy `visible` đổi (pattern "adjust state when props
  // change" của React — render này chạy lại trước khi commit, không kịp vẽ). Để trong
  // effect thì node đã bị gỡ một frame, animation ra không còn gì để chạy.
  if (wasVisible !== visible) {
    setWasVisible(visible)
    setHeld(!visible)
  }

  useEffect(() => {
    if (!held) return
    const id = window.setTimeout(() => setHeld(false), ms)
    return () => window.clearTimeout(id)
  }, [held, ms])

  return { show: visible || held, closing: held && !visible }
}

/**
 * Số thứ tự chỉ đổi lúc MỞ (hoặc lúc `value` đổi khi đang mở), dùng làm `key` cho modal mà
 * parent muốn remount để form sạch state. `key={mode ?? 'closed'}` kiểu cũ đổi cả lúc ĐÓNG
 * → React huỷ instance ngay → overlay không kịp fade ra. Ở đây node cũ sống hết animation,
 * instance mới sinh khi mở nên state cũ vẫn không rò sang lần sau, và đổi 'login' →
 * 'register' lúc modal đang hiện vẫn là một lần mở lại sạch như trước.
 */
export function useOpenSeq(visible: boolean, value?: unknown): number {
  const [seq, setSeq] = useState(0)
  const [last, setLast] = useState({ visible, value })

  if (last.visible !== visible || (visible && last.value !== value)) {
    setLast({ visible, value })
    if (visible) setSeq((n) => n + 1)
  }

  return seq
}
