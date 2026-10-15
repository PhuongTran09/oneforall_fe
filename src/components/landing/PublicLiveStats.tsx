import { useEffect, useState } from 'react'
import { CheckCircle2, RefreshCw } from 'lucide-react'
import { Button } from '../common/Button'
import { useI18n } from '../../i18n/langStore'
import { watchLiveStats } from '../../services/api/statsApi'
import type { PublicStats } from '../../services/api/types'

/*
  Public live stats — hai số THẬT từ kênh SSE /api/v1/public/stats/stream, không có giá
  trị bịa:
  - active_visitors: số phiên vừa heartbeat trong 5 phút gần nhất (Redis).
  - completed_jobs : tổng số job xử lý thành công từ trước tới nay (đếm từ bảng jobs).
  Backend trả null khi không đo được => UI hiện "—", phân biệt với 0 là số đếm được.
  Transport (SSE + polling fallback + tab ẩn) nằm ở statsApi.watchLiveStats.
*/

type Phase = 'loading' | 'ready' | 'error'

const MISSING = '—'

export function PublicLiveStats() {
  const { lang, t } = useI18n()
  const [stats, setStats] = useState<PublicStats | null>(null)
  const [phase, setPhase] = useState<Phase>('loading')
  const [attempt, setAttempt] = useState(0)

  useEffect(
    () =>
      watchLiveStats({
        onStats: (next) => {
          setStats(next)
          setPhase('ready')
        },
        onError: () => setPhase('error'),
      }),
    [attempt],
  )

  const count = (value: number | null) =>
    value === null ? MISSING : value.toLocaleString(lang)

  if (phase === 'error' && stats === null) {
    return (
      <section
        aria-label={t('liveStats.title')}
        className="p-5 sm:p-8 bg-surface border border-edge clip-corner-card flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <p className="text-sm text-slate-300">{t('liveStats.error')}</p>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => {
            setPhase('loading')
            setAttempt((a) => a + 1)
          }}
          leftIcon={<RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />}
        >
          {t('liveStats.retry')}
        </Button>
      </section>
    )
  }

  const loading = stats === null

  return (
    <section
      aria-label={t('liveStats.title')}
      className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6"
    >
      <div className="p-5 sm:p-8 bg-surface border border-edge clip-corner-card card-3d card-3d-dim transition-colors hover:border-brand/40">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5 shrink-0" aria-hidden="true">
            {phase === 'ready' && (
              <span className="absolute inline-flex h-full w-full rounded-full bg-brand opacity-60 motion-safe:animate-ping" />
            )}
            <span
              className={`relative inline-flex h-2.5 w-2.5 rounded-full ${
                phase === 'ready' ? 'bg-brand' : 'bg-edge'
              }`}
            />
          </span>
          <h3 className="text-[11px] sm:text-xs font-mono font-bold uppercase text-slate-400">
            {t('liveStats.activeVisitors')}
          </h3>
        </div>
        <p
          key={`v-${stats?.active_visitors ?? 'load'}`}
          className="mt-4 text-4xl sm:text-5xl font-bold text-ink tabular-nums live-value"
        >
          {loading ? MISSING : count(stats.active_visitors)}
        </p>
        <p className="mt-3 text-xs text-slate-500">{t('liveStats.activeVisitorsHint')}</p>
      </div>

      <div className="p-5 sm:p-8 bg-surface border border-edge clip-corner-card card-3d card-3d-dim transition-colors hover:border-brand/40">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" aria-hidden="true" />
          <h3 className="text-[11px] sm:text-xs font-mono font-bold uppercase text-slate-400">
            {t('liveStats.completedJobs')}
          </h3>
        </div>
        <p
          key={`j-${stats?.completed_jobs ?? 'load'}`}
          className="mt-4 text-4xl sm:text-5xl font-bold text-emerald-500 tabular-nums live-value"
        >
          {loading ? MISSING : count(stats.completed_jobs)}
        </p>
        <p className="mt-3 text-xs text-slate-500">{t('liveStats.completedJobsHint')}</p>
      </div>

      <p className="sm:col-span-2 text-[10px] font-mono text-slate-500">
        {loading ? t('liveStats.loading') : t('liveStats.privacyNote')}
      </p>
    </section>
  )
}
