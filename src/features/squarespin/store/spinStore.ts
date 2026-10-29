import { useSyncExternalStore } from 'react'
import { showToast } from '../../../components/feedback/toastStore'
import { t } from '../../../i18n/langStore'
import type { SpinEntry, SpinList, SpinMode, SpinRecord, SpinState, WheelConfig, WheelSlot } from '../types'
import {
  DEFAULT_VOLUME,
  ENTRY_CAP,
  HISTORY_LIMIT,
  NAME_MAX,
  cleanName,
  clampRotations,
  clampSpinMs,
  defaultEntries,
  defaultSpinState,
  defaultWheelConfig,
  normalizeHex,
  parseBulk,
  paletteColor,
  uid,
} from '../defaults'
import { MODES } from '../defaults'

const STORAGE_KEY = 'ofa-square-spin-v1'

function text(value: unknown, max: number, fallback = ''): string {
  return typeof value === 'string' ? value.slice(0, max) : fallback
}

function num(value: unknown, fallback: number): number {
  const n = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(n) ? n : fallback
}

function flag(value: unknown, fallback: boolean): boolean {
  return typeof value === 'boolean' ? value : fallback
}

function normalizeEntry(raw: unknown): SpinEntry | null {
  const e = (raw ?? {}) as Partial<SpinEntry>
  const name = cleanName(text(e.name, NAME_MAX))
  if (!name) return null
  // Màu sai/không có để trống: normalizeList tô lại theo bảng màu.
  return { id: text(e.id, 40) || uid('spn'), name, color: normalizeHex(e.color, '') }
}

function normalizeList(raw: unknown): SpinList {
  const list = (raw ?? {}) as Partial<SpinList>
  const entries = (Array.isArray(list.entries) ? list.entries : [])
    .map(normalizeEntry)
    .filter((e): e is SpinEntry => e !== null)
    .slice(0, ENTRY_CAP)
  // Bản ghi cũ (trước khi có trường màu) và màu bị loại đều được tô theo vị trí,
  // nên danh sách cất từ trước vẫn lên màu đúng mà không phải đổi STORAGE_KEY.
  return { entries: entries.map((e, i) => (e.color ? e : { ...e, color: paletteColor(i) })) }
}

function normalizeConfig(raw: unknown): WheelConfig {
  const c = (raw ?? {}) as Partial<WheelConfig>
  return {
    spinMs: clampSpinMs(num(c.spinMs, defaultWheelConfig().spinMs)),
    rotations: clampRotations(num(c.rotations, defaultWheelConfig().rotations)),
    removeWinner: flag(c.removeWinner, false),
  }
}

function normalizeRecord(raw: unknown): SpinRecord | null {
  const r = (raw ?? {}) as Partial<SpinRecord>
  const at = num(r.at, 0)
  const name = cleanName(text(r.name, NAME_MAX))
  if (!at || !name) return null
  return {
    id: text(r.id, 40) || uid('spr'),
    at,
    slot: r.slot === 'B' ? 'B' : 'A',
    entryId: text(r.entryId, 40),
    name,
    poolSize: Math.max(1, Math.round(num(r.poolSize, 1))),
  }
}

/** Dữ liệu từ localStorage có thể thiếu/tràn/sai kiểu — mọi đường vào đều qua đây. */
function normalizeState(raw: unknown): SpinState {
  const s = (raw ?? {}) as Partial<SpinState>
  const seed = defaultSpinState()
  const history = (Array.isArray(s.history) ? s.history : [])
    .map(normalizeRecord)
    .filter((r): r is SpinRecord => r !== null)
    .slice(0, HISTORY_LIMIT)
  return {
    mode: MODES.includes(s.mode as SpinMode) ? (s.mode as SpinMode) : 'single',
    wheelA: normalizeConfig(s.wheelA),
    wheelB: normalizeConfig(s.wheelB),
    sharedConfig: flag(s.sharedConfig, true),
    listA: normalizeList(s.listA ?? seed.listA),
    listB: normalizeList(s.listB ?? seed.listB),
    history,
    // Bản ghi cất trước khi có hai khoá này đơn giản là thiếu chúng -> mặc định,
    // nên không phải đổi STORAGE_KEY.
    soundEnabled: flag(s.soundEnabled, true),
    soundVolume: Math.min(1, Math.max(0, num(s.soundVolume, DEFAULT_VOLUME))),
  }
}

