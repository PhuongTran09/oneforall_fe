import { useEffect, useState } from 'react'
import { useNavigate, useOutletContext, useSearchParams } from 'react-router-dom'
import { AlertTriangle, CheckCircle2, CreditCard, Loader2, Mail, XCircle } from 'lucide-react'
import { Button } from '../components/common/Button'
import { SEOHead } from '../components/common/SEOHead'
import { t, withLocale } from '../i18n/langStore'
import { getAccessToken, useAuth } from '../services/authStore'
import { refreshEntitlements } from '../services/entitlementsStore'
import { checkoutMarker, paymentsApi } from '../services/api/paymentsApi'
import { ApiClientError } from '../services/api/types'

const CONTACT_URL =
  'https://mail.google.com/mail/?view=cm&fs=1&to=support@oneforall.io.vn&su=Thanh%20toan%20Pro%20One ForAll'

// IPN của SePay là server-to-server nên đơn có thể paid trễ hơn vài chục giây sau khi
// người dùng quay về tab. Ngưỡng dưới để bắt nhịp đó, không phải để tin 90s = mất tiền.
const POLL_MS = 2_000
const DEADLINE_MS = 90_000
const MAX_CONSECUTIVE_ERRORS = 3

type View =
  | 'signedOut'
  | 'noMarker'
  | 'checking'
  | 'paid'
  | 'pending'
  | 'cancelled'
  | 'failed'
  | 'notFound'
  | 'error'

interface LayoutContext {
  openAuth: (mode: 'login' | 'register') => void
}

function copyFor(view: View): { title: string; body: string } {
  switch (view) {
    case 'paid':
      return { title: t('pay.successTitle'), body: t('pay.successBody') }
    case 'pending':
      return { title: t('pay.pendingTitle'), body: t('pay.pendingBody') }
    case 'cancelled':
      return { title: t('pay.cancelledTitle'), body: t('pay.cancelledBody') }
    case 'failed':
      return { title: t('pay.failedTitle'), body: t('pay.cancelledBody') }
    case 'notFound':
      return { title: t('pay.notFoundTitle'), body: t('pay.notFoundBody') }
    case 'noMarker':
      return { title: t('pay.notFoundTitle'), body: t('pay.noMarker') }
    case 'signedOut':
      return { title: t('pay.signedOutTitle'), body: t('pay.signedOutBody') }
    case 'error':
      return { title: t('pay.errorTitle'), body: t('pay.pendingBody') }
    default:
      return { title: t('pay.returning'), body: t('pay.checkingBody') }
  }
}

