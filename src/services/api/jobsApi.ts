import { apiClient } from './client'
import type { JobPublicResponse } from './types'

export const jobsApi = {
  /**
   * Lấy trạng thái Job hiện tại từ FastAPI backend
   */
  async getJobStatus(jobId: string, token?: string | null): Promise<JobPublicResponse> {
    const params: Record<string, string> = {}
    if (token) {
      params.token = token
    }
    return apiClient.get<JobPublicResponse>(`/v1/jobs/${jobId}`, { params })
  },

  /**
   * Polling liên tục cho tới khi job hoàn tất hoặc thất bại
   */
  async pollJob(
    jobId: string,
    token?: string | null,
    onProgress?: (job: JobPublicResponse) => void,
    intervalMs = 1500,
    maxAttempts = 120, // 3 phút tối đa
  ): Promise<JobPublicResponse> {
    let attempts = 0

    while (attempts < maxAttempts) {
      const job = await this.getJobStatus(jobId, token)
      if (onProgress) {
        onProgress(job)
      }

      if (job.status === 'completed' || job.status === 'failed') {
        return job
      }

      await new Promise((resolve) => setTimeout(resolve, intervalMs))
      attempts++
    }

    throw new Error('Hết thời gian chờ xử lý tác vụ (Timeout). Vui lòng thử lại sau.')
  },
}
