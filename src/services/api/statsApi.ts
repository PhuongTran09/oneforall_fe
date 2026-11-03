import { apiClient, resolveUrl } from './client'
import type { PublicStats } from './types'


const FALLBACK_POLL_MS = 60_000
const MAX_STREAM_ERRORS = 3
const STREAM_PATH = '/v1/public/stats/stream'

export const statsApi = {

  async getStats(signal?: AbortSignal): Promise<PublicStats> {
    return apiClient.get<PublicStats>('/v1/public/stats', { signal })
  },


  async beat(sid: string, signal?: AbortSignal): Promise<void> {
    await apiClient.post<void>('/v1/public/heartbeat', { sid }, { signal })
  },
}

export interface LiveStatsHandlers {
  onStats: (stats: PublicStats) => void

  onError: () => void
}




let activeSource: EventSource | null = null

function parseStats(data: string): PublicStats | null {
  try {
    const value: unknown = JSON.parse(data)
    return value && typeof value === 'object' ? (value as PublicStats) : null
  } catch {

    return null
  }
}


export function watchLiveStats(handlers: LiveStatsHandlers): () => void {
  let stopped = false
  let source: EventSource | null = null
  let pollTimer: ReturnType<typeof setInterval> | null = null
  let streamErrors = 0
  let gotStats = false

  const deliver = (stats: PublicStats) => {
    gotStats = true
    handlers.onStats(stats)
  }

  const stopStream = () => {
    if (source === null) return
    source.close()
    if (activeSource === source) activeSource = null
    source = null
  }

  const stopPoll = () => {
    if (pollTimer === null) return
    clearInterval(pollTimer)
    pollTimer = null
  }

  const pollOnce = async () => {
    if (stopped || document.hidden) return
    try {
      deliver(await statsApi.getStats())
    } catch {
      if (!gotStats) handlers.onError()
    }
  }

  const startPolling = () => {
    if (pollTimer !== null) return
    void pollOnce()
    pollTimer = setInterval(() => {



      if (source === null) startStream()
      void pollOnce()
    }, FALLBACK_POLL_MS)
  }

  const startStream = () => {

    if (stopped || source !== null || document.hidden) return


    activeSource?.close()
    const es = new EventSource(resolveUrl(STREAM_PATH))
    activeSource = es
    source = es



    es.onopen = () => stopPoll()

    es.addEventListener('stats', (event) => {
      streamErrors = 0

      stopPoll()
      const stats = parseStats((event as MessageEvent<string>).data)
      if (stats) deliver(stats)
    })

    es.onerror = () => {



      if (es.readyState === EventSource.CLOSED) {

        if (source === es) source = null
        startPolling()
        return
      }
      streamErrors += 1
      if (streamErrors >= MAX_STREAM_ERRORS) startPolling()
    }
  }

  const onVisibility = () => {
    if (document.hidden) {
      stopStream()
      stopPoll()
      return
    }

    void pollOnce()
    startStream()
  }

  startStream()
  document.addEventListener('visibilitychange', onVisibility)

  return () => {
    stopped = true
    stopStream()
    stopPoll()
    document.removeEventListener('visibilitychange', onVisibility)
  }
}
