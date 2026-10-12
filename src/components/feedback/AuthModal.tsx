import { useState, type FormEvent } from 'react'
import { X, Lock, Mail, ArrowRight, CheckCircle2 } from 'lucide-react'
import { Button } from '../common/Button'
import { t } from '../../i18n/langStore'

export interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  initialMode?: 'login' | 'register'
}

export function AuthModal({ isOpen, onClose, initialMode = 'login' }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  if (!isOpen) return null

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setTimeout(() => {
      setIsSubmitting(false)
      setSuccessMessage(mode === 'login' ? t('auth.loginSuccess') : t('auth.registerSuccess'))
      setTimeout(() => {
        setSuccessMessage(null)
        onClose()
      }, 1400)
    }, 800)
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
          onClick={onClose}
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
            {mode === 'login' ? t('auth.loginTitle') : t('auth.registerTitle')}
          </h3>
          <p className="mt-1 text-sm text-slate-400">
            {mode === 'login' ? t('auth.loginSubtitle') : t('auth.registerSubtitle')}
          </p>
        </div>

        {successMessage ? (
          <div className="p-4 bg-emerald-500/10 border border-emerald-600/30 text-emerald-300 flex items-center gap-3 text-sm clip-corner-card">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{successMessage}</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
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

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5" htmlFor="auth-password">
                {t('auth.password')}
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-10" />
                <input
                  id="auth-password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-page border border-[#ff3b30]/30 focus:border-[#ff3b30] focus:ring-1 focus:ring-[#ff3b30] text-sm text-slate-100 placeholder-slate-500 outline-none transition-all clip-corner-btn"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="glow"
              fullWidth
              size="md"
              isLoading={isSubmitting}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              {mode === 'login' ? t('auth.loginNow') : t('auth.finishRegister')}
            </Button>

            <div className="pt-2 text-center text-xs text-slate-400">
              {mode === 'login' ? (
                <>
                  {t('auth.noAccount')}{' '}
                  <button
                    type="button"
                    onClick={() => setMode('register')}
                    className="text-[#FF6B4A] hover:text-[#FF3B30] font-medium hover:underline"
                  >
                    {t('auth.registerNow')}
                  </button>
                </>
              ) : (
                <>
                  {t('auth.hasAccount')}{' '}
                  <button
                    type="button"
                    onClick={() => setMode('login')}
                    className="text-[#FF6B4A] hover:text-[#FF3B30] font-medium hover:underline"
                  >
                    {t('auth.login')}
                  </button>
                </>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
