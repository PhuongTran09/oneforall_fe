import { useEffect, useMemo, useState } from 'react'
import { t } from '../../../i18n/langStore'
import { readAsset, releaseAssetUrl, retainAssetUrl } from '../utils/assets'
import { isBuiltinSound } from '../utils/builtinSounds'

const NO_URLS: Record<string, string> = {}

/**
 * URL cho một asset. setState chỉ xảy ra trong callback bất đồng bộ; giá trị cũ bị
 * loại bằng cách so id, nên không cần reset state khi id đổi.
 */
export function useAssetUrl(id: string | undefined): string | undefined {
  const [state, setState] = useState<{ id: string; url?: string } | undefined>(undefined)
  useEffect(() => {
    if (!id) return
    let alive = true
    void retainAssetUrl(id).then((url) => {
      if (alive) setState({ id, url: url ?? undefined })
    })
    return () => {
      alive = false
      releaseAssetUrl(id)
    }
  }, [id])
  return id !== undefined && state?.id === id ? state.url : undefined
}

/** URL cho nhiều asset — strip roulette có tới 120 ô nên không dùng hook đơn được. */
export function useAssetUrls(ids: Array<string | undefined>): Record<string, string> {
  const key = useMemo(() => [...new Set(ids.filter((x): x is string => Boolean(x)))].sort().join('|'), [ids])
  const [state, setState] = useState<{ key: string; urls: Record<string, string> }>({ key: '', urls: NO_URLS })

  useEffect(() => {
    if (!key) return
    const list = key.split('|')
    let alive = true
    list.forEach((id) => {
      void retainAssetUrl(id).then((url) => {
        if (!alive || !url) return
        setState((prev) => (prev.key === key ? { key, urls: { ...prev.urls, [id]: url } } : { key, urls: { [id]: url } }))
      })
    })
    return () => {
      alive = false
      list.forEach((id) => releaseAssetUrl(id))
    }
  }, [key])

  return state.key === key ? state.urls : NO_URLS
}

/** Tên tệp gốc của asset, để hiển thị lại sau khi tải trang. */
export function useAssetName(id: string | undefined): string | null {
  const builtin = id !== undefined && isBuiltinSound(id)
  const [state, setState] = useState<{ id: string; name: string | null } | undefined>(undefined)
  useEffect(() => {
    if (!id || builtin) return
    let alive = true
    void readAsset(id).then((record) => {
      if (alive) setState({ id, name: record?.name ?? null })
    })
    return () => {
      alive = false
    }
  }, [builtin, id])
  if (builtin) return t('case.soundBuiltin')
  return id !== undefined && state?.id === id ? state.name : null
}

export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(
    () => typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )
  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = () => setReduced(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])
  return reduced
}
