import { useState, type FormEvent } from 'react'
import { Link2, Clipboard, X, ArrowRight, AlertCircle } from 'lucide-react'
import { Button } from './Button'
import { SegmentedControl } from './SegmentedControl'
import { t } from '../../i18n/langStore'

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
      onSubmit(url.trim(), selectedFormat)
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
              setUrl(e.target.value)
              if (validationError) setValidationError(null)
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
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-300 hover:text-[#FF3B30] bg-elev hover:bg-[#ff3b30]/10 border border-edge transition-colors cursor-pointer clip-corner-btn"
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

      {/* Format Segmented Control */}
      {formats.length > 1 && (
        <div className="flex items-center justify-center sm:justify-start gap-4 flex-wrap text-xs">
          <span className="text-slate-400 font-medium whitespace-nowrap">{t('urlInput.outputFormat')}</span>
          <SegmentedControl
            options={formats}
            value={selectedFormat}
            onChange={setSelectedFormat}
            ariaLabel={t('urlInput.outputFormat')}
          />
        </div>
      )}

      {/* Validation Error Message */}
      {validationError && (
        <div className="flex items-center gap-2 p-3 bg-[#ff3b30]/10 border border-[#ff3b30]/30 text-red-400 text-xs sm:text-sm clip-corner-btn">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{validationError}</span>
        </div>
      )}
    </form>
  )
}
