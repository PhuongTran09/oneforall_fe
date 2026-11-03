import {
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
  type FocusEvent as ReactFocusEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react'
import { useLocation } from 'react-router-dom'
import {
  ArrowRight,
  ArrowUpRight,
  ChevronDown,
  ChevronsUp,
  Dices,
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
import { ToolSearchField } from './ToolSearch'
import { filterTools, useToolSearchIndex } from './toolSearchIndex'
import { CATEGORY_ICONS, ToolIcon, type IconComponent } from './toolIcons'
import { LocaleLink } from '../../i18n/LocaleLink'
import { LanguageToggle } from '../../i18n/LanguageToggle'
import { t, useI18n, withLocale } from '../../i18n/langStore'
import { localizeTool } from '../../i18n/toolConfig'
import { SEO_TOOLS, ALL_TOOL_SLUGS } from '../../config/seoTools'
import { TOOL_CATEGORIES } from '../../config/toolCategories'
import { useAuth, signOut } from '../../services/authStore'
import { isAdFree, useEntitlements } from '../../services/entitlementsStore'
import { useExitFade, useOpenSeq } from '../../hooks/useExitFade'

export interface NavbarProps {
  onOpenAuth?: (mode: 'login' | 'register') => void

  onOpenPro?: () => void
}

interface NavItem {
  to: string
  label: string
  icon: ReactNode
}

interface NavGroup {
  id: string
  title: string

  to: string | null

  count: number
  GroupIcon: IconComponent
  items: NavItem[]
}

const ICON = 'w-4 h-4 shrink-0'
const ICON_BOX = 'grid place-items-center w-7 h-7 shrink-0 bg-elev border border-edge text-brand clip-corner-btn'


const ICON_BOX_SM = 'grid place-items-center w-6 h-6 shrink-0 text-brand'

const MENU_ITEMS_ID = 'nav-menu-groups'

const TOOLS_PANEL_ID = 'nav-tools-menu'





const CLOSE_DELAY_MS = 260


const NAV_LABEL_KEYS: Record<string, string> = {
  '/facebook-downloader': 'nav.toolFacebook',
  '/threads-downloader': 'nav.toolThreads',
  '/tiktok-downloader': 'nav.toolTiktok',
  '/twitter-downloader': 'nav.toolTwitter',
  '/youtube-downloader': 'nav.toolYoutube',
}





function navGroups(lang: 'vi' | 'en'): NavGroup[] {
  const groups: NavGroup[] = TOOL_CATEGORIES.map((cat) => {
    const label = (slug: string): string => {
      const key = NAV_LABEL_KEYS[slug]
      return key ? t(key) : localizeTool(SEO_TOOLS[slug], lang).badge
    }
    return {
      id: cat.id,
      title: t(cat.nameKey),
      to: `/${cat.path}`,
      count: cat.toolSlugs.length,
      GroupIcon: CATEGORY_ICONS[cat.id],
      items: cat.toolSlugs.map((slug) => ({
          to: slug,
          label: label(slug),
          icon: <ToolIcon category={SEO_TOOLS[slug].category} slug={slug} className={ICON} />,
        })),
    }
  })
  const funItems: NavItem[] = [
    { to: '/case-opening', label: t('nav.caseOpening'), icon: <PackageOpen className={ICON} /> },
    { to: '/square-spin', label: t('nav.squareSpin'), icon: <Dices className={ICON} /> },
  ]
  const fun: NavGroup = {
    id: 'fun',
    title: t('nav.groupFun'),
    to: null,
    count: funItems.length,
    GroupIcon: Dices,
    items: funItems,
  }
  return [...groups, fun]
}

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

function ProUpgradeLink({ onOpenPro }: { onOpenPro?: () => void }) {
  return (
    <LocaleLink
      to="/#pricing"
      onClick={(event) => {
        if (!onOpenPro) return
        event.preventDefault()
        onOpenPro()
      }}
      className="inline-flex h-[30px] shrink-0 items-center gap-1.5 px-2.5 text-xs font-medium whitespace-nowrap text-brand-active bg-tint border border-brand/40 clip-corner-btn hover:bg-brand/15 hover:text-brand-active hover:border-brand/70 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#FF4545]/60"
    >
      <ChevronsUp className="w-4 h-4" aria-hidden="true" />
      {t('nav.upgradePro')}
    </LocaleLink>
  )
}

export function Navbar({ onOpenAuth, onOpenPro }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [toolsOpen, setToolsOpen] = useState(false)
  const [navQuery, setNavQuery] = useState('')
  const [openGroup, setOpenGroup] = useState<string | null>(null)
  const [menuGroup, setMenuGroup] = useState<string | null>(null)
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register' | null>(null)
  const [accountOpen, setAccountOpen] = useState(false)
  const [confirmSignOutOpen, setConfirmSignOutOpen] = useState(false)
  const { show: toolsShow, closing: toolsClosing } = useExitFade(toolsOpen)
  const { show: accountShow, closing: accountClosing } = useExitFade(accountOpen)
  const { show: mobileShow, closing: mobileClosing } = useExitFade(mobileMenuOpen)
  const authModalSeq = useOpenSeq(authModalMode !== null, authModalMode)
  const accountRef = useRef<HTMLDivElement>(null)
  const toolsRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLDivElement>(null)
  const closeTimer = useRef<number | null>(null)
  const location = useLocation()
  const { session, ready } = useAuth()
  const { me } = useEntitlements()
  const showProCta = me === null || !isAdFree(me)
  const { lang } = useI18n()
  const user = session?.user ?? null
  const groups = navGroups(lang)
  const searchIndex = useToolSearchIndex()

  const closeTools = useCallback(() => {
    if (closeTimer.current !== null) {
      window.clearTimeout(closeTimer.current)
      closeTimer.current = null
    }
    setToolsOpen(false)
  }, [])

  useEffect(() => {
    if (!accountOpen && !toolsOpen) return
    const onDocClick = (e: MouseEvent) => {
      const target = e.target as Node
      if (accountRef.current && !accountRef.current.contains(target)) setAccountOpen(false)
      if (toolsRef.current && !toolsRef.current.contains(target)) closeTools()
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      setAccountOpen(false)
      const insideTools = toolsRef.current?.contains(document.activeElement) ?? false
      closeTools()
      if (insideTools) toolsRef.current?.querySelector('button')?.focus()
    }
    document.addEventListener('mousedown', onDocClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDocClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [accountOpen, toolsOpen, closeTools])

  useEffect(
    () => () => {
      if (closeTimer.current !== null) window.clearTimeout(closeTimer.current)
    },
    [],
  )

  const handleAuthClick = (mode: 'login' | 'register') => {
    setMobileMenuOpen(false)
    if (onOpenAuth) {
      onOpenAuth(mode)
    } else {
      setAuthModalMode(mode)
    }
  }

  const isCurrent = (to: string): boolean => location.pathname === withLocale(to)
  const onDirectoryPage = location.pathname.startsWith(withLocale('/tools'))
  const onToolPage = ALL_TOOL_SLUGS.some((slug) => isCurrent(slug)) || onDirectoryPage
  const activeGroupId = groups.find((g) => g.items.some((item) => isCurrent(item.to)))?.id ?? null

  const hits = navQuery.trim() ? new Set(filterTools(searchIndex, navQuery).map((entry) => entry.slug)) : null
  const visibleGroups = hits
    ? groups
        .map((group) => ({ ...group, items: group.items.filter((item) => hits.has(item.to)) }))
        .filter((group) => group.items.length > 0)
    : groups

  const openMenuGroup = groups.find((group) => group.id === menuGroup) ?? null

  const openTools = () => {
    if (closeTimer.current !== null) {
      window.clearTimeout(closeTimer.current)
      closeTimer.current = null
    }
    setNavQuery('')
    setMenuGroup(null)
    setToolsOpen(true)
  }

  const scheduleToolsClose = () => {
    if (closeTimer.current !== null) return
    closeTimer.current = window.setTimeout(() => {
      closeTimer.current = null
      setToolsOpen(false)
    }, CLOSE_DELAY_MS)
  }

  const toggleTools = () => (toolsOpen ? closeTools() : openTools())

  const onToolsPointerEnter = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== 'mouse') return
    openTools()
  }

  const onToolsPointerLeave = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== 'mouse') return
    scheduleToolsClose()
  }

  const onToolsBlur = (e: ReactFocusEvent<HTMLDivElement>) => {
    if (e.currentTarget.contains(e.relatedTarget as Node | null)) return
    closeTools()
  }

  const toggleMobileMenu = () => {
    const next = !mobileMenuOpen
    if (next) setNavQuery('')
    setMobileMenuOpen(next)
    if (next) setOpenGroup(activeGroupId)
  }

  const closeMobile = () => {
    setMobileMenuOpen(false)
    searchRef.current?.querySelector('input')?.blur()
  }

  const itemClass = (active: boolean): string =>
    `flex items-center gap-2 px-2 py-1.5 text-[13px] clip-corner-btn transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#FF4545]/60 ${
      active ? 'bg-tint text-brand-active font-semibold' : 'text-soft hover:text-ink hover:bg-brand/10'
    }`

  const groupTabClass = (open: boolean, current: boolean): string =>
    `flex w-full items-center gap-1.5 px-2 py-1.5 text-[10px] font-mono uppercase tracking-[0.02em] clip-corner-btn transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#FF4545]/60 ${
      open
        ? 'bg-tint text-brand-active font-semibold'
        : current
          ? 'text-brand hover:text-brand-active hover:bg-brand/10'
          : 'text-slate-500 hover:text-ink hover:bg-brand/10'
    }`

  return (
    <>


      <header className="sticky top-0 z-40 w-full border-b border-edge bg-page/85 backdrop-blur-xl pointer-coarse:bg-page pointer-coarse:backdrop-blur-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-[72px] flex items-center gap-3">

          <LocaleLink to="/" onClick={closeTools} className="flex items-center gap-2.5 shrink-0 group">
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



          <nav className="hidden lg:flex items-center" aria-label={t('nav.ariaMain')}>
            <div
              className="relative"
              ref={toolsRef}
              onPointerEnter={onToolsPointerEnter}
              onPointerLeave={onToolsPointerLeave}
              onBlur={onToolsBlur}
            >
              <button
                type="button"
                onClick={toggleTools}
                aria-expanded={toolsOpen}
                aria-controls={toolsShow ? TOOLS_PANEL_ID : undefined}
                aria-label={t('nav.ariaTools')}
                data-active={onToolPage || toolsOpen}
                className="nav-pill text-soft hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF4545]/60"
              >
                <LayoutGrid className="w-4.5 h-4.5 shrink-0" />
                <span>{t('nav.tools')}</span>


                <ChevronDown className={`w-3.5 h-3.5 shrink-0 opacity-70 transition-transform duration-200 ${toolsOpen ? 'rotate-180' : ''}`} />
              </button>

              {toolsShow && (
                <div
                  id={TOOLS_PANEL_ID}
                  className={`absolute left-0 top-full pt-2 w-[calc(100vw-4rem)] max-w-[34rem] lg:max-w-[38rem] xl:max-w-[44rem] z-50 ${
                    toolsClosing ? 'out-fade pointer-events-none' : 'in-down'
                  }`}
                >
                  <div className="bg-surface border border-[rgba(255,59,48,0.35)] clip-corner-card shadow-[0_18px_44px_rgba(0,0,0,0.45)] overflow-hidden">
                    <div className="p-2 border-b border-edge/60">
                      <ToolSearchField
                        value={navQuery}
                        onChange={setNavQuery}
                        dropdown={false}
                        placeholder={t('directory.searchShort')}
                      />
                    </div>

                    {visibleGroups.length === 0 ? (
                      <p className="px-4 py-5 text-sm text-soft">{t('directory.noResult', { q: navQuery.trim() })}</p>
                    ) : hits ? (
                      <div data-lenis-prevent className="grid grid-cols-2 gap-x-3 gap-y-1 p-3 max-h-[60vh] overflow-y-auto scrollbar-none lg:grid-cols-3 xl:grid-cols-4">
                        {visibleGroups.flatMap((group) =>
                          group.items.map((item) => (
                            <LocaleLink
                              key={item.to}
                              to={item.to}
                              onClick={closeTools}
                              aria-current={isCurrent(item.to) ? 'page' : undefined}
                              className={itemClass(isCurrent(item.to))}
                            >
                              <span className={ICON_BOX}>{item.icon}</span>
                              <span className="min-w-0 leading-tight">{item.label}</span>
                            </LocaleLink>
                          )),
                        )}
                      </div>
                    ) : (
                      <>




                        <div className="grid grid-cols-4 gap-1 p-2">
                          {groups.map((group) => {
                            const GroupIcon = group.GroupIcon
                            const open = group.id === menuGroup
                            return (
                              <button
                                key={group.id}
                                type="button"
                                onClick={() => setMenuGroup(open ? null : group.id)}
                                aria-expanded={open}
                                aria-controls={open ? MENU_ITEMS_ID : undefined}
                                className={groupTabClass(open, group.id === activeGroupId)}
                              >
                                <GroupIcon className={ICON} />
                                <span className="min-w-0 truncate">{group.title}</span>
                              </button>
                            )
                          })}
                        </div>


                        {openMenuGroup ? (
                          <div
                            key={openMenuGroup.id}
                            id={MENU_ITEMS_ID}
                            className="mx-2 mb-2 p-3 pt-2.5 min-h-[7.5rem] bg-page/40 border-t border-edge/60 clip-corner-card in-up"
                          >
                            <div className="grid grid-cols-2 gap-x-3 gap-y-1 lg:grid-cols-3 xl:grid-cols-4">
                              {openMenuGroup.items.map((item) => (
                                <LocaleLink
                                  key={item.to}
                                  to={item.to}
                                  onClick={closeTools}
                                  aria-current={isCurrent(item.to) ? 'page' : undefined}
                                  className={itemClass(isCurrent(item.to))}
                                >
                                  <span className={ICON_BOX}>{item.icon}</span>
                                  <span className="min-w-0 leading-tight">{item.label}</span>
                                </LocaleLink>
                              ))}
                            </div>
                            {openMenuGroup.to && (
                              <LocaleLink
                                to={openMenuGroup.to}
                                onClick={closeTools}
                                aria-current={isCurrent(openMenuGroup.to) ? 'page' : undefined}
                                className="mt-2.5 inline-flex items-center gap-1.5 text-xs font-semibold text-brand hover:underline"
                              >
                                {t('directory.viewAll', { count: openMenuGroup.count })}
                                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                              </LocaleLink>
                            )}
                          </div>
                        ) : (
                          <p className="px-4 pb-4 text-xs leading-relaxed text-slate-500">{t('nav.menuHint')}</p>
                        )}
                      </>
                    )}

                    <div className="border-t border-edge/60 bg-page/40 px-4 py-2">
                      <LocaleLink
                        to="/tools"
                        onClick={closeTools}
                        aria-current={onDirectoryPage ? 'page' : undefined}
                        className="inline-flex min-h-6 items-center gap-1.5 text-xs font-medium text-soft hover:text-ink transition-colors clip-corner-btn focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#FF4545]/60"
                      >
                        {t('directory.allTools')}
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </LocaleLink>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </nav>

          <div className="flex-1" />





          <div className="relative hidden min-[768px]:flex" ref={accountRef}>


            <div className="flex items-center gap-2 px-2 py-1.5 bg-surface/45 border border-edge clip-corner-card pointer-coarse:bg-surface">
              <span className="hidden xl:inline-flex">
                <LanguageToggle />
              </span>

              {showProCta && <ProUpgradeLink onOpenPro={onOpenPro} />}
              <ThemeToggle />
              <span className="w-px h-6 bg-edge/70" aria-hidden="true" />
              {!ready ? (
                <div className="h-[30px] w-24 rounded-md bg-surface/60 animate-pulse" aria-hidden="true" />
              ) : user ? (
                <button
                  type="button"
                  onClick={() => setAccountOpen((o) => !o)}
                  aria-haspopup="menu"
                  aria-expanded={accountOpen}
                  aria-label={t('nav.accountMenu')}
                  className="inline-flex items-center gap-2 px-2 py-1.5 text-sm font-medium text-slate-200 bg-surface border border-[rgba(255,59,48,0.35)] clip-corner-btn max-w-[220px] hover:bg-brand/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#FF4545]/60"
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
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleAuthClick('login')}
                  leftIcon={<LogIn className="w-4 h-4" />}
                >
                  {t('auth.login')}
                </Button>
              )}
            </div>

            {accountShow && user && (
              <div
                role="menu"
                className={`absolute right-2 top-full mt-0.5 w-56 bg-surface border border-[rgba(255,59,48,0.35)] clip-corner-card shadow-xl py-1 z-50 ${
                  accountClosing ? 'out-fade' : 'in-fade'
                }`}
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



          <div className="flex lg:hidden items-center gap-2">
            <span className="min-[768px]:hidden">
              <ThemeToggle />
            </span>
            <button
              type="button"
              onClick={toggleMobileMenu}
              className="grid h-11 w-11 shrink-0 place-items-center text-slate-300 hover:text-ink hover:bg-brand/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#FF4545]/60 clip-corner-btn"
              aria-label={mobileMenuOpen ? t('common.closeMenu') : t('common.openMenu')}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>



        {mobileShow && (
          <div
            data-lenis-prevent
            className={`lg:hidden border-b border-edge bg-page px-4 pt-2.5 pb-5 ${
              mobileClosing ? 'in-out' : 'in-up'
            } max-h-[calc(100dvh-72px)] overflow-y-auto scrollbar-none`}
          >



            <div className="flex items-center justify-end gap-2 pb-2">
              {showProCta && <ProUpgradeLink onOpenPro={onOpenPro} />}
              <LanguageToggle />
            </div>



            <div className="pb-2" ref={searchRef}>
              <ToolSearchField
                value={navQuery}
                onChange={setNavQuery}
                dropdown={false}
                placeholder={t('directory.searchShort')}
              />
            </div>
            <nav aria-label={t('nav.ariaMain')}>
              {hits ? (
                <div className="space-y-1 pb-1.5">
                  {visibleGroups.flatMap((group) => group.items).map((item) => (
                    <LocaleLink
                      key={item.to}
                      to={item.to}
                      onClick={closeMobile}
                      aria-current={isCurrent(item.to) ? 'page' : undefined}
                      className={itemClass(isCurrent(item.to))}
                    >
                      <span className={ICON_BOX_SM}>{item.icon}</span>
                      <span className="min-w-0 leading-tight">{item.label}</span>
                    </LocaleLink>
                  ))}
                  {visibleGroups.length === 0 && (
                    <p className="px-2 py-2 text-sm text-soft">{t('directory.noResult', { q: navQuery.trim() })}</p>
                  )}
                </div>
              ) : (
                visibleGroups.map((group) => {
                  const expanded = openGroup === group.id
                  return (
                    <div key={group.id}>
                      <button
                        type="button"
                        onClick={() => setOpenGroup(expanded ? null : group.id)}
                        aria-expanded={expanded}
                        className="flex w-full items-center gap-2 px-1 py-2 text-left text-[13px] font-semibold text-ink clip-corner-btn hover:bg-brand/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#FF4545]/60"
                      >
                        <span className="truncate">{group.title}</span>
                        <span className="ml-auto shrink-0 font-mono text-[10px] text-slate-500">{group.items.length}</span>
                        <ChevronDown className={`w-4 h-4 shrink-0 text-soft transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} />
                      </button>
                      <div className="acc" data-open={expanded}>
                        <div>
                          <div className="grid grid-cols-1 gap-1 pb-1.5 min-[400px]:grid-cols-2">
                            {group.items.map((item) => (
                              <LocaleLink
                                key={item.to}
                                to={item.to}
                                onClick={closeMobile}
                                aria-current={isCurrent(item.to) ? 'page' : undefined}
                                className={itemClass(isCurrent(item.to))}
                              >
                                <span className={ICON_BOX_SM}>{item.icon}</span>


                                <span className="min-w-0 leading-tight">{item.label}</span>
                              </LocaleLink>
                            ))}
                          </div>
                          {group.to && (
                            <LocaleLink
                              to={group.to}
                              onClick={closeMobile}
                              className="flex items-center gap-1.5 px-2 pb-1 text-xs font-medium text-brand hover:text-brand-active transition-colors"
                            >
                              {t('directory.viewAll', { count: group.count })}
                              <ArrowUpRight className="w-3.5 h-3.5" />
                            </LocaleLink>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </nav>


            <div className="grid grid-cols-2 gap-1.5 pt-2.5 border-t border-edge/60">
              {user ? (
                <>
                  <span
                    className="col-span-2 inline-flex items-center gap-2 px-2.5 py-1.5 text-[13px] text-slate-200 bg-surface border border-[rgba(255,59,48,0.35)] clip-corner-btn"
                    title={user.email ?? undefined}
                  >
                    {accountAvatar(user) ? (
                      <img
                        src={accountAvatar(user) as string}
                        alt=""
                        className="w-5 h-5 rounded-full object-cover shrink-0"
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
                    className="flex items-center gap-2 px-2.5 py-1.5 text-[13px] font-medium text-soft hover:text-ink bg-surface border border-edge clip-corner-btn"
                  >
                    <UserIcon className="w-4 h-4 shrink-0 text-brand-2" />
                    <span className="min-w-0 leading-tight">{t('nav.myProfile')}</span>
                  </LocaleLink>
                  <LocaleLink
                    to="/history"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-2.5 py-1.5 text-[13px] font-medium text-soft hover:text-ink bg-surface border border-edge clip-corner-btn"
                  >
                    <HistoryIcon className="w-4 h-4 shrink-0 text-brand-2" />
                    <span className="min-w-0 leading-tight">{t('nav.history')}</span>
                  </LocaleLink>
                  <Button
                    variant="secondary"
                    fullWidth
                    size="sm"
                    className="col-span-2"
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
                <Button
                  variant="primary"
                  fullWidth
                  size="sm"
                  className="col-span-2"
                  onClick={() => handleAuthClick('login')}
                  leftIcon={<LogIn className="w-4 h-4" />}
                >
                  {t('auth.login')}
                </Button>
              )}
            </div>
          </div>
        )}
      </header>

      {!onOpenAuth && (
        <AuthModal
          key={authModalSeq}
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
