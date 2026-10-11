import { useEffect, useState } from 'react'
import { AlertCircle, Clock, Loader2, Upload } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { JobPublicResponse } from '../../services'
import { Button } from './Button'

export interface JobProgressProps {
  job: JobPublicResponse | null
  onRetry?: () => void
}

type Stage = 'sending' | 'queued' | 'processing' | 'finalizing'

const STAGE_COPY: Record<Stage, { label: string; icon: LucideIcon; tone: string }> = {
  sending: {
    label: 'Đang tải tệp lên...',
    icon: Upload,
    tone: 'bg-[#ff3b30]/10 border-[#ff3b30]/30 text-[#FF3B30]',
  },
  queued: {
    label: 'Đang chờ đến lượt xử lý...',
    icon: Clock,
    tone: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
  },
  processing: {
    label: 'Đang xử lý tệp tin...',
    icon: Loader2,
    tone: 'bg-[#ff3b30]/10 border-[#ff3b30]/30 text-[#FF3B30]',
  },
  finalizing: {
    label: 'Đang hoàn tất kết quả...',
    icon: Loader2,
    tone: 'bg-[#ff3b30]/10 border-[#ff3b30]/30 text-[#FF3B30]',
  },
}

function formatElapsed(seconds: number): string {
  if (seconds < 60) return `${seconds}s`
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`
}

export function JobProgress({ job, onRetry }: JobProgressProps) {
  const [submittedAt] = useState(() => Date.now())
  const [now, setNow] = useState(() => Date.now())

  const isFailed = job?.status === 'failed'
  const stage: Stage = !job
    ? 'sending'
    : job.status === 'queued'
      ? 'queued'
      : job.progress >= 99
        ? 'finalizing'
        : 'processing'

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
  const { label, icon: StageIcon, tone } = STAGE_COPY[stage]
  const displayLabel = isFailed ? 'Xử lý thất bại' : label

  return (
    <div className="w-full max-w-3xl mx-auto p-6 bg-[#14141b] border border-[rgba(255,59,48,0.25)] space-y-4 animate-fade-in clip-corner-lg card-3d card-3d-dim">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 border flex items-center justify-center shrink-0 clip-corner-btn ${
              isFailed ? 'bg-[#ff3b30]/10 border-[#ff3b30]/30 text-[#FF3B30]' : tone
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
              ? 'Lỗi'
              : isDeterminate
                ? `${reportedProgress}%`
                : `Đã chờ ${formatElapsed(elapsed)}`}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      {!isFailed && (
        <div className="w-full h-2 bg-[#0a0a0f] overflow-hidden">
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

      {/* Error message */}
      {isFailed && (
        <div className="p-3.5 bg-[#ff3b30]/10 border border-[#ff3b30]/30 text-red-400 text-xs sm:text-sm space-y-2 clip-corner-btn">
          <p>{job?.error || 'Đã có lỗi xảy ra trong quá trình xử lý tệp. Vui lòng kiểm tra lại liên kết hoặc tệp nguồn.'}</p>
          {onRetry && (
            <Button variant="secondary" size="sm" onClick={onRetry}>
              Thử lại tác vụ
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
