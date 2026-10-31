/* Scroll reveal cho các section mang [data-reveal] nằm dưới màn hình đầu.
   [data-reveal-items] cùng máy observer nhưng CSS khác: bản thân hộp không nhún, chỉ
   lưới .stagger bên trong mới diễn — xem index.css. */
const NOOP = () => {}

export function initReveal(): () => void {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return NOOP
  if (typeof IntersectionObserver === 'undefined') return NOOP

  // Bỏ phần tử đã nằm trong khung hình lúc mount: .animate-page-enter của
  // MainLayout đã lo nữa trên màn hình, reveal lại lần nữa là nhún cả nội dung
  // người dùng đang đọc mỗi lần đổi route.
  const fold = window.innerHeight * 0.9
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
    // -10%: section cao bằng py-16/py-24; inset lớn hơn thì heading đã hiện rồi
    // mới nhún, trông như animation chạy trễ. Ngưỡng này trùng bộ lọc fold ở trên.
    { root: null, rootMargin: '0px 0px -10% 0px', threshold: 0 },
  )

  for (const el of targets) io.observe(el)
  return () => io.disconnect()
}
