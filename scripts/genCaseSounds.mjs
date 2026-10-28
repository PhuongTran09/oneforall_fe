// Sinh 3 tệp WAV cho tính năng mở hòm bằng DSP thuần (không dùng mẫu âm thanh bên ngoài).
// Tiếng quay không nằm ở đây — nó được tổng hợp theo easing của lượt quay trong tickSound.ts.
// Chạy: node scripts/genCaseSounds.mjs  →  public/sounds/*.wav
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const SR = 32000
const OUT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'public', 'sounds')

const ms = (sec) => Math.round(sec * SR)
const buf = (sec) => new Float64Array(ms(sec))

function rng(seed) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function add(target, src, gain = 1, at = 0) {
  const start = Math.round(at * SR)
  for (let i = 0; i < src.length; i += 1) {
    const j = start + i
    if (j >= 0 && j < target.length) target[j] += src[i] * gain
  }
  return target
}

/** Chuông kim loại: hoạ âm bất hoà hợp + suy giảm mũ, đây là màu tiếng chính của hòm. */
function metal(f0, { dur = 0.5, ratios = [1, 1.62, 2.41, 3.72, 5.13, 7.01], decay = 0.35, bend = 0.985 } = {}) {
  const out = buf(dur)
  const n = out.length
  ratios.forEach((ratio, r) => {
    const freq = f0 * ratio
    if (freq > SR / 2.2) return
    const amp = 1 / (r + 1.6)
    const tau = decay / (1 + r * 0.75)
    let phase = 0
    for (let i = 0; i < n; i += 1) {
      const t = i / SR
      phase += ((freq * Math.pow(bend, t * 1000 / 60)) / SR) * 2 * Math.PI
      out[i] += Math.sin(phase) * amp * Math.exp(-t / tau)
    }
  })
  const atk = Math.min(n, ms(0.0015))
  for (let i = 0; i < atk; i += 1) out[i] *= i / atk
  return out
}

/** `floor` giữ cao độ không trôi về 0Hz (lệch DC), `rate` là tốc độ giáng của cú đấm trầm. */
function thud(f0 = 62, { dur = 0.28, decay = 0.07, floor = 0, rate = 6 } = {}) {
  const out = buf(dur)
  let phase = 0
  for (let i = 0; i < out.length; i += 1) {
    const t = i / SR
    phase += (Math.max(floor, f0 * Math.exp(-t * rate)) / SR) * 2 * Math.PI
    out[i] = Math.sin(phase) * Math.exp(-t / decay)
  }
  return out
}

/** Quét cao độ kiểu piston: hoạ âm cộng hạn chế dưới Nyquist + rung biên của mô-tơ. */
function riser(fFrom, fTo, { dur = 0.34, curve = 0.75, trem = 0, depth = 0, partials = 6 } = {}) {
  const out = buf(dur)
  const n = out.length
  const weights = Array.from({ length: partials }, (_, k) => 1 / Math.pow(k + 1, 1.5))
  const norm = 1 / weights.reduce((a, b) => a + b, 0)
  const ph = new Float64Array(partials)
  for (let i = 0; i < n; i += 1) {
    const t = i / SR
    const f = fFrom + (fTo - fFrom) * Math.pow(i / n, curve)
    let s = 0
    for (let k = 0; k < partials; k += 1) {
      const fk = f * (k + 1)
      if (fk > SR / 2.2) break
      ph[k] += (fk / SR) * 2 * Math.PI
      s += Math.sin(ph[k]) * weights[k]
    }
    out[i] = s * norm * (trem > 0 ? 1 + depth * Math.sin(2 * Math.PI * trem * t) : 1)
  }
  return out
}

