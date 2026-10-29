import { Download, CheckCircle2, Clock, RotateCcw } from 'lucide-react'
import { Button } from './Button'
import { t } from '../../i18n/langStore'

export interface DownloadResultProps {
  downloadUrl: string
  fileName?: string
  fileSize?: string
  format?: string
  previewUrl?: string | null
  onReset?: () => void
}

export function DownloadResult({
  downloadUrl,
  fileName = 'file_ket_qua',
  fileSize,
  format,
  previewUrl,
  onReset,
}: DownloadResultProps) {
  const handleDownload = () => {
    // Kích hoạt tải tệp trực tiếp
    const a = document.createElement('a')
    a.href = downloadUrl
    a.download = fileName
    a.target = '_blank'
    // Không gửi Referer mang token sang R2/CDN
    a.rel = 'noreferrer'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  return (
    <div className="w-full max-w-3xl mx-auto p-6 sm:p-8 bg-surface/90 border border-[rgba(255,59,48,0.35)] space-y-6 in-up clip-corner-lg card-3d card-3d-dim card-hover-glow">
      {/* Header status */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-edge/60">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 bg-emerald-900/20 border border-emerald-600/40 flex items-center justify-center text-emerald-400 shrink-0 clip-corner-btn">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-ink text-lg sm:text-xl">
              {t('download.successTitle')}
            </h3>
            <p className="text-xs sm:text-sm text-slate-400">
              {t('download.successDesc')}
            </p>
          </div>
        </div>

        {onReset && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            leftIcon={<RotateCcw className="w-4 h-4" />}
          >
            {t('download.convertAnother')}
          </Button>
        )}
      </div>

      {/* File Details & Preview */}
      <div className="p-4 sm:p-5 bg-elev border border-edge flex flex-col sm:flex-row items-center justify-between gap-4 clip-corner-card">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          {previewUrl ? (
            <div className="w-16 h-16 overflow-hidden border border-edge shrink-0 bg-[linear-gradient(45deg,var(--bg-elevated)_25%,transparent_25%),linear-gradient(-45deg,var(--bg-elevated)_25%,transparent_25%),linear-gradient(45deg,transparent_75%,var(--bg-elevated)_75%),linear-gradient(-45deg,transparent_75%,var(--bg-elevated)_75%)] bg-[size:10px_10px] bg-[position:0_0,0_5px,5px_-5px,-5px_0] bg-surface clip-corner-btn">
              <img
                src={previewUrl}
                alt={t('download.resultAlt')}
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain"
              />
            </div>
          ) : (
            <div className="w-14 h-14 bg-brand text-white flex items-center justify-center font-mono font-bold text-xs uppercase shrink-0 clip-corner-btn">
              .{format || 'FILE'}
            </div>
          )}
          <div className="space-y-1 min-w-0 flex-1">
            {/* Không hiển thị tên file/format trên UI — fileName chỉ dùng cho a.download */}
            {fileSize && (
              <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                <span>{fileSize}</span>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <Button
            variant="primary"
            size="md"
            onClick={handleDownload}
            leftIcon={<Download className="w-4 h-4" />}
            className="flex-1 sm:flex-initial btn-shimmer btn-glow-pulse"
          >
            {t('download.downloadNow')}
          </Button>
        </div>
      </div>

      {/* Security & TTL Notice */}
      <div className="flex items-center gap-2 text-xs text-amber-400 bg-amber-900/15 border border-amber-600/25 px-4 py-3 clip-corner-btn">
        <Clock className="w-4 h-4 text-amber-600 shrink-0" />
        <span>
          <strong>{t('download.securityNote')}</strong> {t('download.securityDesc')}
        </span>
      </div>
    </div>
  )
}
