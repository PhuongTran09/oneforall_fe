import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '../../../components/common/Button'
import { ConfirmModal } from '../../../components/feedback/ConfirmModal'
import { t } from '../../../i18n/langStore'
import type { CaseItem, Rarity } from '../types'
import { addRarity, deleteRarity, patchRarity } from '../store/caseStore'
import { effectiveWeights, formatPercent, sum } from '../utils/random'
import { ColorField, Field, NumberField, TextField } from './FormControls'

export interface RarityTableProps {
  caseId: string
  rarities: Rarity[]
  items: CaseItem[]
}

/** Tỷ lệ trúng KHÔNG nhập tay — nó tính từ trọng số vật phẩm × hệ số cấp độ. */
export function RarityTable({ caseId, rarities, items }: RarityTableProps) {
  const [pendingDelete, setPendingDelete] = useState<Rarity | null>(null)

  const weights = effectiveWeights(items, rarities)
  const total = sum(weights)

  const rows = rarities.map((rarity) => {
    const own = items.reduce((acc, item, index) => (item.rarityId === rarity.id ? acc + weights[index] : acc), 0)
    const count = items.filter((item) => item.rarityId === rarity.id).length
    return { rarity, share: total > 0 ? own / total : 0, count }
  })

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-400 leading-relaxed">{t('case.rarityIntro')}</p>

      <ul className="space-y-3">
        {rows.map(({ rarity, share, count }) => (
          <li key={rarity.id} className="p-3 bg-page border border-edge clip-corner-card space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:items-end">
              <TextField
                label={t('case.rarityName')}
                value={rarity.name}
                onChange={(next) => patchRarity(caseId, rarity.id, { name: next })}
                maxLength={40}
              />
              <NumberField
                label={t('case.rarityMultiplier')}
                value={rarity.weight}
                onChange={(next) => patchRarity(caseId, rarity.id, { weight: next })}
                min={0}
                max={1000}
                step={1}
              />
              <ColorField label={t('case.rarityColor')} value={rarity.color} onChange={(next) => patchRarity(caseId, rarity.id, { color: next })} />
              <div className="flex items-end gap-2">
                <Field label={t('case.rarityChance')} className="flex-1">
                  <div className="px-3 py-2 bg-surface border border-edge clip-corner-btn flex items-center justify-between gap-2">
                    <span className="text-sm font-mono text-ink">{formatPercent(share)}</span>
                    <span className="text-[11px] font-mono text-slate-500">{t('case.itemCount', { count })}</span>
                  </div>
                </Field>
                <button
                  type="button"
                  disabled={rarities.length <= 1}
                  onClick={() => setPendingDelete(rarity)}
                  aria-label={t('case.deleteRarity')}
                  title={t('case.deleteRarity')}
                  className="shrink-0 inline-flex items-center justify-center w-10 h-10 text-slate-400 hover:text-brand hover:bg-brand/10 transition-colors cursor-pointer clip-corner-btn disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="h-1.5 bg-elev overflow-hidden clip-corner-btn" aria-hidden="true">
              <div className="h-full transition-[width] duration-300" style={{ width: `${Math.min(100, share * 100)}%`, background: rarity.color }} />
            </div>
          </li>
        ))}
      </ul>

      <div className="flex justify-start">
        <Button variant="secondary" size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={() => addRarity(caseId)}>
          {t('case.addRarity')}
        </Button>
      </div>

      <ConfirmModal
        isOpen={pendingDelete !== null}
        title={t('case.deleteRarityTitle')}
        message={pendingDelete ? t('case.deleteRarityConfirm', { name: pendingDelete.name }) : undefined}
        onConfirm={() => {
          if (pendingDelete) deleteRarity(caseId, pendingDelete.id)
          setPendingDelete(null)
        }}
        onClose={() => setPendingDelete(null)}
      />
    </div>
  )
}
