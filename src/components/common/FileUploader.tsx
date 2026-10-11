import { useState, useRef, type ChangeEvent, type DragEvent } from 'react'
import { UploadCloud, File as FileIcon, X, ArrowRight } from 'lucide-react'
import { Button } from './Button'

export interface FileUploaderProps {
  acceptedTypes?: string
  outputFormats: string[]
  defaultFormat: string
  actionLabel?: string
  onSubmit: (file: File, format: string) => void
  isLoading?: boolean
  disabled?: boolean
}

export function FileUploader({
  acceptedTypes = '*/*',
  outputFormats,
  defaultFormat,
  actionLabel = 'Bắt đầu xử lý',
  onSubmit,
  isLoading = false,
  disabled = false,
}: FileUploaderProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [selectedFormat, setSelectedFormat] = useState(defaultFormat)
  const [isDragging, setIsDragging] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFile = (file: File) => {
    setSelectedFile(file)
    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    } else {
      setPreviewUrl(null)
    }
  }

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleClear = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }
    setSelectedFile(null)
    setPreviewUrl(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSubmit = () => {
    if (selectedFile) {
      onSubmit(selectedFile, selectedFormat)
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes >= 1024 * 1024) {
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    }
    return `${(bytes / 1024).toFixed(1)} KB`
  }

  return (
    <div className="w-full max-w-3xl mx-auto space-y-5">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !selectedFile && fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-6 sm:p-10 text-center transition-all cursor-pointer ${
          isDragging
            ? 'border border-slate-200/80 bg-red-50/50 shadow-brand-sm'
            : selectedFile
            ? 'border-slate-300 bg-white shadow-xs cursor-default'
            : 'border-slate-200 hover:border-amber-200/70 bg-white hover:bg-slate-50/50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedTypes}
          onChange={handleInputChange}
          disabled={disabled || isLoading}
          className="hidden"
          aria-label="Upload file"
        />

        {selectedFile ? (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-2 text-left">
            <div className="flex items-center gap-4">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Xem trước ảnh"
                  className="w-16 h-16 object-cover rounded-xl border border-slate-200 shrink-0"
                />
              ) : (
                <div className="w-14 h-14 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center text-[#FF3B30] shrink-0">
                  <FileIcon className="w-7 h-7" />
                </div>
              )}
              <div className="space-y-0.5 max-w-sm sm:max-w-md">
                <p className="font-semibold text-slate-800 text-sm sm:text-base truncate">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-slate-500 font-mono">
                  Dung lượng: {formatFileSize(selectedFile.size)}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                handleClear()
              }}
              disabled={isLoading}
              className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
              title="Gỡ bỏ tệp"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-red-50/80 border border-red-200/80 flex items-center justify-center text-[#FF3B30] group-hover:scale-105 transition-transform">
              <UploadCloud className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <p className="text-base font-semibold text-slate-800">
                Kéo thả tệp tin vào đây, hoặc{' '}
                <span className="text-[#FF3B30] underline underline-offset-2">duyệt từ thiết bị</span>
              </p>
              <p className="text-xs text-slate-500">
                Hỗ trợ tải lên tối đa 50MB (Miễn phí) • Bảo mật và xóa tự động sau 24 giờ
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Format Selection & Submit Action */}
      {selectedFile && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs animate-fade-in">
          {outputFormats.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold text-slate-600">Định dạng đích:</span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {outputFormats.map((fmt) => (
                  <button
                    key={fmt}
                    type="button"
                    onClick={() => setSelectedFormat(fmt)}
                    className={`px-3 py-1 rounded-lg font-mono text-xs font-semibold uppercase transition-all cursor-pointer ${
                      selectedFormat === fmt
                        ? 'bg-brand-gradient text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200/80'
                    }`}
                  >
                    .{fmt}
                  </button>
                ))}
              </div>
            </div>
          )}

          <Button
            variant="primary"
            size="md"
            isLoading={isLoading}
            disabled={disabled || isLoading}
            onClick={handleSubmit}
            rightIcon={<ArrowRight className="w-4 h-4" />}
            className="w-full sm:w-auto px-6 py-2.5"
          >
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  )
}
