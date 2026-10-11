import { apiClient } from './client'
import type { JobAccepted } from './types'

export interface ConvertFileOptions {
  title?: string
  sheet_name?: string
  all_sheets?: boolean
  quality?: number
  lossless?: boolean
  colormode?: string
  mode?: string
  /** Extra keys are forwarded as-is; src/config/conversionParams.ts lists what each operation reads. */
  [key: string]: string | number | boolean | undefined
}

export const convertApi = {
  /**
   * Tạo job chuyển đổi file (multipart/form-data) tới FastAPI backend /api/v1/convert-file
   */
  async convertFile(
    file: File,
    toFormat: string,
    fromFormat?: string,
    options?: ConvertFileOptions,
  ): Promise<JobAccepted> {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('to', toFormat.toLowerCase().replace(/^\./, ''))
    if (fromFormat) {
      formData.append('from', fromFormat.toLowerCase().replace(/^\./, ''))
    }
    if (options && Object.keys(options).length > 0) {
      formData.append('options', JSON.stringify(options))
    }

    return apiClient.upload<JobAccepted>('/v1/convert-file', formData)
  },
}
