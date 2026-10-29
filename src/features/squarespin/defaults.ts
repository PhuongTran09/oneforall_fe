import type { SpinEntry, SpinList, SpinMode, SpinState, WheelConfig, WheelSlot } from './types'
import { idSuffix } from './utils/fair'
import { t } from '../../i18n/langStore'

/**
 * Trần số tên: ở bảng hẹp nhất (256px), 20 tên vẫn giữ được lời hứa "không cắt chữ,
 * không tràn ô" với chữ 7px — tính theo ringDepth/hasRoom trong utils/wheel.ts.
 */
export const ENTRY_CAP = 20
/** Tên dài hơn sẽ khó nhét vào ô vuông — danh sách và kết quả vẫn hiển thị đầy đủ. */
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

/** Bảng màu ô: lấy từ bộ màu độ hiếm/accent của case-opening, đủ phân biệt trên bảng nhỏ. */
export const CELL_PALETTE = ['#ff3b30', '#f5c518', '#34c759', '#3b82f6', '#a855f7', '#22d3ee', '#f472b6', '#d8431c']

/** Hai mực của design system — đúng hai giá trị mà `contrastInk` của case-opening trả về. */
export const INK_DARK = '#18181b'
export const INK_LIGHT = '#f4f4f6'

const HEX = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i

/** Tách hex (3 hoặc 6 chữ số) thành ba kênh RGB gốc. */
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

/**
 * Mực cho chữ trên nền đã biết: so trực tiếp hai tỉ lệ tương phản thay vì ngưỡng
 * hoá độ sáng — không màu nào bị ép xuống dưới ngưỡng đọc được.
 */
export function pickInk(hex: string): string {
  const l = luminance(normalizeHex(hex, '#000000'))
  return (l + 0.05) ** 2 > (L_LIGHT + 0.05) * (L_DARK + 0.05) ? INK_DARK : INK_LIGHT
}

/** Mức nâng độ sáng của ô đang rọi — từ kính màu sang chói, vẫn giữ sắc độ. */
export const LIT_LIFT = 0.42

/** Ngưỡng AA cho chữ trong ô: ô hẹp nhất còn hỗ trợ viết chữ 7px. */
export const MIN_CELL_CONTRAST = 4.5

/** Trộn hai hex: t=0 ra `from`, t=1 ra `to`, luôn trả về hex 6 chữ in thường. */
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

/** Màu nền của ô đang rọi/thắng — sáng hơn màu nguyên chất của ô đó. */
export function litColor(hex: string): string {
  let out = mixHex(hex, '#ffffff', LIT_LIFT)
  // Màu người dùng tự chọn có thể rơi vào vùng cả hai mực đều dưới ngưỡng — trộn thêm tới khi đạt.
  for (let lift = LIT_LIFT; lift < 0.85 && contrastRatio(out, pickInk(out)) < MIN_CELL_CONTRAST; lift += 0.08) {
    out = mixHex(hex, '#ffffff', lift)
  }
  return out
}

/**
 * Ô kính neon: CSS vẽ tint trong suốt CELL_TINT phần trăm trên nền bảng, nên màu
 * mắt thật nhìn thấy là glassFill(board, tint, alpha). Tương phản kiểm trên màu
 * ghép đó — kiểm trên tint sẽ non. Ô rọi đặc hơn (CELL_TINT_LIT) để loá lên.
 */
export const CELL_TINT = 0.72
export const CELL_TINT_LIT = 0.88

/** Dải sương trắng mép trên ô — phải khớp `rgba(255, 255, 255, .16)` của `.spin-cell`. */
export const CELL_SHEEN = 0.16

/** Màu ghép thật khi tint nằm trên nền bảng — đúng phép pha alpha CSS làm. */
export function glassFill(board: string, tint: string, alpha: number): string {
  return mixHex(board, tint, alpha)
}

/**
 * tint cho một ô kính. Neon là phải loá nên thử trước hết là NÂNG màu: kính sáng
 * + mực tối. Chỉ khi nâng hết cỡ vẫn không đạt AA mới chấp nhận kính tối + mực
 * sáng. `alpha` là phần màu CSS sẽ vẽ lên nền bảng.
 */
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

/**
 * Tương phản của mực trên mặt kính: kiểm đúng đầu xấu nhất của dải sương
 * (mực tối khó đọc trên nền tối, mực sáng ngược lại) là đủ cho mọi điểm giữa.
 */
export function worstInkContrast(bg: string, ink: string): number {
  const light = mixHex(bg, '#ffffff', CELL_SHEEN)
  return ink === INK_LIGHT ? contrastRatio(light, ink) : contrastRatio(bg, ink)
}

/** Tỉ lệ tương phản WCAG giữa hai hex — cùng công thức pickInk dùng để so mực. */
export function contrastRatio(a: string, b: string): number {
  const la = luminance(normalizeHex(a, '#000000'))
  const lb = luminance(normalizeHex(b, '#000000'))
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05)
}

/** Màu lấy từ bảng, quay vòng theo vị trí — danh sách luôn nhiều hơn 8 tên. */
export function paletteColor(index: number): string {
  return CELL_PALETTE[Math.abs(index) % CELL_PALETTE.length]
}

/** Chỉ nhận hex thật; mọi thứ khác (rỗng, "red", chuỗi dài) rơi về màu dự phòng. */
export function normalizeHex(value: unknown, fallback: string): string {
  return typeof value === 'string' && HEX.test(value) ? value : fallback
}

/**
 * `getComputedStyle` trả `rgb()`/`rgba()` bất kể khai báo gốc — đổi về hex để JS trộn tiếp.
 */
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

/** Bỏ khoảng trắng đầu/cuối và dòng trống; khoảng trắng bên trong giữ nguyên. */
export function cleanName(raw: string): string {
  return raw.trim().slice(0, NAME_MAX)
}

export function makeEntry(name: string, color: string): SpinEntry {
  return { id: uid('spn'), name: cleanName(name), color }
}

/** Một dòng = một tên. */
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

/** Key của danh sách mẫu — tên mẫu là dữ liệu nên theo ngôn ngữ lúc tạo/reset vòng. */
const SEED_KEYS: Record<WheelSlot, string[]> = {
  A: ['a1', 'a2', 'a3', 'a4', 'a5', 'a6'],
  B: ['b1', 'b2', 'b3', 'b4'],
}

/** Danh sách mẫu của từng vòng — "Đặt lại vòng" trả về đúng cái này. Id mới mỗi lần gọi để không trùng key. */
export function defaultEntries(slot: WheelSlot): SpinEntry[] {
  return SEED_KEYS[slot].map((key, i) => makeEntry(t(`spin.seed.${key}`), paletteColor(i)))
}

/** Âm lượng mặc định — cùng con số `AudioEngine` của case-opening đang dùng. */
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
