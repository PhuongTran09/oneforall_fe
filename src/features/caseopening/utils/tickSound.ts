import type { SpinPlan } from './roulette'

/**
 * Tiếng quay được tổng hợp bằng WebAudio ngay trong trình duyệt (không có tệp mẫu,
 * không tải từ nguồn ngoài). Lịch nhịp lấy từ `spinSchedule` nên mỗi tiếng tách rơi
 * đúng lúc ô đi qua kim, và cú "cạch" cuối đúng lúc băng phanh lại.
 */
export interface TickHandle {
  stop(): void
}

let ctx: AudioContext | null = null
let tickBuffer: AudioBuffer | null = null
let stopBuffer: AudioBuffer | null = null
let bedBuffer: AudioBuffer | null = null

function context(): AudioContext | null {
  if (typeof window === 'undefined') return null
  try {
    if (!ctx) {
      const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
      if (!Ctor) return null
      ctx = new Ctor()
    }
    if (ctx.state === 'suspended') void ctx.resume()
    return ctx
  } catch {
    return null
  }
}

/** Biquad bandpass RBJ, hệ số đã chuẩn hoá theo a0 = 1 + alpha. */
function bandpassCoeffs(sampleRate: number, center: number, q: number) {
  const w0 = (2 * Math.PI * center) / sampleRate
  const alpha = Math.sin(w0) / (2 * q)
  const norm = 1 + alpha
  return {
    b0: ((1 - Math.cos(w0)) / 2) / norm,
    b1: (1 - Math.cos(w0)) / norm,
    b2: ((1 - Math.cos(w0)) / 2) / norm,
    a1: (-2 * Math.cos(w0)) / norm,
    a2: (1 - alpha) / norm,
  }
}

function filter(input: Float32Array, sampleRate: number, center: number, q: number): Float32Array {
  const { b0, b1, b2, a1, a2 } = bandpassCoeffs(sampleRate, center, q)
  const out = new Float32Array(input.length)
  let x1 = 0
  let x2 = 0
  let y1 = 0
  let y2 = 0
  for (let i = 0; i < input.length; i += 1) {
    const x = input[i]
    const y = b0 * x + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2
    x2 = x1
    x1 = x
    y2 = y1
    y1 = y
    out[i] = y
  }
  return out
}

/** Tròn âm theo hàm mũ, pha lấy tích phân để tần số trượt được mà không méo. */
function decayingSine(data: Float32Array, sampleRate: number, f0: number, f1: number, tau: number, gain: number, drop = 0.02) {
  let phase = 0
  const life = sampleRate * drop
  for (let i = 0; i < data.length; i += 1) {
    const k = i / life
    const freq = k < 1 ? f0 + (f1 - f0) * k : f1
    phase += (freq / sampleRate) * 2 * Math.PI
    data[i] += Math.sin(phase) * Math.exp(-i / sampleRate / tau) * gain
  }
}

function normalize(data: Float32Array, peak: number): void {
  let max = 0
  for (let i = 0; i < data.length; i += 1) max = Math.max(max, Math.abs(data[i]))
  if (max === 0) return
  const scale = peak / max
  for (let i = 0; i < data.length; i += 1) data[i] *= scale
}

/**
 * Một cú "tách": gai noise cho phần đầu, nhát gỗ 1.4kHz trượt xuống làm cao độ,
 * hoạ âm kim loại nhẹ và một tiếng "boom" trầm cho có cân nặng.
 */
function buildTick(audio: AudioContext): AudioBuffer {
  const sr = audio.sampleRate
  const buffer = audio.createBuffer(1, Math.round(sr * 0.06), sr)
  const data = buffer.getChannelData(0)
  const hiss = new Float32Array(data.length)
  for (let i = 0; i < hiss.length; i += 1) hiss[i] = (Math.random() * 2 - 1) * Math.exp(-i / (sr * 0.0022))
  const edge = filter(hiss, sr, 3200, 1.1)
  for (let i = 0; i < data.length; i += 1) data[i] = edge[i] * 0.5
  decayingSine(data, sr, 1450, 1120, 0.0045, 0.6)
  decayingSine(data, sr, 3420, 3420, 0.0022, 0.16)
  decayingSine(data, sr, 205, 205, 0.006, 0.22)
  normalize(data, 0.9)
  return buffer
}

