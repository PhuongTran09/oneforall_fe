import { useState, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Navbar, Footer, AuthModal } from '../components'
import { ConsentModal } from '../components/consent/ConsentModal'
import { LangRouteSync } from '../i18n/LangRouteSync'
import { useI18n } from '../i18n/langStore'

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
  const [authMode, setAuthMode] = useState<'login' | 'register' | null>(null)
  const { pathname } = useLocation()

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

  return (
    <div className="min-h-screen flex flex-col bg-page text-ink selection:bg-[#FF3B30] selection:text-white antialiased">
      <LangRouteSync />
      <Navbar onOpenAuth={(mode) => setAuthMode(mode)} />
      <main className="flex-1 w-full">
        <div key={pathname} className="animate-page-enter">
          <Outlet context={{ openAuth: setAuthMode }} />
        </div>
      </main>
      <Footer />

      <AuthModal
        isOpen={authMode !== null}
        initialMode={authMode ?? 'login'}
        onClose={() => setAuthMode(null)}
      />

      {/* Một instance duy nhất ở layout → không mở lại khi chuyển route */}
      <ConsentModal />
    </div>
  )
}
