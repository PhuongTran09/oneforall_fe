import { useCallback, useState } from 'react'
import type { AsyncState } from '../types'
import { t } from '../i18n/langStore'

export function useAsync<T>() {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    isLoading: false,
    error: null,
  })

  const execute = useCallback(async (promise: Promise<T>): Promise<T | null> => {
    setState({ data: null, isLoading: true, error: null })
    try {
      const data = await promise
      setState({ data, isLoading: false, error: null })
      return data
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : t('errors.generic')
      setState({ data: null, isLoading: false, error: errorMsg })
      return null
    }
  }, [])

  return {
    ...state,
    execute,
    reset: useCallback(() => setState({ data: null, isLoading: false, error: null }), []),
  }
}
