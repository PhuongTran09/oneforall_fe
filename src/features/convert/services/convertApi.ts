import { apiClient } from '../../../services/api/client'
import type { ConvertOptions, ConvertTask, SupportedFormat } from '../types/convert.types'

export const convertApi = {



  async convertFile(file: File, options: ConvertOptions): Promise<ConvertTask> {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('targetFormat', options.targetFormat)
    if (options.qualityPreset) {
      formData.append('qualityPreset', options.qualityPreset)
    }
    return apiClient.upload<ConvertTask>('/convert/file', formData)
  },




  async getSupportedFormats(): Promise<SupportedFormat[]> {
    return apiClient.get<SupportedFormat[]>('/convert/formats')
  },
}
