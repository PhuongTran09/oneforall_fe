import { apiClient } from '../../../services/api/client'
import type { ImageOptimizationOptions, ImageProcessTask } from '../types/image.types'

export const imageApi = {
  /**
   * Upload và tối ưu hóa hình ảnh qua FastAPI backend
   */
  async optimizeImage(file: File, options?: ImageOptimizationOptions): Promise<ImageProcessTask> {
    const formData = new FormData()
    formData.append('file', file)
    if (options) {
      formData.append('options', JSON.stringify(options))
    }
    return apiClient.upload<ImageProcessTask>('/image/optimize', formData)
  },

  /**
   * Lấy danh sách tác vụ xử lý hình ảnh
   */
  async getTasks(): Promise<ImageProcessTask[]> {
    return apiClient.get<ImageProcessTask[]>('/image/tasks')
  },
}
