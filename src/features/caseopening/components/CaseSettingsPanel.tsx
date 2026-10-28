import { Eye } from 'lucide-react'
import { Button } from '../../../components/common/Button'
import { SegmentedControl } from '../../../components/common/SegmentedControl'
import { t } from '../../../i18n/langStore'
import type { CaseConfig, EffectKind } from '../types'
import { patchCase } from '../store/caseStore'
import { MAX_CELLS, MIN_CELLS } from '../utils/roulette'
import { ColorField, RangeField, TextField } from './FormControls'

const ACCENT_PRESETS = ['#cf2216', '#d8431c', '#c8571d', '#ff3b30', '#3b82f6', '#a855f7', '#f5c518', '#22d3ee']
const BACKGROUND_PRESETS = ['#12121a', '#0a0a0f', '#1a1a24', '#221015', '#f5f5f7', '#ffffff']
const EFFECTS: EffectKind[] = ['none', 'glow']

const effectLabel = (kind: string): string => t(`case.effect.${kind}`)
const seconds = (ms: number): string => `${(ms / 1000).toFixed(1)}${t('case.unitSec')}`

export interface CaseSettingsPanelProps {
  activeCase: CaseConfig
  onPreview: () => void
}

export function CaseSettingsPanel({ activeCase, onPreview }: CaseSettingsPanelProps) {
  const obtainable = activeCase.items.some((i) => i.weight > 0)

  return (
    <div className="space-y-5">
      <TextField
        label={t('case.caseName')}
        value={activeCase.name}
        onChange={(next) => patchCase(activeCase.id, { name: next })}
        maxLength={60}
        placeholder={t('case.caseNamePlaceholder')}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ColorField
          label={t('case.accentColor')}
          value={activeCase.accentColor}
          onChange={(next) => patchCase(activeCase.id, { accentColor: next })}
          presets={ACCENT_PRESETS}
        />
        <ColorField
          label={t('case.backgroundColor')}
          value={activeCase.backgroundColor}
          onChange={(next) => patchCase(activeCase.id, { backgroundColor: next })}
          presets={BACKGROUND_PRESETS}
        />
      </div>

      <div className="space-y-2">
        <span className="block text-xs font-semibold text-slate-300">{t('case.effectLabel')}</span>
        <div className="sm:max-w-xs">
          <SegmentedControl
            options={EFFECTS}
            value={activeCase.effect}
            onChange={(next) => patchCase(activeCase.id, { effect: next as EffectKind })}
            ariaLabel={t('case.effectLabel')}
            labelFor={effectLabel}
            size="sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <RangeField
          label={t('case.spinDuration')}
          value={activeCase.spinMs}
          onChange={(next) => patchCase(activeCase.id, { spinMs: next })}
          min={1200}
          max={15000}
          step={200}
          format={seconds}
          hint={t('case.spinDurationHint')}
        />
        <RangeField
          label={t('case.stripCells')}
          value={activeCase.stripCells}
          onChange={(next) => patchCase(activeCase.id, { stripCells: next })}
          min={MIN_CELLS}
          max={MAX_CELLS}
          step={2}
          format={(v) => String(v)}
          hint={t('case.stripCellsHint')}
        />
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
        <Button
          variant="secondary"
          size="md"
          leftIcon={<Eye className="w-4 h-4" />}
          disabled={!obtainable}
          onClick={onPreview}
          className="sm:w-auto w-full"
        >
          {t('case.preview')}
        </Button>
        <p className="text-xs text-slate-400 leading-relaxed sm:flex-1">{t('case.autoSaved')}</p>
      </div>
    </div>
  )
}
