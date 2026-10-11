import { env } from '../../utils/env'
import { apiClient } from './client'
import type { PresignedUrlResponse } from './types'

export const filesApi = {
  /**
   * Tạo URL tải xuống trực tiếp từ FastAPI backend
   */
  getDirectDownloadUrl(jobId: string, token?: string | null): string {
    const base = env.apiBaseUrl.replace(/\/+$/, '')
    const tokenParam = token ? `?token=${encodeURIComponent(token)}&redirect=true` : '?redirect=true'
    return `${base}/v1/files/${jobId}/download${tokenParam}`
  },

  /**
   * Lấy presigned download URL (JSON response)
   */
  async getPresignedDownloadUrl(jobId: string, token?: string | null): Promise<PresignedUrlResponse> {
    const params: Record<string, string> = { redirect: 'false' }
    if (token) {
      params.token = token
    }
    return apiClient.get<PresignedUrlResponse>(`/v1/files/${jobId}/download`, { params })
  },
}
