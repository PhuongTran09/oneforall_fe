/** Nạp script Cloudflare Turnstile — MỘT điểm chèn <script> cho cả app (cùng kiểu với */

export interface TurnstileWidgetOptions {
  sitekey: string
  callback?: (token: string) => void
  'error-callback'?: (errorCode?: string) => void
  'expired-callback'?: () => void
  'timeout-callback'?: () => void
  action?: string
  theme?: 'auto' | 'light' | 'dark'
  size?: 'normal' | 'flexible' | 'compact'
  execution?: 'render' | 'execute'
  appearance?: 'always' | 'execute' | 'interaction-only'
  retry?: number | 'auto'
}

export interface TurnstileApi {
  render: (element: HTMLElement, options: TurnstileWidgetOptions) => string
  remove: (widgetId: string) => void
  reset: (widgetId: string) => void
}

const SCRIPT_URL = 'https://challenges.cloudflare.com/turnstile/v0/api.js'
const ONLOAD_GLOBAL = '__oneforallTurnstileOnLoad'
// Cloudflare không tài liệu hoá thời gian tải script; 15s là mức một cú retry của người
// dùng còn chấp nhận chờ, dài hơn thì panel nên báo lỗi thay vì treo vô hạn.
const LOAD_TIMEOUT_MS = 15_000

let loading: Promise<TurnstileApi> | null = null

function inject(): Promise<TurnstileApi> {
  return new Promise((resolve, reject) => {
    const scope = window as unknown as { turnstile?: TurnstileApi } & Record<string, unknown>
    let settled = false

    const finish = (api: TurnstileApi | undefined, error: string) => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      delete scope[ONLOAD_GLOBAL]
      if (api) resolve(api)
      else {
        loading = null
        reject(new Error(error))
      }
    }

    const timer = setTimeout(() => finish(scope.turnstile, 'turnstile_timeout'), LOAD_TIMEOUT_MS)

    scope[ONLOAD_GLOBAL] = () => finish(scope.turnstile, 'turnstile_no_api')
    if (scope.turnstile) finish(scope.turnstile, 'turnstile_no_api')

    const script = document.createElement('script')
    script.src = `${SCRIPT_URL}?onload=${ONLOAD_GLOBAL}&render=explicit`
    script.async = true
    script.onerror = () => finish(undefined, 'turnstile_script_failed')
    document.head.appendChild(script)
  })
}

export function loadTurnstile(): Promise<TurnstileApi> {
  if (!loading) loading = inject()
  return loading
}
