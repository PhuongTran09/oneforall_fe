import { CELL_BORDER, hasRoom, LINE_H, MIN_FONT } from './wheel'






export const HUB_EDGE = 8
export const HUB_PAD = 6
export const HUB_GAP = 4


export const MIN_TAP = 24

export const MAX_BTN_H = 34

export const MAX_BTN_W = 96

export const TEXT_MIN = 48

export const MIN_NAME_H = 17

export const MAX_NAME_H = 64


const GAP_TIGHT = 3

export interface HubBox {

  inner: number

  metaFs: number

  btnW: number
  btnH: number
  btnFs: number

  nameH: number
  gap: number

  tight: boolean
}

export function hubBox(boardPx: number, depth: number): HubBox {
  const inner = Math.max(0, boardPx * (1 - 2 * depth) - HUB_EDGE - 2 * (HUB_PAD + CELL_BORDER))
  const metaFs = inner > 0 ? Math.min(11, Math.max(8, inner * 0.16)) : 11
  const metaCost = 2 * LINE_H * metaFs + 2 * HUB_GAP
  const btnFs = (h: number) => Math.round(Math.min(12, Math.max(8, h * 0.4)) * 100) / 100

  const btnH = Math.min(inner, Math.max(MIN_TAP, Math.min(MAX_BTN_H, inner * 0.16)))
  const btnW = Math.min(inner, Math.max(btnH * 2, Math.min(MAX_BTN_W, inner * 0.5)))


  const nameRoomy = inner - metaCost - btnH - HUB_GAP
  if (inner > 0 && nameRoomy >= MIN_NAME_H) {
    return { inner, metaFs, btnW, btnH, btnFs: btnFs(btnH), nameH: Math.min(nameRoomy, MAX_NAME_H), gap: HUB_GAP, tight: false }
  }


  return {
    inner,
    metaFs,
    btnW,
    btnH,
    btnFs: btnFs(btnH),
    nameH: Math.min(Math.max(0, inner - btnH - GAP_TIGHT), MAX_NAME_H),
    gap: GAP_TIGHT,
    tight: true,
  }
}


export function hubBtnShowsLabel(btnW: number, btnH: number, btnFs: number, text: string): boolean {
  if (btnW < TEXT_MIN) return false
  return hasRoom(text, btnW - 12, btnH - 8, Math.max(MIN_FONT, btnFs))
}
