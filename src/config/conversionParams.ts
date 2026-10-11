/**
 * Which extra parameters the backend actually reads for a given conversion.
 *
 * Source of truth lives in oneforall_be — re-check these when the processors change:
 *   app/worker/processors/document.py  per-operation sub_options
 *   app/worker/processors/image.py     quality, lossless, width, height
 *   app/worker/processors/video.py     vcodec, acodec, crf, time
 *
 * Anything the processors ignore is deliberately absent: a control that changes nothing is
 * worse than no control, because the job still reports success.
 */

import { classifyFormat, normalizeFormat, resolveRoute } from './conversionMatrix'

export type ParamKind = 'text' | 'int' | 'select' | 'bool'

export interface ParamField {
  key: string
  kind: ParamKind
  label: string
  hint?: string
  placeholder?: string
  min?: number
  max?: number
  presets?: readonly number[]
  choices?: readonly { value: string; label: string }[]
}

export type ParamValues = Record<string, string | boolean>

/** Payload sent as the `options`/`params` JSON to the backend. */
export type ParamOptions = Record<string, string | number | boolean>

const TEXT_MAX_LENGTH = 120

/** Tools whose chips select an output format for a fixed operation rather than a conversion pair. */
const RASTER_TOOL_SLUGS: readonly string[] = ['/image-compressor', '/image-resizer']

function qualityField(backendDefault: number): ParamField {
  return {
    key: 'quality',
    kind: 'int',
    label: 'Chất lượng ảnh xuất',
    hint: `Từ 1 đến 100. Để trống thì hệ thống dùng ${backendDefault}.`,
    min: 1,
    max: 100,
    presets: [95, 90, 80, 70, 60],
    placeholder: String(backendDefault),
  }
}

const LOSSLESS_FIELD: ParamField = {
  key: 'lossless',
  kind: 'bool',
  label: 'Không nén mất dữ liệu',
  hint: 'Giữ 100% chi tiết ảnh, đổi lại file sẽ nặng hơn.',
}

const RESIZE_FIELDS: ParamField[] = [
  {
    key: 'width',
    kind: 'int',
    label: 'Chiều rộng (px)',
    hint: 'Tùy chọn. Để trống thì giữ nguyên chiều rộng gốc.',
    min: 1,
    max: 8192,
    placeholder: '1200',
  },
  {
    key: 'height',
    kind: 'int',
    label: 'Chiều cao (px)',
    hint: 'Tùy chọn. Chỉ nhập một chiều sẽ tự giữ tỷ lệ gốc.',
    min: 1,
    max: 8192,
    placeholder: '800',
  },
]

const TITLE_FIELD: ParamField = {
  key: 'title',
  kind: 'text',
  label: 'Tiêu đề tài liệu',
  hint: 'In trên trang PDF hoặc làm heading của văn bản.',
  placeholder: 'Tài liệu',
  max: TEXT_MAX_LENGTH,
}

const SHEET_FIELD: ParamField = {
  key: 'sheet_name',
  kind: 'text',
  label: 'Tên sheet',
  hint: 'Để trống dùng sheet đang mở. Tên sheet phải khớp chính xác với file Excel.',
  placeholder: 'Sheet1',
  max: TEXT_MAX_LENGTH,
}

const ALL_SHEETS_FIELD: ParamField = {
  key: 'all_sheets',
  kind: 'bool',
  label: 'Xuất tất cả sheet',
  hint: 'Bỏ qua ô "Tên sheet" và gộp mọi sheet vào kết quả.',
}

const SVG_FIELDS: ParamField[] = [
  {
    key: 'colormode',
    kind: 'select',
    label: 'Màu sắc vector',
    choices: [
      { value: 'color', label: 'Giữ màu gốc' },
      { value: 'binary', label: 'Đen trắng' },
    ],
  },
  {
    key: 'mode',
    kind: 'select',
    label: 'Độ mượt đường viền',
    choices: [
      { value: 'spline', label: 'Cong (spline)' },
      { value: 'polygon', label: 'Góc cạnh (polygon)' },
      { value: 'none', label: 'Theo pixel' },
    ],
  },
]

const VIDEO_CODEC_CHOICES = [
  { value: '', label: 'Tự động theo container' },
  { value: 'libx264', label: 'H.264 (libx264)' },
  { value: 'libx265', label: 'H.265 (libx265)' },
  { value: 'libvpx', label: 'VP8 (libvpx)' },
  { value: 'libvpx-vp9', label: 'VP9 (libvpx-vp9)' },
  { value: 'libaom-av1', label: 'AV1 (libaom-av1)' },
]

const AUDIO_CODEC_CHOICES = [
  { value: '', label: 'Tự động theo container' },
  { value: 'aac', label: 'AAC' },
  { value: 'libmp3lame', label: 'MP3' },
  { value: 'libopus', label: 'Opus' },
]

