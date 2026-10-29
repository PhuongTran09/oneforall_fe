import { useState, useEffect, Suspense } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Navbar, Footer, AuthModal, ProPlanModal, SocialBarAds, BuyMeCoffee } from '../components'
import { ConsentModal } from '../components/consent/ConsentModal'
import { LangRouteSync } from '../i18n/LangRouteSync'
import { t, useI18n, withLocale } from '../i18n/langStore'
import { subscribeAuthEvent, useAuth } from '../services/authStore'
import { initReveal } from '../utils/revealMotion'

// Vị trí cuộn theo pathname. React Router v7 ở chế độ khai báo (BrowserRouter + <Routes>)
// không có <ScrollRestoration> (chỉ dùng được với data router), nên app tự quản lý:
// bấm link sang trang mới thì luôn lên đầu, chỉ Back/Forward mới khôi phục chỗ cũ —
// người dùng sang công cụ khác là để đọc từ đầu, còn Back là để quay lại đúng chỗ đang
// đọc. Không dùng localStorage — vị trí cuộn chỉ có nghĩa trong phiên hiện tại.
const scrollByPath = new Map<string, number>()

// popstate là sự kiện gốc, router chỉ thông báo lại sau khi React render xong, nên
// đánh dấu ở đây rồi cho effect theo pathname đọc. Listener đăng sau router cũng không
// sao: cả hai chạy hết trong cùng lượt dispatch, trước khi React flush effect.
let isPop = false

// Chỗ chờ khi chunk của route chưa về. cao bằng khoảng một khối nội dung đầu
// trang để footer không nhảy lên rồi tụt xuống lúc page thật render.
function RouteFallback() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 text-brand-2">
      <span className="w-8 h-8 rounded-full border-2 border-current border-t-transparent animate-spin" />
      <span className="text-sm text-soft">{t('common.loading')}</span>
    </div>
  )
}

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
    const markPop = () => {
      isPop = true
    }
    window.addEventListener('popstate', markPop)
    return () => window.removeEventListener('popstate', markPop)
  }, [])

  useEffect(() => {
    const pop = isPop
    isPop = false
    const saved = pop ? scrollByPath.get(pathname) : undefined
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
          {/* Bọc Outlet chứ không bọc cả <Routes>: chờ chunk của route thì
              Navbar/Footer/modal vẫn đứng nguyên, không chớp cả khung hình. */}
          <Suspense fallback={<RouteFallback />}>
            <Outlet context={{ openAuth: setAuthMode, openPro }} />
          </Suspense>
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

      {/* Nút ủng hộ nổi góc dưới phải — z-40 nên modal (z-50 trở lên) vẫn che được. */}
      <BuyMeCoffee />
    </div>
  )
}
