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
import { useExitFade, useOpenSeq } from '../../hooks/useExitFade'

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
  /** Trang danh mục của nhóm; nhóm Giải trí không có trang nên là null. */
  to: string | null
  /** Số tool thật trong registry — link "Xem tất cả" phải đếm đủ, kể mấy slug menu ẩn. */
  count: number
  GroupIcon: IconComponent
  items: NavItem[]
}

const ICON = 'w-4 h-4 shrink-0'
const ICON_BOX = 'grid place-items-center w-7 h-7 shrink-0 bg-elev border border-edge text-brand clip-corner-btn'
/** Bản 24px cho drawer mobile: hàng 13px mà hộp 28px thì mỗi dòng nở thêm ~4px. */
const ICON_BOX_SM = 'grid place-items-center w-6 h-6 shrink-0 bg-elev border border-edge text-brand clip-corner-btn'
/** Nối tab nhóm với vùng con của mega-menu desktop để aria-expanded có đích. */
const MENU_ITEMS_ID = 'nav-menu-groups'
/** Nối trigger với panel đã render để aria-controls không trỏ vào khoảng không. */
const TOOLS_PANEL_ID = 'nav-tools-menu'
/**
 * Đóng tức thì lúc con trỏ rời đi là nhấp nháy: chuột lượn qua mép panel rồi quay lại
 * trong 100ms thì panel kịp biến mất rồi hiện lại. 260ms đủ dài cho một cú vấp chuột,
 * đủ ngắn để không ai thấy menu "treo" sau khi tay đã rời khỏi navbar.
 */
const CLOSE_DELAY_MS = 260

/**
 * Bốn trang định dạng riêng của TikTok/YouTube vẫn là route thật (registry đủ 17 slug
 * cho /tools, sitemap, prerender) nhưng không đứng trong menu nữa: chọn MP3/MP4 là việc
 * của form bên trong trang tải, không phải của thanh điều hướng. Lọc ngay đây nên lưới
 * nhóm, kết quả tìm của menu và accordion mobile cùng hết hiện chúng — một nguồn, một chỗ.
 */
const NAV_HIDDEN_SLUGS = new Set(['/youtube-to-mp3', '/youtube-to-mp4', '/tiktok-to-mp3', '/tiktok-to-mp4'])

/** Hai trang tải chính gọi theo hành động, ngắn hơn badge registry cho khỏi tràn hàng. */
const NAV_LABEL_KEYS: Record<string, string> = {
  '/tiktok-downloader': 'nav.toolTiktok',
  '/youtube-downloader': 'nav.toolYoutube',
}

