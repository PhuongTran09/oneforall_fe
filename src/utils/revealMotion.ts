/* Scroll reveal cho các section mang [data-reveal] nằm dưới màn hình đầu.
   [data-reveal-items] cùng máy observer nhưng CSS khác: bản thân hộp không nhún, chỉ
   lưới .stagger bên trong mới diễn — xem index.css. */
const NOOP = () => {}

/* Mép kích hoạt, tính bằng % chiều cao khung nhìn, dương là đẩy XUỐNG dưới mép dưới
   màn hình. Bản cũ -10% bắt section phải leo vào tận 10% trong màn hình mới bắt đầu
   diễn — kéo xuống tới nơi chữ vẫn chưa nhúc nhích, lúc nào cũng thấy nội dung "đã
   hiện sẵn" thay vì thấy nó hiện ra. +12% đánh thức khi mép trên của section còn nằm
   dưới màn hình một quãng, nên cú wipe chạy song song với lúc nó bước vào.
   Một số nuôi cả bộ lọc fold dưới kia; SectionHeading đọc REVEAL_ROOT_MARGIN để hai
   máy observer không bao giờ lệch nhịp. */
export const REVEAL_EDGE = 12
export const REVEAL_ROOT_MARGIN = `0px 0px ${REVEAL_EDGE}% 0px`

export function initReveal(): () => void {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return NOOP
  if (typeof IntersectionObserver === 'undefined') return NOOP

  // Bỏ phần tử đã nằm trong khung hình lúc mount: .animate-page-enter của
  // MainLayout đã lo nữa trên màn hình, reveal lại lần nữa là nhún cả nội dung
  // người dùng đang đọc mỗi lần đổi route. Ngưỡng lấy đúng bằng mép kích hoạt — thứ
  // nằm trên mép đó thì observer cũng gọi ngay lúc gắn, diễn off-screen chỉ phí paint.
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
        io.unobserve(entry.target) // reveal một lần, không replay khi cuộn lên xuống
      }
    },
    { root: null, rootMargin: REVEAL_ROOT_MARGIN, threshold: 0 },
  )

  for (const el of targets) io.observe(el)
  return () => io.disconnect()
}
