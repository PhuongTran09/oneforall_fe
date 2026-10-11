import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  Menu,
  X,
  Video,
  FileSpreadsheet,
  Image as ImageIcon,
  LogIn,
  ArrowRight,
} from 'lucide-react'
import { Button } from './Button'
import { AuthModal } from '../feedback/AuthModal'

function YoutubeIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  )
}

export interface NavbarProps {
  onOpenAuth?: (mode: 'login' | 'register') => void
}

export function Navbar({ onOpenAuth }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register' | null>(null)
  const location = useLocation()

  const handleAuthClick = (mode: 'login' | 'register') => {
    setMobileMenuOpen(false)
    if (onOpenAuth) {
      onOpenAuth(mode)
    } else {
      setAuthModalMode(mode)
    }
  }

  const navCategories = [
    { label: 'YouTube', to: '/youtube-downloader', icon: <YoutubeIcon className="w-4 h-4 text-[#FF3B30]" /> },
    { label: 'TikTok', to: '/tiktok-downloader', icon: <Video className="w-4 h-4 text-[#FF6B4A]" /> },
    { label: 'Chuyển đổi File', to: '/convert', icon: <FileSpreadsheet className="w-4 h-4 text-emerald-500" /> },
    { label: 'Xử lý ảnh', to: '/remove-background', icon: <ImageIcon className="w-4 h-4 text-indigo-500" /> },
  ]

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-[#2a2a35] bg-[#0a0a0f]/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo Brand */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10   flex items-center justify-center">
              <img src="/ofa.png" alt="OneForAll Logo" className="w-full h-full object-contain" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-xl tracking-tight text-white flex items-center gap-1.5">
                One<span className="text-brand-gradient">ForAll</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 bg-[#ff3b30]/10 text-[#FF3B30] border border-[#ff3b30]/30 font-semibold clip-corner-btn">
                  Tools
                </span>
              </span>
            </div>
          </Link>

          {/* Desktop Nav Items */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-1.5" aria-label="Điều hướng chính">
            {navCategories.map((item) => {
              const isActive = location.pathname.startsWith(item.to)
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium transition-colors clip-corner-btn ${
                    isActive
                      ? 'text-[#FF3B30] bg-[#ff3b30]/15 font-semibold'
                      : 'text-slate-300 hover:text-white hover:bg-[#ff3b30]/10'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleAuthClick('login')}
              leftIcon={<LogIn className="w-4 h-4" />}
            >
              Đăng nhập
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => handleAuthClick('register')}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Bắt đầu miễn phí
            </Button>
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-300 hover:text-white hover:bg-[#ff3b30]/10 focus:outline-none clip-corner-btn"
              aria-label={mobileMenuOpen ? 'Đóng menu' : 'Mở menu'}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-[#2a2a35] bg-[#0a0a0f] px-4 pt-3 pb-6 animate-in slide-in-from-top-2 duration-200">
            <nav className="flex flex-col space-y-1 mb-4">
              {navCategories.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium text-slate-200 hover:text-[#FF3B30] hover:bg-[#ff3b30]/10 transition-colors clip-corner-btn"
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>
            <div className="flex flex-col gap-2 pt-2 border-t border-[#2a2a35]/60">
              <Button
                variant="secondary"
                fullWidth
                size="md"
                onClick={() => handleAuthClick('login')}
                leftIcon={<LogIn className="w-4 h-4" />}
              >
                Đăng nhập
              </Button>
              <Button
                variant="primary"
                fullWidth
                size="md"
                onClick={() => handleAuthClick('register')}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Bắt đầu ngay
              </Button>
            </div>
          </div>
        )}
      </header>

      {!onOpenAuth && (
        <AuthModal
          isOpen={authModalMode !== null}
          initialMode={authModalMode ?? 'login'}
          onClose={() => setAuthModalMode(null)}
        />
      )}
    </>
  )
}
