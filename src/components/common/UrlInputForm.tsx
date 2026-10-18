import { useEffect, useState, type FormEvent } from 'react'
import { Link2, Clipboard, X, ArrowRight, AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from './Button'
import { SegmentedControl } from './SegmentedControl'
import { t, getLang } from '../../i18n/langStore'
import { mediaApi, type UrlInfo } from '../../services/api/mediaApi'

export interface UrlInputFormProps {
  platform?: 'youtube' | 'tiktok'
  formats: string[]
  defaultFormat: string
  onSubmit: (url: string, format: string, quality: string, slides?: number[]) => void
  isLoading?: boolean
  disabled?: boolean
}

const AUDIO_FORMATS = new Set(['mp3', 'wav', 'm4a', 'aac'])
// ZIP là nguyên bộ ảnh gốc, GIF là ảnh động dựng từ đúng ảnh đó — không có chất lượng để chọn.
const NO_QUALITY_FORMATS = new Set(['zip', 'gif'])
// Ba đầu ra này dựng từ từng ảnh; MP3 của bài ảnh là nhạc nền nên không có gì để chọn.
const SLIDE_FORMATS = new Set(['zip', 'mp4', 'gif'])
// Chỉ bài ảnh TikTok mới có; được nối thêm vào danh sách format của tool khi BE trả slides.
const PHOTO_ONLY_FORMATS = ['zip', 'gif']
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

// Số liệu lớn thì card hẹp không chứa nổi "1.826.937.533 lượt xem" — dùng dạng gọn
// theo locale (vi: 1,8T / en: 1.8B).
const formatCount = (value: number, locale: string): string =>
  new Intl.NumberFormat(locale, { notation: 'compact', compactDisplay: 'short' }).format(value)

// Ngày đăng đến từ backend là "YYYY-MM-DD" (không giờ). Parse tay để new Date(iso)
// không bị coi là UTC rồi lệch sang hôm trước ở múi giờ âm.
const formatDay = (iso: string, locale: string): string => {
  const [y, mo, d] = iso.split('-').map(Number)
  if (!y || !mo || !d) return iso
  return new Date(y, mo - 1, d).toLocaleDateString(locale)
}

// Hàng metadata của card preview: chỉ những thứ backend thực sự lấy được. Thiếu thì
// ẩn hẳn, không hiện 0 hay "không rõ" — số liệu bịa còn hại hơn số liệu thiếu.
const previewMetaLine = (data: UrlInfo): string => {
  const locale = getLang() === 'vi' ? 'vi-VN' : 'en-US'
  return [
    data.duration ? formatDuration(data.duration) : null,
    data.uploader,
    data.view_count ? `${formatCount(data.view_count, locale)} ${t('urlInput.viewsLabel')}` : null,
    data.like_count ? `${formatCount(data.like_count, locale)} ${t('urlInput.likesLabel')}` : null,
    data.upload_date ? formatDay(data.upload_date, locale) : null,
  ]
    .filter(Boolean)
    .join(' · ')
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
  // Bump khi bấm Thử lại — đưa vào deps để effect preview chạy lại cùng một URL.
  const [previewAttempt, setPreviewAttempt] = useState(0)
  // Ảnh được chọn của bài ảnh TikTok; null = cả bộ (mặc định, và là những gì job cũ gửi).
  const [pickedSlides, setPickedSlides] = useState<number[] | null>(null)

  const urlValid = isValidForPlatform(url, platform)
  const trimmedUrl = url.trim()
  const fetched = previewFetched && previewFetched.key === trimmedUrl ? previewFetched : null
  const preview: { status: 'idle' | 'loading' | 'ready' | 'error'; data: UrlInfo | null } =
    !urlValid || dismissedPreviewKey === trimmedUrl
      ? { status: 'idle', data: null }
      : fetched
        ? { status: fetched.status, data: fetched.data }
        : { status: 'loading', data: null }

  // Bài ảnh TikTok = khi BE đọc được ảnh thật, không phải khi URL có /photo/: Share của app ra
  // link vt./vm. (BE mở redirect rồi vẫn đủ ảnh) còn link /share/photo/ thì BE lại không có ảnh
  // — suy từ URL vừa giấu picker với link mobile, vừa hứa chip ZIP ở nơi job sẽ chết 502.
  const slideUrls = platform === 'tiktok' ? preview.data?.slides ?? [] : []
  const isTiktokPhoto = slideUrls.length > 0
  // Bài ảnh TikTok có thêm ZIP/GIF mà link video không có.
  const visibleFormats = isTiktokPhoto
    ? [...formats, ...PHOTO_ONLY_FORMATS.filter((format) => !formats.includes(format))]
    : formats
  // Derive thay vì setState trong effect: người dùng sửa link ảnh thành link video thì
  // selectedFormat vẫn mang 'zip', radios không còn cái nào được chọn và handleSubmit sẽ
  // gửi zip cho video thường (BE trả 400).
  const activeFormat = visibleFormats.includes(selectedFormat) ? selectedFormat : defaultFormat

  // 1 ảnh thì chẳng có gì để chọn; ZIP/MP4 của bài ảnh mới dựng output từ từng ảnh.
  const showSlidePicker = SLIDE_FORMATS.has(activeFormat.toLowerCase()) && slideUrls.length > 1
  const selectedSlides = pickedSlides ?? slideUrls.map((_, index) => index + 1)
  const allSlidesSelected = selectedSlides.length === slideUrls.length

  const toggleSlide = (slide: number) => {
    const next = selectedSlides.includes(slide)
      ? selectedSlides.filter((value) => value !== slide)
      : [...selectedSlides, slide].sort((a, b) => a - b)
    // Bỏ chọn ảnh cuối cùng = job không có gì để tải, BE sẽ 400 — chặn ngay ở đây.
    if (next.length === 0) return
    setPickedSlides(next)
  }

  // Dán link xong debounce 700ms rồi mới fetch preview — tránh gọi oEmbed mỗi lần gõ.
  // /media/url-info là endpoint public nên khách chưa đăng nhập vẫn thấy preview;
  // BE đã có negative cache, FE vẫn hủy request của URL cũ để không dồn lượt gọi.
  useEffect(() => {
    if (!isValidForPlatform(url, platform)) return
    const controller = new AbortController()
    const key = url.trim()
    const timer = setTimeout(async () => {
      try {
        const data = await mediaApi.getUrlInfo(key, controller.signal)
        setPreviewFetched({ key, status: 'ready', data })
      } catch {
        // Chính ta abort vì URL đã đổi: đây không phải lỗi, đừng báo "không xem trước được".
        if (!controller.signal.aborted) setPreviewFetched({ key, status: 'error', data: null })
      }
    }, 700)
    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [url, platform, previewAttempt])

  const qualityOptions = NO_QUALITY_FORMATS.has(activeFormat.toLowerCase())
    ? []
    : qualityOptionsFor(activeFormat)

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
        setPickedSlides(null)
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
      // Chọn cả bộ thì không gửi `slides`: thiếu key đã là "tất cả" với job cũ và với BE.
      const slides = showSlidePicker && !allSlidesSelected ? selectedSlides : undefined
      onSubmit(url.trim(), activeFormat, selectedQuality, slides)
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
              // Ảnh đã chọn thuộc về bài cũ: dán bài khác phải quay lại "cả bộ".
              setPickedSlides(null)
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
        <div className="in-fade flex items-center gap-3 p-2 bg-surface border border-[rgba(255,59,48,0.30)] clip-corner-card">
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
              {previewMetaLine(preview.data)}
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
        <div className="in-fade flex items-center gap-3 p-2 bg-surface border border-edge clip-corner-card">
          <p className="flex-1 min-w-0 text-xs text-slate-400">{t('urlInput.previewFailed')}</p>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => {
              // Về null để khung skeleton hiện lại thay vì giữ nguyên dòng lỗi.
              setPreviewFetched(null)
              setPreviewAttempt((a) => a + 1)
            }}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />}
          >
            {t('urlInput.retry')}
          </Button>
        </div>
      )}

      {/* Format + Quality Segmented Controls — hiện sau khi link hợp lệ */}
      {urlValid && (visibleFormats.length > 1 || qualityOptions.length > 1) && (
        <div className="in-fade flex items-center justify-center sm:justify-start gap-4 flex-wrap text-xs">
          {visibleFormats.length > 1 && (
            <>
              <span className="text-slate-400 font-medium whitespace-nowrap">{t('urlInput.outputFormat')}</span>
              <SegmentedControl
                options={visibleFormats}
                value={activeFormat}
                onChange={handleFormatChange}
                ariaLabel={t('urlInput.outputFormat')}
              />
            </>
          )}
          {qualityOptions.length > 1 && (
            <>
              <span className="text-slate-400 font-medium whitespace-nowrap">{t('urlInput.quality')}</span>
              <SegmentedControl
                options={qualityOptions}
                value={selectedQuality}
                onChange={setSelectedQuality}
                ariaLabel={t('urlInput.quality')}
                labelFor={qualityLabel}
              />
            </>
          )}
        </div>
      )}

      {/* Bộ chọn ảnh của bài ảnh TikTok: bỏ bớt ảnh khỏi ZIP/MP4 thay vì tải cả bộ */}
      {showSlidePicker && (
        <div className="in-fade">
          <div className="flex items-center justify-between gap-2 mb-1.5 text-xs">
            <span className="text-slate-400 font-medium whitespace-nowrap">{t('urlInput.slides')}</span>
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-mono">
                {selectedSlides.length}/{slideUrls.length}
              </span>
              {!allSlidesSelected && (
                <button
                  type="button"
                  onClick={() => setPickedSlides(null)}
                  className="px-2 py-0.5 font-medium text-slate-300 hover:text-brand bg-elev hover:bg-brand/10 border border-edge transition-colors cursor-pointer clip-corner-btn"
                >
                  {t('urlInput.slidesAll')}
                </button>
              )}
            </div>
          </div>
          <div
            role="group"
            aria-label={t('urlInput.slides')}
            className="grid grid-cols-4 sm:grid-cols-6 gap-1.5"
          >
            {slideUrls.map((src, index) => {
              const slide = index + 1
              const picked = selectedSlides.includes(slide)
              return (
                <button
                  key={src}
                  type="button"
                  aria-pressed={picked}
                  aria-label={`${t('urlInput.slides')} ${slide}`}
                  onClick={() => toggleSlide(slide)}
                  className={`relative aspect-[3/4] overflow-hidden border transition-all cursor-pointer clip-corner-btn ${
                    picked
                      ? 'border-brand ring-2 ring-brand/40'
                      : 'border-edge opacity-40 hover:opacity-80'
                  }`}
                >
                  <img
                    src={src}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover pointer-events-none"
                  />
                  <span className="absolute bottom-0.5 left-1 text-[10px] font-mono text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                    {slide}
                  </span>
                </button>
              )
            })}
          </div>
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
