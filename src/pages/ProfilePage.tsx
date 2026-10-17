import { useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { User as UserIcon, History as HistoryIcon, Sparkles, Mail, CalendarDays } from 'lucide-react'
import { Button } from '../components/common/Button'
import { showErrorPopup } from '../components/feedback/errorPopupStore'
import { LocaleLink } from '../i18n/LocaleLink'
import { t, getLang } from '../i18n/langStore'
import { useAuth } from '../services/authStore'
import { refreshEntitlements, useEntitlements } from '../services/entitlementsStore'
import { jobsApi } from '../services/api/jobsApi'
import { paymentsApi, PREMIUM_PLAN_ID } from '../services/api/paymentsApi'
import type { JobStats, PaymentHistoryItem, UserMe } from '../services/api/types'

interface LayoutContext {
  openAuth: (mode: 'login' | 'register') => void
  openPro: () => void
}

function formatDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat(getLang(), { dateStyle: 'medium' }).format(new Date(iso))
  } catch {
    return iso
  }
}

// shortcut: chỉ 10 đơn gần nhất (BE cho phép tới 100), thêm phân trang khi user có nhiều đơn.
const PAYMENT_HISTORY_LIMIT = 10

const PAY_STATUS_KEYS = ['pending', 'paid', 'cancelled', 'expired'] as const

function payStatusLabel(status: string): string {
  return (PAY_STATUS_KEYS as readonly string[]).includes(status)
    ? t(`profile.payStatus.${status}`)
    : status
}

function payStatusClass(status: string): string {
  if (status === 'paid') return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
  if (status === 'pending') return 'text-brand-3 border-brand-2/30 bg-brand-2/10'
  return 'text-soft border-edge bg-page'
}

