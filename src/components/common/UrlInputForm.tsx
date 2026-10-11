import { useState, type FormEvent } from 'react'
import { Link2, Clipboard, X, ArrowRight, AlertCircle } from 'lucide-react'
import { Button } from './Button'

export interface UrlInputFormProps {
  platform?: 'youtube' | 'tiktok'
  formats: string[]
  defaultFormat: string
  onSubmit: (url: string, format: string) => void
  isLoading?: boolean
  disabled?: boolean
}

export function UrlInputForm({
  platform,
  formats,
  defaultFormat,
  onSubmit,
  isLoading = false,
  disabled = false,
}: UrlInputFormProps) {
  const [url, setUrl] = useState('')
  const [selectedFormat, setSelectedFormat] = useState(defaultFormat)
  const [validationError, setValidationError] = useState<string | null>(null)

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText()
      if (text) {
        setUrl(text)
        setValidationError(null)
      }
    } catch {
      // Clipboard access might not be allowed in all browser contexts
    }
  }

  const validateUrl = (value: string): boolean => {
    const trimmed = value.trim()
    if (!trimmed) {
      setValidationError('Vui lòng nhập hoặc dán đường dẫn video.')
      return false
    }

    try {
      new URL(trimmed)
    } catch {
      setValidationError('Đường dẫn không hợp lệ. Vui lòng nhập URL bắt đầu bằng https://')
      return false
    }

    if (platform === 'youtube') {
      if (!trimmed.includes('youtube.com') && !trimmed.includes('youtu.be')) {
        setValidationError('Vui lòng nhập liên kết hợp lệ từ YouTube (youtube.com hoặc youtu.be).')
        return false
      }
    } else if (platform === 'tiktok') {
      if (!trimmed.includes('tiktok.com')) {
        setValidationError('Vui lòng nhập liên kết video hợp lệ từ TikTok (tiktok.com).')
        return false
      }
    }

    setValidationError(null)
    return true
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (validateUrl(url)) {
      onSubmit(url.trim(), selectedFormat)
    }
  }

  const placeholderText =
    platform === 'youtube'
      ? 'Dán liên kết video YouTube tại đây (ví dụ: https://www.youtube.com/watch?v=...)'
      : platform === 'tiktok'
      ? 'Dán liên kết video TikTok tại đây (ví dụ: https://www.tiktok.com/@user/video/...)'
      : 'Dán đường dẫn URL cần xử lý...'

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-3xl mx-auto space-y-4">
      <div className="relative flex flex-col sm:flex-row items-stretch sm:items-center bg-white rounded-2xl border-2 border-slate-200/90 hover:border-amber-200/60 focus-within:border border-slate-200/80 focus-within:shadow-brand-sm p-1.5 sm:p-2 transition-all">
        <div className="flex items-center flex-1 px-3 py-2 sm:py-1">
          <Link2 className="w-5 h-5 text-slate-400 shrink-0 mr-2.5" />
          <input
            type="url"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value)
              if (validationError) setValidationError(null)
            }}
            placeholder={placeholderText}
            disabled={disabled || isLoading}
            className="w-full bg-transparent text-sm sm:text-base text-slate-800 placeholder-slate-400 focus:outline-none"
            aria-label="URL input"
          />
          {url ? (
            <button
              type="button"
              onClick={() => {
                setUrl('')
                setValidationError(null)
              }}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              title="Xóa"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handlePaste}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-[#FF3B30] bg-slate-100 hover:bg-slate-200/80 rounded-lg transition-colors cursor-pointer"
              title="Dán từ bộ nhớ tạm"
            >
              <Clipboard className="w-3.5 h-3.5" />
              <span>Dán</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 pt-2 sm:pt-0 sm:pl-2 border-t sm:border-t-0 sm:border-l border-slate-100">
          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={isLoading}
            disabled={disabled || !url.trim()}
            rightIcon={<ArrowRight className="w-4 h-4" />}
            className="w-full sm:w-auto px-6 py-2.5"
          >
            Bắt đầu tải
          </Button>
        </div>
      </div>

      {/* Format Selection Pills */}
      {formats.length > 1 && (
        <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap text-xs">
          <span className="text-slate-500 font-medium mr-1">Định dạng đầu ra:</span>
          {formats.map((fmt) => (
            <button
              key={fmt}
              type="button"
              onClick={() => setSelectedFormat(fmt)}
              className={`px-3 py-1 rounded-full font-mono text-xs font-semibold uppercase transition-all cursor-pointer ${
                selectedFormat === fmt
                  ? 'bg-brand-gradient text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
              }`}
            >
              .{fmt}
            </button>
          ))}
        </div>
      )}

      {/* Validation Error Message */}
      {validationError && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs sm:text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{validationError}</span>
        </div>
      )}
    </form>
  )
}