export function PaymentReturnPage() {
  const context = useOutletContext<LayoutContext | null>()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const exit = params.get('exit')
  const { session, ready } = useAuth()
  const userId = session?.user?.id ?? null

  // Ba nhánh chốt được mà không cần gọi API: chưa có phiên, hoặc SePay tự báo hủy/lỗi
  // khi redirect. Suy ra từ render (không setState trong effect) nên đổi ngôn ngữ/tab
  // vẫn đúng, và nút "Kiểm tra lại" không làm chúng nhảy lại.
  const decided: View | null = !ready
    ? null
    : getAccessToken() === null
      ? 'signedOut'
      : exit === 'cancel'
        ? 'cancelled'
        : exit === 'error'
          ? 'failed'
          : null

  const [polled, setPolled] = useState<View | null>(null)
  const [orderCode, setOrderCode] = useState<number | null>(null)
  // Đổi số này là chạy lại cả chu trình poll với deadline mới (nút "Kiểm tra lại").
  const [attempt, setAttempt] = useState(0)
  const view = decided ?? polled ?? 'checking'

  useEffect(() => {
    if (decided !== null) return

    const controller = new AbortController()
    let stopped = false
    let timer: ReturnType<typeof setTimeout> | null = null

    const settle = (next: View) => {
      if (!stopped) setPolled(next)
    }

    const sleep = () =>
      new Promise<void>((resolve) => {
        timer = setTimeout(resolve, POLL_MS)
      })

    const poll = async (paymentId: string) => {
      const deadline = Date.now() + DEADLINE_MS
      let errors = 0
      while (!stopped && Date.now() < deadline) {
        try {
          const payment = await paymentsApi.getStatus(paymentId, controller.signal)
          if (stopped) return
          errors = 0
          setOrderCode(payment.order_code)
          if (payment.status === 'paid') {
            checkoutMarker.clear()
            // Bỏ TTL 60s: quyền lợi Pro phải hiện ngay khi tiền được xác nhận.
            void refreshEntitlements(true)
            settle('paid')
            return
          }
          // Luồng SePay không ghi hai status này (chỉ legacy webhook), nhưng nếu BE
          // đổi ý thì người dùng phải thấy đơn đã đóng chứ không phải vòng chờ 90s.
          if (payment.status === 'cancelled' || payment.status === 'expired') {
            settle('cancelled')
            return
          }
        } catch (err) {
          if (stopped || controller.signal.aborted) return
          errors += 1
          if (err instanceof ApiClientError && err.status === 404) {
            settle('notFound')
            return
          }
          if (err instanceof ApiClientError && (err.status === 401 || err.status === 403)) {
            settle('signedOut')
            return
          }
          if (errors >= MAX_CONSECUTIVE_ERRORS) {
            settle('error')
            return
          }
        }
        await sleep()
      }
      // Hết thời gian mà đơn vẫn pending: tiền có thể đang trên đường về qua IPN.
      settle('pending')
    }

    const start = async () => {
      const marker = checkoutMarker.read()
      if (marker) {
        await poll(marker.paymentId)
        return
      }
      // Marker mất (tab mới, storage bị chặn) → BE sort created_at desc, đơn đầu là đơn vừa tạo.
      try {
        const recent = await paymentsApi.latest(controller.signal)
        if (stopped) return
        if (!recent) {
          settle('noMarker')
          return
        }
        setOrderCode(recent.order_code)
        await poll(recent.id)
      } catch {
        settle('error')
      }
    }

    void start()

    return () => {
      stopped = true
      if (timer !== null) clearTimeout(timer)
      controller.abort()
    }
    // userId (chứ không phải session) để đổi tài khoản là poll lại từ đầu.
  }, [decided, exit, userId, attempt])

  const { title, body } = copyFor(view)
  const Icon =
    view === 'checking' ? Loader2
    : view === 'paid' ? CheckCircle2
    : view === 'cancelled' ? XCircle
    : AlertTriangle

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <SEOHead
        title={t('pay.pageTitle')}
        description={t('pay.checkingBody')}
        canonicalUrl="https://oneforall.io.vn/payment-return"
        noindex
      />
      <div className="bg-surface border border-[rgba(255,59,48,0.35)] clip-corner-lg p-6 sm:p-8 space-y-5">
        <div className="text-center space-y-3">
          <div className="inline-flex w-12 h-12 items-center justify-center bg-brand/10 border border-brand/30 clip-corner-btn">
            <Icon className={`w-6 h-6 text-brand-2 ${view === 'checking' ? 'animate-spin' : ''}`} />
          </div>
          <h1 className="text-xl font-bold text-ink">{title}</h1>
          <p className="text-sm text-slate-400 leading-relaxed">{body}</p>
          {orderCode !== null && (
            <p className="text-xs text-soft font-mono">{t('pay.order', { code: orderCode })}</p>
          )}
        </div>

        {view === 'checking' ? null : (
          <div className="space-y-2">
            {view === 'signedOut' && (
              <Button variant="glow" fullWidth size="md" onClick={() => context?.openAuth('login')}>
                {t('pay.signIn')}
              </Button>
            )}
            {view === 'paid' && (
              <Button
                variant="glow"
                fullWidth
                size="md"
                leftIcon={<CreditCard className="w-4 h-4" />}
                onClick={() => navigate(withLocale('/profile'))}
              >
                {t('pay.toProfile')}
              </Button>
            )}
            {(view === 'pending' || view === 'error' || view === 'noMarker') && (
              <Button
                variant="glow"
                fullWidth
                size="md"
                onClick={() => {
                  setPolled(null)
                  setOrderCode(null)
                  setAttempt((value) => value + 1)
                }}
              >
                {t('pay.recheck')}
              </Button>
            )}
            {view !== 'paid' && view !== 'signedOut' && (
              <Button
                variant="ghost"
                fullWidth
                size="sm"
                leftIcon={<Mail className="w-4 h-4" />}
                onClick={() => window.open(CONTACT_URL, '_blank', 'noopener')}
              >
                {t('proModal.contact')}
              </Button>
            )}
            {(view === 'cancelled' || view === 'failed' || view === 'notFound') && (
              <Button variant="secondary" fullWidth size="sm" onClick={() => navigate(withLocale('/'))}>
                {t('pay.backHome')}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
