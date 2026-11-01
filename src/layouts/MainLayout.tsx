import { useState, useEffect, useRef, Suspense } from 'react'
import { Outlet, useLocation, useNavigate, useNavigationType } from 'react-router-dom'
import { Navbar, Footer, AuthModal, ProPlanModal, SocialBarAds, BuyMeCoffee } from '../components'
import { ConsentModal } from '../components/consent/ConsentModal'
import { LangRouteSync } from '../i18n/LangRouteSync'
import { stripLocale, t, useI18n, withLocale } from '../i18n/langStore'
import { subscribeAuthEvent, useAuth } from '../services/authStore'
import { useOpenSeq } from '../hooks/useExitFade'
import { getLenisInstance } from '../hooks/useSmoothScroll'
import { initReveal } from '../utils/revealMotion'
import { initParallax } from '../utils/scrollMotion'

// Vị trí cuộn theo history-entry key (window.history.state.key — React Router gán cho
// mỗi entry một id duy nhất; <ScrollRestoration> chính chủ cũng khoá đúng bằng id này).
// App tự quản vì router chế độ khai báo (BrowserRouter + <Routes>) không có component đó.
// Key chứ không phải pathname: một pathname hiện ra nhiều lần trong lịch sử với chỗ đọc
// khác nhau, và effect có thể chạy lại mà pathname không đổi (StrictMode double-invoke,
// layout remount khi đổi locale). Không có cờ "một lần dùng" nào cả — cờ kiểu đó chính
// là nguồn bug cũ: lượt effect đầu tiêu thụ mất giá trị, lượt sau đọc được undefined và
// tự cuộn về 0 đè lên chỗ người dùng đang đọc.
// sessionStorage (không phải localStorage): vị trí cuộn chỉ có nghĩa trong phiên này, và
// nhờ nó F5 giữa trang vẫn về đúng chỗ cũ — app đã tắt scrollRestoration native nên không
// còn ai khác làm việc đó.
const SS_SCROLL_KEY = 'ofa-scroll-v1'
const SS_MAX_ENTRIES = 50

const isBrowser = typeof window !== 'undefined' && typeof window.history !== 'undefined'

function readSessionScroll(): Map<string, number> {
  const map = new Map<string, number>()
  if (!isBrowser) return map
  try {
    const raw = window.sessionStorage.getItem(SS_SCROLL_KEY)
    if (!raw) return map
    for (const [key, y] of Object.entries(JSON.parse(raw) as Record<string, unknown>)) {
      if (typeof y === 'number' && Number.isFinite(y)) map.set(key, y)
    }
  } catch {
    // sessionStorage blocked (che chế private của Safari) hay JSON hỏng — cứ bỏ trống,
    // mất vị trí cuộn không đáng một lần crash.
  }
  return map
}

const scrollByKey = readSessionScroll()

// Entry ĐẦU TIÊN của lịch sử (trang mở thẳng bằng URL/F5) do trình duyệt tạo thì
// history.state là null — React Router không push nên không gán key. Không có key thì
// không ghi được chỗ đọc, Back/F5 về entry đó luôn đáp 0. <ScrollRestoration> chính chủ
// xử bằng cách tự bổ một key random qua replaceState; làm y vậy, giữ nguyên mọi field
// khác của state để không đụng phần router đang đọc.
function ensureHistoryKey(): string | undefined {
  if (!isBrowser) return undefined
  const state = window.history.state as { key?: string } | null
  if (typeof state?.key === 'string') return state.key
  const key = Math.random().toString(32).slice(2)
  try {
    window.history.replaceState({ ...(state ?? {}), key }, '')
  } catch {
    return undefined
  }
  return key
}

// Native 'auto' để Chrome tự khôi phục, nhưng nó chạy TRỄ hơn effect của app vài chục ms
// và dùng trí nhớ riêng (đo theo chiều cao trang lúc capture, khác chiều cao sau khi route
// mới render xong), nên số cuối cùng bao giờ cũng lệch. App đã kiểm soát vị trí thì phải
// nhận nốt phần còn lại: 'manual' tắt hẳn việc trình duyệt can thiệp.
if (isBrowser) window.history.scrollRestoration = 'manual'