function readStored(): SpinState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return normalizeState(JSON.parse(raw))
  } catch {
    return null
  }
}

let warnedQuota = false

function writeStored(next: SpinState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch {
    if (!warnedQuota) {
      warnedQuota = true
      showToast({ type: 'error', message: t('spin.err.storageFull') })
    }
  }
}

let state: SpinState | null = null
const listeners = new Set<() => void>()

/** Đọc localStorage ở lần truy cập đầu (không phải lúc import) để `t()` đã có ngôn ngữ. */
function ensureLoaded(): SpinState {
  if (!state) {
    const stored = readStored()
    state = stored ?? normalizeState(null)
    if (!stored) writeStored(state)
  }
  return state
}

function commit(next: SpinState): void {
  state = next
  writeStored(next)
  listeners.forEach((l) => l())
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

function getSnapshot(): SpinState {
  return ensureLoaded()
}

export function useSpinStore(): SpinState {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
}

export function getSpinState(): SpinState {
  return ensureLoaded()
}

function listKey(slot: WheelSlot): 'listA' | 'listB' {
  return slot === 'A' ? 'listA' : 'listB'
}

function configKey(slot: WheelSlot): 'wheelA' | 'wheelB' {
  return slot === 'A' ? 'wheelA' : 'wheelB'
}

function withList(s: SpinState, slot: WheelSlot, entries: SpinEntry[]): SpinState {
  return slot === 'A' ? { ...s, listA: { entries } } : { ...s, listB: { entries } }
}

function withConfig(s: SpinState, slot: WheelSlot, config: WheelConfig): SpinState {
  return slot === 'A' ? { ...s, wheelA: config } : { ...s, wheelB: config }
}

export function setMode(mode: SpinMode): void {
  const s = ensureLoaded()
  if (s.mode === mode) return
  commit({ ...s, mode })
}

/** `sharedConfig` = True: wheel 2 dùng chung cấu hình với wheel 1. */
export function setSharedConfig(shared: boolean): void {
  const s = ensureLoaded()
  if (s.sharedConfig === shared) return
  commit({ ...s, sharedConfig: shared, wheelB: shared ? { ...s.wheelA } : s.wheelB })
}

export function setSound(patch: { enabled?: boolean; volume?: number }): void {
  const s = ensureLoaded()
  const enabled = typeof patch.enabled === 'boolean' ? patch.enabled : s.soundEnabled
  const volume = patch.volume === undefined ? s.soundVolume : Math.min(1, Math.max(0, num(patch.volume, s.soundVolume)))
  if (s.soundEnabled === enabled && s.soundVolume === volume) return
  commit({ ...s, soundEnabled: enabled, soundVolume: volume })
}

export function patchConfig(slot: WheelSlot, patch: Partial<WheelConfig>): void {
  const s = ensureLoaded()
  const next = { ...s[configKey(slot)], ...patch }
  const config = normalizeConfig(next)
  if (s.sharedConfig) {
    commit({ ...s, wheelA: config, wheelB: { ...config } })
    return
  }
  commit(withConfig(s, slot, config))
}

export function configFor(s: SpinState, slot: WheelSlot): WheelConfig {
  return s.sharedConfig ? s.wheelA : s[configKey(slot)]
}

/** Thêm nhiều tên một lượt (bulk/paste). Trả về số tên thực thêm vào được. */
export function addEntries(slot: WheelSlot, names: string[]): number {
  const s = ensureLoaded()
  const room = ENTRY_CAP - s[listKey(slot)].entries.length
  if (room <= 0) {
    showToast({ type: 'warning', message: t('spin.err.listFull', { max: ENTRY_CAP }) })
    return 0
  }
  const base = s[listKey(slot)].entries.length
  const fresh = names
    .map(cleanName)
    .filter((n) => n.length > 0)
    .slice(0, room)
    .map((name, i) => ({ id: uid('spn'), name, color: paletteColor(base + i) }))
  if (fresh.length < names.length && names.length > room) {
    showToast({ type: 'warning', message: t('spin.err.listFull', { max: ENTRY_CAP }) })
  }
  commit(withList(s, slot, [...s[listKey(slot)].entries, ...fresh]))
  return fresh.length
}

export function addEntry(slot: WheelSlot, name: string): boolean {
  if (addEntries(slot, [name]) === 0) return false
  return true
}

/** Lúc gõ chỉ cắt theo độ dài: trim ở đây sẽ nuốt khoảng trắng giữa hai từ. */
export function renameEntry(slot: WheelSlot, id: string, name: string): void {
  const s = ensureLoaded()
  const entries = s[listKey(slot)].entries.map((e) => (e.id === id ? { ...e, name: name.slice(0, NAME_MAX) } : e))
  commit(withList(s, slot, entries))
}

/** Màu không hợp lệ (đang gõ dở, "red", chuỗi dài) thì giữ nguyên màu cũ. */
export function setEntryColor(slot: WheelSlot, id: string, color: string): void {
  const s = ensureLoaded()
  const hex = normalizeHex(color, '')
  const current = s[listKey(slot)].entries.find((e) => e.id === id)
  if (!hex || !current || current.color === hex) return
  commit(withList(s, slot, s[listKey(slot)].entries.map((e) => (e.id === id ? { ...e, color: hex } : e))))
}

export function removeEntry(slot: WheelSlot, id: string): void {
  const s = ensureLoaded()
  const entries = s[listKey(slot)].entries.filter((e) => e.id !== id)
  if (entries.length === s[listKey(slot)].entries.length) return
  commit(withList(s, slot, entries))
}

export function clearEntries(slot: WheelSlot): void {
  const s = ensureLoaded()
  if (s[listKey(slot)].entries.length === 0) return
  commit(withList(s, slot, []))
}

/**
 * Đưa một vòng về trạng thái lần đầu mở trang (danh sách mẫu + cấu hình mặc định).
 * Lịch sử là dữ liệu của người dùng nên ở lại; "dùng chung cấu hình" thì cả hai
 * vòng cùng về mặc định.
 */
export function resetWheel(slot: WheelSlot): void {
  const s = ensureLoaded()
  const withListReset = withList(s, slot, defaultEntries(slot))
  const config = defaultWheelConfig()
  if (s.sharedConfig) {
    commit({ ...withListReset, wheelA: config, wheelB: { ...config } })
    return
  }
  commit(withConfig(withListReset, slot, config))
}

/** Sao chép danh sách — bản sao lấy id mới để hai wheel độc lập thật sự. */
export function copyList(from: WheelSlot, to: WheelSlot): number {
  const s = ensureLoaded()
  if (from === to) return 0
  const source = s[listKey(from)].entries
  const room = ENTRY_CAP - s[listKey(to)].entries.length
  const taken = room <= 0 ? [] : source.slice(0, room)
  if (taken.length < source.length) {
    showToast({ type: 'warning', message: t('spin.err.listFull', { max: ENTRY_CAP }) })
  }
  if (taken.length === 0) return 0
  commit(withList(s, to, [...s[listKey(to)].entries, ...taken.map((e) => ({ id: uid('spn'), name: e.name, color: e.color }))]))
  return taken.length
}

export function recordSpin(record: Omit<SpinRecord, 'id' | 'at'>): void {
  const s = ensureLoaded()
  const entry: SpinRecord = { ...record, id: uid('spr'), at: Date.now() }
  commit({ ...s, history: [entry, ...s.history].slice(0, HISTORY_LIMIT) })
}

export function clearHistory(): void {
  const s = ensureLoaded()
  if (s.history.length === 0) return
  commit({ ...s, history: [] })
}

export { parseBulk }
