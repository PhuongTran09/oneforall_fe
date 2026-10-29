import { useState } from 'react'
import { ClipboardPaste, Copy, ListChecks, Plus, Trash2 } from 'lucide-react'
import { Button } from '../../../components/common/Button'
import { ConfirmModal } from '../../../components/feedback/ConfirmModal'
import { showToast } from '../../../components/feedback/toastStore'
import { t } from '../../../i18n/langStore'
import { ColorField } from '../../caseopening/components/FormControls'
import { CELL_PALETTE, ENTRY_CAP, NAME_MAX, parseBulk } from '../defaults'
import { addEntries, clearEntries, copyList, removeEntry, renameEntry, setEntryColor } from '../store/spinStore'
import type { SpinEntry, WheelSlot } from '../types'

export interface NameListPanelProps {
  slot: WheelSlot
  /** Nhãn wheel, vd "Wheel 1". */
  label: string
  entries: SpinEntry[]
  /** Đang quay thì không cho sửa — kết quả đã chốt sẽ lệch ô. */
  busy: boolean
  /** Button "copy sang wheel kia" — chỉ hiện ở Double Spin. */
  copyTo?: WheelSlot
  /** Danh sách wheel này vừa đổi: caller bỏ kết quả đang hiển thị. */
  onMutate?: () => void
  /** Copy đè danh sách wheel kia: caller bỏ kết quả của wheel nhận. */
  onCopy?: () => void
}

