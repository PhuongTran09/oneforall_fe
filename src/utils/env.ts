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
   * Kiểm tra môi trường hiện tại
   */
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
}
