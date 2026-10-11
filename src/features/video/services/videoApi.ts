import { apiClient } from '../../../services/api/client'
import type { VideoTask, VideoTranscodeOptions } from '../types/video.types'

export const videoApi = {
  /**
   * Upload video để nén hoặc transcode qua FastAPI backend
   */
  async transcodeVideo(file: File, options?: VideoTranscodeOptions): Promise<VideoTask> {
    const formData = new FormData()
    formData.append('file', file)
    if (options) {
      formData.append('options', JSON.stringify(options))
    }
    return apiClient.upload<VideoTask>('/video/transcode', formData)
  },

  /**
   * Lấy tiến trình xử lý video theo ID
   */
  async getTaskStatus(taskId: string): Promise<VideoTask> {
    return apiClient.get<VideoTask>(`/video/tasks/${taskId}`)
  },
}
