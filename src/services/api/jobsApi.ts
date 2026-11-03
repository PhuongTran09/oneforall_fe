import { apiClient, resolveUrl } from './client'
import { ApiClientError, type JobHistoryPage, type JobPublicResponse, type JobStats, type JobStatus } from './types'
import { getAccessToken } from '../authStore'
import { t } from '../../i18n/langStore'



const TERMINAL_STATUSES: readonly JobStatus[] = ['completed', 'failed', 'cancelled', 'expired']

const FAST_POLL_MS = 500
const SLOW_POLL_MS = 1000
const MAX_WAIT_MS = 180_000
const MAX_CONSECUTIVE_ERRORS = 3
const RETRY_BACKOFF_MS = 1000
const RETRY_BACKOFF_CAP_MS = 5000

const timeoutMessage = () => t('errors.jobTimeout')



const SERVER_HEARTBEAT_MS = 15_000
const STREAM_SILENCE_MS = SERVER_HEARTBEAT_MS * 3

export interface PollJobOptions {
  signal?: AbortSignal
  onJob?: (job: JobPublicResponse) => void
  timeoutMs?: number
}


export class JobPollCancelled extends Error {
  constructor() {
    super('Job polling cancelled')
    this.name = 'JobPollCancelled'
  }
}

function isTerminalJob(status: JobStatus): boolean {
  return TERMINAL_STATUSES.includes(status)
}

function pollDelayFor(job: JobPublicResponse): number {


  if (job.status === 'processing' && job.progress >= 99) return FAST_POLL_MS
  if (job.status === 'processing') return SLOW_POLL_MS
  return FAST_POLL_MS
}

function retryDelayFor(consecutiveErrors: number): number {
  return Math.min(RETRY_BACKOFF_MS * 2 ** (consecutiveErrors - 1), RETRY_BACKOFF_CAP_MS)
}


function isRetryableError(error: unknown): boolean {
  if (error instanceof ApiClientError) {
    return error.status >= 500 || error.status === 429 || error.status === 408
  }
  return true
}

function stateKey(job: JobPublicResponse): string {


  return `${job.status}|${job.progress}|${job.error ?? ''}|${job.error_code ?? ''}|${job.expires_at ?? ''}`
}

const activeTrackers = new Map<string, AbortController>()

export interface SseFrame {
  event: string
  data: string
}

export function parseSseFrames(buffer: string): { frames: SseFrame[]; rest: string } {
  const frames: SseFrame[] = []
  let rest = buffer
  let index = rest.indexOf('\n\n')

  while (index !== -1) {
    const rawFrame = rest.slice(0, index)
    rest = rest.slice(index + 2)

    let event = 'message'
    const dataLines: string[] = []
    for (const line of rawFrame.split('\n')) {
      if (line.startsWith(':')) continue
      if (line.startsWith('event:')) {
        event = line.slice('event:'.length).trim()
      } else if (line.startsWith('data:')) {
        dataLines.push(line.slice('data:'.length).replace(/^ /, ''))
      }
    }

    if (dataLines.length > 0) {
      frames.push({ event, data: dataLines.join('\n') })
    }
    index = rest.indexOf('\n\n')
  }

  return { frames, rest }
}

async function openJobEventStream(
  jobId: string,
  options: { signal?: AbortSignal; onFrame: (frame: SseFrame) => void },
): Promise<void> {
  const url = resolveUrl(`/v1/jobs/${jobId}/events`)

  const fetchController = new AbortController()
  const relayAbort = () => fetchController.abort()
  options.signal?.addEventListener('abort', relayAbort, { once: true })

  let silenceTimer: ReturnType<typeof setTimeout> | undefined
  const armSilenceWatchdog = () => {
    if (silenceTimer !== undefined) clearTimeout(silenceTimer)
    silenceTimer = setTimeout(() => fetchController.abort(), STREAM_SILENCE_MS)
  }

  try {
    const accessToken = getAccessToken()
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'text/event-stream',
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      credentials: 'include',
      cache: 'no-store',
      signal: fetchController.signal,
    })

    if (!response.ok) {
      throw new ApiClientError(response.status, response.statusText, 'Job event stream unavailable')
    }
    if (!response.body) {
      throw new Error('Job event stream has no body')
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder('utf-8')
    let buffer = ''

    armSilenceWatchdog()
    for (;;) {
      const { done, value } = await reader.read()
      if (done) break
      armSilenceWatchdog()
      buffer += decoder.decode(value, { stream: true })
      const parsed = parseSseFrames(buffer)
      buffer = parsed.rest
      for (const frame of parsed.frames) {
        options.onFrame(frame)
      }
    }
    decoder.decode()
  } finally {
    if (silenceTimer !== undefined) clearTimeout(silenceTimer)
    options.signal?.removeEventListener('abort', relayAbort)
  }
}

