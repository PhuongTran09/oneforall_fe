import { useState, useEffect, useRef, type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import {
  ArrowUpRight,
  ChevronDown,
  Dices,
  Files,
  Image as ImageIcon,
  LayoutGrid,
  LogIn,
  LogOut,
  Menu,
  PackageOpen,
  User as UserIcon,
  History as HistoryIcon,
  X,
} from 'lucide-react'
import { Button } from './Button'
import { ThemeToggle } from './ThemeToggle'
import { AuthModal } from '../feedback/AuthModal'
import { ConfirmModal } from '../feedback/ConfirmModal'
import { LocaleLink } from '../../i18n/LocaleLink'
import { LanguageToggle } from '../../i18n/LanguageToggle'
import { t, withLocale } from '../../i18n/langStore'
import { useAuth, signOut } from '../../services/authStore'

// Lucide đã bỏ brand icon (Youtube/TikTok) → giữ SVG chính hãng inline,
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

interface NavItem {
  to: string
  label: string
  icon: ReactNode
}

interface NavGroup {
  id: string
  title: string
  items: NavItem[]
}

const ICON = 'w-4 h-4 shrink-0'

/** Ba nhóm công cụ của mega-menu — cũng là danh sách hiển thị trong menu mobile. */
function navGroups(): NavGroup[] {
  return [
    {
      id: 'video',
      title: t('nav.groupVideo'),
      items: [
        { to: '/youtube-downloader', label: 'YouTube', icon: <YoutubeIcon className={ICON} /> },
        { to: '/tiktok-downloader', label: 'TikTok', icon: <TiktokIcon className={ICON} /> },
      ],
    },
    {
      id: 'media',
      title: t('nav.groupMedia'),
      items: [
        { to: '/convert', label: t('nav.convertFiles'), icon: <Files className={ICON} /> },
        { to: '/remove-background', label: t('nav.imageTools'), icon: <ImageIcon className={ICON} /> },
      ],
    },
    {
      id: 'fun',
      title: t('nav.groupFun'),
      items: [
        { to: '/case-opening', label: t('nav.caseOpening'), icon: <PackageOpen className={ICON} /> },
        { to: '/square-spin', label: t('nav.squareSpin'), icon: <Dices className={ICON} /> },
      ],
    },
  ]
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
  const [toolsOpen, setToolsOpen] = useState(false)
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register' | null>(null)
  const [accountOpen, setAccountOpen] = useState(false)
  const [confirmSignOutOpen, setConfirmSignOutOpen] = useState(false)
  const accountRef = useRef<HTMLDivElement>(null)
  const toolsRef = useRef<HTMLDivElement>(null)
  const location = useLocation()
  const { session, ready } = useAuth()
  const user = session?.user ?? null
  const groups = navGroups()
  const toolItems = groups.flatMap((g) => g.items)

  // Đóng dropdown khi click ra ngoài / Esc. Navigation đóng qua onClick của từng
  // item (không dùng effect setState-sync — tránh cascading render).
  useEffect(() => {
    if (!accountOpen && !toolsOpen) return
    const onDocClick = (e: MouseEvent) => {
      const target = e.target as Node
      if (accountRef.current && !accountRef.current.contains(target)) setAccountOpen(false)
      if (toolsRef.current && !toolsRef.current.contains(target)) setToolsOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      setAccountOpen(false)
      setToolsOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDocClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [accountOpen, toolsOpen])

  const handleAuthClick = (mode: 'login' | 'register') => {
    setMobileMenuOpen(false)
    if (onOpenAuth) {
      onOpenAuth(mode)
    } else {
      setAuthModalMode(mode)
    }
  }

  const isActive = (to: string): boolean => location.pathname.startsWith(withLocale(to))
  const onToolPage = toolItems.some((item) => isActive(item.to))

  const itemClass = (active: boolean): string =>
    `flex items-center gap-2.5 px-2 py-2 text-sm clip-corner-btn transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF4545]/60 ${
      active ? 'bg-tint text-brand-active font-semibold' : 'text-soft hover:text-ink hover:bg-brand/10'
    }`

  return (
    <>
      {/* backdrop-blur toàn chiều ngang bắt GPU lọc lại nền mọi khung hình cuộn,
          mà máy cảm ứng thì không đủ mạnh — chuyển sang nền đặc, không blur. */}
      <header className="sticky top-0 z-40 w-full border-b border-edge bg-page/85 backdrop-blur-xl pointer-coarse:bg-page pointer-coarse:backdrop-blur-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-[72px] flex items-center gap-3">
          {/* Logo */}
          <LocaleLink to="/" onClick={() => setToolsOpen(false)} className="flex items-center gap-2.5 shrink-0 group">
            <div className="w-9 h-9 flex items-center justify-center transition-all duration-300 group-hover:scale-105 group-hover:drop-shadow-[0_0_12px_rgba(255,59,48,0.45)]">
              <img src="/oneforall.svg" alt="One ForAll Logo" className="w-full h-full object-contain" />
            </div>
            <span className="font-bold text-xl tracking-tight text-ink flex items-center gap-1.5">
              One<span className="text-brand-gradient">ForAll</span>
              <span className="hidden sm:inline-block text-[10px] font-mono px-1.5 py-0.5 bg-brand/10 text-brand border border-brand/30 font-semibold clip-corner-btn">
                Tools
              </span>
            </span>
          </LocaleLink>

          {/* Điều hướng desktop: một pill "Công cụ" mở mega-menu. Pill sáng lên khi
              đang ở trang của một công cụ nào đó trong danh mục. */}
          <nav className="hidden lg:flex items-center" aria-label={t('nav.ariaMain')}>
            <div className="relative" ref={toolsRef}>
              <button
                type="button"
                onClick={() => setToolsOpen((open) => !open)}
                aria-haspopup="true"
                aria-expanded={toolsOpen}
                aria-label={t('nav.ariaTools')}
                data-active={onToolPage || toolsOpen}
                className="nav-pill text-soft hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF4545]/60"
              >
                <LayoutGrid className="w-4.5 h-4.5 shrink-0" />
                <span>{t('nav.tools')}</span>
                {/* Mũi đóng/mở để nhỏ hơn và mờ hơn: cùng 16px với chữ thì nó
                    tranh sự chú ý với nhãn, hàng icon-chữ-mũi không còn một khối. */}
                <ChevronDown className={`w-3.5 h-3.5 shrink-0 opacity-70 transition-transform duration-200 ${toolsOpen ? 'rotate-180' : ''}`} />
              </button>

              {toolsOpen && (
                <div className="absolute left-0 top-full pt-2 w-[40rem] max-w-[calc(100vw-4rem)] z-50 animate-fade-in">
                  <div className="bg-surface border border-[rgba(255,59,48,0.35)] clip-corner-card shadow-[0_24px_60px_rgba(0,0,0,0.5)] overflow-hidden">
                    <div className="grid grid-cols-3 gap-x-3 p-3">
                      {groups.map((group) => (
                        <div key={group.id} className="min-w-0 space-y-1">
                          <p className="px-2 pb-1 text-[10px] font-mono uppercase tracking-[0.14em] text-slate-500">{group.title}</p>
                          {group.items.map((item) => (
                            <LocaleLink
                              key={item.to}
                              to={item.to}
                              onClick={() => setToolsOpen(false)}
                              aria-current={isActive(item.to) ? 'page' : undefined}
                              className={itemClass(isActive(item.to))}
                            >
                              <span className="grid place-items-center w-7 h-7 shrink-0 bg-elev border border-edge text-brand clip-corner-btn">{item.icon}</span>
                              <span className="truncate">{item.label}</span>
                            </LocaleLink>
                          ))}
                        </div>
                      ))}
                    </div>
                    <div className="border-t border-edge/60 bg-page/40 px-5 py-2.5">
                      <LocaleLink
                        to="/"
                        onClick={() => setToolsOpen(false)}
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-soft hover:text-ink transition-colors"
                      >
                        {t('toolsGrid.all')}
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </LocaleLink>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </nav>

          <div className="flex-1" />

          {/* Cụm phải nằm trong một thanh glass riêng cho khỏi rời rạc. Menu tài khoản
              là ANH EM của thanh glass chứ không phải con: clip-path của clip-corner-card
              cắt mọi phần tử rơi ra ngoài hộp pill, nên để menu bên trong thì mở ra
              không thấy gì. */}
          <div className="relative hidden min-[768px]:flex" ref={accountRef}>
            {/* KHÔNG blur lớp này: header đã blur cả dải phía sau rồi, blur lồng
                nhau là bắt GPU lọc lại kết quả vừa lọc, mỗi khung hình cuộn. */}
            <div className="flex items-center gap-2 px-2 py-1.5 bg-surface/45 border border-edge clip-corner-card pointer-coarse:bg-surface">
              <span className="hidden xl:inline-flex">
                <LanguageToggle />
              </span>
              <ThemeToggle />
              <span className="w-px h-6 bg-edge/70" aria-hidden="true" />
              {!ready ? (
                // Loading state trong khi bootstrap phiên (§1): khung tĩnh, không nhấp nháy "đăng nhập".
                <div className="h-9 w-24 rounded-md bg-surface/60 animate-pulse" aria-hidden="true" />
              ) : user ? (
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
              ) : (
                <>
                  <Button variant="ghost" size="sm" onClick={() => handleAuthClick('login')} leftIcon={<LogIn className="w-4 h-4" />}>
                    {t('auth.login')}
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleAuthClick('register')}
                    className="btn-shimmer shadow-[0_0_14px_rgba(255,59,48,0.25)]"
                  >
                    {t('auth.startFree')}
                  </Button>
                </>
              )}
            </div>

            {accountOpen && user && (
              <div
                role="menu"
                className="absolute right-2 top-full mt-0.5 w-56 bg-surface border border-[rgba(255,59,48,0.35)] clip-corner-card shadow-xl py-1 z-50 animate-fade-in"
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

          {/* Mobile: theme + hamburger. Từ 768px theme đã nằm trong thanh glass nên
              cluster này chỉ còn mỗi hamburger. */}
          <div className="flex lg:hidden items-center gap-2">
            <span className="min-[768px]:hidden">
              <ThemeToggle />
            </span>
            <button
              type="button"
              onClick={() => setMobileMenuOpen((open) => !open)}
              className="p-2 text-slate-300 hover:text-ink hover:bg-brand/10 focus:outline-none clip-corner-btn"
              aria-label={mobileMenuOpen ? t('common.closeMenu') : t('common.openMenu')}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Menu mobile: cùng bộ nhóm với mega-menu desktop. */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-b border-edge bg-page px-4 pt-3 pb-6 in-up">
            <div className="flex items-center justify-between gap-3 pb-3 mb-1 border-b border-edge/60">
              <span className="text-sm font-medium text-soft">{t('common.language')}</span>
              <LanguageToggle />
            </div>
            <nav className="space-y-4 py-3" aria-label={t('nav.ariaMain')}>
              {groups.map((group) => (
                <div key={group.id} className="min-w-0">
                  <p className="px-1 pb-1.5 text-[10px] font-mono uppercase tracking-[0.14em] text-slate-500">{group.title}</p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {group.items.map((item) => (
                      <LocaleLink
                        key={item.to}
                        to={item.to}
                        onClick={() => setMobileMenuOpen(false)}
                        aria-current={isActive(item.to) ? 'page' : undefined}
                        className={itemClass(isActive(item.to))}
                      >
                        <span className="grid place-items-center w-7 h-7 shrink-0 bg-elev border border-edge text-brand clip-corner-btn">{item.icon}</span>
                        {/* Nhãn mobile cho phép xuống dòng: cột hẹp ~170px không đủ cho "Vòng quay ô vuông". */}
                        <span className="min-w-0 leading-tight">{item.label}</span>
                      </LocaleLink>
                    ))}
                  </div>
                </div>
              ))}
            </nav>
            <div className="flex flex-col gap-2 pt-3 border-t border-edge/60">
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
                  <Button variant="primary" fullWidth size="md" onClick={() => handleAuthClick('register')}>
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
