export const IMAGE_MAX_BYTES = 2 * 1024 * 1024
export const AUDIO_MAX_BYTES = 5 * 1024 * 1024
const IMAGE_MAX_EDGE = 512

const IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
const AUDIO_TYPES = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/x-wav', 'audio/ogg', 'audio/mp4', 'audio/aac', 'audio/webm']
const AUDIO_EXT = /\.(mp3|wav|ogg|m4a|aac|weba|webm)$/i

/** Trả về key i18n của lỗi, hoặc null khi tệp hợp lệ. */
export function validateImageFile(file: File): string | null {
  const type = file.type.toLowerCase()
  if (!type.startsWith('image/')) return 'case.err.fileNotImage'
  if (!IMAGE_TYPES.includes(type)) return 'case.err.imageType'
  if (file.size > IMAGE_MAX_BYTES) return 'case.err.imageTooBig'
  if (file.size === 0) return 'case.err.emptyFile'
  return null
}

export function validateAudioFile(file: File): string | null {
  const type = file.type.toLowerCase()
  if (!type.startsWith('audio/') && !AUDIO_EXT.test(file.name)) return 'case.err.fileNotAudio'
  if (type.startsWith('audio/') && !AUDIO_TYPES.includes(type)) return 'case.err.audioType'
  if (file.size > AUDIO_MAX_BYTES) return 'case.err.audioTooBig'
  if (file.size === 0) return 'case.err.emptyFile'
  return null
}

function loadBitmap(file: File): Promise<{ width: number; height: number; draw: CanvasImageSource; release: () => void }> {
  return new Promise((resolve, reject) => {
    if (typeof createImageBitmap === 'function') {
      createImageBitmap(file)
        .then((bmp) => resolve({ width: bmp.width, height: bmp.height, draw: bmp, release: () => bmp.close() }))
        .catch(reject)
      return
    }
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight, draw: img, release: () => URL.revokeObjectURL(url) })
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('decode failed'))
    }
    img.src = url
  })
}

function encode(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob((blob) => resolve(blob), type, quality))
}

/**
 * Ảnh tải lên thường là ảnh điện thoại vài MB; ép về ≤512px và WebP trước khi xuống
 * IndexedDB để danh sách dài không nghẽn bộ nhớ. Lỗi bất kỳ bước nào → dùng tệp gốc.
 */
export async function toStorableImage(file: File): Promise<Blob> {
  try {
    const bmp = await loadBitmap(file)
    try {
      const scale = Math.min(1, IMAGE_MAX_EDGE / Math.max(bmp.width, bmp.height))
      const w = Math.max(1, Math.round(bmp.width * scale))
      const h = Math.max(1, Math.round(bmp.height * scale))
      const canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h
      const ctx = canvas.getContext('2d')
      if (!ctx) return file
      ctx.drawImage(bmp.draw, 0, 0, w, h)
      const webp = await encode(canvas, 'image/webp', 0.88)
      const png = webp ?? (await encode(canvas, 'image/png', 1))
      if (!png || png.size >= file.size) return file
      return png
    } finally {
      bmp.release()
    }
  } catch {
    return file
  }
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
