/**
 * Mirror of what the backend can actually convert.
 *
 * Source of truth lives in oneforall_be — re-check these when the matrix changes:
 *   app/services/format_detector.py  FORMAT_ALIASES, KNOWN_EXTENSIONS, SUPPORTED_CONVERSIONS
 *   app/worker/processors/image.py   Pillow branches (resize / crop / compress + save format)
 *   app/worker/tasks/image.py        content-type -> output extension map
 *   app/worker/processors/video.py   VIDEO_CODECS_BY_CONTAINER, AUDIO_ENCODERS, thumbnail
 */

export type FileKind = 'image' | 'video' | 'audio' | 'document' | 'other'

export type ConvertRoute =
  | { endpoint: 'convert-file' }
  | { endpoint: 'media-process'; operation: 'transcode' | 'extract-audio' | 'thumbnail' }
  | { endpoint: 'image-process'; operation: 'compress'; format: string }

/** Backend collapses these to a canonical format before matching pairs. */
const FORMAT_ALIASES: Record<string, string> = {
  jpeg: 'jpg',
  jpe: 'jpg',
  jfif: 'jpg',
  tif: 'tiff',
  svgz: 'svg',
  heif: 'heic',
  htm: 'html',
  text: 'txt',
  plain: 'txt',
  yml: 'yaml',
  tgz: 'gz',
  wave: 'wav',
  oga: 'ogg',
  ogv: 'ogg',
  m4v: 'mp4',
  // Backend also aliases mpg/mpeg to mp3. Those are video containers, so we keep them
  // as-is rather than offer audio targets for a video file.
}

const KNOWN_EXTENSIONS: ReadonlySet<string> = new Set([
  'pdf', 'docx', 'doc', 'xlsx', 'xls', 'pptx', 'ppt', 'txt', 'csv', 'json',
  'xml', 'yaml', 'md', 'html', 'rtf', 'odt', 'ods', 'png', 'jpg', 'webp', 'svg',
  'gif', 'bmp', 'tiff', 'ico', 'heic', 'heif', 'mp4', 'webm', 'mkv',
  'avi', 'mov', 'flv', 'wmv', 'mp3', 'wav', 'ogg', 'flac', 'aac', 'm4a',
  'zip', 'tar', 'gz', 'tgz', '7z', 'rar',
])

const KIND_BY_FORMAT: Record<string, FileKind> = {
  pdf: 'document', docx: 'document', doc: 'document', xlsx: 'document', xls: 'document',
  pptx: 'document', ppt: 'document', txt: 'document', csv: 'document', json: 'document',
  xml: 'document', yaml: 'document', md: 'document', html: 'document',
  rtf: 'document', odt: 'document', ods: 'document',
  png: 'image', jpg: 'image', webp: 'image', svg: 'image', gif: 'image', bmp: 'image',
  tiff: 'image', ico: 'image', heic: 'image', heif: 'image',
  mp4: 'video', webm: 'video', mkv: 'video', avi: 'video', mov: 'video', flv: 'video', wmv: 'video',
  mp3: 'audio', wav: 'audio', ogg: 'audio', flac: 'audio', aac: 'audio', m4a: 'audio',
  zip: 'other', tar: 'other', gz: 'other', tgz: 'other', '7z': 'other', rar: 'other',
}

/** `from>to` pairs accepted by POST /api/v1/convert-file (after format normalization). */
const CONVERT_PAIRS: ReadonlySet<string> = new Set([
  'txt>pdf', 'txt>docx', 'txt>doc', 'txt>md',
  'docx>pdf', 'doc>pdf', 'docx>txt',
  'pdf>txt', 'pdf>docx', 'pdf>jpg', 'pdf>png',
  'xlsx>csv', 'xlsx>json', 'xlsx>pdf',
  'csv>json', 'csv>xlsx', 'json>csv',
  'json>yaml', 'yaml>json', 'json>xml', 'xml>json',
  'md>html', 'html>md', 'html>pdf',
  'png>svg', 'png>jpg', 'png>webp', 'png>ico', 'png>pdf',
  'jpg>png', 'jpg>webp', 'jpg>pdf',
  'webp>jpg', 'webp>png', 'webp>pdf',
  'heic>jpg', 'heic>png',
  'bmp>jpg', 'bmp>png', 'bmp>pdf',
  'tiff>jpg', 'tiff>png', 'tiff>pdf',
  'gif>jpg', 'gif>png', 'gif>webp', 'gif>pdf',
  'svg>png',
  'zip>tar', 'tar>zip', 'gz>zip', 'zip>7z',
])

/** Containers ffmpeg reaches through transcode with a codec that the container accepts. */
export const VIDEO_TARGETS: readonly string[] = ['mp4', 'mov', 'mkv', 'webm', 'avi', 'gif']

