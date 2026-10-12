const enabled = import.meta.env.VITE_AFFILIATE_ENABLED === 'true'
const url = import.meta.env.VITE_AFFILIATE_URL

const COOLDOWN_MS = 5000
const lastOpenedAt = new Map<string, number>()

function isSafeUrl(value: string): boolean {
  try {
    return /^https?:\/\//i.test(new URL(value).origin)
  } catch {
    return false
  }
}

// Guard chống nhấn lặp ngoài ý muốn: cooldown 5s tính theo từng key (tool.slug),
// nên hai công cụ khác nhau không cướp lượt mở của nhau.
export function openAffiliateTab(key = 'default') {
  if (!enabled || !url || !isSafeUrl(url)) return
  const now = Date.now()
  if (now - (lastOpenedAt.get(key) ?? 0) < COOLDOWN_MS) return
  lastOpenedAt.set(key, now)
  // Gọi đồng bộ trong user gesture (submit handler, trước await đầu tiên).
  // Popup bị chặn -> window.open trả null, bỏ qua, luồng xử lý vẫn chạy.
  window.open(url, '_blank', 'noopener,noreferrer')
}
