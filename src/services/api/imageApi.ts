import { apiClient } from './client'
import type { JobAccepted } from './types'

export interface ImageProcessOptions {
  quality?: number
  width?: number
  height?: number
  format?: string
  model?: string
}

export const imageApi = {
  /**
   * Tạo job xử lý hình ảnh tới FastAPI backend /api/v1/image/process
   */
  async processImage(
    file: File,
    operation: 'compress' | 'resize' | 'remove_background' | 'crop' = 'compress',
    options?: ImageProcessOptions,
  ): Promise<JobAccepted> {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('operation', operation)
    if (options) {
      formData.append('options', JSON.stringify(options))
    }

    return apiClient.upload<JobAccepted>('/v1/image/process', formData)
  },
}
