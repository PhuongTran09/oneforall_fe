import { useState, useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import {
  Menu,
  X,
  Files,
  Image as ImageIcon,
  LogIn,
  LogOut,
  ArrowRight,
  User as UserIcon,
  History as HistoryIcon,
  ChevronDown,
} from 'lucide-react'
import { Button } from './Button'
import { ThemeToggle } from './ThemeToggle'
import { AuthModal } from '../feedback/AuthModal'
import { ConfirmModal } from '../feedback/ConfirmModal'
import { LocaleLink } from '../../i18n/LocaleLink'
import { LanguageToggle } from '../../i18n/LanguageToggle'
import { t, withLocale } from '../../i18n/langStore'
import { useAuth, signOut } from '../../services/authStore'

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

// Ưu tiên avatar/name từ Supabase Auth user_metadata (§1); fallback email.
function accountLabel(user: NonNullable<ReturnType<typeof useAuth>['session']>['user']): string {
  const meta = (user.user_metadata ?? {}) as Record<string, unknown>
  return (
    (typeof meta.full_name === 'string' && meta.full_name) ||
    (typeof meta.name === 'string' && meta.name) ||
    user.email ||
    'Tài khoản'
  )
}

function accountAvatar(user: NonNullable<ReturnType<typeof useAuth>['session']>['user']): string | null {
  const meta = (user.user_metadata ?? {}) as Record<string, unknown>
  return typeof meta.avatar_url === 'string' ? meta.avatar_url : null
}

export function Navbar({ onOpenAuth }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register' | null>(null)
  const [accountOpen, setAccountOpen] = useState(false)
  const [confirmSignOutOpen, setConfirmSignOutOpen] = useState(false)
  const accountRef = useRef<HTMLDivElement>(null)
  const location = useLocation()
  const { session, ready } = useAuth()
  const user = session?.user ?? null

  // Đóng dropdown khi click ra ngoài / Esc. Navigation đóng qua onClick của từng item
  // (không dùng effect setState-sync — tránh cascading render).
  useEffect(() => {
    if (!accountOpen) return
    const onDocClick = (e: MouseEvent) => {
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) setAccountOpen(false)
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setAccountOpen(false)
    document.addEventListener('mousedown', onDocClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDocClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [accountOpen])

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
      <header className="sticky top-0 z-40 w-full border-b border-edge bg-page/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo Brand */}
          <LocaleLink to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 flex items-center justify-center transition-all duration-300 group-hover:scale-105 group-hover:drop-shadow-[0_0_12px_rgba(255,59,48,0.45)]">
              <img src="/oneforall.svg" alt="One ForAll Logo" className="w-full h-full object-contain" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-xl tracking-tight text-ink flex items-center gap-1.5">
                One<span className="text-brand-gradient">ForAll</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 bg-brand/10 text-brand border border-brand/30 font-semibold clip-corner-btn">
                  Tools
                </span>
              </span>
            </div>
          </LocaleLink>

          {/* Keep desktop navigation at 768px; the full menu does not fit at 740-767px. */}
          <nav className="hidden min-[768px]:flex items-center gap-1 lg:gap-1.5" aria-label={t('nav.ariaMain')}>
            {navCategories.map((item) => {
              const isActive = location.pathname.startsWith(withLocale(item.to))
              return (
                <LocaleLink
                  key={item.to}
                  to={item.to}
                  aria-current={isActive ? 'page' : undefined}
                  className={`inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium transition-colors duration-150 clip-corner-btn focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF4545]/60 ${
                    isActive
                      ? 'bg-tint text-brand-active font-semibold'
                      : 'text-soft hover:text-ink hover:bg-brand/10'
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
            {/* Dưới xl thì nhãn tab đã phải tự xuống dòng; thêm 69px nữa là "Xoá nền ảnh"
                thành 3 dòng tràn khỏi header cao 64px → bộ đổi ngôn ngữ chỉ lên navbar từ xl. */}
            <span className="hidden xl:inline-flex">
              <LanguageToggle />
            </span>
            <ThemeToggle />
            {!ready ? (
              // Loading state trong khi bootstrap phiên (§1): khung tĩnh, không nhấp nháy "đăng nhập".
              <div className="h-9 w-24 rounded-md bg-surface/60 animate-pulse" aria-hidden="true" />
            ) : user ? (
              <div className="relative" ref={accountRef}>
                <button
                  type="button"
                  onClick={() => setAccountOpen((o) => !o)}
                  aria-haspopup="menu"
                  aria-expanded={accountOpen}
                  aria-label={t('nav.accountMenu')}
                  className="inline-flex items-center gap-2 px-2 py-1.5 text-sm font-medium text-slate-200 bg-surface border border-[rgba(255,59,48,0.35)] clip-corner-btn max-w-[220px] hover:bg-brand/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF4545]/60"
                  title={user.email ?? undefined}
                >
                  {accountAvatar(user) ? (
                    <img
                      src={accountAvatar(user) as string}
                      alt=""
                      className="w-6 h-6 rounded-full object-cover shrink-0"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <UserIcon className="w-5 h-5 shrink-0 text-brand-2" />
                  )}
                  <span className="truncate">{accountLabel(user)}</span>
                  <ChevronDown className="w-4 h-4 shrink-0 text-soft" />
                </button>
                {accountOpen && (
                  <div
                    role="menu"
                    className="absolute right-0 mt-2 w-56 bg-surface border border-[rgba(255,59,48,0.35)] clip-corner-card shadow-xl py-1 z-50 animate-fade-in"
                  >
                    <LocaleLink
                      to="/profile"
                      role="menuitem"
                      onClick={() => setAccountOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-soft hover:text-ink hover:bg-brand/10"
                    >
                      <UserIcon className="w-4 h-4 text-brand-2" />
                      {t('nav.myProfile')}
                    </LocaleLink>
                    <LocaleLink
                      to="/history"
                      role="menuitem"
                      onClick={() => setAccountOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-soft hover:text-ink hover:bg-brand/10"
                    >
                      <HistoryIcon className="w-4 h-4 text-brand-2" />
                      {t('nav.history')}
                    </LocaleLink>
                    <div className="my-1 border-t border-edge/60" />
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setAccountOpen(false)
                        setConfirmSignOutOpen(true)
                      }}
                      className="flex w-full items-center gap-2 px-3 py-2 text-sm text-soft hover:text-ink hover:bg-brand/10"
                    >
                      <LogOut className="w-4 h-4 text-brand-2" />
                      {t('auth.signOut')}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
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
                  className="btn-shimmer shadow-[0_0_14px_rgba(255,59,48,0.25)]"
                >
                  {t('auth.startFree')}
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="flex min-[768px]:hidden items-center gap-2">
            <ThemeToggle />
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-300 hover:text-ink hover:bg-brand/10 focus:outline-none clip-corner-btn"
              aria-label={mobileMenuOpen ? t('common.closeMenu') : t('common.openMenu')}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="min-[768px]:hidden border-b border-edge bg-page px-4 pt-3 pb-6 in-up">
            {/* Hàng utility: trên desktop LanguageToggle đứng cạnh ThemeToggle ở thanh nav,
                còn ở đây không đủ chỗ nên xuống đầu dropdown. */}
            <div className="flex items-center justify-between gap-3 pb-3 mb-1 border-b border-edge/60">
              <span className="text-sm font-medium text-soft">{t('common.language')}</span>
              <LanguageToggle />
            </div>
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
                        ? 'bg-tint text-brand-active font-semibold'
                        : 'text-soft hover:text-ink'
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </LocaleLink>
                )
              })}
            </nav>
            <div className="flex flex-col gap-2 pt-2 border-t border-edge/60">
              {user ? (
                <>
                  <span
                    className="inline-flex items-center gap-2 px-3 py-2.5 text-sm text-slate-200 bg-surface border border-[rgba(255,59,48,0.35)] clip-corner-btn"
                    title={user.email ?? undefined}
                  >
                    {accountAvatar(user) ? (
                      <img
                        src={accountAvatar(user) as string}
                        alt=""
                        className="w-6 h-6 rounded-full object-cover shrink-0"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <UserIcon className="w-4 h-4 shrink-0 text-brand-2" />
                    )}
                    <span className="truncate">{accountLabel(user)}</span>
                  </span>
                  <LocaleLink
                    to="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-soft hover:text-ink clip-corner-btn"
                  >
                    <UserIcon className="w-4 h-4 text-brand-2" />
                    {t('nav.myProfile')}
                  </LocaleLink>
                  <LocaleLink
                    to="/history"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-soft hover:text-ink clip-corner-btn"
                  >
                    <HistoryIcon className="w-4 h-4 text-brand-2" />
                    {t('nav.history')}
                  </LocaleLink>
                  <Button
                    variant="secondary"
                    fullWidth
                    size="md"
                    onClick={() => {
                      setMobileMenuOpen(false)
                      setConfirmSignOutOpen(true)
                    }}
                    leftIcon={<LogOut className="w-4 h-4" />}
                  >
                    {t('auth.signOut')}
                  </Button>
                </>
              ) : (
                <>
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
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {!onOpenAuth && (
        <AuthModal
          key={authModalMode ?? 'closed'}
          isOpen={authModalMode !== null}
          initialMode={authModalMode ?? 'login'}
          onClose={() => setAuthModalMode(null)}
        />
      )}

      <ConfirmModal
        isOpen={confirmSignOutOpen}
        title={t('auth.signOut')}
        message={t('auth.signOutConfirm')}
        onConfirm={() => {
          setConfirmSignOutOpen(false)
          void signOut()
        }}
        onClose={() => setConfirmSignOutOpen(false)}
      />
    </>
  )
}
