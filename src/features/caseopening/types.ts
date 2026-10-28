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
  /** Hệ số nhân của cấp độ, áp lên trọng số từng vật phẩm cùng cấp. */
  weight: number
}

export interface CaseItem {
  id: ItemId
  name: string
  description: string
  color: string
  rarityId: RarityId
  /** Trọng số tương đối. 0 = không bao giờ trúng. */
  weight: number
  imageAssetId?: AssetId
}

export interface CaseConfig {
  id: CaseId
  name: string
  accentColor: string
  backgroundColor: string
  effect: EffectKind
  /** Thời lượng roulette (ms). */
  spinMs: number
  /** Số ô vật phẩm render trên strip mỗi lượt quay. */
  stripCells: number
  rarities: Rarity[]
  items: CaseItem[]
  sounds: Partial<Record<SoundSlot, AssetId>>
}

export interface CaseSettings {
  soundEnabled: boolean
  /** 0..1 */
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
