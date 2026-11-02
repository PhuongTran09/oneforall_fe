import { apiClient } from './client'
import { env } from '../../utils/env'
import type { JobAccepted } from './types'

export interface MediaProcessParams {
  format?: string
  /** yt-dlp preferredquality, only honored for URL downloads. */
  quality?: string | number
  vcodec?: string
  acodec?: string
  crf?: string | number
  time?: string
  /** Số thứ tự ảnh (1-based) của bài ảnh TikTok; thiếu = cả bộ. */
  slides?: number[]
  /** Extra keys are forwarded as-is; src/config/conversionParams.ts lists what ffmpeg gets. */
  [key: string]: string | number | boolean | number[] | undefined
}

export interface UrlInfo {
  platform?: string | null
  title?: string | null
  thumbnail?: string | null
  duration?: number | null
  uploader?: string | null
  author_url?: string | null
  url?: string | null
  view_count?: number | null
  like_count?: number | null
  upload_date?: string | null
  /**
   * Thứ nền tảng tự công bố về bài đang preview: 'photo' | 'video' | 'carousel' | 'text' |
   * 'unknown'. Hiện CHỈ Threads trả; mọi nền tảng khác là null và FE không được suy đoán từ
   * tên format. FE chỉ chặn sớm khi có kind rõ ràng — thấy null thì đối xử như chưa biết gì.
   */
  media_kind?: string | null
  /**
   * Số đầu phương nền tảng TỰ công bố cho bài video — hiện CHỈ Threads và chỉ khi
   * media_kind === 'video'. null = chưa biết (đọc trang công bố lỗi) hoặc bài không phải video,
   * KHÁC với 0 = nền tảng thật sự không còn công bố video nào. FE chỉ dùng 0 để tắt nút sớm;
   * nhiều video thì tải được (chọn một, hoặc ZIP) nên count>1 không còn là lời từ chối.
   */
  media_count?: number | null
  /**
   * Danh mục nền tảng LIỆT KÊ cho một bài Threads, để người dùng chọn TỪNG MỤC (ảnh + video xen kẽ,
   * đúng thứ tự bài đăng). null = chưa liệt kê được (đọc trang embed lỗi, hoặc bài vượt trần mục của
   * một job) — khác với mảng rỗng. Mục video chỉ mang index + kind: URL MP4 ký kèm `oe` không bao giờ
   * về FE, nên ô chọn của nó không có ảnh bìa. Ảnh thì `thumb` là chính URL của nó.
   * `preview_token` chỉ có cho mục video và chỉ khi BE bật PREVIEW_ENABLED: đó là khả năng phát qua
   * `/v1/media/preview?token=…`, KHÔNG phải URL media. Token null = không có nút play.
   */
  media_items?: {
    index: number
    kind: 'photo' | 'video'
    thumb: string | null
    preview_token?: string | null
  }[] | null
  /** Code bài viết Threads (đọc từ permalink đã kiểm) — để người dùng đối chiếu link. null với nền
   * tảng khác và khi BE không đọc được bài. */
  post_code?: string | null
  /** Ảnh của bài ảnh TikTok, theo đúng thứ tự trượt; null với mọi link khác. URL CDN ký kèm */
  slides?: string[] | null
}

export const mediaApi = {
  /**
   * URL nguồn cho thẻ `<video>`: BE stream lại đúng mục video mà chính nó đã liệt kê, nên trình
   * duyệt không bao giờ thấy URL CDN ký kèm `oe`. Chỉ một token ngẫu nhiên đi ra khỏi máy, và
   * endpoint không dựa cookie (`<video>` không gắn được credentials) nên chạy cả khi FE deploy
   * khác host API.
   */
  getPreviewUrl(token: string): string {
    const base = env.apiBaseUrl.replace(/\/+$/, '')
    return `${base}/v1/media/preview?token=${encodeURIComponent(token)}`
  },

  /**
   * Xem trước thông tin link YouTube/TikTok (title/thumbnail/kênh/số liệu) qua BE.
   *
   * `cache: 'no-store'` là một nửa của nút "Thử lại": BE trả `Cache-Control: private, max-age=900`
   * nên browser được phép phát lại đúng JSON cũ mà không chạm mạng — mà token preview chỉ mới khi
   * response thật sự được sinh ra. BE vẫn tự cache 900s, nên cái mất ở đây chỉ là một roundtrip JSON.
   */
  async getUrlInfo(url: string, signal?: AbortSignal): Promise<UrlInfo> {
    return apiClient.get<UrlInfo>('/v1/media/url-info', { params: { url }, signal, cache: 'no-store' })
  },

  /**
   * Tạo job xử lý tải video/audio từ URL (YouTube, TikTok...) qua FastAPI backend /api/v1/media/process
   */
  async processUrl(
    url: string,
    operation: 'url_download' | 'extract-audio' | 'download' = 'url_download',
    params?: MediaProcessParams,
  ): Promise<JobAccepted> {
    const formData = new FormData()
    formData.append('url', url.trim())
    formData.append('operation', operation)
    if (params) {
      formData.append('params', JSON.stringify(params))
    }

    return apiClient.upload<JobAccepted>('/v1/media/process', formData, { captcha: 'proactive' })
  },

  /**
   * Tạo job xử lý tệp video/audio trực tiếp
   */
  async processMediaFile(
    file: File,
    operation: 'transcode' | 'extract-audio' | 'thumbnail' = 'transcode',
    params?: MediaProcessParams,
  ): Promise<JobAccepted> {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('operation', operation)
    if (params) {
      formData.append('params', JSON.stringify(params))
    }

    return apiClient.upload<JobAccepted>('/v1/media/process', formData, { captcha: 'proactive' })
  },
}
