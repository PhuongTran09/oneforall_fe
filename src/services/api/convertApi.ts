import { apiClient } from './client'
import type { JobAccepted } from './types'

export const convertApi = {
  /**
   * Tạo job chuyển đổi file (multipart/form-data) tới FastAPI backend /api/v1/convert-file
   */
  async convertFile(file: File, toFormat: string, fromFormat?: string): Promise<JobAccepted> {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('to', toFormat.toLowerCase().replace(/^\./, ''))
    if (fromFormat) {
      formData.append('from', fromFormat.toLowerCase().replace(/^\./, ''))
    }

    return apiClient.upload<JobAccepted>('/v1/convert-file', formData)
  },
}