export function NameListPanel({ slot, label, entries, busy, copyTo, onMutate, onCopy }: NameListPanelProps) {
  const [draft, setDraft] = useState('')
  const [bulkOpen, setBulkOpen] = useState(false)
  const [bulk, setBulk] = useState('')
  const [pendingClear, setPendingClear] = useState(false)
  /** id của tên đang mở bảng màu, null khi đóng — state UI thuần, không xuống store. */
  const [colorFor, setColorFor] = useState<string | null>(null)

  const duplicateCount = entries.length - new Set(entries.map((e) => e.name)).size

  const commitDraft = () => {
    const lines = parseBulk(draft)
    if (lines.length === 0) {
      showToast({ type: 'warning', message: t('spin.err.blankName') })
      return
    }
    const added = addEntries(slot, lines)
    if (added > 0) {
      setDraft('')
      onMutate?.()
      showToast({ type: 'success', message: t('spin.added', { count: added }) })
    }
  }

  const commitBulk = () => {
    const lines = parseBulk(bulk)
    if (lines.length === 0) {
      showToast({ type: 'warning', message: t('spin.err.blankName') })
      return
    }
    const added = addEntries(slot, lines)
    if (added > 0) {
      setBulk('')
      onMutate?.()
      showToast({ type: 'success', message: t('spin.added', { count: added }) })
    }
  }

  const paste = async () => {
    try {
      const text = await navigator.clipboard.readText()
      if (!text.trim()) {
        showToast({ type: 'info', message: t('spin.pasteEmpty') })
        return
      }
      setBulk(text)
      setBulkOpen(true)
      showToast({ type: 'info', message: t('spin.pasteReady', { count: parseBulk(text).length }) })
    } catch {
      showToast({ type: 'error', message: t('spin.err.clipboard') })
    }
  }

  return (
    <div className="spin-list space-y-3" data-slot={slot}>
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <h3 className="text-sm font-semibold text-ink">{label}</h3>
        <p className="text-xs text-slate-400">
          {t('spin.list.count', { count: entries.length })}
          {duplicateCount > 0 ? <span className="ml-2 text-slate-300">{t('spin.list.duplicates', { count: duplicateCount })}</span> : null}
        </p>
      </div>

      <div className="flex items-end gap-2">
        <label className="block flex-1 min-w-0 space-y-1.5">
          <span className="block text-xs font-semibold text-slate-300">{t('spin.list.addLabel')}</span>
          <input
            type="text"
            value={draft}
            maxLength={NAME_MAX}
            placeholder={t('spin.list.addPlaceholder')}
            disabled={busy || entries.length >= ENTRY_CAP}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                commitDraft()
              }
            }}
            className="w-full px-3 py-2 bg-page border border-edge text-sm text-ink placeholder-slate-500 focus:outline-none focus:border-brand transition-colors clip-corner-btn disabled:cursor-not-allowed disabled:opacity-60"
          />
        </label>
        <Button
          variant="secondary"
          size="md"
          leftIcon={<Plus className="w-4 h-4" />}
          disabled={busy || entries.length >= ENTRY_CAP}
          onClick={commitDraft}
        >
          {t('spin.list.add')}
        </Button>
      </div>

      {entries.length === 0 ? (
        <p className="p-4 text-center text-xs text-slate-400 border border-dashed border-edge clip-corner-card">{t('spin.list.empty')}</p>
      ) : (
        <ul className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
          {entries.map((entry, index) => (
            <li key={entry.id} className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-6 shrink-0 text-[11px] font-mono text-slate-500 text-right">{index + 1}</span>
                <button
                  type="button"
                  disabled={busy}
                  aria-expanded={colorFor === entry.id}
                  aria-label={t('spin.list.colorAria', { name: entry.name })}
                  onClick={() => setColorFor(colorFor === entry.id ? null : entry.id)}
                  className={`w-6 h-6 shrink-0 border clip-corner-btn cursor-pointer transition-transform hover:scale-110 disabled:cursor-not-allowed disabled:opacity-60 ${
                    colorFor === entry.id ? 'border-brand' : 'border-edge'
                  }`}
                  style={{ background: entry.color }}
                />
                <input
                  type="text"
                  value={entry.name}
                  maxLength={NAME_MAX}
                  disabled={busy}
                  aria-label={t('spin.list.renameAria', { name: entry.name })}
                  onChange={(e) => {
                    renameEntry(slot, entry.id, e.target.value)
                    onMutate?.()
                  }}
                  onBlur={() => renameEntry(slot, entry.id, entry.name.trim())}
                  className="min-w-0 flex-1 px-2.5 py-1.5 bg-page border border-edge text-sm text-ink focus:outline-none focus:border-brand transition-colors clip-corner-btn disabled:cursor-not-allowed disabled:opacity-60"
                />
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => {
                    removeEntry(slot, entry.id)
                    onMutate?.()
                  }}
                  aria-label={t('spin.list.deleteAria', { name: entry.name })}
                  className="inline-flex items-center justify-center w-8 py-1.5 shrink-0 text-slate-400 hover:text-brand hover:bg-brand/10 transition-colors cursor-pointer clip-corner-btn disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              {colorFor === entry.id ? (
                <div className="pl-8">
                  <ColorField
                    label={t('spin.list.colorLabel')}
                    value={entry.color}
                    disabled={busy}
                    presets={CELL_PALETTE}
                    onChange={(hex) => setEntryColor(slot, entry.id, hex)}
                  />
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          leftIcon={<ListChecks className="w-4 h-4" />}
          disabled={busy}
          onClick={() => setBulkOpen((open) => !open)}
        >
          {t('spin.list.bulk')}
        </Button>
        <Button variant="ghost" size="sm" leftIcon={<ClipboardPaste className="w-4 h-4" />} disabled={busy} onClick={() => void paste()}>
          {t('spin.list.paste')}
        </Button>
        {copyTo ? (
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<Copy className="w-4 h-4" />}
            disabled={busy || entries.length === 0}
            onClick={() => {
              const added = copyList(slot, copyTo)
              if (added > 0) {
                onCopy?.()
                showToast({ type: 'success', message: t('spin.copied', { count: added }) })
              }
            }}
          >
            {t('spin.list.copyTo')}
          </Button>
        ) : null}
        <Button variant="ghost" size="sm" className="text-brand hover:bg-brand/10" disabled={busy || entries.length === 0} onClick={() => setPendingClear(true)}>
          {t('spin.list.clear')}
        </Button>
      </div>

      {bulkOpen ? (
        <div className="space-y-2 p-3 bg-page border border-edge clip-corner-card">
          <label className="block space-y-1.5">
            <span className="block text-xs font-semibold text-slate-300">{t('spin.list.bulkLabel')}</span>
            <textarea
              rows={5}
              value={bulk}
              disabled={busy}
              placeholder={t('spin.list.bulkPlaceholder')}
              onChange={(e) => setBulk(e.target.value)}
              className="w-full px-3 py-2 bg-surface border border-edge text-sm text-ink placeholder-slate-500 resize-none focus:outline-none focus:border-brand transition-colors clip-corner-btn"
            />
          </label>
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <p className="text-xs text-slate-400">{t('spin.list.bulkLines', { count: parseBulk(bulk).length })}</p>
            <Button variant="secondary" size="sm" disabled={busy} onClick={commitBulk}>
              {t('spin.list.bulkAdd')}
            </Button>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">{t('spin.list.nameLimit', { max: NAME_MAX })}</p>
        </div>
      ) : null}

      <p className="text-[11px] text-slate-500 leading-relaxed">{t('spin.list.limit', { max: ENTRY_CAP })}</p>

      <ConfirmModal
        isOpen={pendingClear}
        title={t('spin.list.clearTitle')}
        message={t('spin.list.clearConfirm', { count: entries.length })}
        onConfirm={() => {
          clearEntries(slot)
          onMutate?.()
          setPendingClear(false)
          showToast({ type: 'success', message: t('spin.list.cleared') })
        }}
        onClose={() => setPendingClear(false)}
      />
    </div>
  )
}
