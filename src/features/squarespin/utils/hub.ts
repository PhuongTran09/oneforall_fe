import { CELL_BORDER, hasRoom, LINE_H, MIN_FONT } from './wheel'

/**
 * Hình học hub (nút quay + nhãn + trạng thái + hộp kết quả) — hàm thuần, không đọc DOM.
 */

/* Khớp với .spin-hub trong index.css: trừ 8px mép, padding 6, khe 4. */
export const HUB_EDGE = 8
export const HUB_PAD = 6
export const HUB_GAP = 4

/** Sàn chạm WCAG 2.2 cho chiều cao nút. */
export const MIN_TAP = 24
/** Nút cao hơn nữa chỉ ăn chỗ hộp kết quả. */
export const MAX_BTN_H = 34
/** Ngang hơn nữa chỉ ăn chỗ hộp kết quả. */
export const MAX_BTN_W = 96
/** Dưới chiều ngang này chỉ hiện icon, bỏ chữ. */
export const TEXT_MIN = 48
/** Dòng kết quả cần tối thiểu chừng này để còn đáng hiện. */
export const MIN_NAME_H = 17
/** Hộp kết quả chỉ lấy tối đa chừng này — chữ vốn bị trần 13px. */
export const MAX_NAME_H = 64

/* Dải chật còn mỗi nút + hộp kết quả, khe co lại để kết quả dư chỗ. */
const GAP_TIGHT = 3

export interface HubBox {
  /** Cạnh trong của hub (đã trừ padding và viền). */
  inner: number
  /** Cỡ chữ nhãn/trạng thái. */
  metaFs: number
  /** Nút quay: chữ nhật nhỏ, ngang ~3 lần cao, nằm đáy hub. */
  btnW: number
  btnH: number
  btnFs: number
  /** Cao độ còn lại cho hộp kết quả — 0 là hết chỗ. */
  nameH: number
  gap: number
  /** true = nhãn/state rời dòng chảy (sr-only) để kết quả lấy lại chỗ. */
  tight: boolean
}

export function hubBox(boardPx: number, depth: number): HubBox {
  const inner = Math.max(0, boardPx * (1 - 2 * depth) - HUB_EDGE - 2 * (HUB_PAD + CELL_BORDER))
  const metaFs = inner > 0 ? Math.min(11, Math.max(8, inner * 0.16)) : 11
  const metaCost = 2 * LINE_H * metaFs + 2 * HUB_GAP
  const btnFs = (h: number) => Math.round(Math.min(12, Math.max(8, h * 0.4)) * 100) / 100
  // Một công thức cạnh nút cho cả hai dải để nút không nhảy cỡ khi kéo cửa sổ.
  const btnH = Math.min(inner, Math.max(MIN_TAP, Math.min(MAX_BTN_H, inner * 0.16)))
  const btnW = Math.min(inner, Math.max(btnH * 2, Math.min(MAX_BTN_W, inner * 0.5)))

  // Dải rộng: nhãn + trạng thái + hộp kết quả + nút; hộp chỉ lấy tối đa MAX_NAME_H.
  const nameRoomy = inner - metaCost - btnH - HUB_GAP
  if (inner > 0 && nameRoomy >= MIN_NAME_H) {
    return { inner, metaFs, btnW, btnH, btnFs: btnFs(btnH), nameH: Math.min(nameRoomy, MAX_NAME_H), gap: HUB_GAP, tight: false }
  }

  // Dải chật: nhãn/state rời dòng chảy nên kết quả lấy lại đúng chỗ của chúng.
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

/** Nút có nhét nổi chữ "Quay" không — trừ mép và hai góc vát. */
export function hubBtnShowsLabel(btnW: number, btnH: number, btnFs: number, text: string): boolean {
  if (btnW < TEXT_MIN) return false
  return hasRoom(text, btnW - 12, btnH - 8, Math.max(MIN_FONT, btnFs))
}
