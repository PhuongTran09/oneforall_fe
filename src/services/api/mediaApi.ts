import { apiClient } from './client'
import { env } from '../../utils/env'
import type { JobAccepted } from './types'

export interface MediaProcessParams {
  format?: string

  quality?: string | number
  vcodec?: string
  acodec?: string
  crf?: string | number
  time?: string

  slides?: number[]

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





  media_kind?: string | null






  media_count?: number | null








  media_items?: {
    index: number
    kind: 'photo' | 'video'
    thumb: string | null
    preview_token?: string | null
  }[] | null


  post_code?: string | null







  embed_url?: string | null

  slides?: string[] | null
}

export const mediaApi = {






  getPreviewUrl(token: string): string {
    const base = env.apiBaseUrl.replace(/\/+$/, '')
    return `${base}/v1/media/preview?token=${encodeURIComponent(token)}`
  },

  async getUrlInfo(url: string, signal?: AbortSignal): Promise<UrlInfo> {
    return apiClient.get<UrlInfo>('/v1/media/url-info', { params: { url }, signal, cache: 'no-store' })
  },

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
