import { useEffect, useState, type FormEvent } from 'react'
import { Link2, Clipboard, X, ArrowRight, AlertCircle } from 'lucide-react'
import { Button } from './Button'
import { SegmentedControl } from './SegmentedControl'
import { t } from '../../i18n/langStore'
import { mediaApi, type UrlInfo } from '../../services/api/mediaApi'
import { useAuth } from '../../services/authStore'

export interface UrlInputFormProps {
  platform?: 'youtube' | 'tiktok'
  formats: string[]
  defaultFormat: string
  onSubmit: (url: string, format: string, quality: string) => void
  isLoading?: boolean
  disabled?: boolean
}

const AUDIO_FORMATS = new Set(['mp3', 'wav', 'm4a', 'aac'])
const VIDEO_QUALITIES = ['best', '1080p', '720p', '480p']
const AUDIO_QUALITIES = ['128', '192', '320']

const qualityOptionsFor = (format: string) =>
  AUDIO_FORMATS.has(format.toLowerCase()) ? AUDIO_QUALITIES : VIDEO_QUALITIES
const defaultQualityFor = (format: string) =>
  AUDIO_FORMATS.has(format.toLowerCase()) ? '192' : 'best'

// Bản pure của validateUrl bên dưới (không set error) — dùng cho effect preview.
const isValidForPlatform = (value: string, platform?: 'youtube' | 'tiktok'): boolean => {
  const trimmed = value.trim()
  if (!trimmed) return false
  try {
    new URL(trimmed)
  } catch {
    return false
  }
  if (platform === 'youtube') return trimmed.includes('youtube.com') || trimmed.includes('youtu.be')
  if (platform === 'tiktok') return trimmed.includes('tiktok.com')
  return true
}

