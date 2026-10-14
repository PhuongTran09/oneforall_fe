import { apiClient } from './client'
import type { UserMe } from './types'

export const usersApi = {
  /** Hồ sơ user đang đăng nhập (Bearer tự gắn). Dùng cho trang Profile (§2). */
  async getMe(signal?: AbortSignal): Promise<UserMe> {
    return apiClient.get<UserMe>('/v1/users/me', { signal })
  },
}
