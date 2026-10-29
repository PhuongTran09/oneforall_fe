import { useState } from 'react'
import { History, Trash2 } from 'lucide-react'
import { Button } from '../../../components/common/Button'
import { ConfirmModal } from '../../../components/feedback/ConfirmModal'
import { showToast } from '../../../components/feedback/toastStore'
import { getLang, t } from '../../../i18n/langStore'
import { formatStamp } from '../../../utils/stamp'
import { clearHistory } from '../store/spinStore'
import type { SpinRecord } from '../types'

export interface SpinHistoryPanelProps {
  history: SpinRecord[]
}

const slotLabel = (slot: SpinRecord['slot']): string => t(slot === 'A' ? 'spin.wheelA' : 'spin.wheelB')

export function SpinHistoryPanel({ history }: SpinHistoryPanelProps) {
  const [confirming, setConfirming] = useState(false)
  const lang = getLang()

  return (
    <div className="spin-history space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-ink flex items-center gap-2">
          <History className="w-4 h-4 text-soft" />
          {t('spin.history')}
        </h3>
        {history.length > 0 ? (
          <Button variant="ghost" size="sm" leftIcon={<Trash2 className="w-4 h-4" />} onClick={() => setConfirming(true)}>
            {t('spin.clearHistory')}
          </Button>
        ) : null}
      </div>

      {history.length === 0 ? (
        <p className="text-xs text-soft">{t('spin.historyEmpty')}</p>
      ) : (
        <ul className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
          {history.map((record) => (
            <li
              key={record.id}
              className="spin-history-row grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-2.5 gap-y-1 p-2.5 bg-page border border-edge clip-corner-card sm:grid-cols-[auto_minmax(0,1fr)_auto]"
            >
              <span className="px-1.5 py-0.5 text-[10px] font-mono uppercase text-soft bg-elev border border-edge clip-corner-btn">
                {slotLabel(record.slot)}
              </span>
              <span className="min-w-0 text-sm font-semibold text-ink break-words">{record.name}</span>
              {/* Mobile: dòng phụ dưới tên để tên không bị chèn còn hai ký tự một dòng. */}
              <span className="col-span-2 flex flex-wrap items-baseline gap-x-2.5 text-[11px] font-mono text-soft sm:col-span-1 sm:flex-nowrap sm:justify-end">
                <span>{t('spin.odds', { count: record.poolSize })}</span>
                <span>{formatStamp(record.at, lang)}</span>
              </span>
            </li>
          ))}
        </ul>
      )}

      <ConfirmModal
        isOpen={confirming}
        title={t('spin.clearHistoryTitle')}
        message={t('spin.clearHistoryConfirm')}
        onConfirm={() => {
          clearHistory()
          setConfirming(false)
          showToast({ type: 'success', message: t('spin.historyCleared') })
        }}
        onClose={() => setConfirming(false)}
      />
    </div>
  )
}
