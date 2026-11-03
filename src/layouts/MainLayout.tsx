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
    // SessionStorage bị chặn hoặc hỏng: coi như chưa có vị trí cuộn nào để khôi phục
  }
  return map
}

const scrollByKey = readSessionScroll()






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





if (isBrowser) window.history.scrollRestoration = 'manual'


if (isBrowser) {
  window.addEventListener('pagehide', () => {
    try {

      const keep = [...scrollByKey].slice(-SS_MAX_ENTRIES)
      const obj: Record<string, number> = {}
      for (const [key, y] of keep) obj[key] = y
      window.sessionStorage.setItem(SS_SCROLL_KEY, JSON.stringify(obj))
    } catch {
      // Mất vị trí cuộn khi quay lại tab là chấp nhận được; ném lỗi lúc pagehide thì hỏng cả lượt đóng
    }
  })
}







function RouteFallback() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 text-brand-2">
      <span className="w-8 h-8 rounded-full border-2 border-current border-t-transparent animate-spin" />
      <span className="text-sm text-soft">{t('common.loading')}</span>
    </div>
  )
}



const LANG_SWAP_MS = 140



const AUTH_PROMPT_KEY = 'ofa-auth-prompt'








const BOOT_PAGE_KEY = stripLocale(window.location.pathname).path

export function MainLayout() {


  const { lang } = useI18n()
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'forgot' | null>(null)
  const [proOpen, setProOpen] = useState(false)
  const { session, ready } = useAuth()




  const [firstVisit, setFirstVisit] = useState(() => {
    try {
      return localStorage.getItem(AUTH_PROMPT_KEY) === null
    } catch {
      return false
    }
  })
  const showFirstVisitAuth = firstVisit && ready && !session
  useEffect(() => {
    if (!showFirstVisitAuth) return
    try {
      localStorage.setItem(AUTH_PROMPT_KEY, '1')
    } catch {
      // Không ghi được cờ thì lần sau lại hỏi một lần nữa — hỏi thừa còn hơn chặn
    }
  }, [showFirstVisitAuth])


  const authSeq = useOpenSeq(
    authMode !== null || showFirstVisitAuth,
    authMode ?? (showFirstVisitAuth ? 'register' : null),
  )
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const navAction = useNavigationType()



  const pageKey = stripLocale(pathname).path
  const contentRef = useRef<HTMLElement>(null)
  const prevLangRef = useRef(lang)
  const lastScrollPathRef = useRef<string | null>(null)





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


  const openPro = () => {
    if (session) setProOpen(true)
    else setAuthMode('register')
  }



  useEffect(
    () =>
      subscribeAuthEvent((event) => {
        if (event !== 'PASSWORD_RECOVERY') return
        setAuthMode(null)
        setFirstVisit(false)
        const target = withLocale('/auth/reset-password')


        if (window.location.pathname === target) return
        navigate(target, { replace: true })
      }),
    [navigate],
  )

  useEffect(() => {
    const key = ensureHistoryKey()




    const lastPath = lastScrollPathRef.current
    lastScrollPathRef.current = pathname
    const localeOnly =
      lastPath !== null &&
      lastPath !== pathname &&
      navAction !== 'POP' &&
      stripLocale(lastPath).path === stripLocale(pathname).path
    const saved = key === undefined ? undefined : scrollByKey.get(key)




    const restore = () => {
      const lenis = getLenisInstance()
      if (lenis) {
        lenis.scrollTo(saved ?? 0, { immediate: true })
        return
      }
      window.scrollTo({ top: saved ?? 0, left: 0, behavior: 'instant' })
    }




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
    // selection: không áp được variant lên class thường (.text-on-brand) nên mực brand để trực tiếp
    <div className="min-h-screen flex flex-col bg-page text-ink selection:bg-brand selection:[color:var(--on-brand)] antialiased">
      <LangRouteSync />
      <Navbar onOpenAuth={(mode) => setAuthMode(mode)} onOpenPro={openPro} />




      <main ref={contentRef} id="main-content" tabIndex={-1} className="flex-1 w-full outline-none">
        <div key={pageKey} className={pageKey === BOOT_PAGE_KEY ? undefined : 'animate-page-enter'}>


          <Suspense fallback={<RouteFallback />}>
            <Outlet context={{ openAuth: setAuthMode, openPro }} />
          </Suspense>
        </div>
      </main>
      <Footer />


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


      <ConsentModal />


      <SocialBarAds />


      <BuyMeCoffee />
    </div>
  )
}
