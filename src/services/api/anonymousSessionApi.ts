import { getAccessToken } from '../authStore'
import { setCaptchaRequiredByBackend } from '../captchaStore'
import { apiClient } from './client'

type AnonymousSessionResponse = { expires_at: string; captcha_required?: boolean }



const REISSUE_MARGIN_MS = 60_000

let expiresAt: number | null = null
let inflight: Promise<void> | null = null


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

        expiresAt = Number.isNaN(parsed) ? null : parsed



        setCaptchaRequiredByBackend(session.captcha_required === true)
      })
      .finally(() => {
        inflight = null
      })
  }
  return inflight
}