/** Biquad bandpass RBJ, cho phép quét tâm tần số theo thời gian (ai tiếng kim loại). */
function bandpass(input, center, q, sweep) {
  const out = new Float64Array(input.length)
  const w0 = (2 * Math.PI * center) / SR
  let alpha = Math.sin(w0) / (2 * q)
  let b0 = (1 - Math.cos(w0)) / 2
  let b1 = 1 - Math.cos(w0)
  let b2 = b0
  let a1 = -2 * Math.cos(w0)
  let a2 = 1 - alpha
  const norm = 1 + alpha
  b0 /= norm; b1 /= norm; b2 /= norm; a1 /= norm; a2 /= norm
  let x1 = 0, x2 = 0, y1 = 0, y2 = 0
  for (let i = 0; i < input.length; i += 1) {
    if (sweep) {
      const f = Math.min(SR / 3, Math.max(60, center + (sweep.to - center) * (i / input.length)))
      const w = (2 * Math.PI * f) / SR
      const al = Math.sin(w) / (2 * q)
      const n = 1 + al
      const nb0 = ((1 - Math.cos(w)) / 2) / n
      const nb1 = (1 - Math.cos(w)) / n
      const nb2 = nb0
      const na1 = (-2 * Math.cos(w)) / n
      const na2 = (1 - al) / n
      b0 = nb0; b1 = nb1; b2 = nb2; a1 = na1; a2 = na2
    }
    const x = input[i]
    const y = b0 * x + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2
    x2 = x1; x1 = x; y2 = y1; y1 = y
    out[i] = y
  }
  return out
}

function noise(dur, seed) {
  const out = buf(dur)
  const r = rng(seed)
  for (let i = 0; i < out.length; i += 1) out[i] = r() * 2 - 1
  return out
}

function shape(input, { attack = 0.002, decay = 0.12, hold = 0, release = 0.2 } = {}) {
  const out = new Float64Array(input.length)
  const a = ms(attack), d = ms(decay), h = ms(hold), rl = ms(release)
  for (let i = 0; i < input.length; i += 1) {
    let g = 1
    if (i < a) g = i / a
    else if (i < a + d) g = 1 - (1 - (i - a) / d) * 0.85
    else if (i < a + d + h) g = 0.15
    else if (i < a + d + h + rl) g = 0.15 * (1 - (i - a - d - h) / rl)
    else g = 0
    out[i] = input[i] * g
  }
  return out
}

/** Vài lược phản hồi có giảm âm → đuôi "phòng" ngắn, đủ để tiếng không bị khô. */
function reverb(input, { wet = 0.28, delays = [0.031, 0.057, 0.093, 0.149], fb = 0.42, damp = 0.35 } = {}) {
  let tail = buf(input.length / SR)
  delays.forEach((d, k) => {
    const n = ms(d)
    const line = new Float64Array(n)
    const comb = new Float64Array(input.length)
    let idx = 0
    let lp = 0
    for (let i = 0; i < input.length; i += 1) {
      const read = line[idx]
      lp = read + damp * (lp - read)
      comb[i] = lp
      line[idx] = input[i] + lp * fb
      idx = (idx + 1) % n
    }
    tail = add(tail, comb, wet / delays.length * (1 - k * 0.15))
  })
  const out = new Float64Array(input.length)
  for (let i = 0; i < input.length; i += 1) out[i] = input[i] + tail[i]
  return out
}

function fadeEdges(input, edge = ms(0.004)) {
  for (let i = 0; i < Math.min(edge, input.length / 2); i += 1) {
    input[i] *= i / edge
    input[input.length - 1 - i] *= i / edge
  }
  return input
}

function master(input, peak = 0.86) {
  let max = 0
  let nan = 0
  for (let i = 0; i < input.length; i += 1) {
    if (!Number.isFinite(input[i])) { nan += 1; input[i] = 0; continue }
    max = Math.max(max, Math.abs(input[i]))
  }
  if (nan) console.warn(`  ! ${nan} mẫu không hữu hạn trước khi chuẩn hoá`)
  const g = max > 0 ? peak / max : 0
  for (let i = 0; i < input.length; i += 1) input[i] = Math.tanh(input[i] * g * 1.25) / Math.tanh(1.25)
  return input
}

function encodeWav(input) {
  const n = input.length
  const out = Buffer.alloc(44 + n * 2)
  out.write('RIFF', 0)
  out.writeUInt32LE(36 + n * 2, 4)
  out.write('WAVE', 8)
  out.write('fmt ', 12)
  out.writeUInt32LE(16, 16)
  out.writeUInt16LE(1, 20)
  out.writeUInt16LE(1, 22)
  out.writeUInt32LE(SR, 24)
  out.writeUInt32LE(SR * 2, 28)
  out.writeUInt16LE(2, 32)
  out.writeUInt16LE(16, 34)
  out.write('data', 36)
  out.writeUInt32LE(n * 2, 40)
  for (let i = 0; i < n; i += 1) {
    const v = Math.max(-1, Math.min(1, input[i]))
    out.writeInt16LE(Math.round(v * 32767), 44 + i * 2)
  }
  return out
}

