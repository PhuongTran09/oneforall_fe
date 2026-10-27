import { useCallback, useEffect, useMemo, useState, useRef, type ChangeEvent } from 'react'
import { UploadCloud, File as FileIcon, X, ArrowRight } from 'lucide-react'
import { Button } from './Button'
import { SegmentedControl } from './SegmentedControl'
import { AdvancedParamsPanel } from './AdvancedParamsPanel'
import { detectFileFormat, getSupportedTargets } from '../../config/conversionMatrix'
import {
  buildParamOptions,
  findInvalidParam,
  type ParamField,
  type ParamOptions,
  type ParamValues,
} from '../../config/conversionParams'
import type { ToolFormState } from '../../utils/toolStateStore'
import { ensureAnonymousSession } from '../../services/api/anonymousSessionApi'
import { warmCaptchaToken } from '../../services/captchaStore'
import { useEntitlements } from '../../services/entitlementsStore'
import { humanSize } from '../../utils/apiError'
import { t } from '../../i18n/langStore'

/** Ô nhập CHỮ giữ paste cho riêng nó (dán link vào ô URL, dán số vào ô width…). Loại input */
const NON_TEXT_INPUT_TYPES = new Set([
  'checkbox',
  'radio',
  'file',
  'range',
  'button',
  'submit',
  'reset',
  'color',
])

function isTextBox(el: HTMLElement): boolean {
  if (el.isContentEditable || el.tagName === 'TEXTAREA') return true
  if (el.tagName !== 'INPUT') return false
  return !NON_TEXT_INPUT_TYPES.has((el as HTMLInputElement).type.toLowerCase())
}

export interface FileUploaderProps {
  acceptedTypes?: string
  outputFormats: string[]
  defaultFormat: string
  actionLabel?: string
  /** Format-conversion tools hide targets the backend has no pair for. */
  filterTargetsBySource?: boolean
  /** Extra options the backend honors for the current source + target. Empty list hides the panel. */
  resolveFields?: (sourceFormat: string | null, targetFormat: string) => ParamField[]
  initialParams?: ParamValues
  /** Form đã chọn của lần ghé trước — trang bị unmount khi đổi route nên phải đưa vào lại. */
  initialForm?: ToolFormState | null
  /** Báo lên cha mỗi khi file/định dạng/tùy chọn đổi để nó lưu lại khi người dùng rời trang. */
  onFormChange?: (form: ToolFormState | null) => void
  onSubmit: (file: File, format: string, options: ParamOptions) => void
  isLoading?: boolean
  disabled?: boolean
}

