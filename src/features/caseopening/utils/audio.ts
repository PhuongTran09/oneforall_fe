import { releaseAssetUrl, retainAssetUrl } from './assets'
import { isSynthSound } from './builtinSounds'
import { demoSpinPlan, type SpinPlan } from './roulette'
import { startTicks, type TickHandle } from './tickSound'

interface Player {
  el: HTMLAudioElement
  assetId: string
}

export interface PlayOptions {
  loop?: boolean
  restart?: boolean
  onEnded?: () => void

  spinPlan?: SpinPlan
}






class AudioEngine {
  private enabled = true
  private volume = 0.8
  private players = new Map<string, Player>()
  private ticks: { slot: string; handle: TickHandle } | null = null

  configure(next: { enabled?: boolean; volume?: number }): void {
    if (next.enabled !== undefined) this.enabled = next.enabled
    if (next.volume !== undefined) this.volume = Math.min(1, Math.max(0, next.volume))
    this.players.forEach(({ el }) => {
      el.volume = this.volume
      if (!this.enabled) el.pause()
    })
    if (!this.enabled && this.ticks) this.stop(this.ticks.slot)
  }

  async play(slot: string, assetId: string | undefined, opts: PlayOptions = {}): Promise<void> {
    if (!this.enabled || !assetId) return

    if (isSynthSound(assetId)) {
      this.stop(slot)

      const handle = startTicks(opts.spinPlan ?? demoSpinPlan(), this.volume)
      if (handle) this.ticks = { slot, handle }
      return
    }

    const current = this.players.get(slot)
    if (current && current.assetId !== assetId) this.stop(slot)

    try {
      let player = this.players.get(slot)
      if (!player) {
        const url = await retainAssetUrl(assetId)
        if (!url) return
        if (this.players.has(slot)) {
          releaseAssetUrl(assetId)
          return
        }
        const el = new Audio(url)
        el.preload = 'auto'
        el.volume = this.volume
        if (opts.onEnded) {
          el.addEventListener(
            'ended',
            () => {
              this.stop(slot)
              opts.onEnded?.()
            },
            { once: true },
          )
        }
        player = { el, assetId }
        this.players.set(slot, player)
      }
      if (!this.enabled) return
      player.el.loop = opts.loop ?? false
      if (opts.restart) player.el.currentTime = 0
      if (player.el.paused) await player.el.play()
    } catch {
      // Autoplay bị trình duyệt chặn hoặc nguồn lỗi: âm thanh là tăng cường, không được ném vào UI
    }
  }

  stop(slot: string): void {
    if (this.ticks?.slot === slot) {
      this.ticks.handle.stop()
      this.ticks = null
    }
    const player = this.players.get(slot)
    if (!player) return
    player.el.pause()
    player.el.currentTime = 0
    releaseAssetUrl(player.assetId)
    this.players.delete(slot)
  }

  stopAll(): void {
    for (const slot of [...this.players.keys()]) this.stop(slot)
    if (this.ticks) this.stop(this.ticks.slot)
  }
}

export const audioEngine = new AudioEngine()
export const SLOT_SPIN = 'spin'
export const SLOT_OPEN = 'open'
export const SLOT_REWARD = 'reward'
export const SLOT_RARE = 'rare'
