import { useState, useEffect, type FormEvent } from 'react'
import { useOutletContext, useNavigate } from 'react-router-dom'
import { KeyRound, Mail, CheckCircle2, Loader2 } from 'lucide-react'
import { Button } from '../components/common/Button'
import { SEOHead } from '../components/common/SEOHead'
import { t, withLocale } from '../i18n/langStore'
import { showToast } from '../components/feedback/toastStore'
import { showErrorPopup } from '../components/feedback/errorPopupStore'
import { isSupabaseConfigured } from '../services/supabase'
import {
  useAuth,
  updatePassword,
  requestPasswordReset,
  initialAuthUrlError,
} from '../services/authStore'
import { describeAuthError } from '../utils/authError'

interface LayoutContext {
  openAuth: (mode: 'login' | 'register' | 'forgot') => void
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MIN_PASSWORD = 8

const inputClass =
  'w-full pl-10 pr-4 py-2.5 bg-page border border-brand/30 focus:border-brand focus:ring-1 focus:ring-[#ff3b30] text-sm text-slate-100 placeholder-slate-500 outline-none transition-all clip-corner-btn'

function RequestLinkForm() {
  const [email, setEmail] = useState('')
  const [busy, setBusy] = useState(false)
  const [sent, setSent] = useState(false)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (!EMAIL_RE.test(email)) {
      showErrorPopup({ message: t('auth.emailInvalid') })
      return
    }
    setBusy(true)
    try {
      await requestPasswordReset(email)
      setSent(true)
    } catch (err) {
      showErrorPopup({ message: describeAuthError(err) })
    }
    setBusy(false)
  }

  if (sent) {
    return (
      <div className="p-4 bg-emerald-500/10 border border-emerald-600/30 text-emerald-300 flex items-start gap-2.5 text-sm clip-corner-card">
        <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
        <span>{t('auth.resetLinkSent', { email })}</span>
      </div>
    )
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-slate-300 mb-1.5" htmlFor="reset-email">
          Email
        </label>
        <div className="relative">
          <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-10" />
          <input
            id="reset-email"
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
      <Button type="submit" variant="glow" fullWidth size="md" isLoading={busy}>
        {t('auth.sendResetLink')}
      </Button>
    </form>
  )
}

export function ResetPasswordPage() {
  const context = useOutletContext<LayoutContext | null>()
  const navigate = useNavigate()
  const { session, ready, recovery: recoveryActive } = useAuth()
  // Nguồn sự thật = sự kiện PASSWORD_RECOVERY (flag trong authStore), không phải
  // recovery_sent — supabase-js không set flag này trên session recovery.
  const recovery = recoveryActive && session != null

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)

  // GoTrue có thể để lại hash lỗi nếu chưa kịp xử lý → xoá khỏi URL (không lặp lại
  // lỗi khi reload/chia sẻ link) nhưng vẫn giữ thông điệp hiển thị một lần.
  useEffect(() => {
    if (window.location.hash.includes('error')) {
      window.history.replaceState(null, '', window.location.pathname + window.location.search)
    }
  }, [])

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (!recovery) return
    if (password.length < MIN_PASSWORD) {
      showErrorPopup({ message: t('auth.passwordTooShort') })
      return
    }
    if (password !== confirm) {
      showErrorPopup({ message: t('auth.passwordMismatch') })
      return
    }
    setBusy(true)
    try {
      await updatePassword(password)
      setDone(true)
      showToast({ type: 'success', message: t('auth.resetSuccess') })
    } catch (err) {
      showErrorPopup({ message: describeAuthError(err) })
    }
    setBusy(false)
  }

  if (!ready) {
    return <div className="py-16 text-center text-soft">{t('profile.loading')}</div>
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <SEOHead
        title={t('auth.resetPassword')}
        description={t('auth.forgotDesc')}
        canonicalUrl="https://oneforall.app/auth/reset-password"
        noindex
      />
      <div className="bg-surface border border-[rgba(255,59,48,0.35)] clip-corner-lg p-6 sm:p-8 space-y-5">
        <div className="text-center">
          <div className="inline-flex w-12 h-12 items-center justify-center bg-brand/10 border border-brand/30 clip-corner-btn mb-3">
            <KeyRound className="w-6 h-6 text-brand-2" />
          </div>
          <h1 className="text-xl font-bold text-ink">{t('auth.resetPassword')}</h1>
          <p className="mt-1 text-sm text-slate-400">{t('auth.resetPasswordDesc')}</p>
        </div>

        {!isSupabaseConfigured ? (
          <div className="p-4 bg-brand/10 border border-brand/30 text-brand-2 text-sm clip-corner-card">
            {t('auth.notConfigured')}
          </div>
        ) : done ? (
          <div className="space-y-4">
            <div className="p-4 bg-emerald-500/10 border border-emerald-600/30 text-emerald-300 flex items-start gap-2.5 text-sm clip-corner-card">
              <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{t('auth.resetSuccess')}</span>
            </div>
            <Button
              variant="glow"
              fullWidth
              size="md"
              onClick={() => navigate(withLocale('/'))}
            >
              {t('common.home')}
            </Button>
          </div>
        ) : recovery ? (
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5" htmlFor="new-password">
                {t('auth.newPassword')}
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-10" />
                <input
                  id="new-password"
                  type="password"
                  required
                  minLength={MIN_PASSWORD}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={inputClass}
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5" htmlFor="confirm-password">
                {t('auth.confirmPassword')}
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-10" />
                <input
                  id="confirm-password"
                  type="password"
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
            <Button type="submit" variant="glow" fullWidth size="md" isLoading={busy}>
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : t('auth.updatePassword')}
            </Button>
          </form>
        ) : (
          // Không cho đổi mật khẩu khi chưa có phiên recovery hợp lệ —
          // liên kết hết hạn/hỏng → yêu cầu liên kết mới.
          <div className="space-y-5">
            <div className="p-3 bg-brand-2/10 border border-brand-2/30 text-brand-3 text-xs clip-corner-card">
              {initialAuthUrlError?.code === 'otp_expired'
                ? t('auth.linkExpired')
                : t('auth.noRecoverySession')}
            </div>
            <RequestLinkForm />
            <p className="text-center text-xs text-slate-400">
              {t('auth.hasAccount')}{' '}
              <button
                type="button"
                onClick={() => context?.openAuth('login')}
                className="text-brand-2 hover:text-brand font-medium hover:underline"
              >
                {t('auth.loginNow')}
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
