import type { SpinEntry, SpinList, SpinMode, SpinState, WheelConfig, WheelSlot } from './types'
import { idSuffix } from './utils/fair'
import { t } from '../../i18n/langStore'





export const ENTRY_CAP = 20

export const NAME_MAX = 40
export const HISTORY_LIMIT = 100

export const MIN_SPIN_MS = 1200
export const MAX_SPIN_MS = 15000
export const DEFAULT_SPIN_MS = 4200
export const FAST_SPIN_MS = 2200
export const SLOW_SPIN_MS = 7000

export const MIN_ROTATIONS = 0
export const MAX_ROTATIONS = 12
export const DEFAULT_ROTATIONS = 4

export const MODES: SpinMode[] = ['single', 'double']


export const CELL_PALETTE = ['#ff3b30', '#f5c518', '#34c759', '#3b82f6', '#a855f7', '#22d3ee', '#f472b6', '#d8431c']


export const INK_DARK = '#18181b'
export const INK_LIGHT = '#f4f4f6'

const HEX = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i


function rgbOf(hex: string): [number, number, number] {
  const digits = hex.slice(1)
  const full = digits.length === 3 ? digits.split('').map((c) => c + c).join('') : digits
  const n = Number.parseInt(full, 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

const srgb = (channel: number): number => {
  const s = channel / 255
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
}

function luminance(hex: string): number {
  const [r, g, b] = rgbOf(hex)
  return 0.2126 * srgb(r) + 0.7152 * srgb(g) + 0.0722 * srgb(b)
}

const L_DARK = luminance(INK_DARK)
const L_LIGHT = luminance(INK_LIGHT)





export function pickInk(hex: string): string {
  const l = luminance(normalizeHex(hex, '#000000'))
  return (l + 0.05) ** 2 > (L_LIGHT + 0.05) * (L_DARK + 0.05) ? INK_DARK : INK_LIGHT
}


export const LIT_LIFT = 0.42


export const MIN_CELL_CONTRAST = 4.5


export function mixHex(from: string, to: string, t: number): string {
  const k = Math.min(1, Math.max(0, Number.isFinite(t) ? t : 0))
  const a = rgbOf(normalizeHex(from, '#000000'))
  const b = rgbOf(normalizeHex(to, '#000000'))
  const chan = (i: number) =>
    Math.round(a[i] + (b[i] - a[i]) * k)
      .toString(16)
      .padStart(2, '0')
  return `#${chan(0)}${chan(1)}${chan(2)}`
}

export function litColor(hex: string): string {
  let out = mixHex(hex, '#ffffff', LIT_LIFT)
  for (let lift = LIT_LIFT; lift < 0.85 && contrastRatio(out, pickInk(out)) < MIN_CELL_CONTRAST; lift += 0.08) {
    out = mixHex(hex, '#ffffff', lift)
  }
  return out
}

export const CELL_TINT = 0.72
export const CELL_TINT_LIT = 0.88

export const CELL_SHEEN = 0.16

export function glassFill(board: string, tint: string, alpha: number): string {
  return mixHex(board, tint, alpha)
}

export function glassTint(board: string, hex: string, alpha: number): string {
  let bright = mixHex(hex, '#ffffff', 0.12)
  for (let step = 0; step < 8; step += 1) {
    if (worstInkContrast(glassFill(board, bright, alpha), INK_DARK) >= MIN_CELL_CONTRAST) return bright
    bright = mixHex(bright, '#ffffff', 0.09)
  }
  let dim = mixHex(hex, '#000000', 0.12)
  for (let step = 0; step < 8; step += 1) {
    if (worstInkContrast(glassFill(board, dim, alpha), INK_LIGHT) >= MIN_CELL_CONTRAST) return dim
    dim = mixHex(dim, '#000000', 0.09)
  }
  return dim
}

export function worstInkContrast(bg: string, ink: string): number {
  const light = mixHex(bg, '#ffffff', CELL_SHEEN)
  return ink === INK_LIGHT ? contrastRatio(light, ink) : contrastRatio(bg, ink)
}

export function contrastRatio(a: string, b: string): number {
  const la = luminance(normalizeHex(a, '#000000'))
  const lb = luminance(normalizeHex(b, '#000000'))
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05)
}

export function paletteColor(index: number): string {
  return CELL_PALETTE[Math.abs(index) % CELL_PALETTE.length]
}

export function normalizeHex(value: unknown, fallback: string): string {
  return typeof value === 'string' && HEX.test(value) ? value : fallback
}

export function toHex(color: unknown): string | null {
  if (typeof color !== 'string') return null
  const value = color.trim()
  if (HEX.test(value)) return value
  const m = value.match(/^rgba?\(\s*(-?[\d.]+)[\s,]+(-?[\d.]+)[\s,]+(-?[\d.]+)/i)
  if (!m) return null
  const chan = (v: string | undefined) => Math.min(255, Math.max(0, Math.round(Number(v))))
  const hex = (v: number) => v.toString(16).padStart(2, '0')
  return `#${hex(chan(m[1]))}${hex(chan(m[2]))}${hex(chan(m[3]))}`
}

export function uid(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}${idSuffix()}`
}

export function clampSpinMs(value: number): number {
  const n = Math.round(Number(value))
  if (!Number.isFinite(n)) return DEFAULT_SPIN_MS
  return Math.min(MAX_SPIN_MS, Math.max(MIN_SPIN_MS, n))
}

export function clampRotations(value: number): number {
  const n = Math.round(Number(value))
  if (!Number.isFinite(n)) return DEFAULT_ROTATIONS
  return Math.min(MAX_ROTATIONS, Math.max(MIN_ROTATIONS, n))
}

export function cleanName(raw: string): string {
  return raw.trim().slice(0, NAME_MAX)
}

export function makeEntry(name: string, color: string): SpinEntry {
  return { id: uid('spn'), name: cleanName(name), color }
}

export function parseBulk(raw: string): string[] {
  return raw
    .split(/\r?\n/)
    .map(cleanName)
    .filter((line) => line.length > 0)
}

export function defaultWheelConfig(): WheelConfig {
  return { spinMs: clampSpinMs(DEFAULT_SPIN_MS), rotations: clampRotations(DEFAULT_ROTATIONS), removeWinner: false }
}

export function emptyList(): SpinList {
  return { entries: [] }
}

const SEED_KEYS: Record<WheelSlot, string[]> = {
  A: ['a1', 'a2', 'a3', 'a4', 'a5', 'a6'],
  B: ['b1', 'b2', 'b3', 'b4'],
}

export function defaultEntries(slot: WheelSlot): SpinEntry[] {
  return SEED_KEYS[slot].map((key, i) => makeEntry(t(`spin.seed.${key}`), paletteColor(i)))
}

export const DEFAULT_VOLUME = 0.8

export function defaultSpinState(): SpinState {
  return {
    mode: 'single',
    wheelA: defaultWheelConfig(),
    wheelB: defaultWheelConfig(),
    sharedConfig: true,
    listA: { entries: defaultEntries('A') },
    listB: { entries: defaultEntries('B') },
    history: [],
    soundEnabled: true,
    soundVolume: DEFAULT_VOLUME,
  }
}
