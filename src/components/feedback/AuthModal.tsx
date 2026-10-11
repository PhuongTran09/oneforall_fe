import { useState, type FormEvent } from 'react'
import { X, Lock, Mail, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react'
import { Button } from '../common/Button'

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
      setSuccessMessage(
        mode === 'login'
          ? 'Đăng nhập thành công! Chào mừng bạn quay trở lại OneForAll.'
          : 'Đăng ký tài khoản thành công! Bạn có thể bắt đầu sử dụng đầy đủ công cụ.',
      )
      setTimeout(() => {
        setSuccessMessage(null)
        onClose()
      }, 1400)
    }, 800)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-md p-6 sm:p-8 bg-[#14141b] border border-[#2a2a35] rounded-2xl"
        role="dialog"
        aria-modal="true"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-[#1a1a24] transition-colors"
          aria-label="Đóng"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 mb-3 rounded-xl bg-[#ff3b30]/10 border border-[#ff3b30]/30 text-[#FF3B30]">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-2xl font-bold text-white tracking-tight">
            {mode === 'login' ? 'Đăng nhập OneForAll' : 'Tạo tài khoản mới'}
          </h3>
          <p className="mt-1 text-sm text-slate-400">
            {mode === 'login'
              ? 'Truy cập thư viện công cụ xử lý tệp tốc độ cao'
              : 'Trải nghiệm toàn bộ tính năng xử lý tệp miễn phí'}
          </p>
        </div>

        {successMessage ? (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-center gap-3 text-sm">
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
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="auth-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#0a0a0f] border border-[#ff3b30]/30 focus:border-[#ff3b30] focus:ring-1 focus:ring-[#ff3b30] rounded-xl text-sm text-slate-100 placeholder-slate-500 outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5" htmlFor="auth-password">
                Mật khẩu
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="auth-password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#0a0a0f] border border-[#ff3b30]/30 focus:border-[#ff3b30] focus:ring-1 focus:ring-[#ff3b30] rounded-xl text-sm text-slate-100 placeholder-slate-500 outline-none transition-all"
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
              {mode === 'login' ? 'Đăng nhập ngay' : 'Hoàn tất đăng ký'}
            </Button>

            <div className="pt-2 text-center text-xs text-slate-400">
              {mode === 'login' ? (
                <>
                  Chưa có tài khoản?{' '}
                  <button
                    type="button"
                    onClick={() => setMode('register')}
                    className="text-[#FF6B4A] hover:text-[#FF3B30] font-medium hover:underline"
                  >
                    Đăng ký ngay
                  </button>
                </>
              ) : (
                <>
                  Đã có tài khoản?{' '}
                  <button
                    type="button"
                    onClick={() => setMode('login')}
                    className="text-[#FF6B4A] hover:text-[#FF3B30] font-medium hover:underline"
                  >
                    Đăng nhập
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
