import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import {
  Menu,
  X,
  Files,
  Image as ImageIcon,
  LogIn,
  ArrowRight,
} from 'lucide-react'
import { Button } from './Button'
import { ThemeToggle } from './ThemeToggle'
import { AuthModal } from '../feedback/AuthModal'
import { LocaleLink } from '../../i18n/LocaleLink'
import { t, withLocale } from '../../i18n/langStore'

// Lucide v1 đã bỏ brand icon (Youtube/TikTok) → giữ SVG chính hãng inline,
// fill currentColor để ăn theo màu của tab (active/hover/inactive).
function YoutubeIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  )
}

function TiktokIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
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
    { label: 'YouTube', to: '/youtube-downloader', icon: <YoutubeIcon className="w-5 h-5" /> },
    { label: 'TikTok', to: '/tiktok-downloader', icon: <TiktokIcon className="w-5 h-5" /> },
    { label: t('nav.convertFiles'), to: '/convert', icon: <Files className="w-5 h-5" /> },
    { label: t('nav.imageTools'), to: '/remove-background', icon: <ImageIcon className="w-5 h-5" /> },
  ]

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-edge bg-page/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo Brand */}
          <LocaleLink to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 flex items-center justify-center">
              <img src="/oneforall.svg" alt="OneForAll Logo" className="w-full h-full object-contain" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-xl tracking-tight text-ink flex items-center gap-1.5">
                One<span className="text-brand-gradient">ForAll</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 bg-[#ff3b30]/10 text-[#FF3B30] border border-[#ff3b30]/30 font-semibold clip-corner-btn">
                  Tools
                </span>
              </span>
            </div>
          </LocaleLink>

          {/* Desktop Nav Items — giữ mốc 768px thật (min-[768px]) vì thanh nav đầy đủ
              không nhét nổi vào 740–767px (iPad mini portrait). --breakpoint-md đã hạ
              xuống 740px cho grid/content, riêng nav giữ nguyên mốc cũ. */}
          <nav className="hidden min-[768px]:flex items-center gap-1 lg:gap-1.5" aria-label={t('nav.ariaMain')}>
            {navCategories.map((item) => {
              const isActive = location.pathname.startsWith(withLocale(item.to))
              return (
                <LocaleLink
                  key={item.to}
                  to={item.to}
                  aria-current={isActive ? 'page' : undefined}
                  className={`inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium transition-colors duration-[180ms] clip-corner-btn focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF4545]/60 ${
                    isActive
                      ? 'bg-[#2A1115] text-[#FF4545] font-semibold'
                      : 'text-[#A1A1AA] hover:text-white'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </LocaleLink>
              )
            })}
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden min-[768px]:flex items-center gap-3">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleAuthClick('login')}
              leftIcon={<LogIn className="w-4 h-4" />}
            >
              {t('auth.login')}
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => handleAuthClick('register')}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              {t('auth.startFree')}
            </Button>
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="flex min-[768px]:hidden items-center gap-2">
            <ThemeToggle />
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-300 hover:text-ink hover:bg-[#ff3b30]/10 focus:outline-none clip-corner-btn"
              aria-label={mobileMenuOpen ? t('common.closeMenu') : t('common.openMenu')}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="min-[768px]:hidden border-b border-edge bg-page px-4 pt-3 pb-6 animate-in slide-in-from-top-2 duration-200">
            <nav className="flex flex-col space-y-1 mb-4">
              {navCategories.map((item) => {
                const isActive = location.pathname.startsWith(withLocale(item.to))
                return (
                  <LocaleLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileMenuOpen(false)}
                    aria-current={isActive ? 'page' : undefined}
                    className={`flex items-center gap-2 px-3 py-2.5 text-sm font-medium transition-colors duration-[180ms] clip-corner-btn focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF4545]/60 ${
                      isActive
                        ? 'bg-[#2A1115] text-[#FF4545] font-semibold'
                        : 'text-[#A1A1AA] hover:text-white'
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </LocaleLink>
                )
              })}
            </nav>
            <div className="flex flex-col gap-2 pt-2 border-t border-edge/60">
              <Button
                variant="secondary"
                fullWidth
                size="md"
                onClick={() => handleAuthClick('login')}
                leftIcon={<LogIn className="w-4 h-4" />}
              >
                {t('auth.login')}
              </Button>
              <Button
                variant="primary"
                fullWidth
                size="md"
                onClick={() => handleAuthClick('register')}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                {t('auth.startNow')}
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
