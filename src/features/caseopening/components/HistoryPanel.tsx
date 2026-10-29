import { useState } from 'react'
import { History, Trash2 } from 'lucide-react'
import { Button } from '../../../components/common/Button'
import { ConfirmModal } from '../../../components/feedback/ConfirmModal'
import { showToast } from '../../../components/feedback/toastStore'
import { getLang, t } from '../../../i18n/langStore'
import type { OpenRecord } from '../types'
import { clearHistory } from '../store/caseStore'
import { chipInk } from '../utils/contrast'
import { formatStamp } from '../../../utils/stamp'

export interface HistoryPanelProps {
  history: OpenRecord[]
  imageUrls: Record<string, string>
}

export function HistoryPanel({ history, imageUrls }: HistoryPanelProps) {
  const [confirming, setConfirming] = useState(false)
  const lang = getLang()

  if (history.length === 0) {
    return (
      <p className="flex items-center gap-2 py-1 text-xs text-soft">
        <History className="w-4 h-4 shrink-0" />
        {t('case.historyEmpty')}
      </p>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-soft">{t('case.historyCount', { count: history.length })}</p>
        <Button variant="ghost" size="sm" leftIcon={<Trash2 className="w-4 h-4" />} onClick={() => setConfirming(true)}>
          {t('case.clearHistory')}
        </Button>
      </div>

      <ul className="space-y-2 max-h-80 overflow-y-auto pr-1">
        {history.map((record) => {
          const chip = chipInk(record.color)
          return (
            <li key={record.id} className="flex items-center gap-2.5 p-2.5 bg-page border border-edge clip-corner-card min-w-0">
              <div
                className="w-9 h-9 sm:w-10 sm:h-10 shrink-0 border border-edge overflow-hidden clip-corner-btn flex items-center justify-center"
                style={{ background: `linear-gradient(145deg, ${record.color} 0%, rgba(0,0,0,0.55) 100%)` }}
              >
                {record.imageAssetId && imageUrls[record.imageAssetId] ? (
                  <img src={imageUrls[record.imageAssetId]} alt="" decoding="async" className="w-full h-full object-contain p-0.5" />
                ) : null}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="min-w-0 text-sm font-semibold text-ink truncate">{record.itemName}</p>
                  <span
                    className="ml-auto shrink-0 px-2 py-0.5 text-[11px] font-semibold clip-corner-btn"
                    style={{ background: chip.background, color: chip.ink }}
                  >
                    {record.rarityName || t('case.rarityUnknown')}
                  </span>
                </div>
                <p className="mt-0.5 text-xs font-mono text-soft truncate">
                  {formatStamp(record.at, lang)} · {record.caseName}
                </p>
              </div>
            </li>
          )
        })}
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