// ── 1. Mở hòm: chốt nhả, hòm rung, nắp piston bật rồi bùng ───────────────────
function caseOpen() {
  // Mốc âm bám frame ảnh: case-shake va ở 15/30/45/60/75%, case-lid-open đạt
  // 122deg ở 55% rồi hạ 116deg lúc hết 620ms.
  const SHAKE = 0.62
  const IMPACTS = [0.15, 0.3, 0.45, 0.6, 0.75].map((p) => p * SHAKE)
  const PEAK = 0.55 * SHAKE

  const t = buf(1.72)

  // nền ầm tích áp lực suốt cú rung
  add(t, shape(bandpass(noise(0.68, 71), 150, 0.55), { attack: 0.34, decay: 0.1, hold: 0.16, release: 0.08 }), 0.36, 0)

  // frame 0: chốt nhả
  add(t, shape(bandpass(noise(0.03, 11), 3200, 1.2), { attack: 0.0004, decay: 0.008, release: 0.014 }), 0.5, 0)
  add(t, metal(2350, { dur: 0.22, decay: 0.04, ratios: [1, 1.73, 2.58, 3.41] }), 0.3, 0.002)
  add(t, thud(74, { dur: 0.2, decay: 0.05 }), 0.72, 0)

  // piston nắp: quét 170Hz → 1.3kHz tới đúng lúc nắp 122deg
  add(t, shape(riser(170, 1300, { dur: PEAK + 0.06, trem: 46, depth: 0.5 }), { attack: 0.05, decay: 0.25, hold: 0.45, release: 0.2 }), 0.4, 0.02)

  // năm cú va, cao độ mỗi cú một khác
  IMPACTS.forEach((at, k) => {
    add(t, shape(bandpass(noise(0.016, 300 + k), 1500 + k * 320, 5), { attack: 0.0005, decay: 0.006, release: 0.01 }), 0.26 + (k % 2) * 0.05, at)
    add(t, metal(1600 + k * 260, { dur: 0.3, decay: 0.05, ratios: [1, 1.62, 2.41, 3.72] }), 0.16, at + 0.004)
  })

  // nắp nảy lại 122 → 116deg
  add(t, thud(96, { dur: 0.24, decay: 0.05 }), 0.5, SHAKE - 0.14)
  add(t, metal(740, { dur: 0.4, decay: 0.07, ratios: [1, 1.57, 2.31, 3.9] }), 0.26, SHAKE - 0.14)

  // 620ms: nắp mở hết — sub giáng, hơi thoát, chuông mở ra
  add(t, thud(46, { dur: 0.8, decay: 0.17, floor: 34, rate: 3.2 }), 1.0, SHAKE)
  add(t, shape(bandpass(noise(0.7, 91), 4200, 1.1, { to: 700 }), { attack: 0.02, decay: 0.22, hold: 0.14, release: 0.3 }), 0.34, SHAKE)
  add(t, bell(880, { dur: 0.9, decay: 0.26 }), 0.24, SHAKE + 0.02)
  add(t, bell(1174.66, { dur: 0.8, decay: 0.22 }), 0.18, SHAKE + 0.05)
  add(t, pad([220, 277.18, 329.63], { dur: 0.8, attack: 0.04, decay: 0.35 }), 0.16, SHAKE + 0.02)

  return fadeEdges(master(reverb(t, { wet: 0.32, delays: [0.029, 0.053, 0.087, 0.139], fb: 0.44 }), 0.8))
}

// ── 2. Công bố kết quả: ba nốt đô trưởng đi lên có đệm ấm bên dưới ───────────
function bell(f0, { dur = 1.2, decay = 0.42 } = {}) {
  return metal(f0, { dur, decay, ratios: [1, 2.0, 2.99, 4.21, 5.43], bend: 0.998 })
}

