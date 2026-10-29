import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { showToast } from '../../../components/feedback/toastStore'
import { t } from '../../../i18n/langStore'
import type { SpinEntry, WheelConfig, WheelSlot } from '../types'
import { recordSpin, removeEntry } from '../store/spinStore'
import { uniformIndex } from '../utils/fair'
import { chaseSchedule, type ChasePlan } from '../utils/chase'
import { configureSound, playChase, playFanfare, stopChase, stopFanfare } from '../utils/spinSound'
import { layoutWheel, type WheelLayout } from '../utils/wheel'

export type SpinPhase = 'idle' | 'spinning' | 'stopped'

/** Chờ một nhịp sau cú "cạch" để nhạc thắng không đè tiếng đậu. */
const FANFARE_LAG_MS = 160

export interface SpinSound {
  enabled: boolean
  volume: number
}

/** Kết quả đã chốt của một lượt quay — bắt buộc trùng ô mà ánh sáng dừng lại. */
export interface SpinWinner {
  entryId: string
  name: string
  /** Index trong danh sách lúc quay — để đối chiếu trong test. */
  index: number
  /** Số ô đang quay — xác suất đều là 1/poolSize. */
  poolSize: number
  /** Tùy chọn xoá ô trúng sau lượt quay, chốt cùng lúc với kết quả. */
  removeWinner: boolean
}

/**
 * Chờ thêm sau deadline phòng tab nền bị kẹp nhịp — kết quả vẫn công bố đúng,
 * chỉ animation cắt ngắn.
 */
const FINISH_GRACE_MS = 260

export interface WheelSpin {
  phase: SpinPhase
  busy: boolean
  winner: SpinWinner | null
  /** Ô đang được rọi sáng; sau khi dừng vẫn còn và chính là ô trúng. */
  litSlot: number | null
  /** Vành đang vẽ — có thể là vành đã chốt lúc bắt đầu quay, xem `holdLayout`. */
  layout: WheelLayout
  spin: () => void
  /** Người dùng sửa danh sách: kết quả cũ không còn mô tả ô nào trên vành mới. */
  invalidate: () => void
  reset: () => void
}

/**
 * Máy trạng thái của một wheel: chốt kết quả bằng Web Crypto trước, rồi chỉ đạo
 * ánh sáng dừng đúng ô đó. Animation không có quyền quyết định lại.
 */