/**
 * Menu đọc thẳng từ registry: thêm tool vào SEO_TOOLS là nó tự xuất hiện ở mega-menu,
 * menu mobile và footer. Danh sách 6/17 tool chép tay chính là lý do menu luôn thiếu tool.
 */
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
      items: cat.toolSlugs
        .filter((slug) => !NAV_HIDDEN_SLUGS.has(slug))
        .map((slug) => ({
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
  const [navQuery, setNavQuery] = useState('')
  const [openGroup, setOpenGroup] = useState<string | null>(null)
  const [menuGroup, setMenuGroup] = useState<string | null>(null)
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register' | null>(null)
  const [accountOpen, setAccountOpen] = useState(false)
  const [confirmSignOutOpen, setConfirmSignOutOpen] = useState(false)
  // Ba surface nổi của navbar (mega-menu, menu tài khoản, drawer mobile) đều fade ra:
  // useExitFade giữ node lại 180ms (lớn hơn .out-fade 160ms một chút) để lớp fade ra
  // chạy hết thay vì biến mất tức thì.
  const { show: toolsShow, closing: toolsClosing } = useExitFade(toolsOpen)
  const { show: accountShow, closing: accountClosing } = useExitFade(accountOpen)
  const { show: mobileShow, closing: mobileClosing } = useExitFade(mobileMenuOpen)
  // Instance AuthModal mới theo nhịp MỞ (xem useOpenSeq) — key đổi lúc đóng sẽ gỡ node
  // trước khi lớp fade ra kịp chạy.
  const authModalSeq = useOpenSeq(authModalMode !== null, authModalMode)
  const accountRef = useRef<HTMLDivElement>(null)
  const toolsRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLDivElement>(null)
  /** Hẹn đóng của hover; ref chứ không state vì nó không đổi thứ gì để vẽ. */
  const closeTimer = useRef<number | null>(null)
  const location = useLocation()
  const { session, ready } = useAuth()
  // useI18n() vừa lấy lang cho nhãn registry, vừa ĐĂNG KÝ re-render khi đổi ngôn ngữ:
  // t() đọc store thẳng nên thiếu subscription thì navbar giữ chữ tiếng Việt mãi sau khi
  // khách bật EN.
  const { lang } = useI18n()
  const user = session?.user ?? null
  const groups = navGroups(lang)
  const searchIndex = useToolSearchIndex()

  // Đóng dropdown khi click ra ngoài / Esc. Navigation đóng qua onClick của từng
  // item (không dùng effect setState-sync — tránh cascading render). closeTools là
  // useCallback([]) nên đưa nó vào deps không khiến listener gắn/rỡ lại mỗi render — và
  // Esc/click ngoài phải đi qua nó chứ không setToolsOpen thẳng, vì một hẹn đóng của hover
  // đang chờ ngoài kia cũng phải bị hủy.
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
      /* Escape khi focus đang ở TRONG panel thì trả về trigger: đóng mà để focus rơi xuống
         body là Tab kế tiếp quay lại tận đầu trang, không ai biết mình đang đứng đâu. */
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

  // Hẹn đóng phải chết theo component: unmount giữa lúc chờ là gọi setToolsOpen trên
  // cây đã gỡ, và một timer còn sống trên window thì không ai dọn.
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

  // startsWith() với đường dẫn có '/' cuối (withLocale luôn thêm) nên không có chuyện
  // '/convert' sáng nhầm trên '/convert-file'. '/tools' sáng cả khi ở trang danh mục nhóm.
  const isCurrent = (to: string): boolean => location.pathname === withLocale(to)
  const onDirectoryPage = location.pathname.startsWith(withLocale('/tools'))
  /* Pill vẫn sáng trên CẢ 17 trang tool, kể cả mấy trang MP3/MP4 không còn đứng trong
     menu: "đang ở nhóm công cụ" là trạng thái của trang, không phải của danh sách link
     vừa thu gọn. */
  const onToolPage = ALL_TOOL_SLUGS.some((slug) => isCurrent(slug)) || onDirectoryPage
  const activeGroupId = groups.find((g) => g.items.some((item) => isCurrent(item.to)))?.id ?? null

  // Mega-menu tự lọc lấy lưới thay vì mở danh sách riêng: overflow-hidden của thẻ
  // cha sẽ cắt mọi dropdown đặt bên trong. Cùng bộ chấm điểm với ô tìm ở hero.
  const hits = navQuery.trim() ? new Set(filterTools(searchIndex, navQuery).map((entry) => entry.slug)) : null
  const visibleGroups = hits
    ? groups
        .map((group) => ({ ...group, items: group.items.filter((item) => hits.has(item.to)) }))
        .filter((group) => group.items.length > 0)
    : groups

  /* Vùng con của mega-menu desktop CHỈ hiện khi bấm vào một nhóm (menuGroup) — không
     bung sẵn nhóm của trang đang xem, vì "thấy trước" nghĩa là hiện cả đống link người
     dùng chưa hỏi tới. `groups` chưa lọc nên menuGroup không thể trỏ vào nhóm mà bộ lọc
     đã ẩn. */
  const openMenuGroup = groups.find((group) => group.id === menuGroup) ?? null

  const openTools = () => {
    if (closeTimer.current !== null) {
      window.clearTimeout(closeTimer.current)
      closeTimer.current = null
    }
    // Mở lại phải thấy đủ các nhóm, không phải danh sách sót lại của lần tìm trước.
    setNavQuery('')
    setMenuGroup(null)
    setToolsOpen(true)
  }

  /* Hẹn đóng chứ không đóng ngay: con trỏ lượn ra mép panel rồi quay lại trong
     CLOSE_DELAY_MS thì lần quay lại đó HOÀN TOÀN không thấy một nhịp biến mất. */
  const scheduleToolsClose = () => {
    if (closeTimer.current !== null) return
    closeTimer.current = window.setTimeout(() => {
      closeTimer.current = null
      setToolsOpen(false)
    }, CLOSE_DELAY_MS)
  }

  const toggleTools = () => (toolsOpen ? closeTools() : openTools())

  /* Hover CHỈ dành cho con trỏ thật: màn cảm ứng bắn pointerenter ngay khi chạm và menu
     sẽ mở trước cả cú bấm chuyển trang, nên pointerType !== 'mouse' bỏ qua hết —
     mobile/tablet vẫn mở bằng bấm (onClick bên trigger). Hai handler đặt trên DIV BAO
     trigger + panel: panel là con của div đó trong DOM nên pointerleave chỉ nổ khi con
     trỏ rời khỏi CẢ khu vực navbar lẫn dropdown, đúng chỗ menu được phép đóng. */
  const onToolsPointerEnter = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== 'mouse') return
    openTools()
  }

  const onToolsPointerLeave = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== 'mouse') return
    scheduleToolsClose()
  }

  /* React cài onBlur bằng native focusout — thứ NỔI từ con lên — nên handler này bắt được
     cả lúc link bên trong panel mất focus. Tab qua link cuối là rời khỏi panel, không có
     con trỏ nào bắn pointerleave nữa: đóng theo focus, nếu không dropdown treo nguyên trên
     trang cho tới cú click kế tiếp. */
  const onToolsBlur = (e: ReactFocusEvent<HTMLDivElement>) => {
    if (e.currentTarget.contains(e.relatedTarget as Node | null)) return
    closeTools()
  }

  // Mở menu là nhóm đang xem bung sẵn — người dùng không phải lần từng accordion.
  const toggleMobileMenu = () => {
    const next = !mobileMenuOpen
    // Xoá bộ lọc lúc MỞ chứ không lúc đóng: frame đang fade ra vẫn phải giữ nguyên nội dung
    // người dùng vừa xem, nếu không lưới nhóm nhảy về giữa lúc panel mờ dần.
    if (next) setNavQuery('')
    setMobileMenuOpen(next)
    if (next) setOpenGroup(activeGroupId)
  }

  const closeMobile = () => {
    setMobileMenuOpen(false)
    searchRef.current?.querySelector('input')?.blur()
  }

  /** Dòng tool trong drawer mobile: gọn hơn bản cũ một bậc để các nhóm + nhóm đang mở
   *  vẫn nằm trong màn hình, không phải cuộn hai lần mới tới nút đăng nhập. */
  const itemClass = (active: boolean): string =>
    `flex items-center gap-2 px-2 py-1.5 text-[13px] clip-corner-btn transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF4545]/60 ${
      active ? 'bg-tint text-brand-active font-semibold' : 'text-soft hover:text-ink hover:bg-brand/10'
    }`

  /** Bản của lưới mega-menu: cùng bộ với itemClass, khác chỗ cột lưới hẹp hơn drawer nên
   *  nhãn dài cắt một hàng bằng truncate thay vì cho xuống dòng. */
  const compactItemClass = (active: boolean): string =>
    `flex items-center gap-2 px-2 py-1.5 text-[13px] clip-corner-btn transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF4545]/60 ${
      active ? 'bg-tint text-brand-active font-semibold' : 'text-soft hover:text-ink hover:bg-brand/10'
    }`

  /** Tab nhóm: chữ mono 10px hoa + icon một hàng, full-width vì lưới chia cột đều. */
  const groupTabClass = (open: boolean, current: boolean): string =>
    `flex w-full items-center gap-1.5 px-2 py-1.5 text-[10px] font-mono uppercase tracking-[0.02em] clip-corner-btn transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF4545]/60 ${
      open
        ? 'bg-tint text-brand-active font-semibold'
        : current
          ? 'text-brand hover:text-brand-active hover:bg-brand/10'
          : 'text-slate-500 hover:text-ink hover:bg-brand/10'
    }`

  return (
    <>
      {/* backdrop-blur toàn chiều ngang bắt GPU lọc lại nền mọi khung hình cuộn,
          mà máy cảm ứng thì không đủ mạnh — chuyển sang nền đặc, không blur. */}
      <header className="sticky top-0 z-40 w-full border-b border-edge bg-page/85 backdrop-blur-xl pointer-coarse:bg-page pointer-coarse:backdrop-blur-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-[72px] flex items-center gap-3">
          {/* Logo */}
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

          {/* Điều hướng desktop: một pill "Công cụ" mở mega-menu. Pill sáng lên khi
              đang ở trang của một công cụ nào đó trong danh mục. */}
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
                {/* Mũi đóng/mở để nhỏ hơn và mờ hơn: cùng 16px với chữ thì nó
                    tranh sự chú ý với nhãn, hàng icon-chữ-mũi không còn một khối. */}
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
                        placeholder={t('directory.searchPlaceholder')}
                      />
                    </div>

                    {visibleGroups.length === 0 ? (
                      <p className="px-4 py-5 text-sm text-soft">{t('directory.noResult', { q: navQuery.trim() })}</p>
                    ) : hits ? (
                      /* Đang gõ: bỏ tab, trải thẳng kết quả ra lưới. Tìm 'mp3' thì phải thấy
                         hết mấy link liên quan ngay, không phải trỏ từng nhóm xem nhóm nào còn sót. */
                      <div className="grid grid-cols-2 gap-x-3 gap-y-1 p-3 max-h-[60vh] overflow-y-auto scrollbar-none lg:grid-cols-3 xl:grid-cols-4">
                        {visibleGroups.flatMap((group) =>
                          group.items.map((item) => (
                            <LocaleLink
                              key={item.to}
                              to={item.to}
                              onClick={closeTools}
                              aria-current={isCurrent(item.to) ? 'page' : undefined}
                              className={compactItemClass(isCurrent(item.to))}
                            >
                              <span className={ICON_BOX}>{item.icon}</span>
                              <span className="min-w-0 truncate">{item.label}</span>
                            </LocaleLink>
                          )),
                        )}
                      </div>
                    ) : (
                      <>
                        {/* Mega-menu desktop hai tầng: dải tab nhóm nằm ngang, bấm (hay Enter)
                            vào tab nào thì đúng nhóm đó xổ con ra dưới, bấm lại tab đó để thu
                            vào. Trang danh mục của nhóm vẫn tới được qua link "Xem tất cả"
                            trong vùng con — URL giữ nguyên. */}
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

                        {/* key theo id để mỗi lần đổi nhóm là một nhịp "xổ ra" rõ ràng. */}
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
                                  className={compactItemClass(isCurrent(item.to))}
                                >
                                  <span className={ICON_BOX}>{item.icon}</span>
                                  <span className="min-w-0 truncate">{item.label}</span>
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
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-soft hover:text-ink transition-colors clip-corner-btn focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF4545]/60"
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
                <div className="h-[30px] w-24 rounded-md bg-surface/60 animate-pulse" aria-hidden="true" />
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
                /* Một nút mở form đăng nhập; chuyển sang đăng ký để trong modal làm
                   bằng hai tab của nó — navbar không lặp lại bộ tab đó. */
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

          {/* Mobile: theme + hamburger. Từ 768px theme đã nằm trong thanh glass nên
              cluster này chỉ còn mỗi hamburger. */}
          <div className="flex lg:hidden items-center gap-2">
            <span className="min-[768px]:hidden">
              <ThemeToggle />
            </span>
            <button
              type="button"
              onClick={toggleMobileMenu}
              className="p-2 text-slate-300 hover:text-ink hover:bg-brand/10 focus:outline-none clip-corner-btn"
              aria-label={mobileMenuOpen ? t('common.closeMenu') : t('common.openMenu')}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Menu mobile: cùng bộ nhóm với mega-menu desktop, nhưng là accordion
            (mở một nhóm/lần) — 17 link trải hết sẽ dài hơn màn hình điện thoại. */}
        {mobileShow && (
          <div
            className={`lg:hidden border-b border-edge bg-page px-4 pt-2.5 pb-5 ${
              mobileClosing ? 'in-out' : 'in-up'
            } max-h-[calc(100dvh-72px)] overflow-y-auto scrollbar-none`}
          >
            {/* VI/EN tự giải thích nên khỏi cần nhãn "Ngôn ngữ" + vạch phân cách: mỗi dòng
                thừa là một dòng ăn vào chỗ của các nhóm công cụ. */}
            <div className="flex justify-end pb-2">
              <LanguageToggle />
            </div>
            {/* Ô tìm kiếm lọc trực tiếp trên menu: gõ vài ký tự là danh sách co lại còn
                đúng thứ cần, không phải mở từng accordion mà mò. */}
            <div className="pb-2" ref={searchRef}>
              <ToolSearchField
                value={navQuery}
                onChange={setNavQuery}
                dropdown={false}
                placeholder={t('directory.searchPlaceholder')}
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
                    <div key={group.id} className="border-b border-edge/50 last:border-b-0">
                      <button
                        type="button"
                        onClick={() => setOpenGroup(expanded ? null : group.id)}
                        aria-expanded={expanded}
                        className="flex w-full items-center gap-2 px-1 py-2 text-left text-[13px] font-semibold text-ink clip-corner-btn hover:bg-brand/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF4545]/60"
                      >
                        <group.GroupIcon className="w-4 h-4 shrink-0 text-brand" />
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
                                {/* Cho phép xuống dòng: hai cột ở 400px chỉ ~150px, không đủ cho
                                    "Tải YouTube" trên một hàng. */}
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
            {/* Tinh gọn: hàng tài khoản chiếm 1 dòng, Hồ sơ/Lịch sử đứng cạnh nhau thay
                vì mỗi cái một dòng — drawer cao quá là phần công cụ bị cuộn mất. */}
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
