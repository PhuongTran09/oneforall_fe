/**
 * Helpers quản lý và truy xuất biến môi trường an toàn.
 * Lưu ý: Tuyệt đối không lưu secret/khóa nhạy cảm trong biến VITE_*.
 */

export const env = {
  /**
   * Base URL dùng cho frontend khi gọi API backend.
   * Mặc định là '/api' để request đi qua proxy trong môi trường dev
   * hoặc Nginx/reverse proxy trong production.
   */
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || '/api',

  /**
   * Supabase Auth (client-side): URL project + anon key public (an toàn khi expose,
   * RLS là lớp bảo vệ thật). Thiếu 2 giá trị này thì UI đăng nhập tự ẩn.
   */
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL || '',
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',

  /**
   * Cloudflare Turnstile cho caller ẩn danh (nối GĐ1 chống spam của BE). Site key là public
   * (widget render phía browser); secret key CHỈ nằm ở BE. Cờ tắt hoặc site key trống thì FE
   * không hỏi xác minh — và một request bị BE chặn sẽ chết với thông báo không xác minh được.
   */
  turnstileEnabled: import.meta.env.VITE_TURNSTILE_ENABLED === 'true',
  turnstileSiteKey: import.meta.env.VITE_TURNSTILE_SITE_KEY || '',

  /**
   * Kiểm tra môi trường hiện tại
   */
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
}
