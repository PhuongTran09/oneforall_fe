import { useEffect, useState, type FormEvent } from 'react'
import { Link2, Clipboard, X, ArrowRight, AlertCircle, RefreshCw, Video, Play, MonitorPlay } from 'lucide-react'
import { Button } from './Button'
import { SegmentedControl } from './SegmentedControl'
import { t, getLang } from '../../i18n/langStore'
import { showToast } from '../feedback/toastStore'
import { describeError, readErrorMeta } from '../../utils/apiError'
import { ApiClientError } from '../../services/api/types'
import { mediaApi, type UrlInfo } from '../../services/api/mediaApi'
import type { UrlPlatform } from '../../config/seoTools'

export interface UrlInputFormProps {
  platform?: UrlPlatform
  formats: string[]
  defaultFormat: string
  onSubmit: (url: string, format: string, quality: string, slides?: number[]) => void
  isLoading?: boolean
  disabled?: boolean
}




type PickerItem = { index: number; kind: 'photo' | 'video'; thumb: string | null }


type PlayableItem = { index: number; token: string }

const AUDIO_FORMATS = new Set(['mp3', 'wav', 'm4a', 'aac'])


const NO_QUALITY_FORMATS = new Set(['zip', 'gif', 'jpg'])

const SLIDE_FORMATS = new Set(['zip', 'mp4', 'gif'])

const PHOTO_ONLY_FORMATS = ['zip', 'gif']
const VIDEO_QUALITIES = ['best', '1080p', '720p', '480p']
const AUDIO_QUALITIES = ['128', '192', '320']




const VIDEO_QUALITY_PLATFORMS: readonly UrlPlatform[] = ['youtube', 'tiktok', 'twitter']

const qualityOptionsFor = (format: string) =>
  AUDIO_FORMATS.has(format.toLowerCase()) ? AUDIO_QUALITIES : VIDEO_QUALITIES
const defaultQualityFor = (format: string) =>
  AUDIO_FORMATS.has(format.toLowerCase()) ? '192' : 'best'




const PLATFORM_HOSTS: Record<UrlPlatform, readonly string[]> = {
  youtube: ['youtube.com', 'youtu.be'],
  tiktok: ['tiktok.com'],
  twitter: ['x.com', 'twitter.com', 't.co'],

  facebook: ['facebook.com', 'fb.watch'],
  threads: ['threads.com', 'threads.net'],
}
const PLATFORM_ERROR_KEYS: Record<UrlPlatform, string> = {
  youtube: 'urlInput.youtubeOnly',
  tiktok: 'urlInput.tiktokOnly',
  twitter: 'urlInput.twitterOnly',
  facebook: 'urlInput.facebookOnly',
  threads: 'urlInput.threadsOnly',
}

const PLATFORM_PLACEHOLDERS: Record<UrlPlatform, string> = {
  youtube: 'urlInput.placeholderYoutube',
  tiktok: 'urlInput.placeholderTiktok',
  twitter: 'urlInput.placeholderTwitter',
  facebook: 'urlInput.placeholderFacebook',
  threads: 'urlInput.placeholderThreads',
}




const THREADS_UNSUPPORTED_KEYS: Record<string, string> = {
  text: 'urlInput.threadsUnsupported.text',
}
const THREADS_UNSUPPORTED_FALLBACK = 'urlInput.threadsUnsupported.unknown'



const THREADS_KIND_FORMATS: Record<string, readonly string[]> = {
  photo: ['jpg'],
  video: ['mp4', 'mp3', 'zip'],
  carousel: ['zip'],
}




const TERMINAL_PREVIEW_CODES = new Set(['LINK_POST_REMOVED', 'LINK_POST_RESTRICTED'])

const hostnameOf = (value: string): string => {
  try {
    return new URL(value).hostname.toLowerCase()
  } catch {
    return ''
  }
}

const matchesPlatform = (host: string, platform: UrlPlatform): boolean =>
  PLATFORM_HOSTS[platform].some((domain) => host === domain || host.endsWith(`.${domain}`))

const isValidForPlatform = (value: string, platform?: UrlPlatform): boolean => {
  const host = hostnameOf(value.trim())
  if (!host) return false
  return platform ? matchesPlatform(host, platform) : true
}

