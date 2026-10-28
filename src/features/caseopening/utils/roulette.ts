import type { CaseItem, Rarity, StripCell } from '../types'
import { effectiveWeights, randomFloat, rarityMap } from './random'

/** Ô trúng thưởng nằm cách đích một đoạn để còn dư băng giảm tốc sau nó. */
export const WINNER_FROM_END = 6
export const MIN_CELLS = 24
export const MAX_CELLS = 120
/**
 * Điểm điều phối của đường cong quay — animation và nhịp tiếng cùng dùng một nguồn.
 * Gần với easeOutCubic (x ≈ θ): 87% quãng đường đi trong nửa đầu lượt quay, nhờ vậy
 * nhịp "tách" vẫn chạy tới gần cuối thay vì dồn hết vào mấy trăm ms đầu.
 */
export const SPIN_EASING_POINTS = [0.33, 1, 0.67, 1]
export const SPIN_EASING = `cubic-bezier(${SPIN_EASING_POINTS.join(', ')})`

export function clampCells(value: number): number {
  const n = Math.round(Number(value))
  if (!Number.isFinite(n)) return 60
  return Math.min(MAX_CELLS, Math.max(MIN_CELLS, n))
}

export function clampSpinMs(value: number): number {
  const n = Math.round(Number(value))
  if (!Number.isFinite(n)) return 5200
  return Math.min(15000, Math.max(1200, n))
}

/**
 * Dựng băng roulette. Kết quả đã được quay xong ở `winnerIndex` trước khi hàm này chạy,
 * strip chỉ là dàn dựng sao cho ô đích dừng đúng dưới kim.
 */
export function buildStrip(
  items: CaseItem[],
  rarities: Rarity[],
  cells: number,
  winnerIndex: number,
  rnd: () => number = randomFloat,
): StripCell[] {
  const total = clampCells(cells)
  const byRarity = rarityMap(rarities)
  const weights = effectiveWeights(items, rarities)
  const pool = items.filter((_, i) => weights[i] > 0)
  if (pool.length === 0) return []

  const toCell = (item: CaseItem, index: number): StripCell => ({
    key: `${index}-${item.id}`,
    itemId: item.id,
    name: item.name,
    color: item.color,
    rarityColor: byRarity[item.rarityId]?.color ?? item.color,
    imageAssetId: item.imageAssetId,
  })

  const strip: StripCell[] = []
  let prev2 = ''
  let prev1 = ''
  for (let i = 0; i < total; i += 1) {
    let pick = pool[Math.floor(rnd() * pool.length) % pool.length]
    // Chặn 3 ô liền cùng một vật phẩm — dễ bị nhìn như quay lỗi.
    if (pool.length > 2 && pick.id === prev1 && pick.id === prev2) {
      pick = pool[(Math.floor(rnd() * pool.length) + 1) % pool.length]
    }
    prev2 = prev1
    prev1 = pick.id
    strip.push(toCell(pick, i))
  }

  const target = Math.max(0, total - WINNER_FROM_END)
  strip[target] = toCell(items[winnerIndex], target)
  return strip
}

export const winnerCellIndex = (cells: number): number => Math.max(0, clampCells(cells) - WINNER_FROM_END)

/**
 * Quãng dịch của track để tâm ô `targetIndex` nằm dưới kim (giữa viewport),
 * lệch ngẫu nhiên ±30% bề rộng ô cho không lần nào cũng dừng giữa như nhau.
 */
export function computeStopOffset(
  targetIndex: number,
  pitch: number,
  viewportWidth: number,
  rnd: () => number = randomFloat,
): number {
  const jitter = (rnd() - 0.5) * pitch * 0.6
  return Math.max(0, (targetIndex + 0.5) * pitch - viewportWidth / 2 + jitter)
}

const bezierAt = (theta: number, p1: number, p2: number): number => {
  const inv = 1 - theta
  return 3 * inv * inv * theta * p1 + 3 * inv * theta * theta * p2 + theta * theta * theta
}

/** Thời gian (tỷ lệ 0..1 của lượt quay) khi băng đã đi được `progress` quãng đường. */
function timeAtProgress(progress: number): number {
  const [x1, y1, x2, y2] = SPIN_EASING_POINTS
  let lo = 0
  let hi = 1
  let theta = progress
  for (let i = 0; i < 24; i += 1) {
    theta = (lo + hi) / 2
    if (bezierAt(theta, y1, y2) < progress) lo = theta
    else hi = theta
  }
  return bezierAt(theta, x1, x2)
}

/** Khoảng cách ngắn nhất giữa hai nhịp; nhanh hơn nữa thì xem như tiếng rè nền. */
const MIN_TICK_GAP_MS = 26

export interface SpinPlan {
  /** Thời điểm (ms kể từ lúc băng bắt đầu chạy) mỗi ô đi qua kim. */
  ticks: number[]
  /** Lúc băng phanh lại tại ô trúng thưởng — cùng duration với transition. */
  stopAt: number
}

/**
 * Lịch tiếng quay: giải đường cong easing đang chạy thật (cùng points, cùng duration,
 * cùng offset kể cả jitter) để biết từng ô qua kim lúc nào. Vì thế nhịp khớp tuyệt đối
 * với animation ở mọi độ dài quay và mọi bề rộng màn hình.
 */
export function spinSchedule(offset: number, pitch: number, viewportWidth: number, durationMs: number): SpinPlan {
  const plan: SpinPlan = { ticks: [], stopAt: Math.round(durationMs) }
  if (offset <= 0 || pitch <= 0 || durationMs <= 0) return plan
  const needle = viewportWidth / 2
  let last = -Infinity
  for (let k = Math.max(0, Math.floor(needle / pitch - 0.5)); (k + 0.5) * pitch - needle <= offset; k += 1) {
    const travelled = (k + 0.5) * pitch - needle
    if (travelled <= 0 || travelled >= offset) continue
    const at = timeAtProgress(travelled / offset) * durationMs
    if (at - last < MIN_TICK_GAP_MS) continue
    last = at
    plan.ticks.push(Math.round(at))
  }
  return plan
}

/** Lịch cho nút "nghe thử": mô phỏng một lượt quay thật nên nghe được nhịp sẽ ra sao. */
export const demoSpinPlan = (): SpinPlan => spinSchedule(6208, 124, 1100, 5200)
