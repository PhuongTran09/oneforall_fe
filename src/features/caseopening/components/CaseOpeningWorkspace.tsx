import { useMemo, useState } from 'react'
import { Copy, Eye, Package, Pencil, Plus, RotateCcw, Trash2 } from 'lucide-react'
import { Button } from '../../../components/common/Button'
import { CardDescription } from '../../../components/common/Card'
import { ConfirmModal } from '../../../components/feedback/ConfirmModal'
import { SEOHead } from '../../../components/common/SEOHead'
import { SegmentedControl } from '../../../components/common/SegmentedControl'
import { showToast } from '../../../components/feedback/toastStore'
import { getLang, t } from '../../../i18n/langStore'
import type { CaseConfig, CaseItem } from '../types'
import {
  activeCaseOf,
  createCase,
  deleteCase,
  duplicateCase,
  resetCase,
  setActiveCase,
  useCaseStore,
} from '../store/caseStore'
import { useCaseOpening } from '../hooks/useCaseOpening'
import { useAssetUrls, useReducedMotion } from '../hooks/useAssetUrls'
import { effectiveWeights } from '../utils/random'
import { CaseStage } from './CaseStage'
import { CaseSettingsPanel } from './CaseSettingsPanel'
import { HistoryPanel } from './HistoryPanel'
import { ItemEditorModal } from './ItemEditorModal'
import { ItemListPanel } from './ItemListPanel'
import { RarityTable } from './RarityTable'
import { SelectMenu } from './SelectMenu'
import { SoundSlots } from './SoundSlots'

const TABS = ['items', 'rarity', 'sound', 'settings'] as const
type Tab = (typeof TABS)[number]

const tabLabel = (tab: string): string => t(`case.tab.${tab}`)

