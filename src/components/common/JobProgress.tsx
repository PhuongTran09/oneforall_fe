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
    <div className="w-full max-w-3xl mx-auto p-6 rounded-2xl bg-white border border-slate-200/80 space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {isFailed ? (
            <div className="w-10 h-10 rounded-xl bg-red-100 border border-red-200 text-red-600 flex items-center justify-center shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
          ) : isPending ? (
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-200 text-[#FF3B30] flex items-center justify-center shrink-0">
              <Loader2 className="w-5 h-5 animate-spin" />
            </div>
          )}

          <div>
            <h4 className="font-semibold text-slate-800 text-sm sm:text-base">
              {isFailed
                ? 'Xử lý thất bại'
                : isPending
                ? 'Đang xếp hàng đợi xử lý...'
                : 'Đang xử lý tệp tin...'}
            </h4>
            <p className="text-xs text-slate-500 font-mono">
              Mã tác vụ: {job.id.slice(0, 8)}...{job.id.slice(-6)}
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-xs font-mono font-semibold text-slate-700">
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
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm space-y-2">
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
