import { useSyncExternalStore } from 'react'
import { t } from '../../../i18n/langStore'
import { showToast } from '../../../components/feedback/toastStore'
import type { CaseConfig, CaseItem, CaseSettings, EffectKind, OpenRecord, Rarity, SoundSlot } from '../types'
import { clampCells, clampSpinMs } from '../utils/roulette'
import { sanitizeWeight } from '../utils/random'
import { createDefaultCase, createEmptyCase, defaultRarities, RARITY_PRESETS, uid } from '../defaults'
import { dropAsset, saveAsset, type AssetKind } from '../utils/assets'

const STORAGE_KEY = 'ofa-case-opening-v2'
const HISTORY_LIMIT = 100
const CASE_LIMIT = 20
const EFFECTS: EffectKind[] = ['none', 'glow']
const HEX = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i

export interface CaseState {
  cases: CaseConfig[]
  activeCaseId: string
  settings: CaseSettings
  history: OpenRecord[]
}

function color(value: unknown, fallback: string): string {
  return typeof value === 'string' && HEX.test(value) ? value : fallback
}

function text(value: unknown, max: number, fallback = ''): string {
  return typeof value === 'string' ? value.slice(0, max) : fallback
}

function num(value: unknown, fallback: number): number {
  const n = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(n) ? n : fallback
}

function normalizeRarity(raw: unknown, preset: Rarity): Rarity {
  const r = (raw ?? {}) as Partial<Rarity>
  return {
    id: text(r.id, 40) || preset.id,
    name: text(r.name, 40, preset.name),
    color: color(r.color, preset.color),
    weight: sanitizeWeight(r.weight ?? preset.weight) || 0,
  }
}

function normalizeItem(raw: unknown, fallbackRarityId: string): CaseItem | null {
  const i = (raw ?? {}) as Partial<CaseItem>
  const name = text(i.name, 60)
  if (!name) return null
  return {
    id: text(i.id, 40) || uid('itm'),
    name,
    description: text(i.description, 160),
    color: color(i.color, RARITY_PRESETS[0]),
    rarityId: text(i.rarityId, 40) || fallbackRarityId,
    weight: sanitizeWeight(i.weight),
    imageAssetId: i.imageAssetId ? text(i.imageAssetId, 60) : undefined,
  }
}

function normalizeCase(raw: unknown): CaseConfig | null {
  const c = (raw ?? {}) as Partial<CaseConfig>
  const presets = defaultRarities()
  const rarities =
    Array.isArray(c.rarities) && c.rarities.length
      ? c.rarities.map((r, i) => normalizeRarity(r, presets[i] ?? presets[presets.length - 1]))
      : presets
  const known = new Set(rarities.map((r) => r.id))
  const items = (Array.isArray(c.items) ? c.items : [])
    .map((i) => normalizeItem(i, rarities[0].id))
    .filter((i): i is CaseItem => i !== null)
    .map((i) => (known.has(i.rarityId) ? i : { ...i, rarityId: rarities[0].id }))
  const sounds: CaseConfig['sounds'] = {}
  for (const slot of ['spin', 'open', 'reward', 'rare'] as SoundSlot[]) {
    const id = text((c.sounds ?? {})[slot], 60)
    if (id) sounds[slot] = id
  }
  return {
    id: text(c.id, 40) || uid('case'),
    name: text(c.name, 60, t('case.defaultName')),
    accentColor: color(c.accentColor, '#cf2216'),
    backgroundColor: color(c.backgroundColor, '#12121a'),
    effect: EFFECTS.includes(c.effect as EffectKind) ? (c.effect as EffectKind) : 'glow',
    spinMs: clampSpinMs(num(c.spinMs, 5200)),
    stripCells: clampCells(num(c.stripCells, 60)),
    rarities,
    items: items.slice(0, 300),
    sounds,
  }
}

