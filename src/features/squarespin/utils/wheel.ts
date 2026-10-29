import type { SpinEntry } from '../types'

/**
 * Hình học vòng quay vuông: bảng 1:1, tên xếp vào vành đai 4 cạnh `per` ô.
 * Ô là chữ nhật ngang/dọc nên chữ không xoay, không bị cắt.
 * Không có kim — "ô đang sáng" là ô thật trên vành, theo đúng thứ tự của chase.
 */
export const RING_SIDES = 4

export interface WheelCell {
  /** Số thứ tự trên vành, 0 = góc trên-trái, tăng theo chiều kim đồng hồ. */
  slot: number
  side: number
  /** Vị trí/kích thước theo % của bảng. */
  left: number
  top: number
  width: number
  height: number
  /** Chỉ số trong danh sách tên, null khi vành còn trống. */
  entryIndex: number | null
  entry: SpinEntry | null
}

export interface WheelLayout {
  /** Số ô mỗi cạnh. */
  per: number
  /** Bề sâu vành đai, tỷ lệ cạnh bảng. */
  depth: number
  /** Padding ô theo px. */
  pad: number
  cells: WheelCell[]
}

/* ---- Ngân sách chữ trong ô -------------------------------------------------
   Chữ phải co theo diện tích ô nên vành dày lên khi danh sách dài hoặc tên dài.
   Đếm dòng theo MẢNH TỪ (ngắt sau khoảng trắng/dấu nối) — ô mỏng chỉ vừa vài chữ,
   chỗ trống đuôi dòng ăn mất một nửa dòng nếu chỉ tính bề rộng trung bình. */
export const MIN_FONT = 7
export const MAX_FONT = 13
export const LINE_H = 1.2
/* Bề rộng chữ theo em, đo bằng canvas measureText trên font dự án (weight 600). */
const W_THIN = 0.3
const W_SEMI = 0.44
const W_HYPHEN = 0.44
const W_NORMAL = 0.62
const W_UPPER = 0.72
const W_WIDE = 0.98
const THIN_CHARS = 'iljıIL.,;:\'"!| '
const SEMI_CHARS = 'trf'

/** Ngắt sau khoảng trắng và sau dấu nối: dấu nối nằm lại cuối mảnh trước. */
const BREAK_AFTER = /[-–—\s]/

function isBreakAfter(ch: string): boolean {
  return BREAK_AFTER.test(ch)
}

function charWidthEm(ch: string): number {
  if (ch === '-' || ch === '–' || ch === '—') return W_HYPHEN
  if (THIN_CHARS.includes(ch)) return W_THIN
  if (SEMI_CHARS.includes(ch)) return W_SEMI
  if (ch === 'M' || ch === 'W') return W_WIDE
  if (ch.toUpperCase() === ch && ch.toLowerCase() !== ch) return W_UPPER
  return W_NORMAL
}

export function textWidthEm(text: string): number {
  let sum = 0
  for (const ch of text) sum += charWidthEm(ch)
  return sum
}

function chunksOf(text: string): string[] {
  const out: string[] = []
  let cur = ''
  for (const ch of text) {
    cur += ch
    if (isBreakAfter(ch)) {
      out.push(cur)
      cur = ''
    }
  }
  if (cur) out.push(cur)
  return out
}

/**
 * Số dòng Chrome sẽ dựng khi đặt `text` trong ô rộng `w` px ở cỡ `fs`.
 * Ưu tiên ngắt ở mảnh từ, chỉ ngắt giữa từ khi một mình mảnh đó đã tràn dòng.
 */
export function textLines(text: string, w: number, fs: number): number {
  if (w <= 0 || fs <= 0) return Infinity
  const max = w / fs
  let lines = 0
  let used = 0
  for (const chunk of chunksOf(text)) {
    let rest = chunk
    while (rest) {
      if (used > 0 && used + textWidthEm(rest) > max) {
        lines += 1
        used = 0
        continue
      }
      if (used + textWidthEm(rest) <= max) {
        used += textWidthEm(rest)
        break
      }
      let acc = 0
      let cut = 0
      for (const ch of rest) {
        const cw = charWidthEm(ch)
        if (used + acc + cw > max) break
        acc += cw
        cut += ch.length
      }
      if (cut === 0) return Infinity
      rest = rest.slice(cut)
      lines += 1
      used = 0
    }
  }
  return used > 0 || lines === 0 ? lines + 1 : lines
}

