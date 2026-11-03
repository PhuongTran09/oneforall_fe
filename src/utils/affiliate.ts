const enabled = import.meta.env.VITE_AFFILIATE_ENABLED === 'true'
const url = import.meta.env.VITE_AFFILIATE_URL

const COOLDOWN_MS = 5000
const lastOpenedAt = new Map<string, number>()

function isSafeUrl(value: string): boolean {
  try {
    return /^https?:\/\//i.test(value)
  } catch {
    return false
  }
}



export function openAffiliateTab(key = 'default') {
  if (!enabled || !url || !isSafeUrl(url)) return
  const now = Date.now()
  if (now - (lastOpenedAt.get(key) ?? 0) < COOLDOWN_MS) return
  lastOpenedAt.set(key, now)


  window.open(url, '_blank', 'noopener,noreferrer')
}