/** Đệm_sin chậm attack dưới chuông, làm nốt không còn khô và hết chói. */
function pad(freqs, { dur = 1.6, attack = 0.1, decay = 0.75 } = {}) {
  const out = buf(dur)
  const n = out.length
  freqs.forEach((f, k) => {
    let p1 = 0
    let p2 = 0
    for (let i = 0; i < n; i += 1) {
      const t = i / SR
      p1 += (f / SR) * 2 * Math.PI
      p2 += ((f * 1.004) / SR) * 2 * Math.PI
      const env = Math.min(1, t / attack) * Math.exp(-t / decay)
      out[i] += (Math.sin(p1) + Math.sin(p2)) * 0.5 * env * (1 / (1 + k * 0.45))
    }
  })
  return out
}

function caseReward() {
  const t = buf(1.6)
  add(t, thud(88, { dur: 0.3, decay: 0.06 }), 0.4, 0)
  add(t, bell(523.25, { dur: 1.0, decay: 0.3 }), 0.5, 0.01)
  add(t, bell(659.25, { dur: 1.1, decay: 0.32 }), 0.45, 0.11)
  add(t, bell(783.99, { dur: 1.35, decay: 0.42 }), 0.5, 0.21)
  add(t, pad([261.63, 329.63, 392.0], { dur: 1.3, attack: 0.09, decay: 0.6 }), 0.3, 0.12)
  add(t, shape(bandpass(noise(0.5, 43), 6200, 1.2), { attack: 0.05, decay: 0.18, release: 0.25 }), 0.07, 0.2)
  return fadeEdges(master(reverb(t, { wet: 0.36, delays: [0.037, 0.061, 0.103, 0.167], fb: 0.46 }), 0.78))
}

// ── 3. Trúng vật phẩm hiếm: dải quét đi lên rồi mở ra hợp trưởng + sub ───────
function caseRare() {
  const t = buf(2.8)
  add(t, shape(bandpass(noise(1.0, 51), 300, 2.4, { to: 6200 }), { attack: 0.55, decay: 0.28, hold: 0.08, release: 0.1 }), 0.34, 0)
  add(t, shape(bandpass(noise(0.95, 52), 1200, 1.4, { to: 4200 }), { attack: 0.6, decay: 0.2, release: 0.12 }), 0.14, 0.05)

  add(t, thud(70, { dur: 0.5, decay: 0.13 }), 0.75, 0.95)
  add(t, bell(440, { dur: 1.6, decay: 0.5 }), 0.42, 0.96)
  add(t, bell(554.37, { dur: 1.6, decay: 0.48 }), 0.4, 0.99)
  add(t, bell(659.25, { dur: 1.7, decay: 0.52 }), 0.42, 1.02)
  add(t, bell(880, { dur: 1.5, decay: 0.4 }), 0.3, 1.06)
  add(t, pad([220, 277.18, 329.63], { dur: 1.7, attack: 0.1, decay: 0.72 }), 0.26, 1.0)
  add(t, shape(bandpass(noise(1.4, 55), 7400, 1.1), { attack: 0.03, decay: 0.5, release: 0.7 }), 0.1, 1.02)
  return fadeEdges(master(reverb(t, { wet: 0.42, delays: [0.041, 0.083, 0.137, 0.211], fb: 0.5 }), 0.8))
}

fs.mkdirSync(OUT, { recursive: true })
// Tiếng quay không sinh ra ở đây: nó được tổng hợp theo easing của lượt quay đang chạy.
const jobs = [
  ['case-open.wav', caseOpen],
  ['case-reward.wav', caseReward],
  ['case-rare.wav', caseRare],
]
for (const [name, make] of jobs) {
  const pcm = encodeWav(make())
  fs.writeFileSync(path.join(OUT, name), pcm)
  let peak = 0
  let sum = 0
  const samples = (pcm.length - 44) / 2
  for (let i = 0; i < samples; i += 1) {
    const v = Math.abs(pcm.readInt16LE(44 + i * 2)) / 32768
    peak = Math.max(peak, v)
    sum += v * v
  }
  console.log(`${name}  ${(pcm.length / 1024).toFixed(0)}KB  ${(samples / SR).toFixed(2)}s  peak ${peak.toFixed(2)}  rms ${Math.sqrt(sum / samples).toFixed(3)}`)
}
