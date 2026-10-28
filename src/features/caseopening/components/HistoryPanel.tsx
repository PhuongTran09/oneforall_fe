import { useState } from 'react'
import { History, Trash2 } from 'lucide-react'
import { Button } from '../../../components/common/Button'
import { ConfirmModal } from '../../../components/feedback/ConfirmModal'
import { showToast } from '../../../components/feedback/toastStore'
import { getLang, t } from '../../../i18n/langStore'
import type { OpenRecord } from '../types'
import { clearHistory } from '../store/caseStore'

export interface HistoryPanelProps {
  history: OpenRecord[]
  imageUrls: Record<string, string>
}

export function HistoryPanel({ history, imageUrls }: HistoryPanelProps) {
  const [confirming, setConfirming] = useState(false)
  const time = new Intl.DateTimeFormat(getLang(), { dateStyle: 'medium', timeStyle: 'short' })

  if (history.length === 0) {
    return (
      <p className="flex items-center gap-2 py-1 text-xs text-slate-500">
        <History className="w-4 h-4 shrink-0" />
        {t('case.historyEmpty')}
      </p>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-slate-400">{t('case.historyCount', { count: history.length })}</p>
        <Button variant="ghost" size="sm" leftIcon={<Trash2 className="w-4 h-4" />} onClick={() => setConfirming(true)}>
          {t('case.clearHistory')}
        </Button>
      </div>

      <ul className="space-y-2 max-h-80 overflow-y-auto pr-1">
        {history.map((record) => (
          <li key={record.id} className="flex items-center gap-3 p-2.5 bg-page border border-edge clip-corner-card min-w-0">
            <div
              className="w-10 h-10 shrink-0 border border-edge overflow-hidden clip-corner-btn flex items-center justify-center"
              style={{ background: `linear-gradient(145deg, ${record.color} 0%, rgba(0,0,0,0.55) 100%)` }}
            >
              {record.imageAssetId && imageUrls[record.imageAssetId] ? (
                <img src={imageUrls[record.imageAssetId]} alt="" decoding="async" className="w-full h-full object-contain p-0.5" />
              ) : null}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-ink truncate">{record.itemName}</p>
              <p className="text-[11px] font-mono text-slate-500 truncate">
                {record.caseName} · {time.format(new Date(record.at))}
              </p>
            </div>
            <span
              className="shrink-0 px-2 py-1 text-[10px] font-mono uppercase tracking-wide text-white clip-corner-btn"
              style={{ background: record.color }}
            >
              {record.rarityName || t('case.rarityUnknown')}
            </span>
          </li>
        ))}
      </ul>

      <ConfirmModal
        isOpen={confirming}
        title={t('case.clearHistoryTitle')}
        message={t('case.clearHistoryConfirm')}
        onConfirm={() => {
          clearHistory()
          setConfirming(false)
          showToast({ type: 'success', message: t('case.historyCleared') })
        }}
        onClose={() => setConfirming(false)}
      />
    </div>
  )
}