// Ghi một lượt khi trang sắp đóng — listener 'scroll' chỉ cập nhật map trong bộ nhớ.
if (isBrowser) {
  window.addEventListener('pagehide', () => {
    try {
      // Map giữ thứ tự chèn; cắt N phần tử CUỐI là các history entry mới nhất.
      const keep = [...scrollByKey].slice(-SS_MAX_ENTRIES)
      const obj: Record<string, number> = {}
      for (const [key, y] of keep) obj[key] = y
      window.sessionStorage.setItem(SS_SCROLL_KEY, JSON.stringify(obj))
    } catch {
      // hết quota — bỏ qua, cùng lý do như trên
    }
  })
}

// Bấm link sang trang mới thì luôn lên đầu, chỉ Back/Forward mới khôi phục chỗ cũ: push
// tạo key mới nên map trống ở key đó (saved === undefined → về 0), pop trở lại key cũ
// đã được ghi. Vì vậy không cần nghe popstate.

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

// Nhịp mờ của khối nội dung lúc đổi ngôn ngữ. PHẢI trùng duration của .lang-swap trong
// index.css — lệnh gỡ class chạy bằng timeout nên lệch số là class ở lại lâu hơn animation.
const LANG_SWAP_MS = 140

// Lời mời đăng ký chỉ bật MỘT lần trên một máy: ghi cờ ngay lúc mở, nếu ghi lúc đóng thì
// mỗi lần reload trang đầu tiên là modal lại nhảy ra.
const AUTH_PROMPT_KEY = 'ofa-auth-prompt'

