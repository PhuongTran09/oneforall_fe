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

/** Email chưa xác minh — UI nên gợi ý gửi lại mã thay vì báo lỗi chung. */
export function isEmailNotConfirmedError(err: unknown): boolean {
  const message = messageOf(err).toLowerCase()
  return message.includes('email not confirmed') || message.includes('confirm your email')
}

/** OTP/token fail — hết hạn, đã dùng, hoặc verify sai type giữa các luồng. */
export function isOtpExpiredError(err: unknown): boolean {
  const message = messageOf(err).toLowerCase()
  const code = (err as { error_code?: string } | null)?.error_code
  return code === 'otp_expired' || message.includes('otp_expired') || message.includes('token has expired')
}

/**
 * Map lỗi Supabase Auth sang thông điệp i18n, không để lộ thông tin nhạy cảm
 * (vd. "Invalid login credentials" → câu chung chung, không nói email nào sai).
 */
export function describeAuthError(err: unknown): string {
  if (isRateLimitError(err)) return t('auth.rateLimited')
  if (isEmailNotConfirmedError(err)) return t('auth.emailNotConfirmed')
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
