import { AlertTriangle } from 'lucide-react'
import { t } from '../../i18n/langStore'
import { useBackendStatus } from '../../services/backendStatusStore'






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
