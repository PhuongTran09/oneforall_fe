import { apiClient } from './client'
import type { JobAccepted } from './types'

export interface ImageProcessOptions {
  quality?: number
  width?: number
  height?: number
  format?: string
  lossless?: boolean
  /** Extra keys are forwarded as-is; src/config/conversionParams.ts lists what the worker reads. */
  [key: string]: string | number | boolean | undefined
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

    return apiClient.upload<JobAccepted>('/v1/image/process', formData, { captcha: 'proactive' })
  },
}
