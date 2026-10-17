/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_PROXY_TARGET?: string
  readonly VITE_API_BASE_URL?: string
  readonly VITE_AFFILIATE_ENABLED?: string
  readonly VITE_AFFILIATE_URL?: string
  readonly VITE_ADSENSE_ENABLED?: string
  readonly VITE_ADSENSE_CLIENT?: string
  readonly VITE_ADSENSE_SLOT_CONTENT?: string
  readonly VITE_ADSENSE_SLOT_BOTTOM?: string
  readonly VITE_ADS_SMARTLINK_ENABLED?: string
  readonly VITE_ADS_SOCIALBAR_ENABLED?: string
  readonly VITE_ADS_POPUNDER_ENABLED?: string
  readonly VITE_TURNSTILE_ENABLED?: string
  readonly VITE_TURNSTILE_SITE_KEY?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
