import { useState, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Navbar, Footer, AuthModal } from '../components'

export function MainLayout() {
  const [authMode, setAuthMode] = useState<'login' | 'register' | null>(null)
  const location = useLocation()

  // Tự động cuộn lên đầu trang khi đổi route
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [location.pathname])

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900 selection:bg-[#FF3B30] selection:text-white antialiased">
      <Navbar onOpenAuth={(mode) => setAuthMode(mode)} />
      <main className="flex-1 w-full">
        <div key={location.pathname} className="animate-page-enter">
          <Outlet context={{ openAuth: setAuthMode }} />
        </div>
      </main>
      <Footer />

      <AuthModal
        isOpen={authMode !== null}
        initialMode={authMode ?? 'login'}
        onClose={() => setAuthMode(null)}
      />
    </div>
  )
}
