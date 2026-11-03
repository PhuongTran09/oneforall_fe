import { apiClient } from './client'
import type { UserMe } from './types'

export const usersApi = {

  async getMe(signal?: AbortSignal): Promise<UserMe> {
    return apiClient.get<UserMe>('/v1/users/me', { signal })
  },
}
