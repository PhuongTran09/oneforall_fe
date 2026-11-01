import { Loader2, X } from 'lucide-react'
import type { JobPublicResponse, JobStatus } from '../../services'
import { t } from '../../i18n/langStore'
import { describeJobError } from '../../utils/apiError'

const STATUS_LABEL_KEYS: readonly string[] = [
  'queued',
  'processing',
  'completed',
  'failed',
  'cancelled',
  'expired',
]

/** Job còn worker đang chạy tới: hiện thanh tiến trình + nút hủy. */
const LIVE_STATUSES: readonly JobStatus[] = ['queued', 'processing']

function statusLabel(status: string): string {
  return STATUS_LABEL_KEYS.includes(status) ? t(`history.status.${status}`) : status
}

function chipClass(status: JobStatus): string {
  if (status === 'completed') return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
  if (status === 'failed') return 'text-brand-2 border-brand/40 bg-brand/10'
  if (LIVE_STATUSES.includes(status)) return 'text-brand-3 border-brand-2/30 bg-brand-2/10'
  return 'text-soft border-edge bg-page'
}

export interface TaskStatusWidgetProps {
  jobs: JobPublicResponse[]
  onCancel?: (jobId: string) => void
  isCancellingId?: string | null
}

/**
 * Bảng tiến trình tác vụ nền (Celery/Redis, số liệu từ jobsApi.pollJob — mỗi lượt poll một
 * lần re-render, không có loop rAF nào ở đây).
 *
 * progress là 0–100 và worker chỉ ghi 1 lúc nhận job: dưới 99 nghĩa là "đang chạy", không phải
 * "xong 1%". Vì vậy thanh co theo transform (scaleX), không animate `width` — width là layout
 * property, mỗi frame poll là một lần reflow cả cột.
 */
export function TaskStatusWidget({ jobs, onCancel, isCancellingId }: TaskStatusWidgetProps) {
  return (
    <section
      aria-label={t('job.panelTitle')}
      className="bg-surface border border-edge clip-corner-card p-4"
    >
      <header className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-sm font-bold text-ink tracking-tight">{t('job.panelTitle')}</h2>
        <span className="font-mono text-[11px] text-slate-500">{jobs.length}</span>
      </header>

      {jobs.length === 0 ? (
        <p className="text-xs leading-relaxed text-slate-500">{t('job.panelEmpty')}</p>
      ) : (
        <ul className="space-y-3">
          {jobs.map((job) => {
            const live = LIVE_STATUSES.includes(job.status)
            const ratio = Math.min(1, Math.max(0, job.progress / 100))
            return (
              <li key={job.id} className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 border px-2 py-0.5 text-[11px] font-medium clip-corner-btn ${chipClass(job.status)}`}
                  >
                    {live && <Loader2 className="w-3 h-3 animate-spin" aria-hidden="true" />}
                    {statusLabel(job.status)}
                  </span>
                  {live && onCancel && (
                    <button
                      type="button"
                      onClick={() => onCancel(job.id)}
                      disabled={isCancellingId === job.id}
                      className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-brand-2 disabled:opacity-50"
                    >
                      {isCancellingId === job.id ? (
                        <Loader2 className="w-3 h-3 animate-spin" aria-hidden="true" />
                      ) : (
                        <X className="w-3 h-3" aria-hidden="true" />
                      )}
                      {t('job.cancel')}
                    </button>
                  )}
                </div>

                <div
                  role="progressbar"
                  aria-valuenow={Math.round(ratio * 100)}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={statusLabel(job.status)}
                  className="h-1.5 w-full overflow-hidden bg-page"
                >
                  <div
                    className="h-full w-full origin-left bg-brand-gradient transition-transform duration-300 ease-out"
                    style={{ transform: `scaleX(${ratio.toFixed(3)})` }}
                  />
                </div>

                {job.status === 'failed' && (
                  <p className="text-[11px] leading-relaxed text-brand-2">
                    {describeJobError(job, t('job.errorFallback'))}
                  </p>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
