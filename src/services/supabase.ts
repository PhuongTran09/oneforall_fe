import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { env } from '../utils/env'

export const isSupabaseConfigured = Boolean(env.supabaseUrl && env.supabaseAnonKey)

let client: SupabaseClient | null = null

// Anon key là public; mọi bảng cần bảo vệ bằng RLS — không đưa service_role key vào FE.
export function getSupabase(): SupabaseClient {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase chưa được cấu hình (thiếu VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY)')
  }
  if (!client) {
    client = createClient(env.supabaseUrl, env.supabaseAnonKey, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    })
  }
  return client
}
