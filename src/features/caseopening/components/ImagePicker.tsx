import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import { ImagePlus, X } from 'lucide-react'
import { t } from '../../../i18n/langStore'
import { Field } from './FormControls'
import { IMAGE_MAX_BYTES, formatBytes, validateImageFile } from '../utils/images'

export interface ImagePickerProps {
  label: string
  /** URL của asset đã lưu trước đó (chế độ sửa). */
  existingUrl?: string
  onPick: (file: File | null) => void
  error?: string
  disabled?: boolean
}

/**
 * Xem trước bằng object URL cục bộ, thu hồi ngay khi đổi tệp hoặc unmount —
 * ảnh chỉ thật sự xuống IndexedDB khi người dùng bấm Lưu.
 */
export function ImagePicker({ label, existingUrl, onPick, error, disabled = false }: ImagePickerProps) {
  const [preview, setPreview] = useState<{ url: string; size: number } | null>(null)
  const [localError, setLocalError] = useState<string | null>(null)
  const previewRef = useRef<{ url: string } | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(
    () => () => {
      if (previewRef.current) URL.revokeObjectURL(previewRef.current.url)
      previewRef.current = null
    },
    [],
  )

  const shown = preview?.url ?? existingUrl

  const handleFile = (file: File | null) => {
    if (previewRef.current) {
      URL.revokeObjectURL(previewRef.current.url)
      previewRef.current = null
    }
    setPreview(null)

    if (!file) {
      setLocalError(null)
      onPick(null)
      return
    }
    const invalid = validateImageFile(file)
    if (invalid) {
      setLocalError(t(invalid, { max: formatBytes(IMAGE_MAX_BYTES) }))
      onPick(null)
      return
    }
    const url = URL.createObjectURL(file)
    previewRef.current = { url }
    setLocalError(null)
    setPreview({ url, size: file.size })
    onPick(file)
  }

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    handleFile(e.target.files?.[0] ?? null)
    e.target.value = ''
  }

  const message = localError ?? error

  return (
    <Field label={label} error={message ?? undefined} hint={t('case.imageHint', { max: formatBytes(IMAGE_MAX_BYTES) })}>
      <div
        className={`flex items-center gap-3 p-3 bg-page border transition-colors clip-corner-btn ${
          message ? 'border-brand' : 'border-edge'
        }`}
      >
        {shown ? (
          <div className="w-20 h-20 shrink-0 border border-edge clip-corner-btn overflow-hidden bg-surface">
            <img src={shown} alt="" decoding="async" className="w-full h-full object-contain" />
          </div>
        ) : (
          <div className="w-20 h-20 shrink-0 flex items-center justify-center border border-dashed border-edge text-slate-500 clip-corner-btn">
            <ImagePlus className="w-6 h-6" />
          </div>
        )}

        <div className="min-w-0 flex-1 space-y-2">
          <p className="text-xs text-slate-400 leading-relaxed">
            {shown ? t('case.imageSelected') : t('case.imageEmpty')}
            {preview && <span className="font-mono text-slate-500"> · {formatBytes(preview.size)}</span>}
          </p>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              disabled={disabled}
              onClick={() => inputRef.current?.click()}
              className="px-3 py-1.5 text-xs font-medium bg-elev border border-edge text-slate-200 hover:border-[rgba(255,59,48,0.45)] hover:text-ink transition-colors cursor-pointer clip-corner-btn disabled:cursor-not-allowed disabled:opacity-60"
            >
              {shown ? t('case.imageChange') : t('case.imageChoose')}
            </button>
            {shown && (
              <button
                type="button"
                disabled={disabled}
                onClick={() => handleFile(null)}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-brand hover:bg-brand/10 transition-colors cursor-pointer clip-corner-btn disabled:cursor-not-allowed"
              >
                <X className="w-3.5 h-3.5" />
                {t('case.imageRemove')}
              </button>
            )}
          </div>
        </div>
      </div>

      <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp" onChange={onChange} className="hidden" aria-label={label} />
    </Field>
  )
}
