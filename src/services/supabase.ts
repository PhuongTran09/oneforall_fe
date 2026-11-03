import type { SupabaseClient } from '@supabase/supabase-js'
import { env } from '../utils/env'

export const isSupabaseConfigured = Boolean(env.supabaseUrl && env.supabaseAnonKey)

let client: SupabaseClient | null = null







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
