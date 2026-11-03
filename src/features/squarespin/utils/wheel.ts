import type { SpinEntry } from '../types'






export const RING_SIDES = 4

export interface WheelCell {

  slot: number
  side: number

  left: number
  top: number
  width: number
  height: number

  entryIndex: number | null
  entry: SpinEntry | null
}

export interface WheelLayout {

  per: number

  depth: number

  pad: number
  cells: WheelCell[]
}





export const MIN_FONT = 7
export const MAX_FONT = 13
export const LINE_H = 1.2

const W_THIN = 0.3
const W_SEMI = 0.44
const W_HYPHEN = 0.44
const W_NORMAL = 0.62
const W_UPPER = 0.72
const W_WIDE = 0.98
const THIN_CHARS = 'iljıIL.,;:\'"!| '
const SEMI_CHARS = 'trf'


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


export const CELL_PAD_WIDE = 3
export const CELL_PAD_TIGHT = 2
export const TIGHT_PER = 5

export const CELL_BORDER = 1

export const MIN_BOARD = 256

export function cellPad(per: number): number {
  return per >= TIGHT_PER ? CELL_PAD_TIGHT : CELL_PAD_WIDE
}


export function hasRoom(text: string, w: number, h: number, fs = MIN_FONT): boolean {
  return textLines(text, w, fs) * LINE_H * fs <= h
}





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





export function fitFontSize(text: string, w: number, h: number): number {
  for (let fs = MAX_FONT; fs >= MIN_FONT; fs -= 0.25) {
    if (hasRoom(text, w, h, fs)) return Math.round(fs * 100) / 100
  }
  return MIN_FONT
}

export function slotsPerSide(count: number): number {
  return Math.max(1, Math.ceil(Math.max(0, count) / RING_SIDES))
}


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
