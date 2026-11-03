import { t } from '../i18n/langStore'

function messageOf(err: unknown): string {
  if (err instanceof Error) return err.message
  if (typeof err === 'string') return err
  return ''
}


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


function isEmailNotConfirmedError(err: unknown): boolean {
  const message = messageOf(err).toLowerCase()
  return message.includes('email not confirmed') || message.includes('confirm your email')
}






export function isAccountNotFoundError(err: unknown): boolean {
  if ((err as { error_code?: string } | null)?.error_code === 'otp_disabled') return true
  return messageOf(err).toLowerCase().includes('signups not allowed for otp')
}


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

  if (message.includes('security purposes')) return t('auth.rateLimited')
  if (message.includes('token') || message.includes('expired') || message.includes('invalid otp')) return t('auth.invalidCode')



  const raw = messageOf(err)
  const technical = /[\n\r<>{}]|traceback|file "|secret|password|bearer|http|\.py|redis|postgres|sqlite|supabase|jwt|api call/i
  return raw && raw.length <= 200 && !technical.test(raw) ? raw : t('auth.genericError')
}