function normalizeState(raw: unknown): CaseState {
  const s = (raw ?? {}) as Partial<CaseState>
  const cases = (Array.isArray(s.cases) ? s.cases : []).map(normalizeCase).filter((c): c is CaseConfig => c !== null)
  const withItems = cases.length ? cases : [createDefaultCase(t('case.defaultName'))]
  const history = (Array.isArray(s.history) ? s.history : [])
    .map((h): OpenRecord | null => {
      const r = (h ?? {}) as Partial<OpenRecord>
      const at = num(r.at, 0)
      const itemName = text(r.itemName, 60)
      if (!at || !itemName) return null
      return {
        id: text(r.id, 40) || uid('rec'),
        caseId: text(r.caseId, 40),
        caseName: text(r.caseName, 60),
        itemId: text(r.itemId, 40),
        itemName,
        rarityId: text(r.rarityId, 40),
        rarityName: text(r.rarityName, 40),
        color: color(r.color, RARITY_PRESETS[0]),
        imageAssetId: r.imageAssetId ? text(r.imageAssetId, 60) : undefined,
        at,
      }
    })
    .filter((h): h is OpenRecord => h !== null)
    .slice(0, HISTORY_LIMIT)
  const activeId = text(s.activeCaseId, 40)
  return {
    cases: withItems.slice(0, CASE_LIMIT),
    activeCaseId: withItems.some((c) => c.id === activeId) ? activeId : withItems[0].id,
    settings: {
      soundEnabled: typeof s.settings?.soundEnabled === 'boolean' ? s.settings.soundEnabled : true,
      volume: Math.min(1, Math.max(0, num(s.settings?.volume, 0.8))),
    },
    history,
  }
}

function readStored(): CaseState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return normalizeState(JSON.parse(raw))
  } catch {
    return null
  }
}

function writeStored(next: CaseState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch {
    if (!warnedQuota) {
      warnedQuota = true
      showToast({ type: 'error', message: t('case.err.storageFull') })
    }
  }
}

let warnedQuota = false

let state: CaseState | null = null
const listeners = new Set<() => void>()

/** Đọc localStorage ở lần truy cập đầu tiên (chứ không phải lúc import) để `t()` đã có ngôn ngữ. */
function ensureLoaded(): CaseState {
  if (!state) {
    const stored = readStored()
    state = stored ?? normalizeState(null)
    // Ghi lại bản seed để id hòm/vật phẩm ổn định giữa các lần tải trang.
    if (!stored) writeStored(state)
  }
  return state
}

function commit(next: CaseState): void {
  state = next
  writeStored(next)
  listeners.forEach((l) => l())
}

