/**
 * Nguồn ngẫu nhiên cho kết quả quay — luôn đi qua `randomUint32` (Web Crypto),
 * không dùng `Math.random()`.
 */

const UINT32_RANGE = 0x1_0000_0000

export class RngUnavailableError extends Error {
  constructor() {
    super('Web Crypto (crypto.getRandomValues) is unavailable')
    this.name = 'RngUnavailableError'
  }
}

export function rngAvailable(): boolean {
  return typeof globalThis.crypto?.getRandomValues === 'function'
}

function randomUint32(): number {
  const buf = new Uint32Array(1)
  globalThis.crypto.getRandomValues(buf)
  return buf[0]
}

/**
 * Số nguyên đều trong [0, count). `u % count` bị lệch vì 2^32 không chia hết cho
 * mọi count — rejection sampling loại toàn bộ vùng dư.
 */
export function uniformIndex(count: number): number {
  if (!Number.isInteger(count) || count <= 0) throw new RangeError(`uniformIndex: count must be a positive integer, got ${count}`)
  if (!rngAvailable()) throw new RngUnavailableError()
  const limit = Math.floor(UINT32_RANGE / count) * count
  // Kỳ vọng dưới 2 lượt; trần 64 chỉ để không bao giờ treo.
  for (let attempt = 0; attempt < 64; attempt += 1) {
    const u = randomUint32()
    if (u < limit) return u % count
  }
  throw new Error('uniformIndex: rejection sampling did not converge')
}

/** Nhịp trình bày — không dùng để chọn kết quả. */
export function randomFloat(): number {
  return rngAvailable() ? randomUint32() / UINT32_RANGE : Math.random()
}

export function idSuffix(): string {
  return rngAvailable() ? randomUint32().toString(36) : Math.random().toString(36).slice(2, 8)
}
