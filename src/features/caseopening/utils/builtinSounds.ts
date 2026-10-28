import type { SoundSlot } from '../types'

/**
 * Gói âm thanh có sẵn của tính năng, sinh bằng DSP trong `scripts/genCaseSounds.mjs`
 * (không dùng mẫu âm thanh của bên thứ ba). Asset nội tại nên nằm ở `public/sounds`
 * thay vì IndexedDB — người dùng tải lên mới cần ghi DB.
 */
export const BUILTIN_PREFIX = 'builtin:'

export const BUILTIN_SOUND_PACK: Record<SoundSlot, string> = {
  spin: `${BUILTIN_PREFIX}case-spin`,
  open: `${BUILTIN_PREFIX}case-open`,
  reward: `${BUILTIN_PREFIX}case-reward`,
  rare: `${BUILTIN_PREFIX}case-rare`,
}

const BUILTIN_IDS: ReadonlySet<string> = new Set(Object.values(BUILTIN_SOUND_PACK))

/**
 * Nhịp vòng quay không thể nằm trong một tệp: nó phải khớp đường cong easing của
 * lượt quay đang chạy nên được tổng hợp lúc quay. Slot này không có URL tệp.
 */
const SYNTH_IDS: ReadonlySet<string> = new Set([BUILTIN_SOUND_PACK.spin])

export function isSynthSound(id: string | undefined): boolean {
  return typeof id === 'string' && SYNTH_IDS.has(id)
}

/** Chỉ bốn id của gói mới được gọi là "âm thanh có sẵn" trong giao diện. */
export function isBuiltinSound(id: string | undefined): boolean {
  return typeof id === 'string' && BUILTIN_IDS.has(id)
}

/** id đến từ localStorage nên phải chặn mọi ký tự ngoài tên tệp an toàn. */
export function resolveBuiltinUrl(id: string): string | null {
  if (isSynthSound(id)) return null
  const match = /^builtin:([a-z0-9][a-z0-9-]{0,39})$/.exec(id)
  return match ? `/sounds/${match[1]}.wav` : null
}
