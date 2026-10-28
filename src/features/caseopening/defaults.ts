import type { CaseConfig, CaseItem, Rarity } from './types'
import { BUILTIN_SOUND_PACK } from './utils/builtinSounds'
import { clampCells, clampSpinMs } from './utils/roulette'

export function uid(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`
}

export const DEFAULT_RARITIES: Rarity[] = [
  { id: 'common', name: 'Common', color: '#9aa3b2', weight: 100 },
  { id: 'uncommon', name: 'Uncommon', color: '#34c759', weight: 60 },
  { id: 'rare', name: 'Rare', color: '#3b82f6', weight: 35 },
  { id: 'epic', name: 'Epic', color: '#a855f7', weight: 18 },
  { id: 'legendary', name: 'Legendary', color: '#f5c518', weight: 8 },
  { id: 'mythic', name: 'Mythic', color: '#ff3b30', weight: 3 },
]

export const RARITY_PRESETS = ['#9aa3b2', '#34c759', '#3b82f6', '#a855f7', '#f5c518', '#ff3b30', '#cf2216', '#d8431c', '#c8571d']

const SAMPLE: Array<[string, string, string, number]> = [
  ['Neon', 'common', '#9aa3b2', 30],
  ['Ember', 'uncommon', '#34c759', 24],
  ['Frost', 'rare', '#3b82f6', 18],
  ['Volt', 'rare', '#22d3ee', 12],
  ['Onyx', 'epic', '#a855f7', 8],
  ['Aurora', 'epic', '#f472b6', 4],
  ['Nova', 'legendary', '#f5c518', 3],
  ['Prism', 'mythic', '#ff3b30', 1],
]

function sampleItems(): CaseItem[] {
  return SAMPLE.map(([name, rarityId, color, weight]) => ({
    id: uid('itm'),
    name,
    description: '',
    color,
    rarityId,
    weight,
  }))
}

export function createDefaultCase(name: string): CaseConfig {
  return {
    id: uid('case'),
    name,
    accentColor: '#cf2216',
    backgroundColor: '#12121a',
    effect: 'glow',
    spinMs: clampSpinMs(5200),
    stripCells: clampCells(60),
    rarities: DEFAULT_RARITIES.map((r) => ({ ...r })),
    items: sampleItems(),
    sounds: { ...BUILTIN_SOUND_PACK },
  }
}

export function createEmptyCase(name: string): CaseConfig {
  return { ...createDefaultCase(name), items: [] }
}
