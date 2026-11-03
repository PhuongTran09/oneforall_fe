import { audioEngine } from '../../caseopening/utils/audio'
import { BUILTIN_SOUND_PACK } from '../../caseopening/utils/builtinSounds'
import type { SpinPlan } from '../../caseopening/utils/roulette'
import { startTicks, type TickHandle } from '../../caseopening/utils/tickSound'
import type { WheelSlot } from '../types'
import type { ChasePlan } from './chase'









const FANFARE_SLOT = 'square-spin'
const chases = new Map<WheelSlot, TickHandle>()


export function tickPlan(plan: ChasePlan): SpinPlan {
  return { ticks: plan.steps.map((s) => s.atMs), stopAt: plan.totalMs }
}

export function configureSound(enabled: boolean, volume: number): void {
  audioEngine.configure({ enabled, volume })
}

export function playChase(slot: WheelSlot, plan: ChasePlan, volume: number): void {
  stopChase(slot)
  const handle = startTicks(tickPlan(plan), volume)
  if (handle) chases.set(slot, handle)
}

export function stopChase(slot: WheelSlot): void {
  const handle = chases.get(slot)
  if (!handle) return
  chases.delete(slot)
  handle.stop()
}


export function playFanfare(): void {
  void audioEngine.play(FANFARE_SLOT, BUILTIN_SOUND_PACK.reward, {
    onEnded: () => audioEngine.stop(FANFARE_SLOT),
  })
}

export function stopFanfare(): void {
  audioEngine.stop(FANFARE_SLOT)
}