function formatVnd(amount: number): string {
  try {
    return new Intl.NumberFormat(getLang(), {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(amount)
  } catch {
    return `${amount} ₫`
  }
}

function planLabel(planId: string): string {
  if (planId === PREMIUM_PLAN_ID) return t('profile.planPremium')
  if (planId === 'free') return t('profile.planFree')
  return planId
}

type Plan = 'free' | 'premium'

/** Độ ưu tiên: backend /users/me → Supabase user_metadata → mặc định 'free'. */
function resolvePlan(me: UserMe | null, meta: Record<string, unknown>): Plan {
  const raw =
    (typeof me?.plan === 'string' && me.plan) ||
    (typeof meta.plan === 'string' && meta.plan) ||
    (typeof meta.subscription_tier === 'string' && meta.subscription_tier) ||
    'free'
  const v = String(raw).toLowerCase()
  return v.includes('premium') || v.includes('pro') ? 'premium' : 'free'
}

function PlanBadge({ plan, onSelect }: { plan: Plan; onSelect: () => void }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      title={t('profile.viewPlan')}
      className={
        plan === 'premium'
          ? 'inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold badge-angular bg-brand-gradient text-white cursor-pointer hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF4545]/60'
          : 'inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold badge-angular bg-surface border border-edge text-soft cursor-pointer hover:border-[rgba(255,59,48,0.5)] hover:text-brand-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF4545]/60'
      }
    >
      {plan === 'premium' && <Sparkles className="w-3.5 h-3.5" />}
      {plan === 'premium' ? t('profile.planPremium') : t('profile.planFree')}
    </button>
  )
}

export function ProfilePage() {
  const context = useOutletContext<LayoutContext | null>()
  const { session, ready } = useAuth()
  const user = session?.user ?? null
  const userId = user?.id ?? null

  // /users/me là state toàn cục (entitlementsStore) — trang chỉ đọc, không tự gọi
  // nữa, nếu không mỗi lần focus tab/refresh token sẽ nhân đôi request.
  const { me } = useEntitlements()
  const [stats, setStats] = useState<JobStats | null>(null)
  const [payments, setPayments] = useState<PaymentHistoryItem[] | null>(null)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    if (!userId) return
    const controller = new AbortController()
    // Đọc MỘT lần khi mở trang — không polling (§8).
    void (async () => {
      try {
        const statsRes = await jobsApi.getStats(controller.signal)
        if (controller.signal.aborted) return
        setStats(statsRes)
      } catch {
        if (!controller.signal.aborted) {
          showErrorPopup({ message: t('history.error'), onRetry: () => setAttempt((a) => a + 1) })
        }
      }
      try {
        const rows = await paymentsApi.history(PAYMENT_HISTORY_LIMIT, controller.signal)
        if (controller.signal.aborted) return
        setPayments(rows)
      } catch {
        if (!controller.signal.aborted) {
          showErrorPopup({
            message: t('profile.paymentsError'),
            onRetry: () => setAttempt((a) => a + 1),
          })
        }
      }
    })()
    void refreshEntitlements()
    return () => controller.abort()
  }, [userId, attempt])

  if (!ready) {
    return <div className="py-16 text-center text-soft">{t('profile.loading')}</div>
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="inline-flex w-16 h-16 items-center justify-center bg-brand/10 border border-brand/30 clip-corner-btn mb-4">
          <UserIcon className="w-8 h-8 text-brand-2" />
        </div>
        <p className="text-slate-300 mb-4">{t('profile.needLogin')}</p>
        <Button variant="glow" onClick={() => context?.openAuth('login')}>
          {t('auth.login')}
        </Button>
      </div>
    )
  }

  const meta = (user.user_metadata ?? {}) as Record<string, unknown>
  const avatar = typeof meta.avatar_url === 'string' ? meta.avatar_url : null
  const displayName =
    me?.full_name ||
    (typeof meta.full_name === 'string' && meta.full_name) ||
    me?.username ||
    user.email ||
    '—'
  const plan = resolvePlan(me, meta)

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-ink tracking-tight">{t('profile.title')}</h1>
        <p className="text-soft mt-1">{t('profile.subtitle')}</p>
      </div>

      {/* Header tài khoản — cùng ngôn ngữ vát góc + viền brand của modal/card web */}
      <div className="bg-surface border border-[rgba(255,59,48,0.35)] clip-corner-lg card-3d p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row gap-5 sm:items-center">
          <div className="shrink-0">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#ff3b30] via-[#ff6b4a] to-[#ff8a65] p-[2.5px]">
              <div className="w-full h-full rounded-full overflow-hidden bg-tint flex items-center justify-center">
                {avatar ? (
                  <img src={avatar} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <UserIcon className="w-9 h-9 text-brand-2" />
                )}
              </div>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-xl font-bold text-ink truncate" title={displayName}>
                {displayName}
              </h2>
              <PlanBadge plan={plan} onSelect={() => context?.openPro()} />
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-sm text-soft">
              <span className="inline-flex items-center gap-1.5 min-w-0">
                <Mail className="w-4 h-4 text-brand-2 shrink-0" />
                <span className="truncate" title={user.email ?? undefined}>
                  {me?.email ?? user.email ?? '—'}
                </span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="w-4 h-4 text-brand-2 shrink-0" />
                {t('profile.memberSince')}: <span className="text-ink">{me ? formatDate(me.created_at) : '—'}</span>
              </span>
            </div>
          </div>

          {plan === 'free' && (
            <div className="shrink-0">
              <Button
                variant="glow"
                size="sm"
                leftIcon={<Sparkles className="w-4 h-4" />}
                onClick={() => context?.openPro()}
              >
                {t('pricing.proCta')}
              </Button>
            </div>
          )}
        </div>

        <dl className="mt-6 pt-5 border-t border-edge/60 grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-3 text-sm">
          <div>
            <dt className="text-soft">{t('profile.plan')}</dt>
            <dd className="text-ink font-medium">
              {plan === 'premium' ? t('profile.planPremium') : `${t('profile.planFree')} · ${t('pricing.freeBadge')}`}
            </dd>
          </div>
          <div>
            <dt className="text-soft">{t('profile.email')}</dt>
            <dd className="text-ink font-medium break-all">{me?.email ?? user.email ?? '—'}</dd>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <dt className="text-soft">{t('profile.displayName')}</dt>
            <dd className="text-ink font-medium truncate">{displayName}</dd>
          </div>
        </dl>
      </div>

      {/* Thống kê — số lớn brand gradient như KPI dashboard */}
      <div className="grid grid-cols-2 gap-4 mt-4">
        <div className="bg-surface border border-edge clip-corner-card p-5 sm:p-6 text-center">
          <div
            key={`s-${stats?.total_completed ?? 'load'}`}
            className="text-3xl sm:text-4xl font-bold text-brand-gradient tabular-nums live-value"
          >
            {stats ? stats.total_completed : '—'}
          </div>
          <div className="text-sm text-soft mt-1">{t('profile.totalCompleted')}</div>
        </div>
        <div className="bg-surface border border-edge clip-corner-card p-5 sm:p-6 text-center">
          <div
            key={`f-${stats?.files_available ?? 'load'}`}
            className="text-3xl sm:text-4xl font-bold text-brand-gradient tabular-nums live-value"
          >
            {stats ? stats.files_available : '—'}
          </div>
          <div className="text-sm text-soft mt-1">{t('profile.filesAvailable')}</div>
        </div>
      </div>

      {/* Lịch sử thanh toán — chữ về gói chuyển từ modal Pro sang; chỉ hiện khi request thành công (thất bại đã có popup retry). */}
      {payments && (
        <div className="bg-surface border border-edge clip-corner-card p-5 sm:p-6 mt-4">
          <h2 className="text-base font-bold text-ink tracking-tight">{t('profile.paymentsTitle')}</h2>
          <p className="text-xs text-soft mt-1 leading-relaxed">{t('profile.paymentsNote')}</p>
          {payments.length === 0 ? (
            <p className="text-sm text-soft mt-3">{t('profile.paymentsEmpty')}</p>
          ) : (
            <ul className="mt-2">
              {payments.map((p) => (
                <li key={p.id} className="flex items-center gap-3 py-2.5 border-b border-edge/60 last:border-0">
                  <div className="flex-1 min-w-0">
                    <div className="truncate text-sm text-ink font-medium">
                      {planLabel(p.plan_id)} · {formatVnd(p.amount_vnd)}
                    </div>
                    <div className="text-xs text-soft mt-0.5 tabular-nums">
                      {t('profile.payOrder')}: {p.order_code} · {formatDate(p.created_at)}
                    </div>
                  </div>
                  <span
                    className={`shrink-0 inline-flex items-center px-2.5 py-1 text-[10px] font-bold badge-angular border ${payStatusClass(p.status)}`}
                  >
                    {payStatusLabel(p.status)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <LocaleLink
        to="/history"
        className="inline-flex items-center gap-2 mt-6 px-4 py-2.5 text-sm font-medium bg-surface border border-[rgba(255,59,48,0.35)] clip-corner-btn text-brand-2 hover:bg-brand/10 transition-colors"
      >
        <HistoryIcon className="w-4 h-4" />
        {t('profile.viewHistory')}
      </LocaleLink>
    </div>
  )
}
