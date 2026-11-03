import { apiClient } from '../../../services/api/client'
import type { ImageOptimizationOptions, ImageProcessTask } from '../types/image.types'

export const imageApi = {



  async optimizeImage(file: File, options?: ImageOptimizationOptions): Promise<ImageProcessTask> {
    const formData = new FormData()
    formData.append('file', file)
    if (options) {
      formData.append('options', JSON.stringify(options))
    }
    return apiClient.upload<ImageProcessTask>('/image/optimize', formData)
  },




  async getTasks(): Promise<ImageProcessTask[]> {
    return apiClient.get<ImageProcessTask[]>('/image/tasks')
  },
}
