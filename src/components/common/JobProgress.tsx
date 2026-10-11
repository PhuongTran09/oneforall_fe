import { Loader2, AlertCircle, Clock } from 'lucide-react'
import type { JobPublicResponse } from '../../services'
import { Button } from './Button'

export interface JobProgressProps {
  job: JobPublicResponse | null
  onRetry?: () => void
}

export function JobProgress({ job, onRetry }: JobProgressProps) {
  if (!job) return null

  const isFailed = job.status === 'failed'
  const isPending = job.status === 'pending'
  const isProcessing = job.status === 'processing'

  if (job.status === 'completed') return null

  return (
    <div className="w-full max-w-3xl mx-auto p-6 bg-[#14141b] border border-[rgba(255,59,48,0.25)] space-y-4 animate-fade-in clip-corner-lg card-3d card-3d-dim">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {isFailed ? (
            <div className="w-10 h-10 bg-[#ff3b30]/10 border border-[#ff3b30]/30 text-[#FF3B30] flex items-center justify-center shrink-0 clip-corner-btn">
              <AlertCircle className="w-5 h-5" />
            </div>
          ) : isPending ? (
            <div className="w-10 h-10 bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0 clip-corner-btn">
              <Clock className="w-5 h-5" />
            </div>
          ) : (
            <div className="w-10 h-10 bg-[#ff3b30]/10 border border-[#ff3b30]/30 text-[#FF3B30] flex items-center justify-center shrink-0 clip-corner-btn">
              <Loader2 className="w-5 h-5 animate-spin" />
            </div>
          )}

          <div>
            <h4 className="font-semibold text-slate-100 text-sm sm:text-base">
              {isFailed
                ? 'Xử lý thất bại'
                : isPending
                ? 'Đang xếp hàng đợi xử lý...'
                : 'Đang xử lý tệp tin...'}
            </h4>
            <p className="text-xs text-slate-400 font-mono">
              Mã tác vụ: {job.id.slice(0, 8)}...{job.id.slice(-6)}
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-xs font-mono font-semibold text-slate-200">
            {isFailed ? 'Lỗi' : `${Math.max(job.progress || (isProcessing ? 45 : 10), 5)}%`}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      {!isFailed && (
        <div className="w-full h-2 overflow-hidden">
          <div
            className="bg-brand-gradient h-full transition-all duration-300"
            style={{
              width: `${Math.max(job.progress || (isProcessing ? 45 : 10), 5)}%`,
            }}
          />
        </div>
      )}

      {/* Error message */}
      {isFailed && (
        <div className="p-3.5 bg-[#ff3b30]/10 border border-[#ff3b30]/30 text-red-400 text-xs sm:text-sm space-y-2 clip-corner-btn">
          <p>{job.error || 'Đã có lỗi xảy ra trong quá trình xử lý tệp. Vui lòng kiểm tra lại liên kết hoặc tệp nguồn.'}</p>
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
