import { useSyncExternalStore } from 'react'

// "API có với được không" của cả tab — một cờ, không phải hàng đợi message.
// Không có request probe riêng: mọi call đi qua apiClient đều báo về đây (client.ts),
// nên nhịp heartbeat 30s ở App.tsx đã là mạch đo sẵn và BE sống lại là banner tự tắt.
// shortcut: tab ẩn thì heartbeat không chạy (App.tsx chặn document.hidden) -> đang ở tab
// khác sẽ không thấy hồi phục cho tới khi tab hiện lại.

let down = false
const listeners = new Set<() => void>()

export function reportBackend(reach: 'up' | 'down'): void {
  const next = reach === 'down'
  if (next === down) return
  down = next
  listeners.forEach((listener) => listener())
}

/** Đọc không cần React — errorPopupStore chặn popup trùng với banner bằng hàm này. */
export function isBackendDown(): boolean {
  return down
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

function getSnapshot() {
  return down
}

export function useBackendStatus(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot)
}
