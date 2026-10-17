import { apiClient } from './client'
import type { JobAccepted } from './types'

export interface MediaProcessParams {
  format?: string
  /** yt-dlp preferredquality, only honored for URL downloads. */
  quality?: string | number
  vcodec?: string
  acodec?: string
  crf?: string | number
  time?: string
  /** Extra keys are forwarded as-is; src/config/conversionParams.ts lists what ffmpeg gets. */
  [key: string]: string | number | boolean | undefined
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
}

export const mediaApi = {
  /**
   * Xem trước thông tin link YouTube/TikTok (title/thumbnail/kênh/số liệu) qua BE.
   * Endpoint public; `signal` để URL cũ bị hủy khi người dùng dán link khác.
   */
  async getUrlInfo(url: string, signal?: AbortSignal): Promise<UrlInfo> {
    return apiClient.get<UrlInfo>('/v1/media/url-info', { params: { url }, signal })
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
