import { getAccessToken } from '../authStore'
import { apiClient } from './client'

type AnonymousSessionResponse = { expires_at: string }

// Cho phép mint lại sớm trước 1 phút: một cú submit bay đúng lúc cookie chạm hạn sẽ ăn 401
// ở BE, trong khi xin lại sớm thì vô hại (route idempotent).
const REISSUE_MARGIN_MS = 60_000

let expiresAt: number | null = null
let inflight: Promise<void> | null = null

/**
 * BE GĐ1 khoá job ẩn danh theo phiên (cookie `ofs_anon`, HttpOnly → FE không đọc được,
 * chỉ nhận `expires_at`). Phải xin phiên TRƯỚC khi tạo job, nếu không mọi
 * /media|image|convert-process trả 401 (AUTH_REQUIRED_* = true).
 *
 * Có Bearer thì KHÔNG xin: job phải gắn user_id, không gắn một phiên ẩn danh tình cờ còn
 * sót trong browser. Called nhiều lần chỉ một request: promise đang chạy được chia sẻ, và
 * tab mở qua hạn phiên (TTL 7 ngày) sẽ tự xin lại ở lần xử lý kế tiếp.
 */
export function ensureAnonymousSession(): Promise<void> {
  if (getAccessToken()) return Promise.resolve()
  if (expiresAt !== null && expiresAt - Date.now() > REISSUE_MARGIN_MS) {
    return Promise.resolve()
  }
  if (!inflight) {
    inflight = apiClient
      .post<AnonymousSessionResponse>('/v1/anonymous/session')
      .then((session) => {
        const parsed = Date.parse(session.expires_at)
        // expires_at hỏng (khác múi giờ thiếu offset, BE đổi format) = coi như chưa có phiên.
        expiresAt = Number.isNaN(parsed) ? null : parsed
      })
      .finally(() => {
        inflight = null
      })
  }
  return inflight
}
