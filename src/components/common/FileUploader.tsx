import { useEffect, useMemo, useState, useRef, type ChangeEvent, type DragEvent } from 'react'
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
import { t } from '../../i18n/langStore'

export interface FileUploaderProps {
  acceptedTypes?: string
  outputFormats: string[]
  defaultFormat: string
  actionLabel?: string
  /**
   * Format-conversion tools hide targets the backend has no pair for.
   * Image-processing tools (compress / resize / remove-background) keep their full list,
   * because their chips describe the operation output rather than a conversion pair.
   */
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

  return (
    <div className="w-full max-w-3xl mx-auto space-y-5">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !selectedFile && fileInputRef.current?.click()}
        className={`relative border-2 border-dashed p-6 sm:p-10 text-center transition-all cursor-pointer input-3d clip-corner-lg ${
          isDragging
            ? 'border-[#ff3b30]/60 bg-[#ff3b30]/10'
            : selectedFile
            ? 'border-edge bg-surface cursor-default'
            : 'border-[rgba(255,59,48,0.30)] hover:border-[rgba(255,59,48,0.60)] bg-surface hover:bg-[#ff3b30]/5'
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
                  alt={t('uploader.previewAlt')}
                  className="w-16 h-16 object-cover border border-edge shrink-0 clip-corner-btn"
                />
              ) : (
                <div className="w-14 h-14 bg-[#ff3b30]/10 border border-[#ff3b30]/30 flex items-center justify-center text-[#FF3B30] shrink-0">
                  <FileIcon className="w-7 h-7" />
                </div>
              )}
              <div className="space-y-0.5 max-w-sm sm:max-w-md">
                <p className="font-semibold text-slate-100 text-sm sm:text-base truncate">
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
              className="p-1.5 text-slate-400 hover:text-[#FF3B30] hover:bg-[#ff3b30]/10 transition-colors cursor-pointer clip-corner-btn"
              title={t('uploader.removeFile')}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="w-16 h-16 mx-auto bg-[#ff3b30]/10 border border-[#ff3b30]/30 flex items-center justify-center text-[#FF3B30] group-hover:scale-105 transition-transform">
              <UploadCloud className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <p className="text-base font-semibold text-slate-100">
                {t('uploader.dropzonePre')}{' '}
                <span className="text-[#FF3B30] underline underline-offset-2">{t('uploader.dropzoneBrowse')}</span>
              </p>
              <p className="text-xs text-slate-400">
                {t('uploader.dropzoneHint')}
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
            <p role="alert" className="text-xs text-[#FF3B30]">
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
              className="w-full sm:w-auto px-6 py-2.5"
            >
              {submitLabel}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
