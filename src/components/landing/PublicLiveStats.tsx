import { useEffect, useState } from 'react'
import { CheckCircle2, RefreshCw, Users, ShieldCheck, Activity } from 'lucide-react'
import { Button } from '../common/Button'
import { useI18n } from '../../i18n/langStore'
import { watchLiveStats } from '../../services/api/statsApi'
import type { PublicStats } from '../../services/api/types'

/* Public live stats — hai số THẬT từ kênh SSE /api/v1/public/stats/stream, không có giá */

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
        className="p-5 sm:p-7 bg-surface border border-edge clip-corner-card card-3d flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <p className="text-sm font-mono text-slate-300">{t('liveStats.error')}</p>
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
      className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6"
    >
      {/* 1. Active Visitors Card */}
      <div className="relative overflow-hidden p-6 sm:p-7 bg-surface/90 border border-[rgba(255,59,48,0.25)] hover:border-[rgba(255,59,48,0.6)] clip-corner-card card-3d card-hover-glow group transition-all duration-300">
        {/* Header Row */}
        <div className="relative z-10 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="badge-angular inline-flex items-center gap-1.5 px-2 py-0.5 bg-brand/10 border border-brand/30 text-[10px] font-mono font-bold tracking-wider uppercase text-brand">
              <span className="relative flex h-2 w-2" aria-hidden="true">
                {phase === 'ready' && (
                  <span className="absolute inline-flex h-full w-full bg-brand opacity-75 motion-safe:animate-ping" />
                )}
                <span
                  className={`relative inline-flex h-2 w-2 ${
                    phase === 'ready' ? 'bg-brand' : 'bg-edge'
                  }`}
                />
              </span>
              <span>LIVE</span>
            </span>
            <h3 className="text-xs sm:text-sm font-mono font-bold uppercase tracking-wider text-slate-300">
              {t('liveStats.activeVisitors')}
            </h3>
          </div>

          <div className="w-10 h-10 bg-page border border-edge clip-corner-btn flex items-center justify-center text-brand group-hover:scale-110 group-hover:rotate-2 group-hover:border-brand/50 group-hover:bg-brand/10 group-hover:shadow-[0_0_14px_rgba(255,59,48,0.25)] transition-all duration-300">
            <Users className="w-4 h-4" />
          </div>
        </div>

        {/* Metric Value Row + Cyber Level Meter */}
        <div className="relative z-10 mt-5 flex items-baseline justify-between gap-4">
          <p
            key={`v-${stats?.active_visitors ?? 'load'}`}
            className="text-4xl sm:text-5xl font-black text-ink tabular-nums tracking-tight live-value group-hover:text-brand transition-colors"
          >
            {loading ? MISSING : count(stats.active_visitors)}
          </p>

          {/* Realtime LED Activity Level Bars */}
          {phase === 'ready' && (
            <div
              className="flex items-end gap-1 h-7 pb-1"
              title="Realtime SSE stream active"
              aria-hidden="true"
            >
              <span className="w-1 h-3 bg-brand/70 motion-safe:animate-pulse" />
              <span className="w-1 h-6 bg-brand motion-safe:animate-pulse [animation-delay:150ms]" />
              <span className="w-1 h-4 bg-brand/80 motion-safe:animate-pulse [animation-delay:300ms]" />
              <span className="w-1 h-5 bg-brand motion-safe:animate-pulse [animation-delay:75ms]" />
              <span className="w-1 h-2.5 bg-brand/60 motion-safe:animate-pulse [animation-delay:220ms]" />
            </div>
          )}
        </div>

        {/* Footer Hint Row */}
        <div className="relative z-10 mt-4 pt-3 border-t border-edge/50 flex items-center justify-between text-xs font-mono text-slate-400">
          <span className="flex items-center gap-1.5 font-medium">
            <Activity className="w-3.5 h-3.5 text-brand" />
            <span>{t('liveStats.activeVisitorsHint')}</span>
          </span>
        </div>
      </div>

      {/* 2. Completed Jobs Card */}
      <div className="relative overflow-hidden p-6 sm:p-7 bg-surface/90 border border-edge/80 hover:border-emerald-500/60 clip-corner-card card-3d card-hover-glow group transition-all duration-300">
        {/* Header Row */}
        <div className="relative z-10 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="badge-angular inline-flex items-center gap-1.5 px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/30 text-[10px] font-mono font-bold tracking-wider uppercase text-emerald-400">
              <span className="relative flex h-2 w-2" aria-hidden="true">
                <span className="relative inline-flex h-2 w-2 bg-emerald-500" />
              </span>
              <span>TOTAL</span>
            </span>
            <h3 className="text-xs sm:text-sm font-mono font-bold uppercase tracking-wider text-slate-300">
              {t('liveStats.completedJobs')}
            </h3>
          </div>

          <div className="w-10 h-10 bg-page border border-edge clip-corner-btn flex items-center justify-center text-emerald-400 group-hover:scale-110 group-hover:rotate-2 group-hover:border-emerald-500/50 group-hover:bg-emerald-500/10 group-hover:shadow-[0_0_14px_rgba(16,185,129,0.25)] transition-all duration-300">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>

        {/* Metric Value Row + Automated Badge */}
        <div className="relative z-10 mt-5 flex items-baseline justify-between gap-4">
          <p
            key={`j-${stats?.completed_jobs ?? 'load'}`}
            className="text-4xl sm:text-5xl font-black text-emerald-400 tabular-nums tracking-tight live-value"
          >
            {loading ? MISSING : count(stats.completed_jobs)}
          </p>
        </div>

        {/* Footer Hint Row */}
        <div className="relative z-10 mt-4 pt-3 border-t border-edge/50 flex items-center justify-between text-xs font-mono text-slate-400">
          <span className="flex items-center gap-1.5 font-medium truncate">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span className="truncate">{t('liveStats.completedJobsHint')}</span>
          </span>
        </div>
      </div>

      {/* Privacy Guarantee Note — matching angular design language */}
      <div className="sm:col-span-2 flex items-center justify-center pt-2">
        <div className="badge-angular inline-flex items-center gap-2 px-3.5 py-1.5 bg-surface/90 border border-edge text-[11px] font-mono text-slate-400 transition-colors hover:border-brand/40">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
          <span>{loading ? t('liveStats.loading') : t('liveStats.privacyNote')}</span>
        </div>
      </div>
    </section>
  )
}