/** Cú "cạch" lúc băng hết trớn: trầm giáng từ 120Hz, điểm gỗ 620Hz, chuông ngắn. */
function buildStop(audio: AudioContext): AudioBuffer {
  const sr = audio.sampleRate
  const buffer = audio.createBuffer(1, Math.round(sr * 0.3), sr)
  const data = buffer.getChannelData(0)
  decayingSine(data, sr, 120, 52, 0.05, 0.85, 0.09)
  const hiss = new Float32Array(data.length)
  for (let i = 0; i < hiss.length; i += 1) hiss[i] = (Math.random() * 2 - 1) * Math.exp(-i / (sr * 0.008))
  const body = filter(hiss, sr, 700, 1.2)
  for (let i = 0; i < data.length; i += 1) data[i] += body[i] * 0.55
  decayingSine(data, sr, 622, 590, 0.09, 0.2)
  decayingSine(data, sr, 944, 900, 0.06, 0.1)
  normalize(data, 0.85)
  return buffer
}

/** Sột sột nền lúc băng chạy nhanh, đủ để khoảng trống giữa các nhịp không chết. */
function buildBed(audio: AudioContext): AudioBuffer {
  const sr = audio.sampleRate
  const n = Math.round(sr * 0.5)
  const buffer = audio.createBuffer(1, n, sr)
  const data = buffer.getChannelData(0)
  const white = new Float32Array(n)
  for (let i = 0; i < n; i += 1) white[i] = Math.random() * 2 - 1
  const band = filter(white, sr, 950, 0.9)
  normalize(band, 0.5)
  data.set(band)
  return buffer
}

export function startTicks(plan: SpinPlan, volume: number): TickHandle | null {
  const audio = context()
  if (!audio || plan.ticks.length === 0) return null
  const tick = (tickBuffer ??= buildTick(audio))
  const brake = (stopBuffer ??= buildStop(audio))
  const bed = (bedBuffer ??= buildBed(audio))
  const level = Math.min(1, Math.max(0, volume))

  const master = audio.createGain()
  master.gain.value = level
  master.connect(audio.destination)

  const t0 = audio.currentTime + 0.01
  const lastTick = plan.ticks[plan.ticks.length - 1] ?? 0
  let lastAt = -Infinity

  for (let i = 0; i < plan.ticks.length; i += 1) {
    const offset = plan.ticks[i]
    if (!Number.isFinite(offset) || offset < 0) continue
    const when = Math.max(t0 + offset / 1000, lastAt + 0.018)
    lastAt = when
    // Càng về cuối càng sáng và rõ hơn một chút: tạo cảm giác hồi hộp khi sắp dừng.
    const near = i / Math.max(1, plan.ticks.length - 1)
    const src = audio.createBufferSource()
    src.buffer = tick
    src.playbackRate.value = 0.97 + near * 0.1 + Math.random() * 0.04
    const gain = audio.createGain()
    gain.gain.value = 0.62 + near * 0.3
    src.connect(gain)
    gain.connect(master)
    src.start(when)
  }

  const stopAt = Math.max(lastTick + 120, plan.stopAt)
  const brakeSrc = audio.createBufferSource()
  brakeSrc.buffer = brake
  const brakeGain = audio.createGain()
  brakeGain.gain.value = 0.8
  brakeSrc.connect(brakeGain)
  brakeGain.connect(master)
  brakeSrc.start(t0 + stopAt / 1000)

  // rè nền: nhỏ dần theo đà hụt của băng, kết thúc ngay trước cú cạch
  const bedSrc = audio.createBufferSource()
  bedSrc.buffer = bed
  bedSrc.loop = true
  const bedGain = audio.createGain()
  const now = audio.currentTime
  const end = now + stopAt / 1000
  bedGain.gain.setValueAtTime(0.13, now)
  bedGain.gain.setValueAtTime(0.13, Math.min(now + 0.05, now + stopAt / 3000))
  bedGain.gain.linearRampToValueAtTime(0.035, now + stopAt / 1800)
  bedGain.gain.linearRampToValueAtTime(0, end - 0.08)
  bedSrc.connect(bedGain)
  bedGain.connect(master)
  bedSrc.start(t0)
  bedSrc.stop(end)

  return {
    stop() {
      try {
        // Nhả nhanh chứ không cắt: cú cạch cuối đúng lúc transitionend nên nếu mute
        // tức thì thì nó bị nuốt mất, người dùng không nghe thấy vòng quay dừng.
        master.gain.setTargetAtTime(0, audio.currentTime, 0.05)
        window.setTimeout(() => master.disconnect(), 400)
      } catch {
        /* đã dừng trước đó */
      }
    },
  }
}
