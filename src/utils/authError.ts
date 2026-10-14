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
  if (message.includes('already registered') || message.includes('user already')) {
    return t('auth.emailAlreadyRegistered')
  }
  if (message.includes('password') && (message.includes('at least') || message.includes('length'))) {
    return t('auth.passwordTooShort')
  }
  if (message.includes('token') || message.includes('expired')) return t('auth.invalidCode')
  // Message của supabase-js là thông điệp user-facing an toàn; fallback có sẵn thì dùng, không log raw.
  return messageOf(err) || t('auth.genericError')
}
