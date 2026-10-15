import { useEffect, useRef, useState, type FormEvent } from 'react'
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

const inputClass =
  'w-full pl-10 pr-4 py-2.5 bg-page border border-brand/30 focus:border-brand focus:ring-1 focus:ring-[#ff3b30] text-sm text-slate-100 placeholder-slate-500 outline-none transition-all clip-corner-btn'

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

  // Hooks phải chạy trước early return — không đặt state/effect sau `if (!isOpen)`.
  if (!isOpen) return null

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm in-backdrop">
      <div
        className="relative w-full max-w-md p-6 sm:p-8 bg-surface border border-[rgba(255,59,48,0.35)] clip-corner-lg card-3d in-up"
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <button
          type="button"
          onClick={close}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-ink hover:bg-elev transition-colors clip-corner-btn"
          aria-label={t('common.close')}
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center">
            <div className="w-10 h-10">
              <img src="/oneforall.svg" alt="One ForAll Logo" className="w-full h-full object-contain" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-ink tracking-tight">{title}</h3>
          <p className="mt-1 text-sm text-slate-400">{subtitle}</p>
        </div>

        {!isSupabaseConfigured ? (
          <div className="p-4 bg-brand/10 border border-brand/30 text-brand-2 text-sm clip-corner-card">
            {t('auth.notConfigured')}
          </div>
        ) : step === 'form' ? (
          <div className="space-y-5">
            {/* Tabs đăng nhập / đăng ký */}
            <div className="grid grid-cols-2 gap-1 p-1 bg-page border border-edge clip-corner-btn" role="tablist" aria-label={t('auth.loginTitle')}>
              {(['login', 'register'] as const).map((name) => (
                <button
                  key={name}
                  type="button"
                  role="tab"
                  aria-selected={tab === name}
                  onClick={() => {
                    setTab(name)
                    setNeedVerify(false)
                  }}
                  className={`py-2 text-sm font-medium clip-corner-btn transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF4545]/60 ${
                    tab === name
                      ? 'bg-tint text-brand-active font-semibold'
                      : 'text-soft hover:text-ink'
                  }`}
                >
                  {name === 'login' ? t('auth.tabLogin') : t('auth.tabRegister')}
                </button>
              ))}
            </div>

            {tab === 'login' && (
              <>
                <Button
                  type="button"
                  variant="secondary"
                  fullWidth
                  size="md"
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

                <form onSubmit={handleLogin} className="space-y-4">
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
                    isLoading={busy}
                    rightIcon={busy ? undefined : <ArrowRight className="w-4 h-4" />}
                  >
                    {t('auth.login')}
                  </Button>

                  <button
                    type="button"
                    onClick={handleSendLoginOtp}
                    disabled={busy}
                    className="w-full text-center text-xs text-slate-400 hover:text-brand-2 font-medium hover:underline disabled:opacity-50"
                  >
                    {t('auth.loginWithCode')}
                  </button>
                </form>
              </>
            )}

            {tab === 'register' && (
              <form onSubmit={handleRegister} className="space-y-4">
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
                  isLoading={busy}
                  rightIcon={busy ? undefined : <ArrowRight className="w-4 h-4" />}
                >
                  {t('auth.finishRegister')}
                </Button>
              </form>
            )}
          </div>
        ) : step === 'forgot' ? (
          <form onSubmit={handleForgotSubmit} className="space-y-4">
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
          <form onSubmit={handleVerify} className="space-y-4">
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

        {/* Footer chuyển đổi login/register ở bước form */}
        {step === 'form' && (
          <p className="mt-5 text-center text-xs text-slate-400">
            {tab === 'login' ? t('auth.noAccount') : t('auth.hasAccount')}{' '}
            <button
              type="button"
              onClick={() => {
                setTab(tab === 'login' ? 'register' : 'login')
                setNeedVerify(false)
              }}
              className="text-brand-2 hover:text-brand font-medium hover:underline"
            >
              {tab === 'login' ? t('auth.registerNow') : t('auth.loginNow')}
            </button>
          </p>
        )}
      </div>
    </div>
  )
}
