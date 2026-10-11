import { Download, CheckCircle2, Clock, RotateCcw } from 'lucide-react'
import { Button } from './Button'

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
    <div className="w-full max-w-3xl mx-auto p-6 sm:p-8 bg-[#14141b] border border-[rgba(255,59,48,0.30)] space-y-6 animate-in fade-in zoom-in-95 duration-200 clip-corner-lg card-3d card-3d-dim">
      {/* Header status */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[#2a2a35]/60">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 bg-emerald-900/20 border border-emerald-600/40 flex items-center justify-center text-emerald-400 shrink-0 clip-corner-btn">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-white text-lg sm:text-xl">
              Xử lý thành công!
            </h3>
            <p className="text-xs sm:text-sm text-slate-400">
              Tệp kết quả đã sẵn sàng để tải xuống lưu trữ về máy tính của bạn.
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
            Chuyển đổi tệp khác
          </Button>
        )}
      </div>

      {/* File Details & Preview */}
      <div className="p-4 sm:p-5 bg-[#1a1a24] border border-[#2a2a35] flex flex-col sm:flex-row items-center justify-between gap-4 clip-corner-card">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          {previewUrl ? (
            <div className="w-16 h-16 overflow-hidden border border-[#2a2a35] shrink-0 bg-[linear-gradient(45deg,#1a1a24_25%,transparent_25%),linear-gradient(-45deg,#1a1a24_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#1a1a24_75%),linear-gradient(-45deg,transparent_75%,#1a1a24_75%)] bg-[size:10px_10px] bg-[position:0_0,0_5px,5px_-5px,-5px_0] bg-[#14141b] clip-corner-btn">
              <img
                src={previewUrl}
                alt="Kết quả"
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain"
              />
            </div>
          ) : (
            <div className="w-14 h-14 bg-[#FF3B30] text-white flex items-center justify-center font-mono font-bold text-xs uppercase shrink-0 clip-corner-btn">
              .{format || 'FILE'}
            </div>
          )}
          <div className="space-y-1 min-w-0 flex-1">
            <p className="font-semibold text-slate-100 text-sm sm:text-base truncate">
              {fileName}
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
              {fileSize && <span>{fileSize}</span>}
              {fileSize && format && <span>•</span>}
              {format && (
                <span className="uppercase text-[#FF3B30] font-semibold">{format}</span>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <Button
            variant="primary"
            size="md"
            onClick={handleDownload}
            leftIcon={<Download className="w-4 h-4" />}
            className="flex-1 sm:flex-initial"
          >
            Tải về ngay
          </Button>
        </div>
      </div>

      {/* Security & TTL Notice */}
      <div className="flex items-center gap-2 text-xs text-amber-400 bg-amber-900/15 border border-amber-600/25 px-4 py-3 clip-corner-btn">
        <Clock className="w-4 h-4 text-amber-600 shrink-0" />
        <span>
          <strong>Lưu ý bảo mật:</strong> Tệp kết quả được lưu trữ tạm thời trong 3 phút và sẽ tự động xóa sạch khỏi hệ thống để bảo vệ quyền riêng tư của bạn.
        </span>
      </div>
    </div>
  )
}
