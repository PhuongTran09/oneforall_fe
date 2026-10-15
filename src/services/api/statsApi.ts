import { apiClient, resolveUrl } from './client'
import type { PublicStats } from './types'

/**
 * Nhịp phát của stream backend (app/services/stats_stream.py: STATS_TTL_S/STREAM_TICK_S).
 * FE không đọc được hằng số đó nên phải khớp tay: watchdog chỉ đếm số lần error, còn
 * keepalive là dòng comment SSE — EventSource không thấy comment, nên không có im lặng
 * giả ở đây.
 */
const FALLBACK_POLL_MS = 60_000
const MAX_STREAM_ERRORS = 3
const STREAM_PATH = '/v1/public/stats/stream'

export const statsApi = {
  /**
   * Hai chỉ số công khai cho khu live stats ở trang chủ (GET, không cần đăng nhập).
   * Đây là đường fallback: trang chủ bình thường nhận số qua SSE, còn endpoint này
   * phục vụ client cũ và lúc stream không dùng được.
   */
  async getStats(signal?: AbortSignal): Promise<PublicStats> {
    return apiClient.get<PublicStats>('/v1/public/stats', { signal })
  },

  /**
   * Nhịp sống của tab này cho chỉ số "đang có bao nhiêu người online".
   * ``sid`` là UUID ngẫu nhiên lưu trong sessionStorage, không định danh ai và
   * không đi kèm user_id/IP. Fail im lặng: stat công khai không đáng retry loop.
   */
  async beat(sid: string, signal?: AbortSignal): Promise<void> {
    await apiClient.post<void>('/v1/public/heartbeat', { sid }, { signal })
  },
}

export interface LiveStatsHandlers {
  onStats: (stats: PublicStats) => void
  /** SSE lẫn poll đều không lấy được số: UI phải báo lỗi, cấm hiển thị số mẫu. */
  onError: () => void
}

// Kết nối đang sống của cả trang. EventSource tự reconnect, nên một effect chạy lại
// (StrictMode, retry, đổi ngôn ngữ) mà không đóng instance cũ sẽ để lại hai stream song
// song trên cùng một tab.
let activeSource: EventSource | null = null

function parseStats(data: string): PublicStats | null {
  try {
    const value: unknown = JSON.parse(data)
    return value && typeof value === 'object' ? (value as PublicStats) : null
  } catch {
    // Frame rác (proxy cắt ngang một chunk) — bỏ qua, stream vẫn còn sống.
    return null
  }
}

/**
 * Theo dõi số liệu công khai qua SSE ``GET /v1/public/stats/stream``, lùi về poll
 * ``GET /stats`` mỗi 60s khi stream không dùng được (backend cũ 404, proxy chặn
 * text/event-stream, mạng drop liên tiếp).
 *
 * Trả hàm dừng hẳn cả hai đường — component phải gọi trong cleanup của effect.
 */
export function watchLiveStats(handlers: LiveStatsHandlers): () => void {
  let stopped = false
  let source: EventSource | null = null
  let pollTimer: ReturnType<typeof setInterval> | null = null
  let streamErrors = 0
  let gotStats = false

  const deliver = (stats: PublicStats) => {
    gotStats = true
    handlers.onStats(stats)
  }

  const stopStream = () => {
    if (source === null) return
    source.close()
    if (activeSource === source) activeSource = null
    source = null
  }

  const stopPoll = () => {
    if (pollTimer === null) return
    clearInterval(pollTimer)
    pollTimer = null
  }

  const pollOnce = async () => {
    if (stopped || document.hidden) return
    try {
      deliver(await statsApi.getStats())
    } catch {
      if (!gotStats) handlers.onError()
    }
  }

  const startPolling = () => {
    if (pollTimer !== null) return
    void pollOnce()
    pollTimer = setInterval(() => {
      // Mỗi nhịp fallback thử mở lại stream một lần: mạng chập chờn sẽ tự về được SSE
      // mà không cần chờ đổi tab. Backend không có route thì cái thử này chết ngay
      // (CLOSED) và polling giữ nguyên nhịp — đổi lại một request lỗi mỗi phút.
      if (source === null) startStream()
      void pollOnce()
    }, FALLBACK_POLL_MS)
  }

  const startStream = () => {
    // Tab ẩn thì không giữ socket của một thứ không ai nhìn; sẽ mở lại khi tab hiện ra.
    if (stopped || source !== null || document.hidden) return
    // instance của một watcher khác (StrictMode mount lại, retry) phải đóng trước:
    // EventSource tự reconnect nên hai kết nối cùng mở là hai luồng số liệu song song.
    activeSource?.close()
    const es = new EventSource(resolveUrl(STREAM_PATH))
    activeSource = es
    source = es

    // Kết nối SSE sống lại (kể cả reconnect nội bộ của browser) là bằng chứng stream
    // dùng được: bỏ polling ngay, đừng chờ tới lần số liệu đổi kế tiếp.
    es.onopen = () => stopPoll()

    es.addEventListener('stats', (event) => {
      streamErrors = 0
      // Stream đã sống thật -> bỏ hẳn đường polling, đừng gửi GET thừa mỗi phút nữa.
      stopPoll()
      const stats = parseStats((event as MessageEvent<string>).data)
      if (stats) deliver(stats)
    })

    es.onerror = () => {
      // Lỗi chí mạng (không 200 / sai Content-Type): browser đánh dấu CLOSED và KHÔNG
      // thử lại, nên phải tự chuyển đường ngay. Lỗi mạng thì browser tự reconnect sau
      // `retry:` — chỉ lùi về poll khi nó hỏng liên tiếp.
      if (es.readyState === EventSource.CLOSED) {
        // Browser không bao giờ thử lại: bỏ tham chiếu để nhịp fallback mở kết nối mới.
        if (source === es) source = null
        startPolling()
        return
      }
      streamErrors += 1
      if (streamErrors >= MAX_STREAM_ERRORS) startPolling()
    }
  }

  const onVisibility = () => {
    if (document.hidden) {
      stopStream()
      stopPoll()
      return
    }
    // Quay lại tab: lấy số ngay bằng một lần GET, rồi mở stream (tab ẩn đã đóng cả hai).
    void pollOnce()
    startStream()
  }

  startStream()
  document.addEventListener('visibilitychange', onVisibility)

  return () => {
    stopped = true
    stopStream()
    stopPoll()
    document.removeEventListener('visibilitychange', onVisibility)
  }
}
