import { isBuiltinSound, resolveBuiltinUrl } from './builtinSounds'

export type AssetKind = 'image' | 'audio'

export interface AssetRecord {
  id: string
  kind: AssetKind
  blob: Blob
  name: string
  size: number
  createdAt: number
}

const DB_NAME = 'ofa-case-opening'
const DB_VERSION = 1
const STORE = 'assets'

// Ảnh/am thanh là Blob nên nằm ở IndexedDB; localStorage chỉ giữ metadata (asset id).
let dbPromise: Promise<IDBDatabase | null> | null = null

function openDb(): Promise<IDBDatabase | null> {
  if (dbPromise) return dbPromise
  dbPromise = new Promise((resolve) => {
    try {
      if (typeof indexedDB === 'undefined') {
        resolve(null)
        return
      }
      const req = indexedDB.open(DB_NAME, DB_VERSION)
      req.onupgradeneeded = () => {
        const db = req.result
        if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE, { keyPath: 'id' })
      }
      req.onsuccess = () => resolve(req.result)
      req.onerror = () => resolve(null)
      req.onblocked = () => resolve(null)
    } catch {
      resolve(null)
    }
  })
  return dbPromise
}

function run<T>(mode: IDBTransactionMode, action: (store: IDBObjectStore) => IDBRequest<T>): Promise<T | null> {
  return openDb().then(
    (db) =>
      new Promise<T | null>((resolve) => {
        if (!db) {
          resolve(null)
          return
        }
        try {
          const tx = db.transaction(STORE, mode)
          const req = action(tx.objectStore(STORE))
          req.onsuccess = () => resolve(req.result ?? null)
          req.onerror = () => resolve(null)
        } catch {
          resolve(null)
        }
      }),
  )
}

export function isAssetStoreAvailable(): Promise<boolean> {
  return openDb().then((db) => db !== null)
}

/** false = không ghi được (IDB bị chặn/cháy dung lượng) → caller báo người dùng. */
export async function saveAsset(record: AssetRecord): Promise<boolean> {
  const res = await run('readwrite', (store) => store.put(record) as IDBRequest<IDBValidKey>)
  return res !== null
}

export function readAsset(id: string): Promise<AssetRecord | null> {
  return run<AssetRecord | null>('readonly', (store) => store.get(id) as IDBRequest<AssetRecord | null>)
}

export function removeAsset(id: string): Promise<unknown> {
  return run('readwrite', (store) => store.delete(id) as unknown as IDBRequest<undefined>)
}

interface CacheEntry {
  refs: number
  url: string | null
  promise: Promise<string | null>
}

const urlCache = new Map<string, CacheEntry>()

/** Đọc Blob từ IDB và trả về object URL đã cache. Mỗi lần gọi phải `releaseAssetUrl` tương ứng. */
export function retainAssetUrl(id: string): Promise<string | null> {
  if (isBuiltinSound(id)) return Promise.resolve(resolveBuiltinUrl(id))

  const hit = urlCache.get(id)
  if (hit) {
    hit.refs += 1
    return hit.promise
  }

  const entry: CacheEntry = { refs: 1, url: null, promise: null as unknown as Promise<string | null> }
  entry.promise = readAsset(id)
    .then((record) => {
      if (!record) return null
      const url = URL.createObjectURL(record.blob)
      // Bị release trong lúc đang đọc thì thu hồi ngay, không để URL mồ côi.
      if (urlCache.get(id) !== entry) {
        URL.revokeObjectURL(url)
        return null
      }
      entry.url = url
      return url
    })
    .catch(() => null)
  urlCache.set(id, entry)
  return entry.promise
}

export function releaseAssetUrl(id: string): void {
  if (isBuiltinSound(id)) return
  const entry = urlCache.get(id)
  if (!entry) return
  entry.refs -= 1
  if (entry.refs > 0) return
  if (entry.url) URL.revokeObjectURL(entry.url)
  urlCache.delete(id)
}

export async function dropAsset(id: string): Promise<void> {
  if (isBuiltinSound(id)) return
  releaseAllFor(id)
  await removeAsset(id)
}

function releaseAllFor(id: string): void {
  const entry = urlCache.get(id)
  if (!entry) return
  if (entry.url) URL.revokeObjectURL(entry.url)
  urlCache.delete(id)
}
