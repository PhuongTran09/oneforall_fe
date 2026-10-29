import type { CaseConfig, CaseItem, Rarity } from './types'
import { t } from '../../i18n/langStore'
import { BUILTIN_SOUND_PACK } from './utils/builtinSounds'
import { clampCells, clampSpinMs } from './utils/roulette'

export function uid(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`
}

const RARITY_TIERS: Array<Omit<Rarity, 'name'>> = [
  { id: 'common', color: '#9aa3b2', weight: 100 },
  { id: 'uncommon', color: '#34c759', weight: 60 },
  { id: 'rare', color: '#3b82f6', weight: 35 },
  { id: 'epic', color: '#a855f7', weight: 18 },
  { id: 'legendary', color: '#f5c518', weight: 8 },
  { id: 'mythic', color: '#ff3b30', weight: 3 },
]

/** Cấp mặc định cho hòm mới — tên là dữ liệu người dùng sửa được nên theo ngôn ngữ lúc tạo/reset. */
export function defaultRarities(): Rarity[] {
  return RARITY_TIERS.map((r) => ({ ...r, name: t(`case.seedRarity.${r.id}`) }))
}

export const RARITY_PRESETS = ['#9aa3b2', '#34c759', '#3b82f6', '#a855f7', '#f5c518', '#ff3b30', '#cf2216', '#d8431c', '#c8571d']

const SAMPLE: Array<{ key: string; rarityId: string; color: string; weight: number }> = [
  { key: 'neon', rarityId: 'common', color: '#9aa3b2', weight: 30 },
  { key: 'ember', rarityId: 'uncommon', color: '#34c759', weight: 24 },
  { key: 'frost', rarityId: 'rare', color: '#3b82f6', weight: 18 },
  { key: 'volt', rarityId: 'rare', color: '#22d3ee', weight: 12 },
  { key: 'onyx', rarityId: 'epic', color: '#a855f7', weight: 8 },
  { key: 'aurora', rarityId: 'epic', color: '#f472b6', weight: 4 },
  { key: 'nova', rarityId: 'legendary', color: '#f5c518', weight: 3 },
  { key: 'prism', rarityId: 'mythic', color: '#ff3b30', weight: 1 },
]

function sampleItems(): CaseItem[] {
  return SAMPLE.map(({ key, rarityId, color, weight }) => ({
    id: uid('itm'),
    name: t(`case.seedItem.${key}`),
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
    rarities: defaultRarities(),
    items: sampleItems(),
    sounds: { ...BUILTIN_SOUND_PACK },
  }
}

export function createEmptyCase(name: string): CaseConfig {
  return { ...createDefaultCase(name), items: [] }
}
