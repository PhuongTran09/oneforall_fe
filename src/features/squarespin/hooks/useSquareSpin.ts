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


const FANFARE_LAG_MS = 160

export interface SpinSound {
  enabled: boolean
  volume: number
}


export interface SpinWinner {
  entryId: string
  name: string

  index: number

  poolSize: number

  removeWinner: boolean
}





const FINISH_GRACE_MS = 260

export interface WheelSpin {
  phase: SpinPhase
  busy: boolean
  winner: SpinWinner | null

  litSlot: number | null

  layout: WheelLayout
  spin: () => void

  invalidate: () => void
  reset: () => void
}





export function useSquareSpin(
  slot: WheelSlot,
  entries: SpinEntry[],
  config: WheelConfig,
  reducedMotion: boolean,
  sound: SpinSound,
): WheelSpin {
  const layout = useMemo(() => layoutWheel(entries), [entries])

  const [heldLayout, setHeldLayout] = useState<WheelLayout | null>(null)

  const [phase, setPhase] = useState<SpinPhase>('idle')
  const [winner, setWinner] = useState<SpinWinner | null>(null)
  const [litSlot, setLitSlot] = useState<number | null>(null)


  const hopRef = useRef<number | null>(null)

  const finishRef = useRef<number | null>(null)

  const fanfareRef = useRef<number | null>(null)
  const pendingRef = useRef<SpinWinner | null>(null)

  const landingSlotRef = useRef<number | null>(null)

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

    setLitSlot(landingSlotRef.current)
    recordSpin({ slot, entryId: pending.entryId, name: pending.name, poolSize: pending.poolSize })

    if (pending.removeWinner) removeEntry(slot, pending.entryId)
    stopChase(slot)

    if (soundOnRef.current) {
      fanfareRef.current = window.setTimeout(playFanfare, FANFARE_LAG_MS)
    }
  }, [clearTimers, slot])





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

    if (entries.some((e) => !e.name.trim())) {
      showToast({ type: 'warning', message: t('spin.err.blankName') })
      return
    }
    let index: number
    try {

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
