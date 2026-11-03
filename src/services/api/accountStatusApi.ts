import { apiClient } from './client'

type AccountStatusResponse = { exists: boolean; confirmed: boolean }










export async function getAccountStatus(email: string): Promise<AccountStatusResponse | null> {
  try {
    return await apiClient.get<AccountStatusResponse>('/v1/auth/account-status', {
      params: { email },
    })
  } catch {
    return null
  }
}
