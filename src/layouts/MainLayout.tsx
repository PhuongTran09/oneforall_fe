import { useState, useEffect, Suspense } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Navbar, Footer, AuthModal, ProPlanModal, SocialBarAds, BuyMeCoffee, ScrollProgress } from '../components'
import { ConsentModal } from '../components/consent/ConsentModal'
import { LangRouteSync } from '../i18n/LangRouteSync'
import { t, useI18n, withLocale } from '../i18n/langStore'
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

export function MainLayout() {
  // Navbar/Footer/page con gọi t() trực tiếp (không hook) → layout phải subscribe
  // để cả subtree render lại khi lang đổi.
  useI18n()
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'forgot' | null>(null)
  // key đổi lúc MỞ chứ không lúc đóng — nếu 'closed' là một key thì React gỡ AuthModal
  // ngay khi tắt và lớp fade ra không bao giờ chạy.
  const authSeq = useOpenSeq(authMode !== null, authMode)
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
    const key = ensureHistoryKey()
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
    if (saved === undefined || typeof requestAnimationFrame !== 'function') {
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
  }, [pathname])

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
      <ScrollProgress />
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

      {/* key theo nhịp mở: mỗi lần mở là instance mới → state form/OTP không dư leftover */}
      <AuthModal
        key={authSeq}
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
