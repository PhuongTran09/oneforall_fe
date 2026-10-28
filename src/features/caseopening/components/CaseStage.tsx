import { useCallback, useRef, type CSSProperties, type PointerEvent as ReactPointerEvent } from 'react'
import { Button } from '../../../components/common/Button'
import { t } from '../../../i18n/langStore'
import type { CaseConfig, CaseItem, Rarity, StripCell } from '../types'
import type { OpenPhase } from '../hooks/useCaseOpening'
import { contrastInk } from '../utils/contrast'
import type { SpinPlan } from '../utils/roulette'
import { CaseRoulette } from './CaseRoulette'
import { ItemTile } from './ItemTile'

export interface CaseReveal {
  item: CaseItem
  rarity: Rarity | null
}

export interface CaseStageProps {
  activeCase: CaseConfig
  phase: OpenPhase
  busy: boolean
  itemCount: number
  obtainableCount: number
  reveal: CaseReveal | null
  revealImage?: string
  preview: boolean
  reducedMotion: boolean
  strip: StripCell[]
  imageUrls: Record<string, string>
  targetIndex: number
  spinId: number
  durationMs: number
  onOpen: () => void
  onSpinDone: () => void
  onSpinScheduled: (plan: SpinPlan) => void
}

export function CaseStage({
  activeCase,
  phase,
  busy,
  itemCount,
  obtainableCount,
  reveal,
  revealImage,
  preview,
  reducedMotion,
  strip,
  imageUrls,
  targetIndex,
  spinId,
  durationMs,
  onOpen,
  onSpinDone,
  onSpinScheduled,
}: CaseStageProps) {
  const stageStyle = {
    '--case-accent': activeCase.accentColor,
    '--case-bg': activeCase.backgroundColor,
    '--case-ink': contrastInk(activeCase.backgroundColor),
  } as CSSProperties

  const showFx = !reducedMotion
  const revealed = reveal !== null && phase === 'revealed'
  const showStrip = strip.length > 0 && (phase === 'spinning' || phase === 'revealed')
  const showBox = !revealed && !showStrip
  const rarityColor = reveal ? (reveal.rarity?.color ?? reveal.item.color) : activeCase.accentColor

  const boxRef = useRef<HTMLDivElement>(null)
  // Nghiêng theo con trỏ bằng CSS biến trực tiếp: không có re-render cho mỗi frame.
  const tiltBox = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      const el = boxRef.current
      if (!el || reducedMotion) return
      const r = el.getBoundingClientRect()
      const px = (e.clientX - r.left) / r.width - 0.5
      const py = (e.clientY - r.top) / r.height - 0.5
      el.style.setProperty('--tilt-y', `${(-22 + px * 30).toFixed(2)}deg`)
      el.style.setProperty('--tilt-x', `${(18 - py * 14).toFixed(2)}deg`)
    },
    [reducedMotion],
  )
  const resetTilt = useCallback(() => {
    const el = boxRef.current
    if (!el) return
    el.style.removeProperty('--tilt-y')
    el.style.removeProperty('--tilt-x')
  }, [])

  return (
    <div className="case-stage" style={stageStyle}>
      {showStrip && (
        <CaseRoulette
          cells={strip}
          imageUrls={imageUrls}
          targetIndex={targetIndex}
          spinId={spinId}
          spinning={phase === 'spinning'}
          durationMs={durationMs}
          onDone={onSpinDone}
          onSpinScheduled={onSpinScheduled}
        />
      )}

      {showBox && (
        <div
          ref={boxRef}
          className="case-box"
          data-shaking={phase === 'shaking' ? 'true' : 'false'}
          onPointerMove={tiltBox}
          onPointerLeave={resetTilt}
        >
          <div className="case-box-glow" aria-hidden="true" />
          <div className="case-crate-shadow" aria-hidden="true" />
          <div className="case-crate-tilt">
            <div className="case-crate">
              <div className="case-crate-face case-crate-face-back" aria-hidden="true" />
              <div className="case-crate-face case-crate-face-left" aria-hidden="true" />
              <div className="case-crate-face case-crate-face-right" aria-hidden="true" />
              <div className="case-crate-face case-crate-face-bottom" aria-hidden="true" />
              <div className="case-crate-inside" aria-hidden="true" />
              <div className="case-lid-mount" aria-hidden="true">
                <div className="case-lid">
                  <div className="case-lid-inner" />
                  <span className="case-lid-latch" />
                </div>
              </div>
              <div className="case-crate-face case-crate-face-front">
                <div className="case-crate-plate">
                  <span className="case-box-title text-xs sm:text-sm text-center break-words">{activeCase.name}</span>
                  <span className="case-box-count text-[9px] sm:text-[10px] font-mono uppercase tracking-wider">
                    {itemCount === 0 ? t('case.emptyBox') : t('case.itemCount', { count: itemCount })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {revealed && reveal && (
        <div className="case-reveal" style={{ '--fx': rarityColor } as CSSProperties}>
          <div className="relative">
            {showFx && activeCase.effect !== 'none' && <span className="case-reveal-pool" aria-hidden="true" />}
            <ItemTile
              name={reveal.item.name}
              color={reveal.item.color}
              rarityColor={rarityColor}
              imageUrl={revealImage}
              size="lg"
              className="case-pop relative z-10"
            />
          </div>
          <div className="text-center space-y-1 mt-3 relative z-10">
            <span className="case-rarity-badge" style={{ background: rarityColor, color: contrastInk(rarityColor) }}>
              {reveal.rarity?.name ?? t('case.rarityUnknown')}
            </span>
            <h3 className="case-reward-name text-base sm:text-lg font-extrabold leading-tight break-words">{reveal.item.name}</h3>
            {reveal.item.description && <p className="case-reward-desc text-xs max-w-xs mx-auto">{reveal.item.description}</p>}
            {preview && <p className="text-[10px] font-mono uppercase tracking-wide text-brand">{t('case.previewTag')}</p>}
          </div>
        </div>
      )}

      <div className="relative z-10 w-full max-w-[190px] sm:max-w-[240px] mt-4 sm:mt-5">
        <Button
          variant="glow"
          size="md"
          fullWidth
          className="btn-shimmer case-open-btn"
          isLoading={busy}
          disabled={obtainableCount === 0 || busy}
          onClick={onOpen}
        >
          {busy ? t('case.opening') : revealed && !preview ? t('case.openAgain') : t('case.openBox')}
        </Button>
      </div>

      {obtainableCount === 0 && (
        <p className="relative z-10 mt-2.5 text-xs text-brand text-center max-w-md">
          {itemCount === 0 ? t('case.emptyHint') : t('case.err.allZeroWeights')}
        </p>
      )}
    </div>
  )
}