/** Audio targets served by media-process/extract-audio. */
export const AUDIO_TARGETS: readonly string[] = ['mp3', 'wav', 'aac', 'm4a', 'flac', 'ogg']

/**
 * Raster formats image-process can emit with a correct filename: tasks/image.py only maps
 * image/jpeg, image/png and image/webp to an extension, anything else lands in a wrong one.
 */
const RASTER_IMAGE_TARGETS: readonly string[] = ['png', 'jpg', 'webp']

/**
 * Raster sources Pillow opens on the worker. HEIC and SVG now convert through
 * convert-file (pillow-heif / svglib), so they stay out of this fallback list.
 */
const RASTER_IMAGE_SOURCES: ReadonlySet<string> = new Set([
  'png', 'jpg', 'webp', 'gif', 'bmp', 'tiff', 'ico',
])

/** Still frame that media-process/thumbnail writes out of a video. */
const VIDEO_STILL_TARGET = 'jpg'

export function normalizeFormat(raw: string | null | undefined): string {
  const clean = (raw ?? '').trim().toLowerCase().replace(/^\./, '')
  return FORMAT_ALIASES[clean] ?? clean
}

export function classifyFormat(format: string): FileKind {
  return KIND_BY_FORMAT[normalizeFormat(format)] ?? 'other'
}

/** Extension first, MIME subtype second — the backend re-detects by magic bytes anyway. */
export function detectFileFormat(file: File): string | null {
  const name = file.name ?? ''
  const fromName = normalizeFormat(name.includes('.') ? name.slice(name.lastIndexOf('.') + 1) : '')
  if (KNOWN_EXTENSIONS.has(fromName)) return fromName

  const mime = (file.type ?? '').split(';')[0].trim().toLowerCase()
  if (!mime || mime === 'application/octet-stream') return null

  const fromMime = normalizeFormat(mime.includes('/') ? mime.slice(mime.lastIndexOf('/') + 1) : '')
  if (fromMime === 'x-msvideo') return 'avi'
  if (fromMime === 'quicktime') return 'mov'
  if (fromMime === 'matroska') return 'mkv'
  if (KNOWN_EXTENSIONS.has(fromMime)) return fromMime

  return null
}

/** Target formats offered for a given source format, in chip display order. */
export function getSupportedTargets(sourceFormat: string | null): string[] {
  if (!sourceFormat) return []

  const kind = classifyFormat(sourceFormat)
  if (kind === 'video') {
    return [...VIDEO_TARGETS, VIDEO_STILL_TARGET, ...AUDIO_TARGETS]
  }
  if (kind === 'audio') return [...AUDIO_TARGETS]

  const from = normalizeFormat(sourceFormat)
  const targets = [...CONVERT_PAIRS]
    .filter((pair) => pair.startsWith(`${from}>`))
    .map((pair) => pair.slice(from.length + 1))

  if (kind === 'image' && RASTER_IMAGE_SOURCES.has(from)) {
    for (const target of RASTER_IMAGE_TARGETS) {
      if (!targets.includes(target)) targets.push(target)
    }
  }

  // GIF is an image but ffmpeg animates it into video containers through transcode.
  if (from === 'gif') {
    for (const target of VIDEO_TARGETS) {
      if (target !== 'gif' && !targets.includes(target)) targets.push(target)
    }
  }

  return targets
}

/**
 * Which endpoint and operation a conversion needs.
 * Audio targets always go through extract-audio: transcode would feed an audio-only input
 * to a video encoder, and an mp3 container cannot hold H.264.
 * convert-file is tried before image-process, so documented pairs keep their endpoint.
 */
export function resolveRoute(
  sourceFormat: string | null,
  target: string,
): ConvertRoute | null {
  if (!sourceFormat) return null

  const to = normalizeFormat(target)
  const from = normalizeFormat(sourceFormat)
  const kind = classifyFormat(sourceFormat)

  if (AUDIO_TARGETS.includes(to)) {
    return kind === 'video' || kind === 'audio'
      ? { endpoint: 'media-process', operation: 'extract-audio' }
      : null
  }

  if (VIDEO_TARGETS.includes(to)) {
    return kind === 'video' || (from === 'gif' && to !== 'gif')
      ? { endpoint: 'media-process', operation: 'transcode' }
      : null
  }

  if (to === VIDEO_STILL_TARGET && kind === 'video') {
    return { endpoint: 'media-process', operation: 'thumbnail' }
  }

  if (CONVERT_PAIRS.has(`${from}>${to}`)) {
    return { endpoint: 'convert-file' }
  }

  if (kind === 'image' && RASTER_IMAGE_SOURCES.has(from) && RASTER_IMAGE_TARGETS.includes(to)) {
    return { endpoint: 'image-process', operation: 'compress', format: to }
  }

  return null
}
