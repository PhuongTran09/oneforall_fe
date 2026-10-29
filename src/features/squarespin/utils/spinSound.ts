import { audioEngine } from '../../caseopening/utils/audio'
import { BUILTIN_SOUND_PACK } from '../../caseopening/utils/builtinSounds'
import type { SpinPlan } from '../../caseopening/utils/roulette'
import { startTicks, type TickHandle } from '../../caseopening/utils/tickSound'
import type { WheelSlot } from '../types'
import type { ChasePlan } from './chase'

/**
 * Âm thanh lượt quay — nối lịch nhịp của `chaseSchedule` vào engine case-opening.
 *
 * Wrapper này bắt buộc vì `AudioEngine` chỉ giữ MỘT `this.ticks`: hai vòng cùng quay
 * thì vòng sau bỏ rơi handle của vòng nhất. Mỗi slot giữ handle riêng; fanfare dùng
 * slot riêng `'square-spin'` để không giẫm phần thưởng của mở hòm.
 */

const FANFARE_SLOT = 'square-spin'
const chases = new Map<WheelSlot, TickHandle>()

/** Nhịp sáng của wheel -> lịch tick: mỗi ô được rọi là một tiếng tách. */
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

/** Nhạc thắng — âm lượng đã được `configureSound` bật sẵn ở đầu lượt quay. */
export function playFanfare(): void {
  void audioEngine.play(FANFARE_SLOT, BUILTIN_SOUND_PACK.reward, {
    onEnded: () => audioEngine.stop(FANFARE_SLOT),
  })
}

export function stopFanfare(): void {
  audioEngine.stop(FANFARE_SLOT)
}
