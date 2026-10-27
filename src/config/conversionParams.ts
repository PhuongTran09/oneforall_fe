/** Which extra parameters the backend actually reads for a given conversion. */

import { classifyFormat, normalizeFormat, resolveRoute } from './conversionMatrix'
import { t } from '../i18n/langStore'

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
    label: t('params.qualityLabel'),
    hint: t('params.qualityHint', { default: backendDefault }),
    min: 1,
    max: 100,
    presets: [95, 90, 80, 70, 60],
    placeholder: String(backendDefault),
  }
}

const LOSSLESS_FIELD: ParamField = {
  key: 'lossless',
  kind: 'bool',
  label: t('params.losslessLabel'),
  hint: t('params.losslessHint'),
}

const RESIZE_FIELDS: ParamField[] = [
  {
    key: 'width',
    kind: 'int',
    label: t('params.widthLabel'),
    hint: t('params.widthHint'),
    min: 1,
    max: 8192,
    placeholder: '1200',
  },
  {
    key: 'height',
    kind: 'int',
    label: t('params.heightLabel'),
    hint: t('params.heightHint'),
    min: 1,
    max: 8192,
    placeholder: '800',
  },
]

const TITLE_FIELD: ParamField = {
  key: 'title',
  kind: 'text',
  label: t('params.titleLabel'),
  hint: t('params.titleHint'),
  placeholder: t('params.titlePlaceholder'),
  max: TEXT_MAX_LENGTH,
}

const SHEET_FIELD: ParamField = {
  key: 'sheet_name',
  kind: 'text',
  label: t('params.sheetLabel'),
  hint: t('params.sheetHint'),
  placeholder: 'Sheet1',
  max: TEXT_MAX_LENGTH,
}

const ALL_SHEETS_FIELD: ParamField = {
  key: 'all_sheets',
  kind: 'bool',
  label: t('params.allSheetsLabel'),
  hint: t('params.allSheetsHint'),
}

const SVG_FIELDS: ParamField[] = [
  {
    key: 'colormode',
    kind: 'select',
    label: t('params.colorModeLabel'),
    choices: [
      { value: 'color', label: t('params.colorKeep') },
      { value: 'binary', label: t('params.colorBinary') },
    ],
  },
  {
    key: 'mode',
    kind: 'select',
    label: t('params.edgeLabel'),
    choices: [
      { value: 'spline', label: t('params.edgeSpline') },
      { value: 'polygon', label: t('params.edgePolygon') },
      { value: 'none', label: t('params.edgePixel') },
    ],
  },
]

const VIDEO_CODEC_CHOICES = [
  { value: '', label: t('params.codecAuto') },
  { value: 'libx264', label: 'H.264 (libx264)' },
  { value: 'libx265', label: 'H.265 (libx265)' },
  { value: 'libvpx', label: 'VP8 (libvpx)' },
  { value: 'libvpx-vp9', label: 'VP9 (libvpx-vp9)' },
  { value: 'libaom-av1', label: 'AV1 (libaom-av1)' },
]

const AUDIO_CODEC_CHOICES = [
  { value: '', label: t('params.codecAuto') },
  { value: 'aac', label: 'AAC' },
  { value: 'libmp3lame', label: 'MP3' },
  { value: 'libopus', label: 'Opus' },
]

const TRANSCODE_FIELDS: ParamField[] = [
  {
    key: 'vcodec',
    kind: 'select',
    label: t('params.vcodecLabel'),
    hint: t('params.vcodecHint'),
    choices: VIDEO_CODEC_CHOICES,
  },
  {
    key: 'crf',
    kind: 'int',
    label: t('params.crfLabel'),
    hint: t('params.crfHint'),
    min: 0,
    max: 51,
    presets: [18, 23, 28, 35],
    placeholder: '23',
  },
  {
    key: 'acodec',
    kind: 'select',
    label: t('params.acodecLabel'),
    choices: AUDIO_CODEC_CHOICES,
  },
]

const THUMBNAIL_FIELDS: ParamField[] = [
  {
    key: 'time',
    kind: 'text',
    label: t('params.timeLabel'),
    hint: t('params.timeHint'),
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