export function FileUploader({
  acceptedTypes = '*/*',
  outputFormats,
  defaultFormat,
  actionLabel,
  filterTargetsBySource = false,
  resolveFields,
  initialParams,
  initialForm,
  onFormChange,
  onSubmit,
  isLoading = false,
  disabled = false,
}: FileUploaderProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(initialForm?.file ?? null)
  const [pickedFormat, setPickedFormat] = useState<string | null>(initialForm?.format ?? null)
  const submitLabel = actionLabel ?? t('uploader.startProcessing')
  const [paramValues, setParamValues] = useState<ParamValues>(
    initialForm?.params ?? initialParams ?? {},
  )
  const [isDragging, setIsDragging] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(() =>
    // shortcut: tạo blob URL cho ảnh khôi phục ngay trong useState init — StrictMode dev
    // double-render sẽ rò một URL nhẹ; bản build không có vấn đề này.
    initialForm?.file?.type.startsWith('image/') ? URL.createObjectURL(initialForm.file) : null,
  )
  const fileInputRef = useRef<HTMLInputElement>(null)

  const sourceFormat = selectedFile ? detectFileFormat(selectedFile) : null

  const availableFormats = useMemo(() => {
    if (!selectedFile) return []
    if (!filterTargetsBySource) return outputFormats
    const supported = getSupportedTargets(sourceFormat)
    return outputFormats.filter((fmt) => supported.includes(fmt.toLowerCase()))
  }, [selectedFile, sourceFormat, outputFormats, filterTargetsBySource])

  // Derived so a pick that is invalid for the current file can never be submitted.
  const activeFormat =
    pickedFormat && availableFormats.includes(pickedFormat)
      ? pickedFormat
      : availableFormats.includes(defaultFormat)
        ? defaultFormat
        : (availableFormats[0] ?? '')

  const paramFields = useMemo(
    () => resolveFields?.(sourceFormat, activeFormat) ?? [],
    [resolveFields, sourceFormat, activeFormat],
  )

  // Options are built from the visible fields only, so a value left behind when the user
  // switches target can never reach the wire.
  const invalidParam = findInvalidParam(paramFields, paramValues)

  useEffect(() => {
    onFormChange?.(
      selectedFile ? { file: selectedFile, format: activeFormat, params: paramValues } : null,
    )
  }, [selectedFile, activeFormat, paramValues, onFormChange])

  const handleParamChange = (key: string, value: string | boolean) => {
    setParamValues((previous) => ({ ...previous, [key]: value }))
  }

  const handleParamsReset = () => {
    setParamValues(initialParams ?? {})
  }

  const handleFile = useCallback((file: File) => {
    // Kéo/chọn/dán tệp là lúc mở ải, không phải lúc bấm nút. BE mới là nguồn của "phiên này có
    // cần ải không" nên phải xin phiên trước; ensureAnonymousSession idempotent và đã cache.
    void ensureAnonymousSession().then(
      () => warmCaptchaToken(),
      () => undefined,
    )
    setSelectedFile(file)
    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    } else {
      setPreviewUrl(null)
    }
  }, [])

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const dragDepth = useRef(0)

  // Thả tệp ở BẤT KỲ đâu trên trang cũng tính: chẳng ai nhìn trúng vùng nét đứt cả, và nếu
  // không chặn default thì browser điều hướng thẳng tới ảnh vừa thả — mất form đang điền.
  // Counter vì dragleave bắn trên từng phần tử con, không riêng lúc rời khỏi trang.
  useEffect(() => {
    if (disabled || isLoading) return
    const dragsFiles = (e: DragEvent) =>
      Array.from(e.dataTransfer?.types ?? []).includes('Files')

    const onEnter = (e: DragEvent) => {
      if (!dragsFiles(e)) return
      e.preventDefault()
      dragDepth.current += 1
      setIsDragging(true)
    }
    const onOver = (e: DragEvent) => {
      if (dragsFiles(e)) e.preventDefault()
    }
    const onLeave = () => {
      dragDepth.current = Math.max(0, dragDepth.current - 1)
      if (dragDepth.current === 0) setIsDragging(false)
    }
    const reset = () => {
      dragDepth.current = 0
      setIsDragging(false)
    }
    const onDrop = (e: DragEvent) => {
      if (!dragsFiles(e)) return
      e.preventDefault()
      reset()
      const file = e.dataTransfer?.files[0]
      if (file) handleFile(file)
    }

    window.addEventListener('dragenter', onEnter)
    window.addEventListener('dragover', onOver)
    window.addEventListener('dragleave', onLeave)
    window.addEventListener('dragend', reset)
    window.addEventListener('drop', onDrop)
    return () => {
      window.removeEventListener('dragenter', onEnter)
      window.removeEventListener('dragover', onOver)
      window.removeEventListener('dragleave', onLeave)
      window.removeEventListener('dragend', reset)
      window.removeEventListener('drop', onDrop)
    }
  }, [handleFile, disabled, isLoading])

  // Ctrl+V (⌘V trên macOS): ảnh copy từ Explorer/Finder/ảnh mở ở tab khác vào thẳng công cụ,
  // không phải mở hộp thoại chọn tệp. Bỏ qua khi người dùng dán CHỮ vào một ô nhập —
  // paste bắn từ phần tử đó rồi nổi lên document, nên phải xét target.
  useEffect(() => {
    if (disabled || isLoading) return
    const onPaste = (e: ClipboardEvent) => {
      const el = e.target as HTMLElement | null
      if (el && isTextBox(el)) return
      const file = Array.from(e.clipboardData?.items ?? []).find((i) => i.kind === 'file')
        ?.getAsFile()
      if (file) {
        e.preventDefault()
        handleFile(file)
      }
    }
    document.addEventListener('paste', onPaste)
    return () => document.removeEventListener('paste', onPaste)
  }, [handleFile, disabled, isLoading])

  const handleClear = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }
    setSelectedFile(null)
    setPreviewUrl(null)
    setParamValues(initialParams ?? {})
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSubmit = () => {
    if (selectedFile && activeFormat && !invalidParam) {
      onSubmit(selectedFile, activeFormat, buildParamOptions(paramFields, paramValues))
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes >= 1024 * 1024) {
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    }
    return `${(bytes / 1024).toFixed(1)} KB`
  }

  // Trần upload hiển thị trong hint lấy từ PLAN_POLICIES mà BE trả qua /users/me. Chưa có dữ
  // liệu (ẩn danh — BE không trả plan_policy công khai) thì nói chung chung: hardcode số của
  // gói Free sẽ nói dối user Pro và mâu thuẫn với con số thật trên toast 413 khi BE đổi trần.
  const { me } = useEntitlements()
  const caps = me?.plan_policy?.max_upload_bytes
  const capHint = caps
    ? t('uploader.dropzoneCaps', {
        video: humanSize(caps.video),
        document: humanSize(caps.document),
        image: humanSize(caps.image),
        audio: humanSize(caps.audio),
      })
    : t('uploader.dropzoneCapsUnknown')

  return (
    <div className="w-full max-w-3xl mx-auto space-y-5">
      {isDragging && (
        <div className="pointer-events-none fixed inset-0 z-[55] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm in-backdrop">
          <div className="px-10 py-8 text-center space-y-2 border-2 border-dashed border-brand/60 bg-surface clip-corner-lg">
            <UploadCloud className="w-10 h-10 mx-auto text-brand" />
            <p className="text-base font-semibold text-slate-100">{t('uploader.dropOverlay')}</p>
          </div>
        </div>
      )}
      <div
        onClick={() => !selectedFile && fileInputRef.current?.click()}
        className={`relative border-2 border-dashed p-6 sm:p-10 text-center transition-all cursor-pointer input-3d clip-corner-lg ${
          selectedFile
            ? 'border-edge bg-surface cursor-default'
            : 'border-[rgba(255,59,48,0.30)] hover:border-[rgba(255,59,48,0.70)] bg-surface/90 hover:bg-brand/5 card-hover-glow group'
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
          <div className="flex flex-col sm:flex-row items-center sm:items-center justify-between gap-4 p-2 text-left">
            <div className="flex w-full min-w-0 items-center gap-3 sm:gap-4">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt={t('uploader.previewAlt')}
                  className="w-16 h-16 object-cover border border-edge shrink-0 clip-corner-btn"
                />
              ) : (
                <div className="w-14 h-14 bg-brand/10 border border-brand/30 flex items-center justify-center text-brand shrink-0">
                  <FileIcon className="w-7 h-7" />
                </div>
              )}
              <div className="min-w-0 flex-1 space-y-0.5">
                <p
                  title={selectedFile.name}
                  className="font-semibold text-slate-100 text-sm sm:text-base break-words [overflow-wrap:anywhere] line-clamp-2"
                >
                  {selectedFile.name}
                </p>
                <p className="text-xs text-slate-400 font-mono">
                  {t('uploader.fileSize')}: {formatFileSize(selectedFile.size)}
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
              className="shrink-0 p-1.5 text-slate-400 hover:text-brand hover:bg-brand/10 transition-colors cursor-pointer clip-corner-btn"
              title={t('uploader.removeFile')}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="w-16 h-16 mx-auto bg-brand/10 border border-brand/30 flex items-center justify-center text-brand animate-float-gentle group-hover:scale-110 group-hover:border-brand/60 group-hover:shadow-[0_0_18px_rgba(255,59,48,0.35)] transition-all duration-300 clip-corner-btn">
              <UploadCloud className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <p className="text-base font-semibold text-slate-100">
                {t('uploader.dropzonePre')}{' '}
                <span className="text-brand underline underline-offset-2">{t('uploader.dropzoneBrowse')}</span>
              </p>
              <p className="text-xs text-slate-400">{capHint}</p>
              <p className="text-xs text-slate-400">
                {t('uploader.dropzonePaste')}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Format Selection, Advanced Options & Submit Action */}
      {selectedFile && (
        <div className="p-4 bg-surface border border-[rgba(255,59,48,0.25)] space-y-4 animate-fade-in clip-corner-lg">
          {availableFormats.length > 0 ? (
            <>
              <div className="flex items-center gap-4 flex-wrap">
                <span className="text-xs font-semibold text-slate-300">{t('uploader.targetFormat')}</span>
                <SegmentedControl
                  options={availableFormats}
                  value={activeFormat}
                  onChange={setPickedFormat}
                  ariaLabel={t('uploader.targetFormat')}
                />
              </div>

              <AdvancedParamsPanel
                fields={paramFields}
                values={paramValues}
                onChange={handleParamChange}
                onReset={handleParamsReset}
                disabled={disabled || isLoading}
              />
            </>
          ) : (
            <p className="text-xs text-slate-400 leading-relaxed">
              {sourceFormat
                ? t('uploader.unsupportedFile', { format: sourceFormat })
                : t('uploader.unknownFormat')}
            </p>
          )}

          {invalidParam && (
            <p role="alert" className="text-xs text-brand">
              {t('uploader.invalidParam', { label: invalidParam.label })}
            </p>
          )}

          <div className="flex justify-end">
            <Button
              variant="primary"
              size="md"
              isLoading={isLoading}
              disabled={
                disabled || isLoading || availableFormats.length === 0 || invalidParam !== null
              }
              onClick={handleSubmit}
              rightIcon={<ArrowRight className="w-4 h-4" />}
              className="w-full sm:w-auto px-6 py-2.5 btn-shimmer shadow-[0_0_18px_rgba(255,59,48,0.25)]"
            >
              {submitLabel}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
