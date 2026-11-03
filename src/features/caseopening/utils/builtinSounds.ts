import type { SoundSlot } from '../types'






export const BUILTIN_PREFIX = 'builtin:'

export const BUILTIN_SOUND_PACK: Record<SoundSlot, string> = {
  spin: `${BUILTIN_PREFIX}case-spin`,
  open: `${BUILTIN_PREFIX}case-open`,
  reward: `${BUILTIN_PREFIX}case-reward`,
  rare: `${BUILTIN_PREFIX}case-rare`,
}

const BUILTIN_IDS: ReadonlySet<string> = new Set(Object.values(BUILTIN_SOUND_PACK))

const SYNTH_IDS: ReadonlySet<string> = new Set([BUILTIN_SOUND_PACK.spin])

export function isSynthSound(id: string | undefined): boolean {
  return typeof id === 'string' && SYNTH_IDS.has(id)
}

export function isBuiltinSound(id: string | undefined): boolean {
  return typeof id === 'string' && BUILTIN_IDS.has(id)
}

export function resolveBuiltinUrl(id: string): string | null {
  if (isSynthSound(id)) return null
  const match = /^builtin:([a-z0-9][a-z0-9-]{0,39})$/.exec(id)
  return match ? `/sounds/${match[1]}.wav` : null
}