const formatDuration = (seconds: number): string => {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  const mmss = h > 0 ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}` : `${m}:${String(s).padStart(2, '0')}`
  return mmss
}

const formatCount = (value: number, locale: string): string =>
  new Intl.NumberFormat(locale, { notation: 'compact', compactDisplay: 'short' }).format(value)

const formatDay = (iso: string, locale: string): string => {
  const [y, mo, d] = iso.split('-').map(Number)
  if (!y || !mo || !d) return iso
  return new Date(y, mo - 1, d).toLocaleDateString(locale)
}

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
  const [previewFetched, setPreviewFetched] = useState<{
    key: string
    status: 'ready' | 'error'
    data: UrlInfo | null
    message?: string
    code?: string
    postCode?: string | null
  } | null>(null)
  const [previewAttempt, setPreviewAttempt] = useState(0)
  const [pickedSlides, setPickedSlides] = useState<number[] | null>(null)
  const [playing, setPlaying] = useState<{ key: string; index: number } | null>(null)
  const [playFailed, setPlayFailed] = useState(false)
  const [deadToken, setDeadToken] = useState<string | null>(null)
  const [embedLoadedFor, setEmbedLoadedFor] = useState<string | null>(null)
  const [embedRatio, setEmbedRatio] = useState<{ url: string; value: number } | null>(null)

  const urlValid = isValidForPlatform(url, platform)
  const trimmedUrl = url.trim()
  const fetched = previewFetched && previewFetched.key === trimmedUrl ? previewFetched : null
  const preview: { status: 'idle' | 'loading' | 'ready' | 'error'; data: UrlInfo | null } = !urlValid
    ? { status: 'idle', data: null }
    : fetched
      ? { status: fetched.status, data: fetched.data }
      : { status: 'loading', data: null }

  const mediaKind = platform === 'threads' ? preview.data?.media_kind : undefined
  const threadItems = platform === 'threads' ? (preview.data?.media_items ?? null) : null
  const playableItems: PlayableItem[] = threadItems
    ? threadItems.flatMap((item) =>
        item.kind === 'video' && item.preview_token ? [{ index: item.index, token: item.preview_token }] : [],
      )
    : []
  const playingItem =
    playing && playing.key === trimmedUrl
      ? (playableItems.find((item) => item.index === playing.index) ?? null)
      : null
  const readyData = preview.status === 'ready' ? preview.data : null
  const embedUrl = readyData?.embed_url ?? null
  const embedHost = embedUrl ? embedUrl.slice(embedUrl.indexOf('//') + 2).split('/')[0] : ''
  const embedAspect = embedRatio && embedRatio.url === trimmedUrl ? String(embedRatio.value) : '0.5625'
  const mediaCount = platform === 'threads' ? preview.data?.media_count : undefined
  const multiItems = threadItems != null && threadItems.length > 1
  const unsupportedMessage = (() => {
    if (!mediaKind) return null
    if (mediaKind === 'video') {
      return mediaCount === 0 ? t('urlInput.threadsUnsupported.videoGone') : null
    }
    if (mediaKind === 'photo') return null
    if (mediaKind === 'carousel') {
      return multiItems ? null : t('urlInput.threadsUnsupported.itemsUnreadable')
    }
    return t(THREADS_UNSUPPORTED_KEYS[mediaKind] ?? THREADS_UNSUPPORTED_FALLBACK)
  })()

  const hostNote = !urlValid && trimmedUrl
    ? (hostnameOf(trimmedUrl) && platform ? t(PLATFORM_ERROR_KEYS[platform]) : t('urlInput.invalid'))
    : null

  const slideUrls = preview.data?.slides ?? []
  const isPhotoPost = slideUrls.length > 0
  const slideFormats = isPhotoPost
    ? [...formats, ...PHOTO_ONLY_FORMATS.filter((format) => !formats.includes(format))]
    : formats
  const kindFormats = (() => {
    if (platform !== 'threads' || !mediaKind) return undefined
    const listed = THREADS_KIND_FORMATS[mediaKind]
    return listed && listed.filter((format) => format !== 'zip' || multiItems)
  })()
  const visibleFormats = kindFormats
    ? slideFormats.filter((format) => kindFormats.includes(format))
    : slideFormats
  const activeFormat = visibleFormats.includes(selectedFormat)
    ? selectedFormat
    : (visibleFormats[0] ?? defaultFormat)

  const showSlidePicker = SLIDE_FORMATS.has(activeFormat.toLowerCase()) && slideUrls.length > 1
  const pickerItems: PickerItem[] = threadItems
    ? threadItems.map((item) => ({ index: item.index, kind: item.kind, thumb: item.thumb }))
    : slideUrls.map((src, index) => ({ index: index + 1, kind: 'photo' as const, thumb: src }))
  const showItemPicker = threadItems != null ? multiItems : showSlidePicker
  const selectedSlides = pickedSlides ?? pickerItems.map((item) => item.index)
  const allSlidesSelected = selectedSlides.length === pickerItems.length
  const pickerLabel = threadItems != null ? t('urlInput.threadsItemPicker') : t('urlInput.slides')
  const pickedKind = (index: number): string | undefined =>
    pickerItems.find((item) => item.index === index)?.kind

  const toggleSlide = (slide: number) => {
    const next = selectedSlides.includes(slide)
      ? selectedSlides.filter((value) => value !== slide)
      : [...selectedSlides, slide].sort((a, b) => a - b)
    if (next.length === 0) return
    setPickedSlides(next)
  }

  const selectionHint =
    threadItems == null || unsupportedMessage || !['mp4', 'mp3'].includes(activeFormat.toLowerCase())
      ? null
      : selectedSlides.length === 1 && pickedKind(selectedSlides[0]) === 'video'
        ? null
        : t('urlInput.threadsPickOneVideo')

  const canStart = urlValid && fetched?.status === 'ready' && !unsupportedMessage && !selectionHint

  useEffect(() => {
    if (!isValidForPlatform(url, platform)) return
    const controller = new AbortController()
    const key = url.trim()
    const timer = setTimeout(async () => {
      try {
        const data = await mediaApi.getUrlInfo(key, controller.signal)
        setPreviewFetched({ key, status: 'ready', data })
      } catch (err) {
        if (controller.signal.aborted) return
        const meta = err instanceof ApiClientError ? readErrorMeta(err) : {}
        const postCode = typeof meta.params?.post_code === 'string' ? meta.params.post_code : null
        setPreviewFetched({
          key,
          status: 'error',
          data: null,
          message: describeError(err, undefined, {
            keySuffix: platform === 'threads' ? 'Threads' : undefined,
          }).message,
          code: meta.code,
          postCode,
        })
      }
    }, 700)
    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [url, platform, previewAttempt])

  const isAudioFormat = AUDIO_FORMATS.has(activeFormat.toLowerCase())
  const offersVideoTiers = !platform || VIDEO_QUALITY_PLATFORMS.includes(platform)
  const qualityOptions =
    NO_QUALITY_FORMATS.has(activeFormat.toLowerCase()) || (!isAudioFormat && !offersVideoTiers)
      ? []
      : qualityOptionsFor(activeFormat)

  const handleFormatChange = (format: string) => {
    setSelectedFormat(format)
    setSelectedQuality(defaultQualityFor(format))
  }

  const qualityLabel = (option: string) =>
    option === 'best' ? t('urlInput.qualityBest') : AUDIO_QUALITIES.includes(option) ? `${option} kbps` : option

  const clearLink = () => {
    setUrl('')
    setValidationError(null)
    setPickedSlides(null)
    setPlaying(null)
    setPlayFailed(false)
    setDeadToken(null)
    setEmbedLoadedFor(null)
    setEmbedRatio(null)
    setPreviewFetched(null)
  }

  const refetchPreview = () => {
    setPreviewFetched(null)
    setPlayFailed(false)
    setPreviewAttempt((attempt) => attempt + 1)
  }

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText()
      if (text) {
        setUrl(text)
        setPickedSlides(null)
        validateUrl(text)
      }
    } catch {
      showToast({ type: 'info', message: t('urlInput.pasteBlocked') })
    }
  }

  const validateUrl = (value: string): boolean => {
    const trimmed = value.trim()
    if (!trimmed) {
      setValidationError(t('urlInput.empty'))
      return false
    }

    const host = hostnameOf(trimmed)
    if (!host) {
      setValidationError(t('urlInput.invalid'))
      return false
    }

    if (platform && !matchesPlatform(host, platform)) {
      setValidationError(t(PLATFORM_ERROR_KEYS[platform]))
      return false
    }

    setValidationError(null)
    return true
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!validateUrl(url)) return
    if (!canStart) {
      setValidationError(unsupportedMessage ?? selectionHint ?? fetched?.message ?? t('urlInput.waitingPreview'))
      return
    }
    const slides = showItemPicker && !allSlidesSelected ? selectedSlides : undefined
    onSubmit(url.trim(), activeFormat, selectedQuality, slides)
  }

  const placeholderText = platform
    ? t(PLATFORM_PLACEHOLDERS[platform])
    : t('urlInput.placeholderGeneric')

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-3xl mx-auto space-y-4">
      <div className="relative flex flex-col sm:flex-row items-stretch sm:items-center bg-surface/90 border-2 border-[rgba(255,59,48,0.30)] hover:border-[rgba(255,59,48,0.65)] focus-within:border-brand p-1.5 sm:p-2 transition-all clip-corner-lg input-3d card-hover-glow">
        <div className="flex items-center flex-1 px-3 py-2 sm:py-1">
          <Link2 className="w-5 h-5 text-slate-400 shrink-0 mr-2.5" />
          <input
            type="url"
            value={url}
            onChange={(e) => {
              const value = e.target.value
              setUrl(value)
              setPickedSlides(null)
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
              onClick={clearLink}
              className="-m-1 grid min-h-8 min-w-8 shrink-0 place-items-center text-slate-400 hover:text-slate-200 clip-corner-btn focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#FF4545]/60"
              aria-label={t('common.clear')}
              title={t('common.clear')}
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handlePaste}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-300 hover:text-brand bg-elev hover:bg-brand/10 border border-edge transition-colors cursor-pointer clip-corner-btn focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#FF4545]/60"
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
            disabled={disabled || !canStart}
            title={
              canStart
                ? undefined
                : (hostNote ??
                  unsupportedMessage ??
                  selectionHint ??
                  fetched?.message ??
                  t('urlInput.waitingPreview'))
            }
            rightIcon={<ArrowRight className="w-4 h-4" />}
            className="w-full sm:w-auto px-6 py-2.5 btn-shimmer shadow-[0_0_18px_rgba(255,59,48,0.25)]"
          >
            {t('urlInput.startDownload')}
          </Button>
        </div>
      </div>


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
              onLoad={(e) => {
                const { naturalWidth: w, naturalHeight: h } = e.currentTarget
                if (w > 0 && h > 0) setEmbedRatio({ url: trimmedUrl, value: w / h })
              }}
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

            {unsupportedMessage && (
              <p className="mt-1 text-xs text-amber-300">{unsupportedMessage}</p>
            )}
          </div>
        </div>
      )}
      {preview.status === 'error' && (
        <div className="in-fade flex items-center gap-3 p-2 bg-surface border border-edge clip-corner-card">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-slate-400">
              {fetched?.message ?? t('urlInput.previewFailed')}
            </p>



            {fetched?.postCode && (
              <p className="mt-1 text-xs text-slate-500 font-mono break-all">
                {t('urlInput.postCode', { n: fetched.postCode })}
              </p>
            )}
          </div>


          {!TERMINAL_PREVIEW_CODES.has(fetched?.code ?? '') && (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={refetchPreview}
              leftIcon={<RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />}
            >
              {t('urlInput.retry')}
            </Button>
          )}
        </div>
      )}



      {readyData && playableItems.length > 0 && (
        <div className="in-fade flex flex-wrap items-center gap-1.5">
          {playableItems.map((item) => {
            const active = playingItem?.index === item.index
            return (
              <button
                key={item.index}
                type="button"
                aria-pressed={active}
                onClick={() => {
                  setPlayFailed(false)
                  setPlaying(active ? null : { key: trimmedUrl, index: item.index })
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium border transition-colors cursor-pointer clip-corner-btn ${
                  active
                    ? 'border-brand text-brand bg-brand/10'
                    : 'border-edge text-slate-300 hover:text-brand hover:bg-elev bg-elev'
                }`}
              >
                <Play className="w-3.5 h-3.5" aria-hidden="true" />
                {t('urlInput.playVideo', { n: item.index })}
              </button>
            )
          })}
        </div>
      )}
      {playingItem && (
        <div className="in-fade space-y-1.5">


          {playingItem.token !== deadToken && (
            <video
              controls
              preload="none"
              playsInline
              poster={readyData?.thumbnail ?? undefined}
              src={mediaApi.getPreviewUrl(playingItem.token)}
              onError={() => {
                setDeadToken(playingItem.token)
                setPlayFailed(true)
              }}
              className="w-full aspect-video max-h-[60vh] bg-black rounded-lg border border-edge"
            />
          )}



          {(playFailed || playingItem.token === deadToken) && (
            <div className="flex items-center gap-3">
              <p className="flex-1 min-w-0 text-xs text-slate-400">{t('urlInput.previewPlayFailed')}</p>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={refetchPreview}
                leftIcon={<RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />}
              >
                {t('urlInput.retry')}
              </Button>
            </div>
          )}
          <button
            type="button"
            onClick={() => {
              setPlaying(null)
              setPlayFailed(false)
              setDeadToken(null)
            }}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" aria-hidden="true" />
            {t('urlInput.hideVideo')}
          </button>
        </div>
      )}








      {embedUrl && (
        <div className="in-fade mx-auto w-full max-w-[338px] space-y-1.5">
          <div className="clip-corner-card border border-[rgba(255,59,48,0.30)] bg-surface p-2">
            <div className="flex items-center gap-1.5 px-1 pb-2 text-xs">
              <MonitorPlay className="w-3.5 h-3.5 text-brand shrink-0" aria-hidden="true" />
              <span className="font-medium text-slate-300 truncate">{t('urlInput.embedTitle')}</span>
              <span className="ml-auto shrink-0 font-mono text-[11px] text-slate-500">
                {embedLoadedFor === trimmedUrl ? embedHost : t('urlInput.embedLoading')}
              </span>
            </div>
            <iframe
              title={t('urlInput.embedTitle')}
              src={embedUrl}
              sandbox="allow-scripts allow-same-origin allow-popups allow-presentation"
              allow="fullscreen; encrypted-media; picture-in-picture"
              loading="lazy"
              onLoad={() => setEmbedLoadedFor(trimmedUrl)}
              style={{ aspectRatio: embedAspect }}
              className="block w-full rounded-lg bg-black"
            />
          </div>
          <p className="px-1 text-xs leading-relaxed text-slate-400">{t('urlInput.embedNote')}</p>
        </div>
      )}


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



      {showItemPicker && (
        <div className="in-fade">
          <div className="flex items-center justify-between gap-2 mb-1.5 text-xs">
            <span className="text-slate-400 font-medium whitespace-nowrap">{pickerLabel}</span>
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-mono">
                {selectedSlides.length}/{pickerItems.length}
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
            aria-label={pickerLabel}
            className="grid grid-cols-4 sm:grid-cols-6 gap-1.5"
          >
            {pickerItems.map((item) => {
              const picked = selectedSlides.includes(item.index)
              return (
                <button
                  key={`${item.kind}-${item.index}`}
                  type="button"
                  aria-pressed={picked}
                  aria-label={`${pickerLabel} ${item.index}`}
                  onClick={() => toggleSlide(item.index)}
                  className={`relative aspect-[3/4] overflow-hidden border transition-all cursor-pointer clip-corner-btn ${
                    picked
                      ? 'border-brand ring-2 ring-brand/40'
                      : 'border-edge opacity-40 hover:opacity-80'
                  }`}
                >
                  {item.thumb ? (
                    <img
                      src={item.thumb}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover pointer-events-none"
                    />
                  ) : (
                    <span className="flex w-full h-full flex-col items-center justify-center gap-1 bg-elev text-slate-300">
                      <Video className="w-5 h-5" aria-hidden="true" />
                      <span className="text-[10px] font-mono">
                        {t('urlInput.threadsVideoTile', { n: item.index })}
                      </span>
                    </span>
                  )}
                  <span className="absolute bottom-0.5 left-1 text-[10px] font-mono text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                    {item.index}
                  </span>
                </button>
              )
            })}
          </div>
          {selectionHint && <p className="mt-1.5 text-xs text-amber-300">{selectionHint}</p>}
        </div>
      )}


      {validationError && (
        <div className="flex items-center gap-2 p-3 bg-brand/10 border border-brand/30 text-red-400 text-xs sm:text-sm clip-corner-btn">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{validationError}</span>
        </div>
      )}
    </form>
  )
}
