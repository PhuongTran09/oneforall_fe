import { Gauge, Turtle, Zap } from 'lucide-react'
import { Button } from '../../../components/common/Button'
import { t } from '../../../i18n/langStore'
import { RangeField, SwitchField } from '../../caseopening/components/FormControls'
import {
  DEFAULT_SPIN_MS,
  FAST_SPIN_MS,
  MAX_ROTATIONS,
  MAX_SPIN_MS,
  MIN_ROTATIONS,
  MIN_SPIN_MS,
  SLOW_SPIN_MS,
} from '../defaults'
import type { WheelConfig } from '../types'

export interface SpinConfigPanelProps {
  config: WheelConfig
  busy: boolean
  onChange: (patch: Partial<WheelConfig>) => void
}

const seconds = (ms: number): string => `${(ms / 1000).toFixed(1)}s`

export function SpinConfigPanel({ config, busy, onChange }: SpinConfigPanelProps) {
  return (
    <div className="spin-config space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant={config.spinMs <= FAST_SPIN_MS ? 'primary' : 'ghost'}
          size="sm"
          leftIcon={<Zap className="w-3.5 h-3.5" />}
          disabled={busy}
          onClick={() => onChange({ spinMs: FAST_SPIN_MS })}
        >
          {t('spin.config.fast')}
        </Button>
        <Button
          variant={config.spinMs > FAST_SPIN_MS && config.spinMs < SLOW_SPIN_MS ? 'primary' : 'ghost'}
          size="sm"
          leftIcon={<Gauge className="w-3.5 h-3.5" />}
          disabled={busy}
          onClick={() => onChange({ spinMs: DEFAULT_SPIN_MS })}
        >
          {t('spin.config.normal')}
        </Button>
        <Button
          variant={config.spinMs >= SLOW_SPIN_MS ? 'primary' : 'ghost'}
          size="sm"
          leftIcon={<Turtle className="w-3.5 h-3.5" />}
          disabled={busy}
          onClick={() => onChange({ spinMs: SLOW_SPIN_MS })}
        >
          {t('spin.config.slow')}
        </Button>
      </div>

      <RangeField
        label={t('spin.config.duration')}
        value={config.spinMs}
        min={MIN_SPIN_MS}
        max={MAX_SPIN_MS}
        step={100}
        format={seconds}
        disabled={busy}
        onChange={(next) => onChange({ spinMs: next })}
        hint={t('spin.config.durationHint')}
      />

      <RangeField
        label={t('spin.config.rotations')}
        value={config.rotations}
        min={MIN_ROTATIONS}
        max={MAX_ROTATIONS}
        step={1}
        format={(v) => t('spin.config.rotationsValue', { turns: v })}
        disabled={busy}
        onChange={(next) => onChange({ rotations: next })}
        hint={t('spin.config.rotationsHint')}
      />

      <SwitchField
        label={t('spin.config.removeWinner')}
        checked={config.removeWinner}
        onChange={(next) => onChange({ removeWinner: next })}
        hint={t('spin.config.removeWinnerHint')}
      />
    </div>
  )
}
