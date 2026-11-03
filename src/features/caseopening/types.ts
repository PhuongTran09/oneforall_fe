export type CaseId = string
export type ItemId = string
export type RarityId = string
export type AssetId = string

export type EffectKind = 'none' | 'glow'
export type SoundSlot = 'spin' | 'open' | 'reward' | 'rare'

export interface Rarity {
  id: RarityId
  name: string
  color: string

  weight: number
}

export interface CaseItem {
  id: ItemId
  name: string
  description: string
  color: string
  rarityId: RarityId

  weight: number
  imageAssetId?: AssetId
}

export interface CaseConfig {
  id: CaseId
  name: string
  accentColor: string
  backgroundColor: string
  effect: EffectKind

  spinMs: number

  stripCells: number
  rarities: Rarity[]
  items: CaseItem[]
  sounds: Partial<Record<SoundSlot, AssetId>>
}

export interface CaseSettings {
  soundEnabled: boolean

  volume: number
}

export interface OpenRecord {
  id: string
  caseId: CaseId
  caseName: string
  itemId: ItemId
  itemName: string
  rarityId: RarityId
  rarityName: string
  color: string
  imageAssetId?: AssetId
  at: number
}

export interface StripCell {
  key: string
  itemId: ItemId
  name: string
  color: string
  rarityColor: string
  imageAssetId?: AssetId
}