const TRANSCODE_FIELDS: ParamField[] = [
  {
    key: 'vcodec',
    kind: 'select',
    label: 'Bộ mã hóa video',
    hint: 'Mỗi container chỉ nhận một số codec; WebM không nhận H.264.',
    choices: VIDEO_CODEC_CHOICES,
  },
  {
    key: 'crf',
    kind: 'int',
    label: 'Chất lượng video (CRF)',
    hint: '0–51, số càng nhỏ càng nét và file càng nặng. Mặc định 23 (VP9: 30).',
    min: 0,
    max: 51,
    presets: [18, 23, 28, 35],
    placeholder: '23',
  },
  {
    key: 'acodec',
    kind: 'select',
    label: 'Bộ mã hóa âm thanh',
    choices: AUDIO_CODEC_CHOICES,
  },
]

const THUMBNAIL_FIELDS: ParamField[] = [
  {
    key: 'time',
    kind: 'text',
    label: 'Thời điểm lấy khung hình',
    hint: 'Định dạng HH:MM:SS (00:00:12) hoặc giây (12). Mặc định 00:00:01.',
    placeholder: '00:00:01',
    max: 20,
  },
]

const TIME_PATTERN = /^(\d{1,2}:)?(\d{1,2}:)?\d{1,2}(\.\d{1,3})?$/

/** Raster targets are limited to what the image worker names correctly: png, jpg, webp. */
function rasterFields(target: string): ParamField[] {
  const fields: ParamField[] = []
  if (target === 'jpg' || target === 'webp') fields.push(qualityField(85))
  if (target === 'webp') fields.push(LOSSLESS_FIELD)
  fields.push(...RESIZE_FIELDS)
  return fields
}

const CONVERT_FIELDS_BY_PAIR: Record<string, ParamField[]> = {
  'txt>pdf': [TITLE_FIELD],
  'txt>docx': [TITLE_FIELD],
  'txt>doc': [TITLE_FIELD],
  'xlsx>csv': [SHEET_FIELD],
  'xlsx>json': [SHEET_FIELD, ALL_SHEETS_FIELD],
  'xlsx>pdf': [SHEET_FIELD, TITLE_FIELD],
  'png>jpg': [qualityField(95)],
  'png>webp': [qualityField(90), LOSSLESS_FIELD],
  'jpg>webp': [qualityField(90), LOSSLESS_FIELD],
  'png>svg': SVG_FIELDS,
}

export interface ParamScope {
  sourceFormat: string | null
  targetFormat: string
  toolSlug?: string
}

/** Controls to show for the current file + chosen target. Empty means "nothing to configure". */
export function getParamFields(scope: ParamScope): ParamField[] {
  const { sourceFormat, toolSlug } = scope
  const target = normalizeFormat(scope.targetFormat)

  if (toolSlug === '/remove-background') return []
  if (toolSlug && RASTER_TOOL_SLUGS.includes(toolSlug)) {
    return rasterFields(target)
  }

  const route = resolveRoute(sourceFormat, target)
  if (!route) return []

  if (route.endpoint === 'media-process') {
    if (route.operation === 'thumbnail') return THUMBNAIL_FIELDS
    if (route.operation === 'transcode') return TRANSCODE_FIELDS
    return []
  }

  if (route.endpoint === 'image-process') return rasterFields(target)

  if (!sourceFormat || classifyFormat(sourceFormat) === 'other') return []
  return CONVERT_FIELDS_BY_PAIR[`${normalizeFormat(sourceFormat)}>${target}`] ?? []
}

/** Pre-filled values that keep existing tool behaviour after the panel replaced hardcoded options. */
export function getInitialParamValues(toolSlug?: string): ParamValues {
  if (toolSlug === '/image-compressor') return { quality: '80' }
  if (toolSlug === '/image-resizer') return { width: '1200' }
  return {}
}

export function isParamValid(field: ParamField, value: string | boolean | undefined): boolean {
  if (field.kind === 'bool') return value === undefined || typeof value === 'boolean'
  if (typeof value !== 'string' || value.trim() === '') return true

  const text = value.trim()

  if (field.kind === 'int') {
    if (!/^\d+$/.test(text)) return false
    const parsed = Number(text)
    if (field.min !== undefined && parsed < field.min) return false
    if (field.max !== undefined && parsed > field.max) return false
    return true
  }

  if (field.kind === 'select') {
    return (field.choices ?? []).some((choice) => choice.value === text)
  }

  if (field.key === 'time') return TIME_PATTERN.test(text)

  return text.length <= (field.max ?? TEXT_MAX_LENGTH)
}

/** First field the user filled in wrongly; submit stays blocked while one exists. */
export function findInvalidParam(fields: ParamField[], values: ParamValues): ParamField | null {
  return fields.find((field) => !isParamValid(field, values[field.key])) ?? null
}

/**
 * Only keys the visible fields own, and never a default: an absent key is what makes the
 * backend apply its own. Booleans go out as real JSON booleans — `bool("false")` is True there.
 */
export function buildParamOptions(fields: ParamField[], values: ParamValues): ParamOptions {
  const options: ParamOptions = {}

  for (const field of fields) {
    const value = values[field.key]

    if (field.kind === 'bool') {
      if (value === true) options[field.key] = true
      continue
    }

    const text = typeof value === 'string' ? value.trim() : ''
    if (!text) continue

    options[field.key] = field.kind === 'int' ? Number(text) : text
  }

  return options
}