function patchCaseOf(id: string, fn: (c: CaseConfig) => CaseConfig): CaseState {
  const s = ensureLoaded()
  return { ...s, cases: s.cases.map((c) => (c.id === id ? fn(c) : c)) }
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

function getSnapshot(): CaseState {
  return ensureLoaded()
}

export function useCaseStore(): CaseState {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
}

export function getCaseState(): CaseState {
  return ensureLoaded()
}

export function activeCaseOf(s: CaseState): CaseConfig {
  return s.cases.find((c) => c.id === s.activeCaseId) ?? s.cases[0]
}

export function useActiveCase(): CaseConfig {
  const s = useCaseStore()
  return activeCaseOf(s)
}

export function setActiveCase(id: string): void {
  const s = ensureLoaded()
  if (!s.cases.some((c) => c.id === id) || s.activeCaseId === id) return
  commit({ ...s, activeCaseId: id })
}

export function createCase(): void {
  const s = ensureLoaded()
  if (s.cases.length >= CASE_LIMIT) {
    showToast({ type: 'warning', message: t('case.err.caseLimit', { max: CASE_LIMIT }) })
    return
  }
  const fresh = createEmptyCase(t('case.newCaseName', { index: s.cases.length + 1 }))
  commit({ ...s, cases: [...s.cases, fresh], activeCaseId: fresh.id })
}

export function duplicateCase(id: string): void {
  const s = ensureLoaded()
  if (s.cases.length >= CASE_LIMIT) {
    showToast({ type: 'warning', message: t('case.err.caseLimit', { max: CASE_LIMIT }) })
    return
  }
  const source = s.cases.find((c) => c.id === id)
  if (!source) return
  // Ảnh là Blob dùng chung theo assetId — nhân bản case không được xoá asset của bản gốc.
  const copy: CaseConfig = {
    ...source,
    id: uid('case'),
    name: `${source.name} (2)`,
    rarities: source.rarities.map((r) => ({ ...r })),
    items: source.items.map((i) => ({ ...i })),
    sounds: { ...source.sounds },
  }
  commit({ ...s, cases: [...s.cases, copy], activeCaseId: copy.id })
}

export async function deleteCase(id: string): Promise<void> {
  const s = ensureLoaded()
  const target = s.cases.find((c) => c.id === id)
  if (!target || s.cases.length <= 1) return
  const orphaned = new Set(target.items.map((i) => i.imageAssetId).filter((x): x is string => Boolean(x)))
  for (const other of s.cases) {
    if (other.id === id) continue
    other.items.forEach((i) => orphaned.delete(i.imageAssetId ?? ''))
    Object.values(other.sounds).forEach((a) => orphaned.delete(a ?? ''))
  }
  orphaned.forEach((assetId) => void dropAsset(assetId))
  const cases = s.cases.filter((c) => c.id !== id)
  commit({ ...s, cases, activeCaseId: cases.some((c) => c.id === s.activeCaseId) ? s.activeCaseId : cases[0].id })
}

/** Trả hòm về cấu hình hệ thống: giữ id và tên, xoá asset không còn hòm/lịch sử nào tham chiếu. */
export function resetCase(id: string): void {
  const s = ensureLoaded()
  const target = s.cases.find((c) => c.id === id)
  if (!target) return
  const kept = new Set<string>()
  for (const other of s.cases) {
    if (other.id === id) continue
    other.items.forEach((i) => i.imageAssetId && kept.add(i.imageAssetId))
    Object.values(other.sounds).forEach((a) => a && kept.add(a))
  }
  s.history.forEach((h) => h.imageAssetId && kept.add(h.imageAssetId))
  for (const assetId of [...target.items.map((i) => i.imageAssetId), ...Object.values(target.sounds)]) {
    if (assetId && !kept.has(assetId)) void dropAsset(assetId)
  }
  commit(patchCaseOf(id, (c) => ({ ...createDefaultCase(c.name), id: c.id })))
}

export function renameCase(id: string, name: string): void {
  commit(patchCaseOf(id, (c) => ({ ...c, name: text(name, 60, c.name) || c.name })))
}

export function patchCase(id: string, patch: Partial<Pick<CaseConfig, 'name' | 'accentColor' | 'backgroundColor' | 'effect' | 'spinMs' | 'stripCells'>>): void {
  commit(
    patchCaseOf(id, (c) => ({
      ...c,
      name: patch.name !== undefined ? text(patch.name, 60, c.name) || c.name : c.name,
      accentColor: patch.accentColor !== undefined ? color(patch.accentColor, c.accentColor) : c.accentColor,
      backgroundColor: patch.backgroundColor !== undefined ? color(patch.backgroundColor, c.backgroundColor) : c.backgroundColor,
      effect: patch.effect && EFFECTS.includes(patch.effect) ? patch.effect : c.effect,
      spinMs: patch.spinMs !== undefined ? clampSpinMs(patch.spinMs) : c.spinMs,
      stripCells: patch.stripCells !== undefined ? clampCells(patch.stripCells) : c.stripCells,
    })),
  )
}

export function addItem(id: string, item: Omit<CaseItem, 'id'>): void {
  commit(patchCaseOf(id, (c) => ({ ...c, items: [...c.items, { ...item, id: uid('itm') }].slice(0, 300) })))
}

export function patchItem(id: string, itemId: string, patch: Partial<CaseItem>): void {
  commit(
    patchCaseOf(id, (c) => ({
      ...c,
      items: c.items.map((i) =>
        i.id === itemId
          ? {
              ...i,
              ...patch,
              id: i.id,
              name: patch.name !== undefined ? text(patch.name, 60, i.name) || i.name : i.name,
              color: patch.color !== undefined ? color(patch.color, i.color) : i.color,
              weight: patch.weight !== undefined ? sanitizeWeight(patch.weight) : i.weight,
            }
          : i,
      ),
    })),
  )
}

export async function deleteItem(id: string, itemId: string): Promise<void> {
  const s = ensureLoaded()
  const c = s.cases.find((x) => x.id === id)
  const target = c?.items.find((i) => i.id === itemId)
  if (!c || !target) return
  await dropAsset(target.imageAssetId ?? '')
  commit(patchCaseOf(id, (x) => ({ ...x, items: x.items.filter((i) => i.id !== itemId) })))
}

export function addRarity(id: string): void {
  commit(
    patchCaseOf(id, (c) => ({
      ...c,
      rarities: [...c.rarities, { id: uid('rar'), name: t('case.rarityNew'), color: RARITY_PRESETS[c.rarities.length % RARITY_PRESETS.length], weight: 10 }],
    })),
  )
}

export function patchRarity(id: string, rarityId: string, patch: Partial<Rarity>): void {
  commit(
    patchCaseOf(id, (c) => ({
      ...c,
      rarities: c.rarities.map((r) =>
        r.id === rarityId
          ? {
              ...r,
              ...patch,
              id: r.id,
              name: patch.name !== undefined ? text(patch.name, 40, r.name) || r.name : r.name,
              color: patch.color !== undefined ? color(patch.color, r.color) : r.color,
              weight: patch.weight !== undefined ? sanitizeWeight(patch.weight) : r.weight,
            }
          : r,
      ),
    })),
  )
}

export function deleteRarity(id: string, rarityId: string): void {
  commit(
    patchCaseOf(id, (c) => {
      if (c.rarities.length <= 1) return c
      const rarities = c.rarities.filter((r) => r.id !== rarityId)
      const fallback = rarities[0].id
      return { ...c, rarities, items: c.items.map((i) => (i.rarityId === rarityId ? { ...i, rarityId: fallback } : i)) }
    }),
  )
}

/** Đổi slot âm thanh: asset cũ không còn ai tham chiếu thì xoá khỏi IDB. */
export async function setSound(id: string, slot: SoundSlot, assetId: string | undefined): Promise<void> {
  const s = ensureLoaded()
  const c = s.cases.find((x) => x.id === id)
  const previous = c?.sounds[slot]
  commit(patchCaseOf(id, (x) => ({ ...x, sounds: { ...x.sounds, [slot]: assetId } })))
  if (previous && previous !== assetId) await dropAsset(previous)
}

export function patchSettings(patch: Partial<CaseSettings>): void {
  const s = ensureLoaded()
  commit({
    ...s,
    settings: {
      soundEnabled: patch.soundEnabled ?? s.settings.soundEnabled,
      volume: patch.volume !== undefined ? Math.min(1, Math.max(0, patch.volume)) : s.settings.volume,
    },
  })
}

export function recordOpen(entry: OpenRecord): void {
  const s = ensureLoaded()
  commit({ ...s, history: [entry, ...s.history].slice(0, HISTORY_LIMIT) })
}

export function clearHistory(): void {
  const s = ensureLoaded()
  commit({ ...s, history: [] })
}

/** Trả về asset id đã lưu, hoặc null khi IndexedDB bị chặn. */
export async function uploadAsset(kind: AssetKind, blob: Blob, name: string): Promise<string | null> {
  const id = uid('ast')
  const ok = await saveAsset({ id, kind, blob, name: name.slice(0, 80), size: blob.size, createdAt: Date.now() })
  return ok ? id : null
}

export function normalizeWeightsToHundred(id: string): void {
  const s = ensureLoaded()
  const c = s.cases.find((x) => x.id === id)
  if (!c || c.items.length === 0) return
  const total = c.items.reduce((acc, i) => acc + sanitizeWeight(i.weight), 0)
  if (total <= 0) return
  commit(
    patchCaseOf(id, (x) => ({
      ...x,
      items: x.items.map((i) => ({ ...i, weight: Math.round((sanitizeWeight(i.weight) / total) * 1000) / 10 })),
    })),
  )
}
