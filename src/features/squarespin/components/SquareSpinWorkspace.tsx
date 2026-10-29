import { Dices, Play, RotateCcw, Volume2, VolumeX } from 'lucide-react'
import { useState } from 'react'
import { Button } from '../../../components/common/Button'
import { CardDescription } from '../../../components/common/Card'
import { SEOHead } from '../../../components/common/SEOHead'
import { SegmentedControl } from '../../../components/common/SegmentedControl'
import { ConfirmModal } from '../../../components/feedback/ConfirmModal'
import { showToast } from '../../../components/feedback/toastStore'
import { useReducedMotion } from '../../../hooks/useReducedMotion'
import { getLang, t } from '../../../i18n/langStore'
import { RangeField, SwitchField } from '../../caseopening/components/FormControls'
import { MODES } from '../defaults'
import { useSquareSpin, type WheelSpin } from '../hooks/useSquareSpin'
import { configFor, patchConfig, resetWheel, setMode, setSharedConfig, setSound, useSpinStore } from '../store/spinStore'
import type { SpinEntry, SpinMode, WheelConfig, WheelSlot } from '../types'
import { NameListPanel } from './NameListPanel'
import { SpinConfigPanel } from './SpinConfigPanel'
import { SpinHistoryPanel } from './SpinHistoryPanel'
import { SpinResultPanel, type WheelResult } from './SpinResultPanel'
import { SquareWheel } from './SquareWheel'

const modeLabel = (mode: string): string => t(`spin.mode.${mode}`)

interface WheelBlockProps {
  slot: WheelSlot
  label: string
  entries: SpinEntry[]
  spin: WheelSpin
  onSpin: () => void
}

/** Một cột quay: vòng (nút quay nằm trong hub) và nút reset. Kết quả, list, config là phần riêng. */
function WheelBlock({ slot, label, entries, spin, onSpin }: WheelBlockProps) {
  const count = entries.length
  const [pendingReset, setPendingReset] = useState(false)

  const doReset = () => {
    // Thứ tự quan trọng: ghi danh sách mẫu trước rồi mới bỏ kết quả cũ, nếu không
    // kết quả của lượt trước vẫn treo trong hub dù danh sách mới không còn nó.
    resetWheel(slot)
    spin.reset()
    setPendingReset(false)
    showToast({ type: 'success', message: t('spin.resetDone') })
  }

  return (
    <div className="spin-block space-y-4" data-slot={slot}>
      <SquareWheel
        slot={slot}
        label={label}
        layout={spin.layout}
        phase={spin.phase}
        litSlot={spin.litSlot}
        winnerEntryId={spin.winner?.entryId ?? null}
        winnerName={spin.winner?.name ?? null}
        count={count}
        onSpin={onSpin}
        busy={spin.busy}
      />
      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          leftIcon={<RotateCcw className="w-4 h-4" />}
          disabled={spin.busy}
          title={spin.busy ? t('spin.resetBusyHint') : undefined}
          onClick={() => setPendingReset(true)}
        >
          {t('spin.reset')}
        </Button>
        {count === 0 ? (
          <p role="alert" className="min-w-0 flex-1 text-[11px] text-brand leading-relaxed">
            {t('spin.err.empty')}
          </p>
        ) : null}
      </div>
      <ConfirmModal
        isOpen={pendingReset}
        title={t('spin.resetTitle')}
        message={t('spin.resetConfirm', { count })}
        onConfirm={doReset}
        onClose={() => setPendingReset(false)}
      />
    </div>
  )
}

interface WheelSetupProps {
  slot: WheelSlot
  label: string
  entries: SpinEntry[]
  config: WheelConfig
  busy: boolean
  copyTo?: WheelSlot
  onMutate: () => void
  /** Chỉ dùng khi có `copyTo`: danh sách wheel nhận vừa bị ghi đè. */
  onCopy?: () => void
}

function WheelSetup({ slot, label, entries, config, busy, copyTo, onMutate, onCopy }: WheelSetupProps) {
  return (
    <div className="spin-setup min-w-0 space-y-4 p-3 sm:p-4 bg-page border border-edge clip-corner-card" data-slot={slot}>
      <SpinConfigPanel config={config} busy={busy} onChange={(patch) => patchConfig(slot, patch)} />
      <div className="pt-4 border-t border-edge">
        <NameListPanel
          slot={slot}
          label={t('spin.list.title', { label })}
          entries={entries}
          busy={busy}
          copyTo={copyTo}
          onMutate={onMutate}
          onCopy={onCopy}
        />
      </div>
    </div>
  )
}

