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
  sendLoginOtp,
  verifyLoginOtp,
  requestPasswordReset,
  useAuth,
} from '../../services/authStore'
import { describeAuthError, isAccountNotFoundError } from '../../utils/authError'
import { getAccountStatus } from '../../services/api/accountStatusApi'
import { useExitFade } from '../../hooks/useExitFade'
import { useDialogFocus } from '../../hooks/useDialogFocus'

export interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  initialMode?: 'login' | 'register' | 'forgot'
}

type Step = 'form' | 'login-otp' | 'verify-email' | 'verify-required' | 'forgot' | 'forgot-sent'
type Tab = 'login' | 'register'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MIN_PASSWORD = 8
const RESEND_COOLDOWN_S = 60







const BENEFIT_KEYS = ['auth.benefit1', 'auth.benefit2', 'auth.benefit3', 'auth.benefit4'] as const

const TABS = [
  { id: 'login', labelKey: 'auth.tabLogin' },
  { id: 'register', labelKey: 'auth.tabRegister' },
] as const


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
  const [accountMissing, setAccountMissing] = useState(false)

  const [codeTypeUncertain, setCodeTypeUncertain] = useState(false)
  const [cooldown, setCooldown] = useState(0)



  const prevSessionRef = useRef(session)
  useEffect(() => {
    const was = prevSessionRef.current
    prevSessionRef.current = session
    if (isOpen && session && !was) {
      showToast({ type: 'success', message: t('auth.loginSuccess') })
      onClose()
    }
  }, [session, isOpen, onClose])


  const cooldownActive = cooldown > 0
  useEffect(() => {
    if (!cooldownActive) return
    const id = setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000)
    return () => clearInterval(id)
  }, [cooldownActive])




  const panelRef = useRef<HTMLDivElement>(null)
  const tablistRef = useRef<HTMLDivElement>(null)


  useDialogFocus({ panelRef, open: isOpen, onEscape: onClose })


















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

  const { show, closing } = useExitFade(isOpen)
  if (!show) return null

  const startCooldown = () => setCooldown(RESEND_COOLDOWN_S)

  const showError = (msg: string) => showErrorPopup({ message: msg })

  const handleError = (err: unknown) => {
    setBusy(false)
    showError(describeAuthError(err))
  }

  const handleEmailChange = (value: string) => {
    setEmail(value)
    setAccountMissing(false)
  }

  const handleGoogle = () => {
    setBusy(true)
    signInWithGoogle().catch(handleError)
  }

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault()
    if (!EMAIL_RE.test(email)) {
      showError(t('auth.emailInvalid'))
      return
    }
    setBusy(true)
    try {
      await signInWithPassword(email, password)
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
        setStep('verify-email')
        startCooldown()
      }
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
    const status = await getAccountStatus(email)
    if (status && !status.exists) {
      setAccountMissing(true)
      setBusy(false)
      showError(t('auth.accountNotFound'))
      return
    }
    if (status && !status.confirmed) {
      setStep('verify-required')
      setBusy(false)
      return
    }
    setCodeTypeUncertain(status === null)
    try {
      await sendLoginOtp(email)
      setCode('')
      setAccountMissing(false)
      setStep('login-otp')
      startCooldown()
      setBusy(false)
    } catch (err) {
      setAccountMissing(isAccountNotFoundError(err))
      handleError(err)
    }
  }

  const handleVerify = async (e: FormEvent) => {
    e.preventDefault()
    if (code.length !== 6) return
    setBusy(true)
    try {
      await verifyLoginOtp(email, code)
      setBusy(false)
    } catch (err) {
      handleError(err)
    }
  }

  const handleFinishSignup = async () => {
    setBusy(true)
    try {
      await resendSignupOtp(email)
      setCode('')
      setStep('verify-email')
      startCooldown()
      setBusy(false)
    } catch (err) {
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

  const handleForgotSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!EMAIL_RE.test(email)) {
      showError(t('auth.emailInvalid'))
      return
    }
    setBusy(true)
    try {
      await requestPasswordReset(email)
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
    setAccountMissing(false)
  }

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

  const desc = step === 'form' ? t('auth.upsellDesc') : subtitle

  return (
    <div
      ref={backdropRef}
      className={`auth-backdrop fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm ${
        closing ? 'out-fade' : 'in-backdrop'
      }`}
      onClick={onClose}
    >




      <div
        ref={panelRef}
        onClick={(e) => e.stopPropagation()}
        className={`auth-panel relative flex w-full max-w-md sm:max-w-3xl flex-col sm:flex-row overflow-hidden bg-surface border border-[rgba(255,59,48,0.35)] clip-corner-lg ${
          closing ? 'in-out' : 'in-up'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
      >

        <button
          type="button"
          onClick={onClose}
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



        <div data-lenis-prevent className="flex-1 min-w-0 min-h-0 overflow-y-auto scrollbar-none p-5 sm:px-6 sm:pb-6 sm:pt-11">
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






              <div
                role="tabpanel"
                id={`auth-panel-${tab}`}
                aria-labelledby={`auth-tab-${tab}`}
                className="flex min-h-[17.5rem] flex-col justify-center"
              >
                {tab === 'login' && (
                  <form onSubmit={handleLogin} className="auth-swap space-y-3">
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
                          onChange={(e) => handleEmailChange(e.target.value)}
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
                          className="-my-1 inline-flex min-h-6 items-center text-xs text-brand-2 hover:text-brand font-medium hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF4545]/60"
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
                          className="absolute right-0 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center text-slate-400 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#FF4545]/60"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
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
                      {t('auth.login')}
                    </Button>







                    <button
                      type="button"
                      onClick={handleSendLoginOtp}
                      disabled={busy}
                      className="inline-flex w-full min-h-6 items-center justify-center text-xs text-slate-400 hover:text-brand-2 font-medium hover:underline disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF4545]/60"
                    >
                      {t('auth.loginWithCode')}
                    </button>



                    {accountMissing && (
                      <button
                        type="button"
                        onClick={() => switchTab('register')}
                        className="inline-flex w-full min-h-6 items-center justify-center text-xs text-brand-2 hover:text-brand font-medium hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF4545]/60"
                      >
                        {t('auth.registerInstead')}
                      </button>
                    )}
                  </form>
                )}

                {tab === 'register' && (
                  <form onSubmit={handleRegister} className="auth-swap space-y-3">
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
                          className="absolute right-0 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center text-slate-400 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#FF4545]/60"
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
                  className="-my-1 inline-flex min-h-6 items-center gap-1.5 text-xs text-slate-400 hover:text-ink font-medium hover:underline"
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
                  className="-my-1 inline-flex min-h-6 items-center gap-1.5 text-brand-2 hover:text-brand font-medium hover:underline disabled:opacity-50 disabled:no-underline"
                >
                  {busy && <Loader2 className="w-3 h-3 animate-spin" />}
                  {cooldown > 0 ? t('auth.resendIn', { seconds: cooldown }) : t('auth.resend')}
                </button>
                <span aria-hidden="true">•</span>
                <button
                  type="button"
                  onClick={goBackToForm}
                  className="-my-1 inline-flex min-h-6 items-center text-slate-400 hover:text-ink font-medium hover:underline"
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
                  className="-my-1 inline-flex min-h-6 items-center gap-1.5 text-brand-2 hover:text-brand font-medium hover:underline disabled:opacity-50 disabled:no-underline"
                >
                  {busy && <Loader2 className="w-3 h-3 animate-spin" />}
                  {cooldown > 0 ? t('auth.resendIn', { seconds: cooldown }) : t('auth.resendEmail')}
                </button>
                <span aria-hidden="true">•</span>
                <button
                  type="button"
                  onClick={goBackToForm}
                  className="-my-1 inline-flex min-h-6 items-center text-slate-400 hover:text-ink font-medium hover:underline"
                >
                  {t('auth.changeEmail')}
                </button>
              </div>
            </div>
          ) : step === 'verify-required' ? (
            <div className="space-y-4">


              <div className="p-3 bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-start gap-2.5 text-xs clip-corner-card">
                <Mail className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>{t('auth.verifyRequiredDesc', { email })}</span>
              </div>

              <div className="flex items-center justify-center gap-4 text-xs text-slate-400 pt-1">
                <button
                  type="button"
                  onClick={handleFinishSignup}
                  disabled={cooldown > 0 || busy}
                  className="-my-1 inline-flex min-h-6 items-center gap-1.5 text-brand-2 hover:text-brand font-medium hover:underline disabled:opacity-50 disabled:no-underline"
                >
                  {busy && <Loader2 className="w-3 h-3 animate-spin" />}
                  {cooldown > 0 ? t('auth.resendIn', { seconds: cooldown }) : t('auth.resendEmail')}
                </button>
                <span aria-hidden="true">•</span>
                <button
                  type="button"
                  onClick={goBackToForm}
                  className="-my-1 inline-flex min-h-6 items-center text-slate-400 hover:text-ink font-medium hover:underline"
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


                <span
                  id="otp-group-label"
                  className="mb-1.5 block text-center text-xs font-medium text-slate-300"
                >
                  {t('auth.codeLabel')}
                </span>
                <OtpInput value={code} onChange={setCode} disabled={busy} describedBy="otp-desc" groupLabelledBy="otp-group-label" />
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
                  className="-my-1 inline-flex min-h-6 items-center gap-1.5 text-brand-2 hover:text-brand font-medium hover:underline disabled:opacity-50 disabled:no-underline"
                >
                  {busy && <Loader2 className="w-3 h-3 animate-spin" />}
                  {cooldown > 0 ? t('auth.resendIn', { seconds: cooldown }) : t('auth.resend')}
                </button>
                <span aria-hidden="true">•</span>
                <button
                  type="button"
                  onClick={goBackToForm}
                  className="-my-1 inline-flex min-h-6 items-center text-slate-400 hover:text-ink font-medium hover:underline"
                >
                  {t('auth.changeEmail')}
                </button>
              </div>




              {codeTypeUncertain && (
                <p className="pt-1 text-center text-xs leading-relaxed text-slate-500">
                  {t('auth.noCodeHint')}{' '}
                  <button
                    type="button"
                    onClick={handleFinishSignup}
                    disabled={busy}
                    className="text-brand-2 hover:text-brand font-medium hover:underline disabled:opacity-50"
                  >
                    {t('auth.resendEmail')}
                  </button>
                </p>
              )}
            </form>
          ) : null}



          {step === 'form' && (
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={onClose}
                className="inline-flex min-h-6 items-center text-xs font-medium text-slate-400 underline-offset-2 hover:text-ink hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF4545]/60"
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