/** Padding ô: rộng khi vành còn thưa, hẹp khi vành dày (per >= TIGHT_PER). */
export const CELL_PAD_WIDE = 3
export const CELL_PAD_TIGHT = 2
export const TIGHT_PER = 5
/** Viền 1px mỗi phía, tính trong box-sizing: border-box. */
export const CELL_BORDER = 1
/** Bảng hẹp nhất còn hỗ trợ: viewport 320px trừ padding trang (16 + 16 mỗi bên). */
export const MIN_BOARD = 256

export function cellPad(per: number): number {
  return per >= TIGHT_PER ? CELL_PAD_TIGHT : CELL_PAD_WIDE
}

/** Có chỗ cho `text` ở cỡ `fs` trong ô `w`x`h` px không? */
export function hasRoom(text: string, w: number, h: number, fs = MIN_FONT): boolean {
  return textLines(text, w, fs) * LINE_H * fs <= h
}

/**
 * Vành cần sâu bao nhiêu cho `per` ô để tên dài nhất (`worstName`) vẫn vừa ô
 * ở cả hai hình, trên bảng hẹp nhất — tìm depth nhỏ nhất trong [0.16, 0.4].
 */
export function ringDepth(per: number, worstName = 'n'.repeat(12)): number {
  const p = Math.max(1, per)
  const pad = cellPad(p)
  const name = worstName || 'n'
  for (let d = 0.16; d <= 0.4 + 1e-9; d += 0.01) {
    const tang = ((1 - d) / p) * MIN_BOARD - 2 * (pad + CELL_BORDER)
    const radial = d * MIN_BOARD - 2 * (pad + CELL_BORDER)
    if (hasRoom(name, tang, radial) && hasRoom(name, radial, tang)) return Math.round(d * 100) / 100
  }
  return 0.4
}

/**
 * Cỡ chữ lớn nhất để `text` nằm gọn trong ô `w`x`h` px.
 * Không có cỡ nào vừa thì trả MIN_FONT — thà chữ nhỏ còn hơn cắt tên.
 */
export function fitFontSize(text: string, w: number, h: number): number {
  for (let fs = MAX_FONT; fs >= MIN_FONT; fs -= 0.25) {
    if (hasRoom(text, w, h, fs)) return Math.round(fs * 100) / 100
  }
  return MIN_FONT
}

export function slotsPerSide(count: number): number {
  return Math.max(1, Math.ceil(Math.max(0, count) / RING_SIDES))
}

/** Ô theo % của bảng: cạnh 0 trái→phải, 1 trên→xuống, 2 phải→trái, 3 dưới→lên. */
function cellBox(side: number, j: number, per: number, depth: number) {
  const span = ((1 - depth) * 100) / per
  const deep = depth * 100
  if (side === 0) return { left: j * span, top: 0, width: span, height: deep }
  if (side === 1) return { left: (1 - depth) * 100, top: j * span, width: deep, height: span }
  if (side === 2) return { left: 100 - (j + 1) * span, top: (1 - depth) * 100, width: span, height: deep }
  return { left: 0, top: 100 - (j + 1) * span, width: deep, height: span }
}

export function layoutWheel(entries: SpinEntry[]): WheelLayout {
  const per = slotsPerSide(entries.length)
  // Tên "rộng" nhất theo mô hình đo chữ quyết định bề sâu vành.
  let worstName = ''
  let worstWidth = -1
  for (const e of entries) {
    const w = textWidthEm(e.name)
    if (w > worstWidth) {
      worstWidth = w
      worstName = e.name
    }
  }
  const depth = ringDepth(per, worstName)
  const slots = per * RING_SIDES
  const pad = cellPad(per)

  // Mỗi tên một ô, rải đều trên vành: stride = slots / count >= 1 nên không trùng ô.
  const slotOf = entries.map((_, i) => Math.floor((i * slots) / entries.length))
  const entryAtSlot = new Map<number, number>()
  slotOf.forEach((slot, i) => entryAtSlot.set(slot, i))

  const cells: WheelCell[] = []
  for (let slot = 0; slot < slots; slot += 1) {
    const side = Math.floor(slot / per)
    const j = slot % per
    const box = cellBox(side, j, per, depth)
    const entryIndex = entryAtSlot.get(slot) ?? null
    cells.push({
      slot,
      side,
      ...box,
      entryIndex,
      entry: entryIndex === null ? null : entries[entryIndex],
    })
  }

  return { per, depth, pad, cells }
}
