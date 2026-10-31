import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react'
import { X, Mail, Lock, Eye, EyeOff, ArrowRight, ArrowLeft, CheckCircle2, Loader2 } from 'lucide-react'
import { Button } from '../common/Button'
import { OtpInput } from './OtpInput'
import { t } from '../../i18n/langStore'
import { showToast } from './toastStore'
import { showErrorPopup } from './errorPopupStore'
import { isSupabaseConfigured } from '../../services/supabase'
import {
  signInWithGoogle,
  signInWithPassword,
  signUp,
  resendSignupOtp,
  verifySignupOtp,
  sendLoginOtp,
  verifyLoginOtp,
  requestPasswordReset,
  useAuth,
} from '../../services/authStore'
import { describeAuthError, isEmailNotConfirmedError, isOtpExpiredError } from '../../utils/authError'
import { useExitFade } from '../../hooks/useExitFade'

export interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  initialMode?: 'login' | 'register' | 'forgot'
}

type Step = 'form' | 'login-otp' | 'verify-email' | 'forgot' | 'forgot-sent'
type Tab = 'login' | 'register'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MIN_PASSWORD = 8
const RESEND_COOLDOWN_S = 60

/**
 * Chỉ những gì đã chạy thật: lịch sử đa thiết bị (GET /v1/jobs) · huỷ/xoá và tải lại
 * tác vụ tới hạn expires_at · trần upload + bỏ quảng cáo theo gói · trang hồ sơ và
 * thanh toán. Không có mục "theo dõi hạn mức" vì số hiển thị chỉ là totalCompleted
 * và filesAvailable.
 */
const BENEFIT_KEYS = ['auth.benefit1', 'auth.benefit2', 'auth.benefit3', 'auth.benefit4'] as const

const TABS = [
  { id: 'login', labelKey: 'auth.tabLogin' },
  { id: 'register', labelKey: 'auth.tabRegister' },
] as const

// Lucide v1 bỏ brand icon → giữ SVG Google chính hãng inline (fill currentColor).
function GoogleIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.63h6.46a5.52 5.52 0 0 1-2.4 3.62v3h3.88c2.27-2.09 3.58-5.18 3.58-8.8z" />
      <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.94-2.93l-3.88-3a7.2 7.2 0 0 1-4.06 1.13 7.2 7.2 0 0 1-6.75-4.96H1.28v3.09A12 12 0 0 0 12 24z" />
      <path fill="#FBBC05" d="M5.25 14.24a7.2 7.2 0 0 1 0-4.48V6.67H1.28a12 12 0 0 0 0 10.66l3.97-3.09z" />
      <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.34-3.34A11.98 11.98 0 0 0 12 0 12 12 0 0 0 1.28 6.67l3.97 3.09A7.15 7.15 0 0 1 12 4.75z" />
    </svg>
  )
}

// 44px là mức chạm tối thiểu cho input; chiều cao chốt bằng h-11 thay vì padding để
// mọi hàng (Google, email, mật khẩu, OTP) cao đúng bằng nhau.
const inputClass =
  'auth-input h-11 w-full pl-10 pr-4 bg-page border border-brand/30 text-sm text-slate-100 placeholder-slate-500 outline-none transition-all clip-corner-btn focus:border-brand focus:ring-1 focus:ring-[#ff3b30]'

