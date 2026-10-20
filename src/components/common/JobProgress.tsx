import { useEffect, useState } from 'react'
import { AlertCircle, Ban, Clock, Loader2, Upload } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { JobPublicResponse } from '../../services'
import { Button } from './Button'
import { ConfirmModal } from '../feedback/ConfirmModal'
import { t } from '../../i18n/langStore'
import { describeJobError } from '../../utils/apiError'

export interface JobProgressProps {
  job: JobPublicResponse | null
  onRetry?: () => void
  onCancel?: () => void
  isCancelling?: boolean
}

type Stage = 'sending' | 'queued' | 'processing' | 'finalizing'

const STAGE_ICON_TONE: Record<Stage, { icon: LucideIcon; tone: string }> = {
  sending: {
    icon: Upload,
    tone: 'bg-brand/10 border-brand/30 text-brand',
  },
  queued: {
    icon: Clock,
    tone: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
  },
  processing: {
    icon: Loader2,
    tone: 'bg-brand/10 border-brand/30 text-brand',
  },
  finalizing: {
    icon: Loader2,
    tone: 'bg-brand/10 border-brand/30 text-brand',
  },
}

const STAGE_LABEL_KEY: Record<Stage, string> = {
  sending: 'job.stageSending',
  queued: 'job.stageQueued',
  processing: 'job.stageProcessing',
  finalizing: 'job.stageFinalizing',
}

function formatElapsed(seconds: number): string {
  if (seconds < 60) return `${seconds}s`
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`
}

export function JobProgress({ job, onRetry, onCancel, isCancelling }: JobProgressProps) {
  const [submittedAt] = useState(() => Date.now())
  const [now, setNow] = useState(() => Date.now())
  const [confirmCancelOpen, setConfirmCancelOpen] = useState(false)

  const isFailed = job?.status === 'failed'
  const stage: Stage = !job
    ? 'sending'
    : job.status === 'queued'
      ? 'queued'
      : job.progress >= 99
        ? 'finalizing'
        : 'processing'

  // Chỉ hủy được job đã có id và chưa rơi vào trạng thái cuối: ở stage 'sending'
  // (job === null) backend chưa có job nào để hủy.
  const canCancel =
    !!onCancel && !!job && (job.status === 'queued' || job.status === 'processing')

  // Worker chỉ ghi progress 1 lúc nhận job (mark_processing); mọi giá trị lớn hơn 1 là
  // % thật do ffmpeg/yt-dlp báo. Nên 1 vẫn nghĩa là "chưa rõ tiến độ".
  const reportedProgress = !isFailed && job ? job.progress : 0
  const isDeterminate = reportedProgress > 1

  useEffect(() => {
    if (isFailed) return
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [isFailed])

  if (job?.status === 'completed') return null

  const elapsed = Math.max(0, Math.floor((now - submittedAt) / 1000))
  const { icon: StageIcon, tone } = STAGE_ICON_TONE[stage]
  const displayLabel = isFailed ? t('job.failed') : t(STAGE_LABEL_KEY[stage])

  return (
    <div className="w-full max-w-3xl mx-auto p-6 bg-surface border border-[rgba(255,59,48,0.25)] space-y-4 animate-fade-in clip-corner-lg card-3d card-3d-dim">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 border flex items-center justify-center shrink-0 clip-corner-btn ${
              isFailed ? 'bg-brand/10 border-brand/30 text-brand' : tone
            }`}
          >
            {isFailed ? (
              <AlertCircle className="w-5 h-5" />
            ) : (
              <StageIcon
                className={`w-5 h-5 ${stage === 'processing' || stage === 'finalizing' ? 'animate-spin' : ''}`}
              />
            )}
          </div>

          <div>
            <h4 className="font-semibold text-slate-100 text-sm sm:text-base">{displayLabel}</h4>
          </div>
        </div>

        <div className="text-right">
          <span className="text-xs font-mono font-semibold text-slate-200">
            {isFailed
              ? t('job.error')
              : isDeterminate
                ? `${reportedProgress}%`
                : t('job.waited', { time: formatElapsed(elapsed) })}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      {!isFailed && (
        <div className="w-full h-2 bg-page overflow-hidden">
          {isDeterminate ? (
            <div
              className="bg-brand-gradient h-full transition-all duration-300"
              style={{ width: `${Math.min(reportedProgress, 100)}%` }}
            />
          ) : (
            <div className="w-[30%] h-full bg-brand-gradient animate-loading-sweep" />
          )}
        </div>
      )}

      {/* Hủy tác vụ: backend CAS sang cancelled và worker đang chạy sẽ dừng subprocess */}
      {canCancel && (
        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            isLoading={isCancelling}
            leftIcon={<Ban className="w-4 h-4" />}
            onClick={() => setConfirmCancelOpen(true)}
          >
            {t('job.cancel')}
          </Button>
        </div>
      )}

      {/* Error message */}
      {isFailed && (
        <div className="p-3.5 bg-brand/10 border border-brand/30 text-red-400 text-xs sm:text-sm space-y-2 clip-corner-btn">
          <p>{describeJobError(job, t('job.errorFallback'))}</p>
          {onRetry && (
            <Button variant="secondary" size="sm" onClick={onRetry}>
              {t('job.retry')}
            </Button>
          )}
        </div>
      )}

      <ConfirmModal
        isOpen={confirmCancelOpen}
        title={t('history.cancelConfirmTitle')}
        message={t('history.cancelConfirm')}
        onConfirm={() => {
          setConfirmCancelOpen(false)
          onCancel?.()
        }}
        onClose={() => setConfirmCancelOpen(false)}
      />
    </div>
  )
}
