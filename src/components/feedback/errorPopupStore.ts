import { useSyncExternalStore } from 'react'
import { t } from '../../i18n/langStore'
import { isBackendDown } from '../../services/backendStatusStore'

export interface ErrorPopupInput {
  message: string
  title?: string
  /** Nếu cung cấp, popup hiện nút "Thử lại" gọi callback này (load lại dữ liệu...). */
  onRetry?: () => void
}

export interface ErrorPopupEntry extends ErrorPopupInput {
  id: number
}

// Hàng đợi lỗi popup toàn cục — cùng mô hình singleton với toastStore:
// module thuần (gọi được ngoài React), viewport render một modal cho lỗi trên cùng.
let nextId = 1
let queue: ErrorPopupEntry[] = []
const listeners = new Set<() => void>()

function emit() {
  queue = [...queue]
  listeners.forEach((l) => l())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

function getSnapshot() {
  return queue
}

export function showErrorPopup(input: ErrorPopupInput): void {
  if (!input.message) return
  // Lỗi trùng đang chờ user xác nhận → không nhảy popup đôi.
  if (queue.some((e) => e.message === input.message)) return
  // Backend không với tới được thì BackendStatusBanner đã nói và còn hiện suốt: popup
  // thêm một lần nữa là báo hai lần cho một nguyên nhân. Banner dùng errors.unavailable,
  // còn fetch chết giữa đường thì describeError trả errors.network — phải chặn cả hai.
  // t() gọi trong hàm chứ không đưa ra module-level để đổi ngôn ngữ vẫn đúng.
  if (isBackendDown() && [t('errors.unavailable'), t('errors.network')].includes(input.message)) return
  queue = [...queue, { id: nextId++, ...input }]
  emit()
}

export function dismissErrorPopup(id: number) {
  queue = queue.filter((e) => e.id !== id)
  emit()
}

export function useErrorPopups(): ErrorPopupEntry[] {
  return useSyncExternalStore(subscribe, getSnapshot)
}
