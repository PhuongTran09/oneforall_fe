import { type ToolConfig } from './seoTools'
import { classifyFormat, normalizeFormat, resolveRoute } from './conversionMatrix'

export interface FormatPair {
  from: string
  to: string
}

/** acceptedFileTypes có thể là MIME tổng quát; ánh xạ sang một định dạng đại diện có thật. */
const MIME_SOURCE: Record<string, string> = {
  'image/*': 'jpg',
  'video/*': 'mp4',
  'audio/*': 'wav',
}

/**
 * Định dạng đầu vào mà công cụ nhận, lấy thẳng từ acceptedFileTypes của registry.
 * Không suy diễn thêm: thứ không nằm ở đây thì UI cũng không được gợi ý.
 */
export function toolInputFormats(tool: ToolConfig): string[] {
  const out: string[] = []
  for (const item of (tool.acceptedFileTypes ?? '').split(',')) {
    const token = item.trim()
    if (!token) continue
    const mapped = MIME_SOURCE[token]
    const format = mapped ?? (token.startsWith('.') ? normalizeFormat(token) : '')
    if (format && !out.includes(format)) out.push(format)
  }
  return out
}

/**
 * Xen kẽ theo CẶP loại tệp (video→audio khác video→video) để dải chip trải đều khả năng của
 * công cụ. Giữ thứ tự acceptedFileTypes thì 8 chip đầu của /convert toàn là văn bản, còn
 * /video-converter không bao giờ lộ mp4→mp3 vì bị các hoán vị container chặn hết chỗ.
 */
function interleaveByKind(pairs: FormatPair[]): FormatPair[] {
  const buckets: FormatPair[][] = []
  const rankByRoute = new Map<string, number>()
  for (const pair of pairs) {
    const kind = `${classifyFormat(pair.from)}>${classifyFormat(pair.to)}`
    let rank = rankByRoute.get(kind)
    if (rank === undefined) {
      rank = buckets.length
      rankByRoute.set(kind, rank)
      buckets.push([])
    }
    buckets[rank].push(pair)
  }

  const out: FormatPair[] = []
  for (let index = 0; out.length < pairs.length; index += 1) {
    let picked = false
    for (const bucket of buckets) {
      const pair = bucket[index]
      if (!pair) continue
      out.push(pair)
      picked = true
    }
    if (!picked) break
  }
  return out
}

/**
 * Cặp from → to mà backend thật sự xử lý được cho một công cụ, đã soi qua resolveRoute().
 * Chip gợi ý chỉ là lối tắt chọn định dạng đích, không thay thế bước kiểm tra khi submit.
 */
export function toolFormatPairs(tool: ToolConfig, limit = 8): FormatPair[] {
  // image_process (xóa nền / nén / đổi kích) không phải chuyển định dạng, media_url thì cần link.
  if (tool.backendType !== 'convert_file' || tool.inputType !== 'file') return []

  const pairs: FormatPair[] = []
  for (const from of toolInputFormats(tool)) {
    for (const to of tool.outputFormats) {
      if (from === to) continue
      if (!resolveRoute(from, to)) continue
      pairs.push({ from, to })
    }
  }
  return interleaveByKind(pairs).slice(0, limit)
}

/** Cặp kèm slug của tool xử lý nó — chip trên trang danh mục link thẳng tới trang tool thật. */
export interface FormatPairSuggestion extends FormatPair {
  slug: string
}

/** Gộp cặp của nhiều tool trong một nhóm, khử trùng lặp để hiển thị trên trang danh mục. */
export function mergePairs(tools: ToolConfig[], limit = 12): FormatPairSuggestion[] {
  const seen = new Set<string>()
  const out: FormatPairSuggestion[] = []
  for (const tool of tools) {
    for (const pair of toolFormatPairs(tool, limit)) {
      const key = `${pair.from}>${pair.to}`
      if (seen.has(key)) continue
      seen.add(key)
      out.push({ ...pair, slug: tool.slug })
      if (out.length >= limit) return out
    }
  }
  return out
}