export function SquareSpinWorkspace() {
  const state = useSpinStore()
  const reducedMotion = useReducedMotion()
  const double = state.mode === 'double'

  const configA = state.wheelA
  const configB = configFor(state, 'B')
  const sound = { enabled: state.soundEnabled, volume: state.soundVolume }
  const spinA = useSquareSpin('A', state.listA.entries, configA, reducedMotion, sound)
  const spinB = useSquareSpin('B', state.listB.entries, configB, reducedMotion, sound)

  const labelA = t('spin.wheelA')
  const labelB = t('spin.wheelB')
  const spinBoth = () => {
    spinA.spin()
    spinB.spin()
  }

  const resultA: WheelResult = {
    slot: 'A',
    label: labelA,
    phase: spinA.phase,
    winner: spinA.winner,
    count: state.listA.entries.length,
  }
  const resultB: WheelResult = {
    slot: 'B',
    label: labelB,
    phase: spinB.phase,
    winner: spinB.winner,
    count: state.listB.entries.length,
  }
  const results = double ? [resultA, resultB] : [resultA]

  const path = getLang() === 'en' ? '/en/square-spin' : '/square-spin'

  return (
    <div className="page-container spin-page-container relative">
      <SEOHead title={t('spin.seoTitle')} description={t('spin.seoDesc')} canonicalUrl={`https://oneforall.io.vn${path}`} noindex />
      <div className="hero-ambient-glow" aria-hidden="true" />

      <div className="relative z-10 p-4 sm:p-8">
        <div className="spin-head pb-4 sm:pb-6 border-b border-edge">
          <div className="flex items-center gap-2.5 sm:gap-3 mb-2">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-brand/10 border border-[rgba(255,59,48,0.30)] flex items-center justify-center text-brand clip-corner-btn shadow-[0_0_12px_rgba(255,59,48,0.2)]">
              <Dices className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-2xl font-bold text-ink tracking-tight leading-tight">{t('spin.title')}</h1>
              <span className="text-[10px] sm:text-xs font-mono text-brand">{t('spin.kicker')}</span>
            </div>
          </div>
          <CardDescription className="max-sm:text-xs">{t('spin.desc')}</CardDescription>
        </div>

        <div className="pt-4 sm:pt-6 space-y-4 sm:space-y-6">
          <div className="spin-toolbar space-y-2.5">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <SegmentedControl
                options={[...MODES]}
                value={state.mode}
                onChange={(next) => setMode(next as SpinMode)}
                ariaLabel={t('spin.modeLabel')}
                labelFor={modeLabel}
                size="sm"
              />
              {double ? (
                <Button
                  className="ms-auto"
                  variant="secondary"
                  size="sm"
                  leftIcon={<Play className="w-4 h-4" />}
                  disabled={spinA.busy || spinB.busy || state.listA.entries.length === 0 || state.listB.entries.length === 0}
                  onClick={spinBoth}
                >
                  {t('spin.ctaBoth')}
                </Button>
              ) : null}
            </div>
            <div className="flex flex-wrap items-start gap-x-4 gap-y-2">
              {double ? (
                <div className="min-w-0">
                  <SwitchField label={t('spin.sharedConfig')} checked={state.sharedConfig} onChange={setSharedConfig} />
                  <p className="hidden sm:block max-w-xs pl-6.5 text-xs text-slate-400 leading-relaxed">{t('spin.sharedConfigHint')}</p>
                </div>
              ) : null}
              <div className="flex min-w-0 items-start gap-2">
                {state.soundEnabled ? (
                  <Volume2 className="mt-1.5 w-4 h-4 shrink-0 text-brand" aria-hidden="true" />
                ) : (
                  <VolumeX className="mt-1.5 w-4 h-4 shrink-0 text-slate-500" aria-hidden="true" />
                )}
                <div className="min-w-0">
                  <SwitchField label={t('spin.sound')} checked={state.soundEnabled} onChange={(enabled) => setSound({ enabled })} />
                  <p className="hidden sm:block max-w-sm pl-6.5 text-xs text-slate-400 leading-relaxed">
                    {reducedMotion ? t('spin.soundReducedNote') : t('spin.soundHint')}
                  </p>
                </div>
              </div>
              <div className="spin-volume mt-1.5 w-28 sm:mt-0 sm:w-56">
                <RangeField
                  label={t('spin.soundVolume')}
                  value={state.soundVolume}
                  min={0}
                  max={1}
                  step={0.05}
                  disabled={!state.soundEnabled}
                  format={(v) => `${Math.round(v * 100)}%`}
                  onChange={(volume) => setSound({ volume })}
                />
              </div>
            </div>
          </div>

          {reducedMotion ? <p className="text-xs text-slate-400">{t('spin.reducedNote')}</p> : null}

          <div className="spin-layout" data-mode={state.mode}>
            <div className="min-w-0" data-area="wheel" data-slot="A">
              <WheelBlock slot="A" label={labelA} entries={state.listA.entries} spin={spinA} onSpin={spinA.spin} />
            </div>
            {double ? (
              <div className="min-w-0" data-area="wheel" data-slot="B">
                <WheelBlock slot="B" label={labelB} entries={state.listB.entries} spin={spinB} onSpin={spinB.spin} />
              </div>
            ) : null}
            <div className="min-w-0" data-area="result">
              <SpinResultPanel results={results} />
            </div>
            <div className="min-w-0" data-area="setup" data-slot="A">
              <WheelSetup
                slot="A"
                label={labelA}
                entries={state.listA.entries}
                config={configA}
                busy={spinA.busy}
                copyTo={double ? 'B' : undefined}
                onMutate={spinA.invalidate}
                onCopy={spinB.invalidate}
              />
            </div>
            {double ? (
              <div className="min-w-0" data-area="setup" data-slot="B">
                <WheelSetup slot="B" label={labelB} entries={state.listB.entries} config={configB} busy={spinB.busy} onMutate={spinB.invalidate} />
              </div>
            ) : null}
          </div>

          <div className="spin-history-wrap pt-4 border-t border-edge space-y-4">
            <SpinHistoryPanel history={state.history} />
            <p className="text-[11px] text-slate-500 leading-relaxed max-w-3xl">{t('spin.fairNote')}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
