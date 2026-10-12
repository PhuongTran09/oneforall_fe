import { ApiClientError } from '../services/api/types'
import { JobPollCancelled } from '../services/api/jobsApi'
import { t } from '../i18n/langStore'

// Mapper lỗi duy nhất dùng chung toàn FE: đổi mọi lỗi (API, mạng, timeout, backend message
// tiếng Anh/nội bộ) thành thông báo an toàn theo ngôn ngữ UI. Log đầy đủ vẫn nằm ở backend;
// FE chỉ hiển thị.

export type ErrorToastType = 'success' | 'error' | 'warning' | 'info'

// Message user-facing của backend viết tiếng Việt có dấu; nội bộ/traceback thì tiếng Anh
// hoặc chứa ký tự kỹ thuật → chỉ hiện message nào "an toàn" theo cả hai tiêu chí.
export function isSafeUserMessage(text: unknown): text is string {
  if (typeof text !== 'string') return false
  const t = text.trim()
  if (!t || t.length > 300) return false
  if (/[\n\r<>{}]|traceback|file "|secret|password|bearer|BEGIN |redis|postgres|sqlite|supabase|jwt|http|\/var\/|\.py/i.test(t)) {
    return false
  }
  // Có dấu tiếng Việt (= message backend soạn cho người dùng), không phải English debug text.
  return t !== t.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

export function describeError(
  err: unknown,
  fallback?: string,
): { type: ErrorToastType; message: string } {
  // Người dùng chủ động hủy luồng theo dõi — không phải lỗi, caller thường đã lọc;
  // giữ ở đây để không bao giờ biến thành toast lỗi.
  if (err instanceof JobPollCancelled) {
    return { type: 'info', message: t('errors.cancelled') }
  }

  if (err instanceof ApiClientError) {
    // 401/403: KHÔNG dùng detail từ backend (chứa cơ chế token/JWT). Status là đủ.
    switch (true) {
      case err.status === 401:
        return { type: 'error', message: t('errors.401') }
      case err.status === 403:
        return { type: 'error', message: t('errors.403') }
      case err.status === 404:
        return {
          type: 'error',
          message: isSafeUserMessage(err.message) ? err.message : t('errors.404'),
        }
      case err.status === 410:
        return {
          type: 'warning',
          message: isSafeUserMessage(err.message) ? err.message : t('errors.410'),
        }
      case err.status === 413:
        return { type: 'warning', message: t('errors.413') }
      case err.status === 422:
        // Pydantic "field: msg" tiếng Anh — ẩn khỏi UI, giữ hướng dẫn chung.
        return { type: 'warning', message: t('errors.422') }
      case err.status === 429:
        return { type: 'warning', message: t('errors.429') }
      case err.status >= 500:
        if (err.status === 502 || err.status === 503 || err.status === 504) {
          return { type: 'error', message: t('errors.unavailable') }
        }
        return { type: 'error', message: t('errors.generic') }
      default:
        // 400 và các status còn lại: backend tự soạn detail tiếng Việt cho người dùng.
        return {
          type: 'error',
          message: isSafeUserMessage(err.message) ? err.message : t('errors.400'),
        }
    }
  }

  if (err instanceof DOMException && err.name === 'AbortError') {
    return { type: 'error', message: t('errors.timeout') }
  }

  if (err instanceof TypeError || /fetch|network|ECONN|load failed/i.test(String((err as Error)?.message ?? ''))) {
    return { type: 'error', message: t('errors.network') }
  }

  if (err instanceof Error && isSafeUserMessage(err.message)) {
    return { type: 'error', message: err.message }
  }

  return { type: 'error', message: fallback ?? t('errors.generic') }
}

// Cho chuỗi lỗi không phải Exception (job.error từ worker, message khôi phục snapshot).
export function sanitizeUserMessage(text: string | null | undefined, fallback: string): string {
  return isSafeUserMessage(text) ? text : fallback
}
