import type { CaseItem, Rarity } from '../types'

export function randomFloat(): number {
  const buf = new Uint32Array(1)
  if (globalThis.crypto?.getRandomValues) {
    globalThis.crypto.getRandomValues(buf)
    return buf[0] / 0x100000000
  }
  return Math.random()
}

/** Dữ liệu đến từ localStorage nên có thể là NaN/âm/chuỗi — mọi đường vào đều qua đây. */
export function sanitizeWeight(value: unknown): number {
  const n = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(n) || n <= 0) return 0
  return Math.min(n, 1_000_000)
}

export function rarityMap(rarities: Rarity[]): Record<string, Rarity> {
  const out: Record<string, Rarity> = {}
  for (const r of rarities) out[r.id] = r
  return out
}

/** Xác suất thật = trọng số vật phẩm × hệ số cấp độ hiếm. */
export function effectiveWeights(items: CaseItem[], rarities: Rarity[]): number[] {
  const byId = rarityMap(rarities)
  return items.map((item) => sanitizeWeight(item.weight) * sanitizeWeight(byId[item.rarityId]?.weight ?? 0))
}

export function sum(values: number[]): number {
  return values.reduce((acc, v) => acc + v, 0)
}

export function shares(weights: number[]): number[] {
  const total = sum(weights)
  if (total <= 0) return weights.map(() => 0)
  return weights.map((w) => w / total)
}

/** Trả về index vật phẩm trúng, hoặc null khi không có ứng viên (toàn bộ trọng số 0). */
export function pickWeightedIndex(weights: number[], rnd: () => number = randomFloat): number | null {
  const total = sum(weights)
  if (total <= 0) return null
  let roll = rnd() * total
  for (let i = 0; i < weights.length; i += 1) {
    roll -= weights[i]
    if (roll < 0) return i
  }
  return weights.length - 1
}

export function formatPercent(share: number): string {
  if (share <= 0) return '0%'
  if (share < 0.001) return '<0.1%'
  return `${(share * 100).toFixed(share < 0.1 ? 2 : 1)}%`
}