export function MainLayout() {
  // Navbar/Footer/page con gọi t() trực tiếp (không hook) → layout phải subscribe
  // để cả subtree render lại khi lang đổi.
  const { lang } = useI18n()
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'forgot' | null>(null)
  const [proOpen, setProOpen] = useState(false)
  const { session, ready } = useAuth()
  // Khách lần đầu đặt chân tới (máy này chưa từng thấy lời mời, chưa có phiên) → mở sẵn form
  // đăng ký. Là giá trị DẪN XUẤT chứ không phải setState trong effect: `ready` bật lên sau khi
  // Supabase khôi phục phiên nên khách đã đăng nhập không bị modal chặn; chờ xong vẫn đóng được
  // bằng đúng nút đóng của AuthModal.
  const [firstVisit, setFirstVisit] = useState(() => {
    try {
      return localStorage.getItem(AUTH_PROMPT_KEY) === null
    } catch {
      return false // storage bị chặn → không đoán được lần đầu, thà không bật còn hơn mỗi reload là một lần
    }
  })
  const showFirstVisitAuth = firstVisit && ready && !session
  useEffect(() => {
    if (!showFirstVisitAuth) return
    try {
      localStorage.setItem(AUTH_PROMPT_KEY, '1')
    } catch {
      // Không ghi được cờ thì lần reload sau modal bật lại — chấp nhận được, không chặn app.
    }
  }, [showFirstVisitAuth])
  // key đổi lúc MỞ chứ không lúc đóng — nếu 'closed' là một key thì React gỡ AuthModal
  // ngay khi tắt và lớp fade ra không bao giờ chạy.
  const authSeq = useOpenSeq(
    authMode !== null || showFirstVisitAuth,
    authMode ?? (showFirstVisitAuth ? 'register' : null),
  )
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const navAction = useNavigationType()
  // /tools ↔ /en/tools là MỘT trang: key dựng từ path đã trừ prefix locale, nên bấm VI/EN
  // không remount khối nội dung — không replay page-enter, không dựng lại reveal, chữ chỉ
  // đổi tại chỗ. Đường khác nhau thì key vẫn khác như trước.
  const pageKey = stripLocale(pathname).path
  const contentRef = useRef<HTMLElement>(null)
  const prevLangRef = useRef(lang)
  const lastScrollPathRef = useRef<string | null>(null)

  // Chữ đổi là một cú đổi nội dung, không phải một lần vào trang → page-enter không chạy,
  // nên cần nhịp mờ ngắn để chữ mới không pop ngay frame đầu. Gỡ class bằng timeout đúng
  // bằng duration chứ không nghe animationend: reduced-motion đặt animation: none nên sự
  // kiện đó không bao giờ bắn, class ở lại và lần đổi sau không khởi động lại được.
  useEffect(() => {
    if (prevLangRef.current === lang) return
    prevLangRef.current = lang
    const el = contentRef.current
    if (!el) return
    el.classList.add('lang-swap')
    const id = window.setTimeout(() => el.classList.remove('lang-swap'), LANG_SWAP_MS)
    return () => {
      window.clearTimeout(id)
      el.classList.remove('lang-swap')
    }
  }, [lang])

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
        setFirstVisit(false)
        const target = withLocale('/auth/reset-password')
        // Đang ở chính trang reset (hash được tiêu thụ tại chỗ) → không navigate,
        // tránh history replace xóa hash/token trước khi supabase-js xử lý xong.
        if (window.location.pathname === target) return
        navigate(target, { replace: true })
      }),
    [navigate],
  )

  useEffect(() => {
    const key = ensureHistoryKey()
    // Lượt đổi ngôn ngữ: pathname khác mỗi prefix, push tạo history entry mới nên map
    // trống ở key đó — mặc định là kéo về 0 giữa lúc người dùng đang đọc. Giữ nguyên số
    // hiện tại và ghi nó xuống key mới để Back về entry này vẫn đúng chỗ. POP thì không áp
    // dụng: entry cũ đã có chỗ đọc riêng, phải restore số đó.
    const lastPath = lastScrollPathRef.current
    lastScrollPathRef.current = pathname
    const localeOnly =
      lastPath !== null &&
      lastPath !== pathname &&
      navAction !== 'POP' &&
      stripLocale(lastPath).path === stripLocale(pathname).path
    const saved = key === undefined ? undefined : scrollByKey.get(key)
    // Qua Lenis chứ không window.scrollTo: `immediate` mới đặt lại cả targetScroll lẫn
    // animatedScroll về đích. Native scroll tức thì không xoá cục quán tính đang bay của
    // trang cũ, nên frame kế tiếp Lenis lại kéo trang mới đi tiếp — đúng cái giật mà
    // stopInertiaOnNavigate không bắt kịp khi pathname đổi trước effect này.
    const restore = () => {
      const lenis = getLenisInstance()
      if (lenis) {
        lenis.scrollTo(saved ?? 0, { immediate: true })
        return
      }
      window.scrollTo({ top: saved ?? 0, left: 0, behavior: 'instant' })
    }

    // Khôi phục sau khi DOM của route mới đã commit (effect chạy sau commit) và một
    // frame layout ổn định, tránh scroll vào chiều cao cũ khi trang còn render.
    // Vị trí 0 thì không có gì phải chờ, đặt luôn.
    let raf = 0
    if (localeOnly) {
      if (key !== undefined) scrollByKey.set(key, window.scrollY)
    } else if (saved === undefined || typeof requestAnimationFrame !== 'function') {
      restore()
    } else {
      raf = requestAnimationFrame(restore)
    }

    const onScroll = () => {
      if (key !== undefined) scrollByKey.set(key, window.scrollY)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      if (raf) cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
    }
  }, [pathname, navAction])

  // Reveal + parallax dựng sau hiệu ứng page-enter của route mới. rAF thứ hai là để
  // đo getBoundingClientRect() SAU khi restore() ở effect trên đã định vị cuộn (nó
  // cũng queue một rAF), nếu không Back/Forward sẽ tính nhầm section/lớp nền nào
  // "đã trong khung hình".
  useEffect(() => {
    let dispose = () => {}
    const raf = requestAnimationFrame(() => {
      const disposeReveal = initReveal()
      const disposeParallax = initParallax()
      dispose = () => {
        disposeReveal()
        disposeParallax()
      }
    })
    return () => {
      cancelAnimationFrame(raf)
      dispose()
    }
  }, [pathname])

  return (
    <div className="min-h-screen flex flex-col bg-page text-ink selection:bg-brand selection:text-white antialiased">
      <LangRouteSync />
      <Navbar onOpenAuth={(mode) => setAuthMode(mode)} onOpenPro={openPro} />
      <main ref={contentRef} className="flex-1 w-full">
        <div key={pageKey} className="animate-page-enter">
          {/* Bọc Outlet chứ không bọc cả <Routes>: chờ chunk của route thì
              Navbar/Footer/modal vẫn đứng nguyên, không chớp cả khung hình. */}
          <Suspense fallback={<RouteFallback />}>
            <Outlet context={{ openAuth: setAuthMode, openPro }} />
          </Suspense>
        </div>
      </main>
      <Footer />

      {/* key theo nhịp mở: mỗi lần mở là instance mới → state form/OTP không dư leftover */}
      <AuthModal
        key={authSeq}
        isOpen={authMode !== null || showFirstVisitAuth}
        initialMode={authMode ?? 'register'}
        onClose={() => {
          setAuthMode(null)
          setFirstVisit(false)
        }}
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