export function CaseOpeningWorkspace() {
  const state = useCaseStore()
  const activeCase = activeCaseOf(state)
  const reducedMotion = useReducedMotion()
  const [tab, setTab] = useState<Tab>('items')
  const [editor, setEditor] = useState<{ item: CaseItem | null } | null>(null)
  const [pendingCaseDelete, setPendingCaseDelete] = useState<CaseConfig | null>(null)
  const [pendingCaseReset, setPendingCaseReset] = useState<CaseConfig | null>(null)

  const opening = useCaseOpening(activeCase, state.settings, reducedMotion)

  const itemImageIds = useMemo(() => activeCase.items.map((i) => i.imageAssetId), [activeCase.items])
  const imageUrls = useAssetUrls(itemImageIds)
  const historyImageIds = useMemo(() => state.history.map((h) => h.imageAssetId), [state.history])
  const historyImageUrls = useAssetUrls(historyImageIds)

  const weights = effectiveWeights(activeCase.items, activeCase.rarities)
  const obtainableCount = weights.filter((w) => w > 0).length

  const reveal = opening.winner ? { item: opening.winner, rarity: opening.winnerRarity } : null

  const revealImage = reveal?.item.imageAssetId ? imageUrls[reveal.item.imageAssetId] : undefined
  const revealed = opening.phase === 'revealed'
  const editingOpen = opening.phase === 'idle'

  const backToEditor = () => {
    opening.reset()
    setTab('settings')
  }

  const togglePreview = () => {
    if (opening.preview) {
      opening.reset()
      return
    }
    opening.startPreview()
  }

  const confirmCaseDelete = async () => {
    if (!pendingCaseDelete) return
    await deleteCase(pendingCaseDelete.id)
    setPendingCaseDelete(null)
    showToast({ type: 'success', message: t('case.caseDeleted') })
  }

  const confirmCaseReset = () => {
    if (!pendingCaseReset) return
    resetCase(pendingCaseReset.id)
    opening.reset()
    setPendingCaseReset(null)
    showToast({ type: 'success', message: t('case.resetDone') })
  }

  return (
    <div className="page-container case-page-container relative">
      <SEOHead
        title={t('case.seoTitle')}
        description={t('case.seoDesc')}
        canonicalUrl={`https://oneforall.io.vn${getLang() === 'en' ? '/en/case-opening' : '/case-opening'}`}
        noindex
      />
      <div className="hero-ambient-glow" aria-hidden="true" />

      <div className="relative z-10 p-4 sm:p-8">
        <div className="case-head pb-4 sm:pb-6 border-b border-edge">
          <div className="flex items-center gap-2.5 sm:gap-3 mb-2">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-brand/10 border border-[rgba(255,59,48,0.30)] flex items-center justify-center text-brand clip-corner-btn shadow-[0_0_12px_rgba(255,59,48,0.2)]">
              <Package className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-2xl font-bold text-ink tracking-tight leading-tight">{t('case.title')}</h1>
              <span className="text-[10px] sm:text-xs font-mono text-brand">{t('case.kicker')}</span>
            </div>
          </div>
          <CardDescription className="max-sm:text-xs">{t('case.desc')}</CardDescription>
        </div>

        <div className="pt-4 sm:pt-6 space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end">
            <div className="space-y-1.5">
              <label htmlFor="case-picker" className="block text-xs font-semibold text-slate-300">
                {t('case.activeCase')}
              </label>
              <SelectMenu
                id="case-picker"
                options={state.cases.map((c) => ({ value: c.id, label: c.name }))}
                value={activeCase.id}
                onChange={(next) => {
                  opening.reset()
                  setActiveCase(next)
                }}
              />
            </div>

            <div className="case-toolbar flex flex-wrap items-center gap-2 sm:col-span-2 lg:col-span-3">
              <Button variant="secondary" size="md" leftIcon={<Plus className="w-4 h-4" />} onClick={createCase}>
                {t('case.newCase')}
              </Button>
              <Button variant="ghost" size="md" leftIcon={<Copy className="w-4 h-4" />} onClick={() => duplicateCase(activeCase.id)}>
                {t('case.duplicateCase')}
              </Button>
              <Button variant="ghost" size="md" leftIcon={<RotateCcw className="w-4 h-4" />} onClick={() => setPendingCaseReset(activeCase)}>
                {t('case.resetCase')}
              </Button>
              {opening.preview ? (
                <Button variant="ghost" size="md" leftIcon={<Eye className="w-4 h-4" />} onClick={togglePreview}>
                  {t('case.exitPreview')}
                </Button>
              ) : revealed ? (
                <Button variant="secondary" size="md" leftIcon={<Pencil className="w-4 h-4" />} onClick={backToEditor}>
                  {t('case.editCase')}
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  size="md"
                  leftIcon={<Eye className="w-4 h-4" />}
                  disabled={obtainableCount === 0 || opening.busy}
                  onClick={togglePreview}
                >
                  {t('case.preview')}
                </Button>
              )}
              <Button
                variant="ghost"
                size="md"
                leftIcon={<Trash2 className="w-4 h-4" />}
                disabled={state.cases.length <= 1}
                onClick={() => setPendingCaseDelete(activeCase)}
                className="text-brand hover:bg-brand/10"
              >
                {t('case.deleteCase')}
              </Button>
            </div>
          </div>

          <CaseStage
            activeCase={activeCase}
            phase={opening.phase}
            busy={opening.busy}
            itemCount={activeCase.items.length}
            obtainableCount={obtainableCount}
            reveal={reveal}
            revealImage={revealImage}
            preview={opening.preview}
            reducedMotion={reducedMotion}
            strip={opening.strip}
            imageUrls={imageUrls}
            targetIndex={opening.targetIndex}
            spinId={opening.spinId}
            durationMs={reducedMotion ? 0 : activeCase.spinMs}
            onOpen={opening.open}
            onSpinDone={opening.onSpinDone}
            onSpinScheduled={opening.onSpinScheduled}
          />

          <div className="case-history pt-4 border-t border-edge">
            <HistoryPanel history={state.history} imageUrls={historyImageUrls} />
          </div>

          {editingOpen && (
            <div className="case-editor pt-2 border-t border-edge space-y-5">
              <SegmentedControl
                options={[...TABS]}
                value={tab}
                onChange={(next) => setTab(next as Tab)}
                ariaLabel={t('case.editorTabs')}
                labelFor={tabLabel}
                size="sm"
              />

              {tab === 'items' && (
                <ItemListPanel
                  caseId={activeCase.id}
                  items={activeCase.items}
                  rarities={activeCase.rarities}
                  imageUrls={imageUrls}
                  onAdd={() => setEditor({ item: null })}
                  onEdit={(item) => setEditor({ item })}
                />
              )}

              {tab === 'rarity' && <RarityTable caseId={activeCase.id} rarities={activeCase.rarities} items={activeCase.items} />}

              {tab === 'sound' && <SoundSlots caseId={activeCase.id} sounds={activeCase.sounds} settings={state.settings} />}

              {tab === 'settings' && (
                <CaseSettingsPanel activeCase={activeCase} onPreview={togglePreview} />
              )}
            </div>
          )}
        </div>
      </div>

      {editor && (
        <ItemEditorModal
          key={editor.item?.id ?? 'new'}
          caseId={activeCase.id}
          item={editor.item}
          rarities={activeCase.rarities}
          caseItems={activeCase.items}
          existingImageUrl={editor.item?.imageAssetId ? imageUrls[editor.item.imageAssetId] : undefined}
          onClose={() => setEditor(null)}
        />
      )}

      <ConfirmModal
        isOpen={pendingCaseDelete !== null}
        title={t('case.deleteCaseTitle')}
        message={pendingCaseDelete ? t('case.deleteCaseConfirm', { name: pendingCaseDelete.name }) : undefined}
        onConfirm={() => void confirmCaseDelete()}
        onClose={() => setPendingCaseDelete(null)}
      />

      <ConfirmModal
        isOpen={pendingCaseReset !== null}
        title={t('case.resetCaseTitle')}
        message={pendingCaseReset ? t('case.resetCaseConfirm', { name: pendingCaseReset.name }) : undefined}
        onConfirm={confirmCaseReset}
        onClose={() => setPendingCaseReset(null)}
      />
    </div>
  )
}
