import { apiClient } from '../../../services/api/client'
import type { ConvertOptions, ConvertTask, SupportedFormat } from '../types/convert.types'

export const convertApi = {
  /**
   * Chuyển đổi định dạng tệp tin qua FastAPI backend
   */
  async convertFile(file: File, options: ConvertOptions): Promise<ConvertTask> {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('targetFormat', options.targetFormat)
    if (options.qualityPreset) {
      formData.append('qualityPreset', options.qualityPreset)
    }
    return apiClient.upload<ConvertTask>('/convert/file', formData)
  },

  /**
   * Lấy danh sách các định dạng hỗ trợ
   */
  async getSupportedFormats(): Promise<SupportedFormat[]> {
    return apiClient.get<SupportedFormat[]>('/convert/formats')
  },
}
