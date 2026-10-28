import { useCallback, useEffect, useRef, useState } from 'react'
import { t } from '../../../i18n/langStore'
import { showToast } from '../../../components/feedback/toastStore'
import type { CaseConfig, CaseItem, CaseSettings, OpenRecord, Rarity, StripCell } from '../types'
import { buildStrip, winnerCellIndex, type SpinPlan } from '../utils/roulette'
import { effectiveWeights, pickWeightedIndex, rarityMap } from '../utils/random'
import { audioEngine, SLOT_OPEN, SLOT_RARE, SLOT_REWARD, SLOT_SPIN } from '../utils/audio'
import { uid } from '../defaults'
import { recordOpen } from '../store/caseStore'

export type OpenPhase = 'idle' | 'shaking' | 'spinning' | 'revealed'

const SHAKE_MS = 620
/** Để cú "cạch" lúc băng phanh kịp nghe rõ trước tiếng công bố phần thưởng. */
const FANFARE_LAG_MS = 160

export interface CaseOpening {
  phase: OpenPhase
  busy: boolean
  /** Lượt chạy hiện tại là xem trước: cùng sequence, không ghi lịch sử. */
  preview: boolean
  strip: StripCell[]
  winner: CaseItem | null
  winnerRarity: Rarity | null
  targetIndex: number
  spinId: number
  open: () => void
  startPreview: () => void
  onSpinDone: () => void
  onSpinScheduled: (plan: SpinPlan) => void
  reset: () => void
}

/**
 * Máy trạng thái mở hòm: bấm nút → quay số ĐÃ xác định kết quả → dựng strip quanh ô
 * trúng thưởng → roulette chạy → kết thúc tại đúng ô đó. Animation không có quyền
 * đổi kết quả, và mỗi lượt chỉ có duy nhất một kết quả.
 */
export function useCaseOpening(activeCase: CaseConfig, settings: CaseSettings, reducedMotion: boolean): CaseOpening {
  const [phase, setPhase] = useState<OpenPhase>('idle')
  const [strip, setStrip] = useState<StripCell[]>([])
  const [winnerIndex, setWinnerIndex] = useState<number>(-1)
  const [winnerCaseId, setWinnerCaseId] = useState<string | null>(null)
  const [isPreview, setIsPreview] = useState(false)
  const previewRef = useRef(false)
  const [spinId, setSpinId] = useState(0)
  const timers = useRef<number[]>([])

  const clearTimers = useCallback(() => {
    timers.current.forEach((id) => window.clearTimeout(id))
    timers.current = []
  }, [])

  useEffect(
    () => () => {
      clearTimers()
      audioEngine.stopAll()
    },
    [clearTimers],
  )

  const finalize = useCallback(
    (index: number) => {
      const item = activeCase.items[index]
      if (!item) return
      const rarity = rarityMap(activeCase.rarities)[item.rarityId]
      audioEngine.stop(SLOT_SPIN)
      const rare = rarity ? activeCase.rarities.indexOf(rarity) >= activeCase.rarities.length - 2 : false
      const fanfare: [string, string | undefined] =
        rare && activeCase.sounds.rare ? [SLOT_RARE, activeCase.sounds.rare] : [SLOT_REWARD, activeCase.sounds.reward]
      timers.current.push(
        window.setTimeout(() => {
          void audioEngine.play(fanfare[0], fanfare[1])
        }, FANFARE_LAG_MS),
      )
      if (!previewRef.current) {
        const entry: OpenRecord = {
          id: uid('rec'),
          caseId: activeCase.id,
          caseName: activeCase.name,
          itemId: item.id,
          itemName: item.name,
          rarityId: item.rarityId,
          rarityName: rarity?.name ?? '',
          color: rarity?.color ?? item.color,
          imageAssetId: item.imageAssetId,
          at: Date.now(),
        }
        recordOpen(entry)
      }
      setWinnerCaseId(activeCase.id)
      setPhase('revealed')
    },
    [activeCase],
  )

  const start = useCallback(
    (preview: boolean) => {
      if (phase === 'shaking' || phase === 'spinning') return

      const weights = effectiveWeights(activeCase.items, activeCase.rarities)
      const index = pickWeightedIndex(weights)
      if (index === null) {
        showToast({ type: 'warning', message: t('case.err.allZeroWeights') })
        return
      }

      audioEngine.configure({ enabled: settings.soundEnabled, volume: settings.volume })
      previewRef.current = preview
      setIsPreview(preview)
      setWinnerIndex(index)
      setStrip(buildStrip(activeCase.items, activeCase.rarities, activeCase.stripCells, index))
      setSpinId((n) => n + 1)

      if (reducedMotion) {
        clearTimers()
        finalize(index)
        return
      }

      clearTimers()
      setPhase('shaking')
      void audioEngine.play(SLOT_OPEN, activeCase.sounds.open)
      timers.current.push(window.setTimeout(() => setPhase('spinning'), SHAKE_MS))
    },
    [activeCase, clearTimers, finalize, phase, reducedMotion, settings.soundEnabled, settings.volume],
  )

  const open = useCallback(() => start(false), [start])

  const startPreview = useCallback(() => start(true), [start])

  const onSpinDone = useCallback(() => {
    if (phase !== 'spinning') return
    finalize(winnerIndex)
  }, [finalize, phase, winnerIndex])

  // Tiếng quay nhận lịch thật từ roulette: `loop` chỉ còn nghĩa với tệp người dùng tải lên.
  const onSpinScheduled = useCallback(
    (plan: SpinPlan) => {
      void audioEngine.play(SLOT_SPIN, activeCase.sounds.spin, { spinPlan: plan, loop: true, restart: true })
    },
    [activeCase],
  )

  const reset = useCallback(() => {
    clearTimers()
    audioEngine.stopAll()
    setStrip([])
    setWinnerIndex(-1)
    setWinnerCaseId(null)
    previewRef.current = false
    setIsPreview(false)
    setPhase('idle')
  }, [clearTimers])

  // Kết quả đã công bố thuộc về hòm đang hiển thị; đổi/ xoá item giữa hai lượt làm nó hết nghĩa.
  const stale = phase === 'revealed' && winnerCaseId !== activeCase.id
  const visiblePhase: OpenPhase = stale ? 'idle' : phase
  const winner = !stale && winnerIndex >= 0 ? (activeCase.items[winnerIndex] ?? null) : null
  const winnerRarity = winner ? (rarityMap(activeCase.rarities)[winner.rarityId] ?? null) : null

  return {
    phase: visiblePhase,
    busy: phase === 'shaking' || phase === 'spinning',
    preview: !stale && isPreview,
    strip,
    winner,
    winnerRarity,
    targetIndex: winnerCellIndex(activeCase.stripCells),
    spinId,
    open,
    startPreview,
    onSpinDone,
    onSpinScheduled,
    reset,
  }
}
