import { useState } from 'react'
import { Pencil, Plus, Trash2, PackageSearch, Wand2 } from 'lucide-react'
import { Button } from '../../../components/common/Button'
import { ConfirmModal } from '../../../components/feedback/ConfirmModal'
import { showToast } from '../../../components/feedback/toastStore'
import { t } from '../../../i18n/langStore'
import type { CaseItem, Rarity } from '../types'
import { deleteItem, normalizeWeightsToHundred } from '../store/caseStore'
import { effectiveWeights, formatPercent, rarityMap, shares, sum } from '../utils/random'
import { ItemTile } from './ItemTile'

export interface ItemListPanelProps {
  caseId: string
  items: CaseItem[]
  rarities: Rarity[]
  imageUrls: Record<string, string>
  onAdd: () => void
  onEdit: (item: CaseItem) => void
}

export function ItemListPanel({ caseId, items, rarities, imageUrls, onAdd, onEdit }: ItemListPanelProps) {
  const [pendingDelete, setPendingDelete] = useState<CaseItem | null>(null)
  const [busy, setBusy] = useState(false)

  const weights = effectiveWeights(items, rarities)
  const odds = shares(weights)
  const byRarity = rarityMap(rarities)
  const allZero = sum(weights) <= 0

  const confirmDelete = async () => {
    if (!pendingDelete) return
    setBusy(true)
    await deleteItem(caseId, pendingDelete.id)
    setBusy(false)
    setPendingDelete(null)
    showToast({ type: 'success', message: t('case.itemDeleted') })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <p className="text-sm text-slate-400 basis-full sm:basis-auto">
          {t('case.itemsTotal', { count: items.length })}
          {items.length > 0 && allZero && <span className="ml-2 text-brand">{t('case.err.allZeroWeights')}</span>}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          {items.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<Wand2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
              className="whitespace-nowrap"
              onClick={() => normalizeWeightsToHundred(caseId)}
            >
              {t('case.normalizeWeights')}
            </Button>
          )}
          <Button variant="secondary" size="sm" leftIcon={<Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />} className="whitespace-nowrap" onClick={onAdd}>
            {t('case.addItem')}
          </Button>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center gap-3 p-8 text-center border border-dashed border-edge clip-corner-card">
          <PackageSearch className="w-9 h-9 text-slate-500" />
          <p className="text-sm text-slate-400 max-w-sm leading-relaxed">{t('case.itemsEmpty')}</p>
          <Button variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={onAdd}>
            {t('case.addItem')}
          </Button>
        </div>
      ) : (
        <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 stagger">
          {items.map((item, index) => {
            const rarity = byRarity[item.rarityId]
            return (
              <li key={item.id} className="p-3 bg-page border border-edge space-y-2 clip-corner-card min-w-0">
                <ItemTile
                  name={item.name}
                  color={item.color}
                  rarityColor={rarity?.color ?? item.color}
                  imageUrl={item.imageAssetId ? imageUrls[item.imageAssetId] : undefined}
                  size="sm"
                />
                <div className="space-y-0.5 min-w-0">
                  <p className="text-xs font-semibold text-ink truncate" title={item.name}>
                    {item.name}
                  </p>
                  <p className="text-[11px] font-mono text-slate-400 truncate">
                    {rarity?.name ?? t('case.rarityUnknown')} · {t('case.weightShort', { weight: item.weight })} ·{' '}
                    <span className="text-ink">{formatPercent(odds[index] ?? 0)}</span>
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => onEdit(item)}
                    aria-label={t('case.editItem')}
                    className="flex-1 inline-flex items-center justify-center gap-1 py-1.5 text-[11px] font-medium bg-elev border border-edge text-slate-200 hover:border-[rgba(255,59,48,0.45)] hover:text-ink transition-colors cursor-pointer clip-corner-btn"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    {t('case.edit')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setPendingDelete(item)}
                    aria-label={t('case.deleteItem')}
                    className="inline-flex items-center justify-center w-8 py-1.5 text-slate-400 hover:text-brand hover:bg-brand/10 transition-colors cursor-pointer clip-corner-btn"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      )}

      <ConfirmModal
        isOpen={pendingDelete !== null}
        title={t('case.deleteItemTitle')}
        message={pendingDelete ? t('case.deleteItemConfirm', { name: pendingDelete.name }) : undefined}
        onConfirm={() => void confirmDelete()}
        onClose={() => (busy ? undefined : setPendingDelete(null))}
      />
    </div>
  )
}
