import { useState, useEffect } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Navbar, Footer, AuthModal, ProPlanModal, SocialBarAds } from '../components'
import { ConsentModal } from '../components/consent/ConsentModal'
import { LangRouteSync } from '../i18n/LangRouteSync'
import { useI18n, withLocale } from '../i18n/langStore'
import { subscribeAuthEvent, useAuth } from '../services/authStore'
import { initReveal } from '../utils/revealMotion'

// Vị trí cuộn theo pathname. React Router v7 ở chế độ khai báo (BrowserRouter + <Routes>)
// không có <ScrollRestoration> (chỉ dùng được với data router), nên app tự quản lý:
// trang đã ghé sẽ được khôi phục đúng chỗ cũ khi quay lại bằng Back/Forward hoặc link menu;
// trang chưa từng ghé thì lên đầu. Không dùng localStorage — vị trí cuộn chỉ có nghĩa
// trong phiên hiện tại.
const scrollByPath = new Map<string, number>()

export function MainLayout() {
  // Navbar/Footer/page con gọi t() trực tiếp (không hook) → layout phải subscribe
  // để cả subtree render lại khi lang đổi.
  useI18n()
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'forgot' | null>(null)
  const [proOpen, setProOpen] = useState(false)
  const { session } = useAuth()
  const { pathname } = useLocation()
  const navigate = useNavigate()

  // CTA gói Pro: chưa đăng nhập → bắt đăng ký/đăng nhập; đã đăng nhập → hiện bảng gói Pro.
  const openPro = () => {
    if (session) setProOpen(true)
    else setAuthMode('register')
  }

  // Supabase gửi PASSWORD_RECOVERY khi link đặt lại mật khẩu được open
  // (detectSessionInUrl đổi hash → session recovery) → đưa user về route reset.
  useEffect(
    () =>
      subscribeAuthEvent((event) => {
        if (event !== 'PASSWORD_RECOVERY') return
        setAuthMode(null)
        const target = withLocale('/auth/reset-password')
        // Đang ở chính trang reset (hash được tiêu thụ tại chỗ) → không navigate,
        // tránh history replace xóa hash/token trước khi supabase-js xử lý xong.
        if (window.location.pathname === target) return
        navigate(target, { replace: true })
      }),
    [navigate],
  )

  useEffect(() => {
    const saved = scrollByPath.get(pathname)
    const restore = () => window.scrollTo({ top: saved ?? 0, left: 0, behavior: 'instant' })

    // Khôi phục sau khi DOM của route mới đã commit (effect chạy sau commit) và một
    // frame layout ổn định, tránh scroll vào chiều cao cũ khi trang còn render.
    let raf = 0
    if (saved === undefined || typeof requestAnimationFrame !== 'function') {
      restore()
    } else {
      raf = requestAnimationFrame(restore)
    }

    const onScroll = () => {
      scrollByPath.set(pathname, window.scrollY)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      if (raf) cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
    }
  }, [pathname])

  // Scroll reveal chạy sau hiệu ứng page-enter của route mới. rAF thứ hai là để
  // đo getBoundingClientRect() SAU khi restore() ở effect trên đã định vị cuộn
  // (nó cũng queue một rAF), nếu không Back/Forward sẽ tính nhầm section nào
  // "đã trong khung hình".
  useEffect(() => {
    let dispose = () => {}
    const raf = requestAnimationFrame(() => {
      dispose = initReveal()
    })
    return () => {
      cancelAnimationFrame(raf)
      dispose()
    }
  }, [pathname])

  return (
    <div className="min-h-screen flex flex-col bg-page text-ink selection:bg-brand selection:text-white antialiased">
      <LangRouteSync />
      <Navbar onOpenAuth={(mode) => setAuthMode(mode)} />
      <main className="flex-1 w-full">
        <div key={pathname} className="animate-page-enter">
          <Outlet context={{ openAuth: setAuthMode, openPro }} />
        </div>
      </main>
      <Footer />

      {/* key theo mode: mỗi lần mở là instance mới → state form/OTP không dư leftover */}
      <AuthModal
        key={authMode ?? 'closed'}
        isOpen={authMode !== null}
        initialMode={authMode ?? 'login'}
        onClose={() => setAuthMode(null)}
      />

      <ProPlanModal isOpen={proOpen} onClose={() => setProOpen(false)} />

      {/* Một instance duy nhất ở layout → không mở lại khi chuyển route */}
      <ConsentModal />

      {/* Điểm nạp script quảng cáo duy nhất của app (một lần cho cả phiên trang) */}
      <SocialBarAds />
    </div>
  )
}
