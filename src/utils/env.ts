

export const env = {

  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || '/api',


  supabaseUrl: import.meta.env.VITE_SUPABASE_URL || '',
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',


  turnstileEnabled: import.meta.env.VITE_TURNSTILE_ENABLED === 'true',
  turnstileSiteKey: import.meta.env.VITE_TURNSTILE_SITE_KEY || '',




  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
}
