import { t } from '../i18n/langStore'

function messageOf(err: unknown): string {
  if (err instanceof Error) return err.message
  if (typeof err === 'string') return err
  return ''
}

/** Lỗi gửi thư/rate limit của Supabase (HTTP 429, "frequency", "rate limit"). */
export function isRateLimitError(err: unknown): boolean {
  const message = messageOf(err).toLowerCase()
  const status = (err as { status?: number; code?: number } | null)?.status
  return (
    status === 429 ||
    message.includes('rate limit') ||
    message.includes('too many requests') ||
    message.includes('frequency')
  )
}

/** Email chưa xác minh — thuộc trách nhiệm luồng đăng ký, tab Đăng nhập chỉ báo lỗi. */
function isEmailNotConfirmedError(err: unknown): boolean {
  const message = messageOf(err).toLowerCase()
  return message.includes('email not confirmed') || message.includes('confirm your email')
}

/**
 * Email chưa có tài khoản. /otp của GoTrue chỉ trả 422 otp_disabled khi
 * create_user=false VÀ không tìm thấy user (shouldCreateUser trong internal/api/otp.go)
 * — user đã tồn tại vẫn được gửi mã như thường, nên đây là tín hiệu "chưa đăng ký" đáng tin.
 */
export function isAccountNotFoundError(err: unknown): boolean {
  if ((err as { error_code?: string } | null)?.error_code === 'otp_disabled') return true
  return messageOf(err).toLowerCase().includes('signups not allowed for otp')
}

/** Map auth failures to localized, non-sensitive messages. */
export function describeAuthError(err: unknown): string {
  if (isRateLimitError(err)) return t('auth.rateLimited')
  if (isEmailNotConfirmedError(err)) return t('auth.emailNotConfirmed')
  if (isAccountNotFoundError(err)) return t('auth.accountNotFound')
  const message = messageOf(err).toLowerCase()
  if (message.includes('invalid login credentials')) return t('auth.invalidCredentials')
  if (message.includes('already registered') || message.includes('user already') || message.includes('already signed up')) {
    return t('auth.emailAlreadyRegistered')
  }
  if (message.includes('password') && (message.includes('at least') || message.includes('length'))) {
    return t('auth.passwordTooShort')
  }
  if (message.includes('different from the old password')) return t('auth.passwordSameAsOld')
  if (message.includes('validate email') || message.includes('invalid email address')) return t('auth.emailInvalid')
  // Gotrue dồn mọi thứ vượt cửa chống spam vào một câu "vì lý do bảo mật, chỉ yêu cầu lại sau…".
  if (message.includes('security purposes')) return t('auth.rateLimited')
  if (message.includes('token') || message.includes('expired') || message.includes('invalid otp')) return t('auth.invalidCode')
  // Fallback có sẵn thì dùng, không log raw. shortcut: Supabase viết message tiếng Anh nên
  // không xài isSafeUserMessage (hàm đó đòi dấu VI); chỉ chặn chuỗi kỹ thuật. Đổi sang hàm
  // chung của apiError khi có thêm nguồn lỗi thứ hai cần cùng bộ lọc.
  const raw = messageOf(err)
  const technical = /[\n\r<>{}]|traceback|file "|secret|password|bearer|http|\.py|redis|postgres|sqlite|supabase|jwt|api call/i
  return raw && raw.length <= 200 && !technical.test(raw) ? raw : t('auth.genericError')
}