export function AuthModal({ isOpen, onClose, initialMode = 'login' }: AuthModalProps) {
  const { session } = useAuth()
  const [tab, setTab] = useState<Tab>(initialMode === 'register' ? 'register' : 'login')
  const [step, setStep] = useState<Step>(initialMode === 'forgot' ? 'forgot' : 'form')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [code, setCode] = useState('')
  const [busy, setBusy] = useState(false)
  const [needVerify, setNeedVerify] = useState(false)
  const [cooldown, setCooldown] = useState(0)

  // Đóng modal khi phiên chuyển từ chưa đăng nhập → đã đăng nhập
  // (bao gồm Google redirect, link xác nhận, OTP verify, password login).
  const prevSessionRef = useRef(session)
  useEffect(() => {
    const was = prevSessionRef.current
    prevSessionRef.current = session
    if (isOpen && session && !was) {
      showToast({ type: 'success', message: t('auth.loginSuccess') })
      onClose()
    }
  }, [session, isOpen, onClose])

  // Đồng hồ cooldown gửi lại mã — chạy cả khi modal ẩn (state không mất).
  const cooldownActive = cooldown > 0
  useEffect(() => {
    if (!cooldownActive) return
    const id = setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000)
    return () => clearInterval(id)
  }, [cooldownActive])

  // Escape đóng, Tab quay vòng trong panel. Hai call site mount lại theo `key` nên
  // onClose() là đủ — không cần reset step ở đây.
  const panelRef = useRef<HTMLDivElement>(null)
  const tablistRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!isOpen) return
    const focusables = () =>
      Array.from(
        panelRef.current?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      ).filter((el) => el.offsetParent !== null)
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
        return
      }
      if (e.key !== 'Tab') return
      const items = focusables()
      if (items.length === 0) return
      const first = items[0]
      const last = items[items.length - 1]
      const active = document.activeElement
      if (e.shiftKey && (active === first || !panelRef.current?.contains(active))) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && active === last) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [isOpen, onClose])

  /**
   * Android/iOS không thu layout viewport khi mở bàn phím (mặc định là resizes-visual),
   * nên nền `fixed inset-0` vẫn cao nguyên và panel đứng giữa theo chiều cao CŨ — nút
   * submit và link "tiếp tục ẩn danh" chui hẳn xuống sau bàn phím. iOS còn pan thêm
   * visual viewport (offsetTop > 0) để lộ ô đang gõ, kéo mọi phần tử `fixed` trượt khỏi
   * tầm nhìn. Hai biến --auth-vh/--auth-vt báo đúng vùng nhìn thấy cho CSS.
   *
   * Biến CHỈ được gán khi nhận ra bàn phím thật (xem keyboardUp): không có bàn phím thì
   * biến không tồn tại và CSS rơi về `inset-0`/`height:auto` — y hệt hành vi cũ, không
   * tự nhiên để lộ một dải sáng cạnh thanh địa chỉ của trình duyệt.
   *
   * Viết thẳng vào style của backdrop chứ không qua state: đổi style không kéo theo
   * render, nên không đụng con trỏ của ô người dùng đang gõ. Nghe cả resize lẫn scroll
   * nhưng chỉ ghi khi số thật sự đổi — cuộn trang dưới modal vì thế gần như miễn phí.
   * Listener gỡ theo isOpen; ở chiều đóng ta CỐ Ý không xoá biến, vì node còn sống 180ms
   * để fade ra và xoá giữa chừng là panel giật size ngay frame đầu của animation.
   */
  const backdropRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!isOpen) return
    const el = backdropRef.current
    const viewport = window.visualViewport
    if (!el || !viewport) return
    let height = -1
    let top = -1
    const clear = () => {
      if (height === -1 && top === -1) return
      height = -1
      top = -1
      el.style.removeProperty('--auth-vh')
      el.style.removeProperty('--auth-vt')
    }
    const sync = () => {
      // Ngưỡng 120px phân biệt bàn phím (250–400px) với thanh địa chỉ (60–90px); scale
      // khác 1 là người dùng đang pinch — chiều cao tụt vì zoom chứ không vì bàn phím.
      // 240px là sàn của một vùng còn dùng được: WebView kỳ cục báo số vụn lúc xoay
      // màn hình thì thà giữ nguyên bố cục cũ còn hơn để nền tối co về gần 0.
      const keyboardUp =
        viewport.scale < 1.001 &&
        viewport.height >= 240 &&
        window.innerHeight - viewport.height > 120
      if (!keyboardUp) {
        clear()
        return
      }
      const nextHeight = Math.round(viewport.height)
      const nextTop = Math.round(viewport.offsetTop)
      if (nextHeight === height && nextTop === top) return
      height = nextHeight
      top = nextTop
      el.style.setProperty('--auth-vh', `${nextHeight}px`)
      el.style.setProperty('--auth-vt', `${nextTop}px`)
    }
    sync()
    viewport.addEventListener('resize', sync)
    viewport.addEventListener('scroll', sync)
    return () => {
      viewport.removeEventListener('resize', sync)
      viewport.removeEventListener('scroll', sync)
    }
  }, [isOpen])

  // Hooks phải chạy trước early return — không đặt state/effect sau `if (!isOpen)`.
  // Chiều đóng: node ở lại 180ms (đúng bằng .in-out) để fade ra chạy xong mới bị gỡ.
  const { show, closing } = useExitFade(isOpen)
  if (!show) return null

  const startCooldown = () => setCooldown(RESEND_COOLDOWN_S)

  // Thành công qua toast; mọi Lỗi qua popup xác nhận (ErrorPopupViewport) — không render lỗi inline.
  const showError = (msg: string) => showErrorPopup({ message: msg })

  const reset = () => {
    setStep('form')
    setCode('')
    setNeedVerify(false)
    setBusy(false)
  }

  const handleError = (err: unknown) => {
    setBusy(false)
    showError(describeAuthError(err))
    if (isEmailNotConfirmedError(err)) setNeedVerify(true)
  }

  const handleGoogle = () => {
    setBusy(true)
    signInWithGoogle().catch(handleError)
  }

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault()
    setNeedVerify(false)
    if (!EMAIL_RE.test(email)) {
      showError(t('auth.emailInvalid'))
      return
    }
    setBusy(true)
    try {
      await signInWithPassword(email, password)
      // Thành công → session phát qua onAuthStateChange, effect trên đóng modal + toast.
      setBusy(false)
    } catch (err) {
      handleError(err)
    }
  }

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault()
    if (!EMAIL_RE.test(email)) {
      showError(t('auth.emailInvalid'))
      return
    }
    if (password.length < MIN_PASSWORD) {
      showError(t('auth.passwordTooShort'))
      return
    }
    if (password !== confirm) {
      showError(t('auth.passwordMismatch'))
      return
    }
    setBusy(true)
    try {
      const needsConfirmation = await signUp(email, password)
      if (needsConfirmation) {
        // Email chưa được xác minh — hiện màn "check inbox", user bấm link
        // trong email để hoàn tất (session về qua hash → effect phiên đóng modal).
        setStep('verify-email')
        startCooldown()
      }
      // Nếu không cần xác minh, session sẽ tới qua effect (đóng modal + toast).
      setBusy(false)
    } catch (err) {
      handleError(err)
    }
  }

  const handleSendLoginOtp = async () => {
    if (!EMAIL_RE.test(email)) {
      showError(t('auth.emailInvalid'))
      return
    }
    setBusy(true)
    try {
      await sendLoginOtp(email)
      setCode('')
      setStep('login-otp')
      startCooldown()
      setBusy(false)
    } catch (err) {
      handleError(err)
    }
  }

  const handleVerify = async (e: FormEvent) => {
    e.preventDefault()
    if (code.length !== 6) return
    setBusy(true)
    try {
      await verifyLoginOtp(email, code)
      // Effect phiên đóng modal + toast sau verify thành công.
      setBusy(false)
    } catch (err) {
      // Tài khoản CHƯA xác minh mà bấm "đăng nhập bằng mã" → Supabase có thể gửi
      // lại email xác minh signup (mã type 'signup'). Thử lại đúng type một lần
      // trước khi báo lỗi, tránh kẹt otp_expired giả.
      if (isOtpExpiredError(err)) {
        try {
          await verifySignupOtp(email, code)
          setBusy(false)
          return
        } catch {
          /* fallthrough — giữ lỗi gốc */
        }
      }
      handleError(err)
    }
  }

  const handleResend = async () => {
    if (cooldown > 0 || busy) return
    setBusy(true)
    try {
      if (step === 'verify-email') await resendSignupOtp(email)
      else if (step === 'login-otp') await sendLoginOtp(email)
      else if (step === 'forgot-sent') await requestPasswordReset(email)
      startCooldown()
      setBusy(false)
    } catch (err) {
      handleError(err)
    }
  }

  // Gửi lại email xác minh khi đăng nhập bị chặn vì email chưa confirm.
  const handleResendVerification = async () => {
    setBusy(true)
    try {
      await resendSignupOtp(email)
      setNeedVerify(false)
      setStep('verify-email')
      startCooldown()
      setBusy(false)
    } catch (err) {
      handleError(err)
    }
  }

  const handleForgotSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!EMAIL_RE.test(email)) {
      showError(t('auth.emailInvalid'))
      return
    }
    setBusy(true)
    try {
      await requestPasswordReset(email)
      // Không tiết lộ email có tồn tại hay không — Supabase gửi thư nếu có.
      setStep('forgot-sent')
      startCooldown()
      setBusy(false)
    } catch (err) {
      handleError(err)
    }
  }

  const goBackToForm = () => {
    setStep('form')
    setCode('')
  }

  const switchTab = (next: Tab) => {
    setTab(next)
    setNeedVerify(false)
  }

  // Tablist theo APG: mũi tên + Home/End đổi chế độ, focus đi theo nút được chọn.
  const handleTabListKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    const i = TABS.findIndex((item) => item.id === tab)
    let next = -1
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = (i + 1) % TABS.length
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = (i - 1 + TABS.length) % TABS.length
    else if (e.key === 'Home') next = 0
    else if (e.key === 'End') next = TABS.length - 1
    if (next < 0) return
    e.preventDefault()
    switchTab(TABS[next].id)
    tablistRef.current?.querySelectorAll('button')[next]?.focus()
  }

  const close = () => {
    reset()
    onClose()
  }

  const title =
    step === 'forgot' || step === 'forgot-sent'
      ? t('auth.forgotTitle')
      : tab === 'register' || step === 'verify-email'
        ? t('auth.registerTitle')
        : t('auth.loginTitle')
  const subtitle =
    step === 'forgot'
      ? t('auth.forgotDesc')
      : step === 'forgot-sent' || step === 'verify-email'
        ? t('auth.loginSubtitle')
        : tab === 'register'
          ? t('auth.registerSubtitle')
          : t('auth.loginSubtitle')

  // Tiêu đề đổi theo tab/step; phần mô tả là lời trấn an "không cần tài khoản vẫn dùng
  // được tiện ích" khi ở form, còn các bước sau thì mô tả đúng bước đó.
  const desc = step === 'form' ? t('auth.upsellDesc') : subtitle

  return (
    <div
      ref={backdropRef}
      className={`auth-backdrop fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm ${
        closing ? 'out-fade' : 'in-backdrop'
      }`}
      onClick={close}
    >
      {/* Từ 640px là split-screen: cột trái bán giá trị của tài khoản, cột phải là form.
          Mobile bỏ hẳn cột trái — một panel duy nhất, gọn, không phải cuộn hai lần.
          max-height không nằm ở class: nó kẹp theo --auth-vh (bàn phím on-screen), nên
          phải là CSS thật trong index.css — để utility Tailwind khai báo lại là mất kẹp. */}
      <div
        ref={panelRef}
        onClick={(e) => e.stopPropagation()}
        className={`auth-panel relative flex w-full max-w-md sm:max-w-3xl flex-col sm:flex-row overflow-hidden bg-surface border border-[rgba(255,59,48,0.35)] clip-corner-lg ${
          closing ? 'in-out' : 'in-up'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        {/* Icon trần, không nền không bóng: thêm khung là thêm một mảng nổi đè lên form. */}
        <button
          type="button"
          onClick={close}
          className="absolute top-3 right-3 z-10 p-2 text-slate-400 transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF4545]/60"
          aria-label={t('common.close')}
        >
          <X className="w-5 h-5" />
        </button>

        <aside className="hidden sm:flex sm:w-[38%] shrink-0 flex-col gap-4 p-6 bg-page/60 border-r border-edge">
          <div className="flex items-center gap-2">
            <img src="/oneforall.svg" alt="" className="w-7 h-7 shrink-0 object-contain" />
            <span className="font-bold text-base tracking-tight text-ink">
              One<span className="text-brand-gradient">ForAll</span>
            </span>
          </div>
          <div className="space-y-1.5">
            <h3 className="text-base font-bold text-ink tracking-tight leading-snug">{title}</h3>
            <p className="text-[11px] leading-relaxed text-slate-400">{desc}</p>
          </div>
          {step === 'form' && (
            <div className="mt-auto pt-2">
              <p className="mb-1.5 text-[10px] font-mono uppercase tracking-[0.14em] text-slate-500">
                {t('auth.benefitsTitle')}
              </p>
              <ul className="space-y-1.5">
                {BENEFIT_KEYS.map((key) => (
                  <li key={key} className="flex items-start gap-2 text-[11px] leading-snug text-slate-300">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5 text-emerald-500" />
                    <span className="min-w-0">{t(key)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>

        {/* Đỉnh chừa sẵn 44px cho nút đóng: cột phải không có header ở desktop, bám sát
            mép thì hàng đầu của form nằm ngay dưới nút X. */}
        <div className="flex-1 min-w-0 min-h-0 overflow-y-auto scrollbar-none p-5 sm:px-6 sm:pb-6 sm:pt-11">
          <div className="sm:hidden mb-4 text-center">
            <div className="mx-auto w-8 h-8">
              <img src="/oneforall.svg" alt="One ForAll Logo" className="w-full h-full object-contain" />
            </div>
            <h3 className="mt-2 text-base font-bold text-ink tracking-tight">{title}</h3>
            <p className="mt-1 text-xs text-slate-400">{desc}</p>
          </div>

          {!isSupabaseConfigured ? (
            <div className="p-4 bg-brand/10 border border-brand/30 text-brand-2 text-sm clip-corner-card">
              {t('auth.notConfigured')}
            </div>
          ) : step === 'form' ? (
            <div className="space-y-3">
              {/* Một thanh hai lựa chọn 50/50 cao 48px: bấm hoặc phím mũi tên là đổi form
                  ngay trong modal, không modal mới, không điều hướng, không reload. Nút con
                  không cắt góc — clip-path của thanh cha cắt luôn góc của chúng, lồng thêm
                  một lớp nữa chỉ tạo viền răng cưa. */}
              <div
                ref={tablistRef}
                role="tablist"
                aria-label={t('auth.chooseMode')}
                onKeyDown={handleTabListKeyDown}
                className="grid h-12 grid-cols-2 gap-1 border border-edge bg-page p-1 clip-corner-btn"
              >
                {TABS.map((item) => (
                  <button
                    key={item.id}
                    id={`auth-tab-${item.id}`}
                    type="button"
                    role="tab"
                    aria-selected={tab === item.id}
                    aria-controls={tab === item.id ? `auth-panel-${item.id}` : undefined}
                    tabIndex={tab === item.id ? 0 : -1}
                    onClick={() => switchTab(item.id)}
                    className={`flex h-full items-center justify-center text-sm transition-colors duration-200 focus-visible:outline-none focus-visible:shadow-[inset_0_0_0_2px_#ff3b30] ${
                      tab === item.id
                        ? 'bg-tint font-bold text-brand-active'
                        : 'font-medium text-soft hover:bg-elev/60 hover:text-ink'
                    }`}
                  >
                    {t(item.labelKey)}
                  </button>
                ))}
              </div>

              {/* Google + phân cách dùng cho cả hai tab và nằm ngoài form: vùng đổi chỉ còn
                  các trường, nên chuyển tab không làm panel nhảy chiều cao. */}
              <Button
                type="button"
                variant="secondary"
                fullWidth
                size="md"
                className="h-11"
                onClick={handleGoogle}
                disabled={busy}
                leftIcon={<GoogleIcon />}
              >
                {t('auth.google')}
              </Button>

              <div className="flex items-center gap-3 text-xs text-slate-500">
                <span className="h-px flex-1 bg-edge" />
                {t('auth.or')}
                <span className="h-px flex-1 bg-edge" />
              </div>

              {/* Khung cao tối thiểu bằng đúng khối đăng ký (3 trường + nút): đổi tab chỉ
                  đổi nội dung bên trong, panel không co ra → modal đứng nguyên vị trí. */}
              <div className="flex min-h-[17.5rem] flex-col justify-center">
                {tab === 'login' && (
                  <form
                    onSubmit={handleLogin}
                    role="tabpanel"
                    id="auth-panel-login"
                    aria-labelledby="auth-tab-login"
                    className="auth-swap space-y-3"
                  >
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1.5" htmlFor="auth-email">
                        Email
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-10" />
                        <input
                          id="auth-email"
                          type="email"
                          required
                          autoComplete="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="name@example.com"
                          className={inputClass}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs font-medium text-slate-300" htmlFor="auth-password">
                          {t('auth.password')}
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setStep('forgot')
                          }}
                          className="text-xs text-brand-2 hover:text-brand font-medium hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF4545]/60"
                        >
                          {t('auth.forgotPassword')}
                        </button>
                      </div>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-10" />
                        <input
                          id="auth-password"
                          type={showPassword ? 'text' : 'password'}
                          required
                          autoComplete="current-password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className={`${inputClass} pr-11`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((v) => !v)}
                          aria-label={showPassword ? t('auth.hidePassword') : t('auth.showPassword')}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF4545]/60"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {needVerify && (
                      <div className="p-3 bg-brand-2/10 border border-brand-2/30 text-brand-3 text-xs clip-corner-card space-y-2">
                        <p>{t('auth.emailNotConfirmedHint')}</p>
                        <button
                          type="button"
                          onClick={handleResendVerification}
                          disabled={busy}
                          className="inline-flex items-center gap-1.5 text-brand-2 hover:text-brand font-medium hover:underline disabled:opacity-50"
                        >
                          {busy && <Loader2 className="w-3 h-3 animate-spin" />}
                          {t('auth.resendVerification')}
                        </button>
                      </div>
                    )}

                    <Button
                      type="submit"
                      variant="glow"
                      fullWidth
                      size="md"
                      className="h-12"
                      isLoading={busy}
                      rightIcon={busy ? undefined : <ArrowRight className="w-4 h-4" />}
                    >
                      {t('auth.login')}
                    </Button>

                    {/* OTP qua email là phương thức thật, nhưng để dạng liên kết chữ để
                        nó không cạnh tranh với nút đăng nhập. */}
                    <button
                      type="button"
                      onClick={handleSendLoginOtp}
                      disabled={busy}
                      className="w-full text-center text-xs text-slate-400 hover:text-brand-2 font-medium hover:underline disabled:opacity-50"
                    >
                      {t('auth.loginWithCode')}
                    </button>
                  </form>
                )}

                {tab === 'register' && (
                  <form
                    onSubmit={handleRegister}
                    role="tabpanel"
                    id="auth-panel-register"
                    aria-labelledby="auth-tab-register"
                    className="auth-swap space-y-3"
                  >
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1.5" htmlFor="reg-email">
                        Email
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-10" />
                        <input
                          id="reg-email"
                          type="email"
                          required
                          autoComplete="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="name@example.com"
                          className={inputClass}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1.5" htmlFor="reg-password">
                        {t('auth.password')}
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-10" />
                        <input
                          id="reg-password"
                          type={showPassword ? 'text' : 'password'}
                          required
                          minLength={MIN_PASSWORD}
                          autoComplete="new-password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className={`${inputClass} pr-11`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((v) => !v)}
                          aria-label={showPassword ? t('auth.hidePassword') : t('auth.showPassword')}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF4545]/60"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1.5" htmlFor="reg-confirm">
                        {t('auth.confirmPassword')}
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-10" />
                        <input
                          id="reg-confirm"
                          type={showPassword ? 'text' : 'password'}
                          required
                          minLength={MIN_PASSWORD}
                          autoComplete="new-password"
                          value={confirm}
                          onChange={(e) => setConfirm(e.target.value)}
                          placeholder="••••••••"
                          className={inputClass}
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      variant="glow"
                      fullWidth
                      size="md"
                      className="h-12"
                      isLoading={busy}
                      rightIcon={busy ? undefined : <ArrowRight className="w-4 h-4" />}
                    >
                      {t('auth.createAccount')}
                    </Button>
                  </form>
                )}
              </div>
            </div>
          ) : step === 'forgot' ? (
            <form onSubmit={handleForgotSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5" htmlFor="forgot-email">
                  Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-10" />
                  <input
                    id="forgot-email"
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className={inputClass}
                  />
                </div>
              </div>
              <Button
                type="submit"
                variant="glow"
                fullWidth
                size="md"
                className="h-12"
                isLoading={busy}
                rightIcon={busy ? undefined : <ArrowRight className="w-4 h-4" />}
              >
                {t('auth.sendResetLink')}
              </Button>
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={goBackToForm}
                  className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-ink font-medium hover:underline"
                >
                  <ArrowLeft className="w-3 h-3" />
                  {t('auth.backToLogin')}
                </button>
              </div>
            </form>
          ) : step === 'forgot-sent' ? (
            <div className="space-y-4">
              <div className="p-3 bg-emerald-500/10 border border-emerald-600/30 text-emerald-300 flex items-start gap-2.5 text-xs clip-corner-card">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{t('auth.resetLinkSent', { email })}</span>
              </div>
              <div className="flex items-center justify-center gap-4 text-xs text-slate-400">
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={cooldown > 0 || busy}
                  className="inline-flex items-center gap-1.5 text-brand-2 hover:text-brand font-medium hover:underline disabled:opacity-50 disabled:no-underline"
                >
                  {busy && <Loader2 className="w-3 h-3 animate-spin" />}
                  {cooldown > 0 ? t('auth.resendIn', { seconds: cooldown }) : t('auth.resend')}
                </button>
                <span aria-hidden="true">•</span>
                <button
                  type="button"
                  onClick={goBackToForm}
                  className="text-slate-400 hover:text-ink font-medium hover:underline"
                >
                  {t('auth.backToLogin')}
                </button>
              </div>
            </div>
          ) : step === 'verify-email' ? (
            <div className="space-y-4">
              <div className="p-3 bg-emerald-500/10 border border-emerald-600/30 text-emerald-300 flex items-start gap-2.5 text-xs clip-corner-card">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{t('auth.verifyEmailSent', { email })}</span>
              </div>

              <div className="flex items-center justify-center gap-4 text-xs text-slate-400 pt-1">
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={cooldown > 0 || busy}
                  className="inline-flex items-center gap-1.5 text-brand-2 hover:text-brand font-medium hover:underline disabled:opacity-50 disabled:no-underline"
                >
                  {busy && <Loader2 className="w-3 h-3 animate-spin" />}
                  {cooldown > 0 ? t('auth.resendIn', { seconds: cooldown }) : t('auth.resendEmail')}
                </button>
                <span aria-hidden="true">•</span>
                <button
                  type="button"
                  onClick={goBackToForm}
                  className="text-slate-400 hover:text-ink font-medium hover:underline"
                >
                  {t('auth.changeEmail')}
                </button>
              </div>
            </div>
          ) : step === 'login-otp' ? (
            <form onSubmit={handleVerify} className="space-y-3">
              <div className="p-3 bg-emerald-500/10 border border-emerald-600/30 text-emerald-300 flex items-start gap-2.5 text-xs clip-corner-card">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span id="otp-desc">{t('auth.codeSentDesc', { email })}</span>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5 text-center">
                  {t('auth.codeLabel')}
                </label>
                <OtpInput value={code} onChange={setCode} disabled={busy} describedBy="otp-desc" />
              </div>

              <Button
                type="submit"
                variant="glow"
                fullWidth
                size="md"
                className="h-12"
                isLoading={busy}
                disabled={code.length !== 6}
                rightIcon={busy ? undefined : <ArrowRight className="w-4 h-4" />}
              >
                {t('auth.verify')}
              </Button>

              <div className="flex items-center justify-center gap-4 text-xs text-slate-400 pt-1">
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={cooldown > 0 || busy}
                  className="inline-flex items-center gap-1.5 text-brand-2 hover:text-brand font-medium hover:underline disabled:opacity-50 disabled:no-underline"
                >
                  {busy && <Loader2 className="w-3 h-3 animate-spin" />}
                  {cooldown > 0 ? t('auth.resendIn', { seconds: cooldown }) : t('auth.resend')}
                </button>
                <span aria-hidden="true">•</span>
                <button
                  type="button"
                  onClick={goBackToForm}
                  className="text-slate-400 hover:text-ink font-medium hover:underline"
                >
                  {t('auth.changeEmail')}
                </button>
              </div>
            </form>
          ) : null}

          {/* Bước form chỉ còn một lối ra: tiếp tục ẩn danh. Đổi chế độ đã có thanh tab
              ở đầu form lo, nên không lặp lại liên kết "Đăng ký / Đăng nhập" ở đáy. */}
          {step === 'form' && (
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={close}
                className="text-xs font-medium text-slate-400 underline-offset-2 hover:text-ink hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF4545]/60"
              >
                {t('auth.continueGuest')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
