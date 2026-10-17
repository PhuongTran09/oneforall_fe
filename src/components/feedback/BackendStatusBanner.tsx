import { AlertTriangle } from 'lucide-react'
import { t } from '../../i18n/langStore'
import { useBackendStatus } from '../../services/backendStatusStore'

// Dải sự cố toàn trang: apiClient hết với tới backend (client.ts báo) là nó hiện, và tự
// tắt ở response thành công kế tiếp — nhịp heartbeat trong App.tsx lo phần tự tắt,
// nên không có nút đóng lẫn nút thử lại: đóng một cảnh báo đang còn hỏng là tệ hơn.
// z-[45]: trên header (không sticky), dưới AuthModal (z-50) và mọi modal chặn thao tác.
// fixed → không chen vào flow trang, bật/tắt không gây layout shift.
export function BackendStatusBanner() {
  const down = useBackendStatus()
  if (!down) return null

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-x-0 top-0 z-[45] flex items-center justify-center gap-2 px-4 py-2 bg-surface border-b border-edge text-ink text-xs sm:text-sm font-semibold text-center"
    >
      <AlertTriangle className="w-4 h-4 shrink-0 text-brand" aria-hidden="true" />
      <span>{t('errors.unavailable')}</span>
    </div>
  )
}