const formatDuration = (seconds: number): string => {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  const mmss = h > 0 ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}` : `${m}:${String(s).padStart(2, '0')}`
  return mmss
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
  const [selectedQuality, setSelectedQuality] = useState(() => defaultQualityFor(defaultFormat))
  const [validationError, setValidationError] = useState<string | null>(null)
  // Chỉ KẾT QUẢ fetch (bất đồng bộ) mới là state; idle/loading/error của URL hiện tại
  // được derive bên dưới — effect không setState đồng bộ (rule react-hooks/set-state-in-effect).
  const [previewFetched, setPreviewFetched] = useState<{
    key: string
    status: 'ready' | 'error'
    data: UrlInfo | null
  } | null>(null)
  const [dismissedPreviewKey, setDismissedPreviewKey] = useState<string | null>(null)
  const { session } = useAuth()

  const urlValid = isValidForPlatform(url, platform)
  const trimmedUrl = url.trim()
  const fetched = previewFetched && previewFetched.key === trimmedUrl ? previewFetched : null
  const preview: { status: 'idle' | 'loading' | 'ready' | 'error'; data: UrlInfo | null } =
    !urlValid || !session || dismissedPreviewKey === trimmedUrl
      ? { status: 'idle', data: null }
      : fetched
        ? { status: fetched.status, data: fetched.data }
        : { status: 'loading', data: null }

  // Dán link xong debounce 700ms rồi mới fetch preview — tránh gọi oEmbed mỗi lần gõ.
  // /media/url-info cần Bearer (AUTH_REQUIRED_MEDIA=true) → khách chưa đăng nhập thì không
  // gọi, nếu không mỗi link dán vào sẽ trả 401 và báo "không xem trước được" sai nguyên nhân.
  useEffect(() => {
    if (!session || !isValidForPlatform(url, platform)) return
    let cancelled = false
    const key = url.trim()
    const timer = setTimeout(async () => {
      try {
        const data = await mediaApi.getUrlInfo(key)
        if (!cancelled) setPreviewFetched({ key, status: 'ready', data })
      } catch {
        if (!cancelled) setPreviewFetched({ key, status: 'error', data: null })
      }
    }, 700)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [url, platform, session])

  const qualityOptions = qualityOptionsFor(selectedFormat)

  const handleFormatChange = (format: string) => {
    setSelectedFormat(format)
    setSelectedQuality(defaultQualityFor(format))
  }

  const qualityLabel = (option: string) =>
    option === 'best' ? t('urlInput.qualityBest') : AUDIO_QUALITIES.includes(option) ? `${option} kbps` : option

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText()
      if (text) {
        setUrl(text)
        validateUrl(text)
      }
    } catch {
      // Clipboard access might not be allowed in all browser contexts
    }
  }

  const validateUrl = (value: string): boolean => {
    const trimmed = value.trim()
    if (!trimmed) {
      setValidationError(t('urlInput.empty'))
      return false
    }

    try {
      new URL(trimmed)
    } catch {
      setValidationError(t('urlInput.invalid'))
      return false
    }

    if (platform === 'youtube') {
      if (!trimmed.includes('youtube.com') && !trimmed.includes('youtu.be')) {
        setValidationError(t('urlInput.youtubeOnly'))
        return false
      }
    } else if (platform === 'tiktok') {
      if (!trimmed.includes('tiktok.com')) {
        setValidationError(t('urlInput.tiktokOnly'))
        return false
      }
    }

    setValidationError(null)
    return true
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (validateUrl(url)) {
      onSubmit(url.trim(), selectedFormat, selectedQuality)
    }
  }

  const placeholderText =
    platform === 'youtube'
      ? t('urlInput.placeholderYoutube')
      : platform === 'tiktok'
      ? t('urlInput.placeholderTiktok')
      : t('urlInput.placeholderGeneric')

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-3xl mx-auto space-y-4">
      <div className="relative flex flex-col sm:flex-row items-stretch sm:items-center bg-surface border-2 border-[rgba(255,59,48,0.30)] hover:border-[rgba(255,59,48,0.55)] focus-within:border-[rgba(255,59,48,0.55)] p-1.5 sm:p-2 transition-all clip-corner-lg input-3d">
        <div className="flex items-center flex-1 px-3 py-2 sm:py-1">
          <Link2 className="w-5 h-5 text-slate-400 shrink-0 mr-2.5" />
          <input
            type="url"
            value={url}
            onChange={(e) => {
              const value = e.target.value
              setUrl(value)
              setDismissedPreviewKey(null)
              // Dán link (nhảy >=4 ký tự cùng lúc) -> báo lỗi sai platform ngay, không đợi bấm nút.
              if (value.length - url.length >= 4) {
                validateUrl(value)
              } else if (validationError) {
                setValidationError(null)
              }
            }}
            placeholder={placeholderText}
            disabled={disabled || isLoading}
            className="w-full bg-transparent text-sm sm:text-base text-slate-100 placeholder-slate-400 focus:outline-none"
            aria-label={t('urlInput.aria')}
          />
          {url ? (
            <button
              type="button"
              onClick={() => {
                setUrl('')
                setValidationError(null)
              }}
              className="p-1 text-slate-400 hover:text-slate-200 clip-corner-btn"
              title={t('common.clear')}
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handlePaste}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-300 hover:text-brand bg-elev hover:bg-brand/10 border border-edge transition-colors cursor-pointer clip-corner-btn"
              title={t('urlInput.pasteFromClipboard')}
            >
              <Clipboard className="w-3.5 h-3.5" />
              <span>{t('urlInput.paste')}</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 pt-2 sm:pt-0 sm:pl-2 border-t sm:border-t-0 sm:border-l border-edge/60">
          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={isLoading}
            disabled={disabled || !url.trim()}
            rightIcon={<ArrowRight className="w-4 h-4" />}
            className="w-full sm:w-auto px-6 py-2.5"
          >
            {t('urlInput.startDownload')}
          </Button>
        </div>
      </div>

      {/* Link preview (review) */}
      {preview.status === 'loading' && (
        <div className="flex items-center gap-3 p-2 bg-surface border border-edge clip-corner-card animate-pulse" aria-hidden="true">
          <div className="w-16 h-16 bg-elev border border-edge shrink-0 clip-corner-btn" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-2/3 bg-elev rounded" />
            <div className="h-2.5 w-1/3 bg-elev rounded" />
          </div>
        </div>
      )}
      {preview.status === 'ready' && preview.data && (
        <div className="flex items-center gap-3 p-2 bg-surface border border-[rgba(255,59,48,0.30)] clip-corner-card">
          {preview.data.thumbnail ? (
            <img
              src={preview.data.thumbnail}
              alt=""
              referrerPolicy="no-referrer"
              className="w-16 h-16 object-cover border border-edge shrink-0 clip-corner-btn"
            />
          ) : (
            <div className="w-16 h-16 bg-brand/10 border border-brand/30 flex items-center justify-center shrink-0 clip-corner-btn">
              <Link2 className="w-5 h-5 text-brand" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-slate-100 text-sm truncate">{preview.data.title || url}</p>
            <p className="text-xs text-slate-400 font-mono truncate">
              {[
                preview.data.duration ? formatDuration(preview.data.duration) : null,
                preview.data.uploader,
              ]
                .filter(Boolean)
                .join(' · ')}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setDismissedPreviewKey(trimmedUrl)
            }}
            className="p-1.5 text-slate-400 hover:text-slate-200 clip-corner-btn"
            title={t('common.clear')}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      {preview.status === 'error' && (
        <p className="text-xs text-slate-400">{t('urlInput.previewFailed')}</p>
      )}

      {/* Format + Quality Segmented Controls — hiện sau khi link hợp lệ */}
      {urlValid && formats.length > 0 && qualityOptions.length > 1 && (
        <div className="flex items-center justify-center sm:justify-start gap-4 flex-wrap text-xs">
          {formats.length > 1 && (
            <>
              <span className="text-slate-400 font-medium whitespace-nowrap">{t('urlInput.outputFormat')}</span>
              <SegmentedControl
                options={formats}
                value={selectedFormat}
                onChange={handleFormatChange}
                ariaLabel={t('urlInput.outputFormat')}
              />
            </>
          )}
          <span className="text-slate-400 font-medium whitespace-nowrap">{t('urlInput.quality')}</span>
          <SegmentedControl
            options={qualityOptions}
            value={selectedQuality}
            onChange={setSelectedQuality}
            ariaLabel={t('urlInput.quality')}
            labelFor={qualityLabel}
          />
        </div>
      )}

      {/* Validation Error Message */}
      {validationError && (
        <div className="flex items-center gap-2 p-3 bg-brand/10 border border-brand/30 text-red-400 text-xs sm:text-sm clip-corner-btn">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{validationError}</span>
        </div>
      )}
    </form>
  )
}
