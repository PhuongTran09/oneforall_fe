import { useState, type FormEvent } from 'react'
import { X, Mail, ArrowRight, CheckCircle2, Loader2 } from 'lucide-react'
import { Button } from '../common/Button'
import { t } from '../../i18n/langStore'
import { showToast } from './toastStore'
import { isSupabaseConfigured } from '../../services/supabase'
import { signInWithGoogle, sendOtp, verifyOtp } from '../../services/authStore'

export interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  initialMode?: 'login' | 'register'
}

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

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [step, setStep] = useState<'email' | 'code'>('email')
  const [busy, setBusy] = useState(false)

  if (!isOpen) return null

  const reset = () => {
    setStep('email')
    setCode('')
    setBusy(false)
  }

  const handleError = (err: unknown) => {
    setBusy(false)
    showToast({
      type: 'error',
      message: err instanceof Error ? err.message : t('auth.invalidCode'),
    })
  }

  const handleGoogle = () => {
    setBusy(true)
    signInWithGoogle().catch(handleError)
  }

  const handleSendOtp = async (e: FormEvent) => {
    e.preventDefault()
    setBusy(true)
    try {
      await sendOtp(email)
      setStep('code')
      setBusy(false)
    } catch (err) {
      handleError(err)
    }
  }

  const handleVerify = async (e: FormEvent) => {
    e.preventDefault()
    setBusy(true)
    try {
      await verifyOtp(email, code.trim())
      showToast({ type: 'success', message: t('auth.loginSuccess') })
      setBusy(false)
      reset()
      onClose()
    } catch (err) {
      handleError(err)
    }
  }

  const handleResend = () => {
    sendOtp(email).catch(handleError)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-md p-6 sm:p-8 bg-surface border border-[rgba(255,59,48,0.35)] clip-corner-lg card-3d"
        role="dialog"
        aria-modal="true"
      >
        <button
          type="button"
          onClick={() => {
            reset()
            onClose()
          }}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-ink hover:bg-elev transition-colors clip-corner-btn"
          aria-label={t('common.close')}
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center">
            <div className="w-10 h-10">
              <img src="/oneforall.svg" alt="OneForAll Logo" className="w-full h-full object-contain" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-ink tracking-tight">
            {t('auth.loginTitle')}
          </h3>
          <p className="mt-1 text-sm text-slate-400">
            {t('auth.loginSubtitle')}
          </p>
        </div>

        {!isSupabaseConfigured ? (
          <div className="p-4 bg-[#ff3b30]/10 border border-[#ff3b30]/30 text-[#FF6B4A] text-sm clip-corner-card">
            {t('auth.notConfigured')}
          </div>
        ) : step === 'email' ? (
          <div className="space-y-5">
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

            <form onSubmit={handleSendOtp} className="space-y-4">
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
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-page border border-[#ff3b30]/30 focus:border-[#ff3b30] focus:ring-1 focus:ring-[#ff3b30] text-sm text-slate-100 placeholder-slate-500 outline-none transition-all clip-corner-btn"
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="glow"
                fullWidth
                size="md"
                isLoading={busy}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                {t('auth.sendCode')}
              </Button>
            </form>
          </div>
        ) : (
          <form onSubmit={handleVerify} className="space-y-4">
            <div className="p-3 bg-emerald-500/10 border border-emerald-600/30 text-emerald-300 flex items-start gap-2.5 text-xs clip-corner-card">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{t('auth.codeSentDesc', { email })}</span>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5" htmlFor="auth-code">
                {t('auth.codeLabel')}
              </label>
              <input
                id="auth-code"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                required
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                placeholder="123456"
                className="w-full px-4 py-2.5 bg-page border border-[#ff3b30]/30 focus:border-[#ff3b30] focus:ring-1 focus:ring-[#ff3b30] text-sm text-slate-100 placeholder-slate-500 outline-none transition-all clip-corner-btn tracking-[0.4em] text-center font-mono"
              />
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
                className="inline-flex items-center gap-1.5 text-[#FF6B4A] hover:text-[#FF3B30] font-medium hover:underline"
              >
                {busy && <Loader2 className="w-3 h-3 animate-spin" />}
                {t('auth.resend')}
              </button>
              <span aria-hidden="true">•</span>
              <button
                type="button"
                onClick={() => setStep('email')}
                className="text-slate-400 hover:text-ink font-medium hover:underline"
              >
                {t('auth.changeEmail')}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
