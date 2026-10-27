/** Helpers quản lý và truy xuất biến môi trường an toàn. */

export const env = {
  /** Base URL dùng cho frontend khi gọi API backend. */
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || '/api',

  /** Supabase URL and public anon key; missing values hide sign-in UI. */
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL || '',
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',

  /** Cloudflare Turnstile cho caller ẩn danh (nối GĐ1 chống spam của BE). Site key là public */
  turnstileEnabled: import.meta.env.VITE_TURNSTILE_ENABLED === 'true',
  turnstileSiteKey: import.meta.env.VITE_TURNSTILE_SITE_KEY || '',

  /**
   * Kiểm tra môi trường hiện tại
   */
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
}