export function useSquareSpin(
  slot: WheelSlot,
  entries: SpinEntry[],
  config: WheelConfig,
  reducedMotion: boolean,
  sound: SpinSound,
): WheelSpin {
  const layout = useMemo(() => layoutWheel(entries), [entries])
  /** Vành của lượt quay gần nhất. Giữ lại để tuỳ chọn xoá không làm sáng lệch ô. */
  const [heldLayout, setHeldLayout] = useState<WheelLayout | null>(null)

  const [phase, setPhase] = useState<SpinPhase>('idle')
  const [winner, setWinner] = useState<SpinWinner | null>(null)
  const [litSlot, setLitSlot] = useState<number | null>(null)

  /** Hẹn giờ của nhịp sáng kế tiếp — một hop tại một thời điểm. */
  const hopRef = useRef<number | null>(null)
  /** Deadline tuyệt đối, phòng khi chuỗi hop bị chậm. */
  const finishRef = useRef<number | null>(null)
  /** Nhạc thắng nổi sau cú "cạch", huỷ được khi quay lượt mới hoặc unmount. */
  const fanfareRef = useRef<number | null>(null)
  const pendingRef = useRef<SpinWinner | null>(null)
  /** Ô mà lịch sáng dừng lại = ô trúng, chốt ngay khi dựng lịch. */
  const landingSlotRef = useRef<number | null>(null)
  /** Bật/tắt tiếng chốt lúc bắt đầu quay: sửa toggle giữa lượt thì nhịp đã chạy không bị giật lại. */
  const soundOnRef = useRef(false)

  const clearTimers = useCallback(() => {
    if (hopRef.current !== null) {
      window.clearTimeout(hopRef.current)
      hopRef.current = null
    }
    if (finishRef.current !== null) {
      window.clearTimeout(finishRef.current)
      finishRef.current = null
    }
    if (fanfareRef.current !== null) {
      window.clearTimeout(fanfareRef.current)
      fanfareRef.current = null
    }
  }, [])

  const dropResult = useCallback(() => {
    setWinner(null)
    setPhase('idle')
    setHeldLayout(null)
    setLitSlot(null)
  }, [])

  const finish = useCallback(() => {
    const pending = pendingRef.current
    if (!pending) return
    pendingRef.current = null
    clearTimers()
    setPhase('stopped')
    setWinner(pending)
    // Giữ ánh sáng trên ô trúng — cú "đậu" về đúng ô đã chốt.
    setLitSlot(landingSlotRef.current)
    recordSpin({ slot, entryId: pending.entryId, name: pending.name, poolSize: pending.poolSize })
    // Vành đã chốt (`heldLayout`) giữ nguyên nên ô vừa trúng vẫn sáng dù bị xoá khỏi danh sách.
    if (pending.removeWinner) removeEntry(slot, pending.entryId)
    stopChase(slot)
    // Tắt tiếng giữa lượt thì chỉ mất nốt nhạc — nhịp đã phát không giật lại được.
    if (soundOnRef.current) {
      fanfareRef.current = window.setTimeout(playFanfare, FANFARE_LAG_MS)
    }
  }, [clearTimers, slot])

  /**
   * Chuỗi hop: mỗi bước đổi một giá trị `litSlot`, theo mốc thời gian tuyệt đối
   * của `atMs` — trễ một nhịp không cộng dồn thành trễ cả lượt.
   */
  const runChase = useCallback(
    (plan: ChasePlan) => {
      const startedAt = Date.now()
      let i = 0
      const hop = () => {
        const step = plan.steps[i]
        if (!step) return
        setLitSlot(step.slot)
        i += 1
        const next = plan.steps[i]
        if (!next) {
          hopRef.current = null
          finish()
          return
        }
        hopRef.current = window.setTimeout(hop, Math.max(0, next.atMs - (Date.now() - startedAt)))
      }
      hop()
    },
    [finish],
  )

  const spin = useCallback(() => {
    if (phase === 'spinning') return
    if (entries.length === 0) {
      showToast({ type: 'warning', message: t('spin.err.empty') })
      return
    }
    // Tên rỗng chỉ xuất hiện lúc đang gõ; quay thì sẽ ra ô không có tên.
    if (entries.some((e) => !e.name.trim())) {
      showToast({ type: 'warning', message: t('spin.err.blankName') })
      return
    }
    let index: number
    try {
      // Kết quả chốt ở đây, trước mọi animation.
      index = uniformIndex(entries.length)
    } catch {
      showToast({ type: 'error', message: t('spin.err.rng') })
      return
    }
    const entry = entries[index]
    const cell = layout.cells.find((c) => c.entryIndex === index)
    if (!entry || !cell) {
      showToast({ type: 'error', message: t('spin.err.layout') })
      return
    }
    const plan = chaseSchedule({
      slots: layout.cells.length,
      startSlot: 0,
      winnerSlot: cell.slot,
      laps: config.rotations,
      spinMs: reducedMotion ? 0 : config.spinMs,
    })

    clearTimers()
    const enabled = sound.enabled
    const volume = sound.volume
    soundOnRef.current = enabled
    configureSound(enabled, volume)
    // Reduced motion: không có animation để tiếng đi theo — bỏ nhịp tách, giữ nhạc thắng.
    if (enabled && !reducedMotion) playChase(slot, plan, volume)
    landingSlotRef.current = plan.steps[plan.steps.length - 1]!.slot
    pendingRef.current = {
      entryId: entry.id,
      name: entry.name,
      index,
      poolSize: entries.length,
      removeWinner: config.removeWinner,
    }
    setHeldLayout(layout)
    setWinner(null)
    setLitSlot(null)
    setPhase('spinning')
    finishRef.current = window.setTimeout(finish, plan.totalMs + FINISH_GRACE_MS)
    runChase(plan)
  }, [clearTimers, config.rotations, config.removeWinner, config.spinMs, entries, finish, layout, phase, reducedMotion, runChase, slot, sound.enabled, sound.volume])

  const invalidate = useCallback(() => {
    if (phase === 'spinning') return
    dropResult()
  }, [dropResult, phase])

  const reset = useCallback(() => {
    clearTimers()
    pendingRef.current = null
    stopChase(slot)
    stopFanfare()
    dropResult()
  }, [clearTimers, dropResult, slot])

  /* Unmount chỉ được touch phần của mình — stopAll() sẽ tắt luôn nhạc thắng của vòng kia. */
  useEffect(
    () => () => {
      clearTimers()
      stopChase(slot)
      stopFanfare()
    },
    [clearTimers, slot],
  )

  return {
    phase,
    busy: phase === 'spinning',
    winner,
    litSlot,
    layout: heldLayout ?? layout,
    spin,
    invalidate,
    reset,
  }
}
