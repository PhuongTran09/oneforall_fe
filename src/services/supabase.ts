import type { SupabaseClient } from '@supabase/supabase-js'
import { env } from '../utils/env'

export const isSupabaseConfigured = Boolean(env.supabaseUrl && env.supabaseAnonKey)

let client: SupabaseClient | null = null

/**
 * Anon key là public; mọi bảng cần bảo vệ bằng RLS — không đưa service_role key vào FE.
 * Dynamic import: supabase-js (~67KB gz) chỉ nằm trên đường tải của người dùng thực sự có
 * khả năng cần tới phiên (đã từng đăng nhập, hoặc URL mang callback), không phải của mọi
 * lượt mở trang landing.
 */
export async function loadSupabase(): Promise<SupabaseClient> {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase chưa được cấu hình (thiếu VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY)')
  }
  if (!client) {
    const { createClient } = await import('@supabase/supabase-js')
    client = createClient(env.supabaseUrl, env.supabaseAnonKey, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    })
  }
  return client
}