export const jobsApi = {
  async listJobs(
    params: { status?: string; type?: string; q?: string; page?: number; page_size?: number } = {},
    signal?: AbortSignal,
  ): Promise<JobHistoryPage> {
    return apiClient.get<JobHistoryPage>('/v1/jobs', { params, signal })
  },

  async getStats(signal?: AbortSignal): Promise<JobStats> {
    return apiClient.get<JobStats>('/v1/jobs/stats', { signal })
  },

  async deleteJob(jobId: string): Promise<void> {
    await apiClient.delete<void>(`/v1/jobs/${jobId}`)
  },

  async cancelJob(jobId: string): Promise<void> {
    await apiClient.post(`/v1/jobs/${jobId}/cancel`)
  },

  async getJobStatus(jobId: string, signal?: AbortSignal): Promise<JobPublicResponse> {
    return apiClient.get<JobPublicResponse>(`/v1/jobs/${jobId}`, { signal })
  },

  pollJob(jobId: string, options: PollJobOptions = {}): Promise<JobPublicResponse> {
    activeTrackers.get(jobId)?.abort()

    const controller = new AbortController()
    activeTrackers.set(jobId, controller)

    const relayAbort = () => controller.abort()
    options.signal?.addEventListener('abort', relayAbort)
    const deadline = Date.now() + (options.timeoutMs ?? MAX_WAIT_MS)

    return new Promise<JobPublicResponse>((resolve, reject) => {
      let timer: ReturnType<typeof setTimeout> | undefined
      let consecutiveErrors = 0
      let lastStateKey: string | null = null

      const settle = (outcome: () => void) => {
        if (timer !== undefined) clearTimeout(timer)
        options.signal?.removeEventListener('abort', relayAbort)
        if (activeTrackers.get(jobId) === controller) {
          activeTrackers.delete(jobId)
        }
        outcome()
      }

      const tick = async (): Promise<void> => {
        if (controller.signal.aborted) {
          settle(() => reject(new JobPollCancelled()))
          return
        }

        let job: JobPublicResponse
        try {
          job = await jobsApi.getJobStatus(jobId, controller.signal)
          consecutiveErrors = 0
        } catch (error) {
          if (controller.signal.aborted) {
            settle(() => reject(new JobPollCancelled()))
            return
          }
          if (!isRetryableError(error) || consecutiveErrors >= MAX_CONSECUTIVE_ERRORS) {
            settle(() => reject(error))
            return
          }
          consecutiveErrors += 1
          if (Date.now() >= deadline) {
            settle(() => reject(new Error(timeoutMessage())))
            return
          }
          timer = setTimeout(() => void tick(), retryDelayFor(consecutiveErrors))
          return
        }

        if (isTerminalJob(job.status)) {
          options.onJob?.(job)
          settle(() => resolve(job))
          return
        }

        const key = stateKey(job)
        if (key !== lastStateKey) {
          lastStateKey = key
          options.onJob?.(job)
        }

        if (Date.now() >= deadline) {
          settle(() => reject(new Error(timeoutMessage())))
          return
        }
        timer = setTimeout(() => void tick(), pollDelayFor(job))
      }

      if (options.signal?.aborted) {
        settle(() => reject(new JobPollCancelled()))
        return
      }

      timer = setTimeout(() => void tick(), 0)
    })
  },

  trackJob(jobId: string, options: PollJobOptions = {}): Promise<JobPublicResponse> {
    activeTrackers.get(jobId)?.abort()

    const controller = new AbortController()
    activeTrackers.set(jobId, controller)

    const relayAbort = () => controller.abort()
    options.signal?.addEventListener('abort', relayAbort)

    const deadline = Date.now() + (options.timeoutMs ?? MAX_WAIT_MS)

    return new Promise<JobPublicResponse>((resolve, reject) => {
      let lastStateKey: string | null = null
      let lastJob: JobPublicResponse | null = null
      let terminalJob: JobPublicResponse | null = null
      let timedOut = false

      const deadlineTimer = setTimeout(() => {
        timedOut = true
        controller.abort()
      }, Math.max(0, deadline - Date.now()))

      const settle = (outcome: () => void) => {
        clearTimeout(deadlineTimer)
        options.signal?.removeEventListener('abort', relayAbort)
        if (activeTrackers.get(jobId) === controller) {
          activeTrackers.delete(jobId)
        }
        outcome()
      }

      const onFrame = (frame: SseFrame): void => {
        if (frame.event === 'ping') return

        let payload: unknown
        try {
          payload = JSON.parse(frame.data) as unknown
        } catch {
          throw new Error('Malformed job event frame')
        }

        if (frame.event === 'job') {
          const job = payload as JobPublicResponse
          lastJob = job
          const key = stateKey(job)
          if (key !== lastStateKey) {
            lastStateKey = key
            options.onJob?.(job)
          }
          return
        }

        if (frame.event === 'stream-end') {
          const reason = (payload as { reason?: string }).reason
          if (reason === 'terminal' && lastJob) terminalJob = lastJob
        }
      }

      void (async () => {
        try {
          await openJobEventStream(jobId, {
            signal: controller.signal,
            onFrame,
          })
        } catch {
          // Không phân biệt loại lỗi: stream là tối ưu, không phải điều kiện chạy.
        }

        const finished = terminalJob
        if (finished) {
          settle(() => resolve(finished))
          return
        }
        if (timedOut) {
          settle(() => reject(new Error(timeoutMessage())))
          return
        }
        if (controller.signal.aborted) {
          settle(() => reject(new JobPollCancelled()))
          return
        }

        let polled: JobPublicResponse
        try {
          polled = await jobsApi.pollJob(jobId, {
            signal: options.signal,
            onJob: options.onJob,
            timeoutMs: Math.max(0, deadline - Date.now()),
          })
        } catch (error) {
          settle(() => reject(error))
          return
        }
        settle(() => resolve(polled))
      })()
    })
  },
}
