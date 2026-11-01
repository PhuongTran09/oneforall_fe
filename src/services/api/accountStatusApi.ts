import { apiClient } from './client'

type AccountStatusResponse = { exists: boolean; confirmed: boolean }

/**
 * Precheck trước khi bấm "đăng nhập bằng mã". GoTrue chỉ gửi OTP cho tài khoản ĐÃ xác minh;
 * tài khoản chưa xác minh nhận email xác minh signup, mà /otp không trả tín hiệu gì để phân
 * biệt hai loại (supabase-js bỏ cả body response) — nên phải hỏi BE bằng 2 bit này.
 *
 * null = không tra được (BE chưa có route, lỗi mạng, 429, 503). Coi như chưa biết gì: caller
 * cư xử đúng như hồi chưa có precheck, thà để user gặp hint "không nhận được mã" còn hơn chặn
 * đăng nhập chỉ vì một route phụ chết.
 */
export async function getAccountStatus(email: string): Promise<AccountStatusResponse | null> {
  try {
    return await apiClient.get<AccountStatusResponse>('/v1/auth/account-status', {
      params: { email },
    })
  } catch {
    return null
  }
}
