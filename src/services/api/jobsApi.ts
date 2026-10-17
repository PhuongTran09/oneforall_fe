import { apiClient, resolveUrl } from './client'
import { ApiClientError, type JobHistoryPage, type JobPublicResponse, type JobStats, type JobStatus } from './types'
import { getAccessToken } from '../authStore'
import { t } from '../../i18n/langStore'

// Trạng thái mà backend thực sự trả về (JobStatus trong oneforall_be/app/models/job.py):
// queued | processing | completed | failed | cancelled | expired.
const TERMINAL_STATUSES: readonly JobStatus[] = ['completed', 'failed', 'cancelled', 'expired']

const FAST_POLL_MS = 500
const SLOW_POLL_MS = 1000
const MAX_WAIT_MS = 180_000 // khớp thời hạn 3 phút của kết quả job phía backend
const MAX_CONSECUTIVE_ERRORS = 3
const RETRY_BACKOFF_MS = 1000
const RETRY_BACKOFF_CAP_MS = 5000
// Dịch tại throw-site để ăn theo ngôn ngữ hiện tại (const module-level sẽ bị "đóng băng")
const timeoutMessage = () => t('errors.jobTimeout')

// Backend gửi `event: ping` mỗi JOB_EVENT_HEARTBEAT_S (15s). Im lặng gấp ba nhịp nghĩa là
// không còn ai viết vào stream nữa — cắt và quay về polling, còn hơn treo tới hết 180s.
const SERVER_HEARTBEAT_MS = 15_000
const STREAM_SILENCE_MS = SERVER_HEARTBEAT_MS * 3

export interface PollJobOptions {
  signal?: AbortSignal
  onJob?: (job: JobPublicResponse) => void
  timeoutMs?: number
}

/** Hủy vòng polling là bình thường (unmount, đổi job, poll lại cùng job) — không phải lỗi. */
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
  // progress 99 do worker ghi ngay trước khi đẩy kết quả lên storage: giai đoạn cuối
  // ngắn nhất nên cần lấy mẫu dày, còn encode thì 1s một lần là đủ mượt.
  if (job.status === 'processing' && job.progress >= 99) return FAST_POLL_MS
  if (job.status === 'processing') return SLOW_POLL_MS
  return FAST_POLL_MS
}

function retryDelayFor(consecutiveErrors: number): number {
  return Math.min(RETRY_BACKOFF_MS * 2 ** (consecutiveErrors - 1), RETRY_BACKOFF_CAP_MS)
}

// 404/401/403 là thất bại vĩnh viễn; các lỗi còn lại (mạng, 5xx, 408/429) là tạm thời.
function isRetryableError(error: unknown): boolean {
  if (error instanceof ApiClientError) {
    return error.status >= 500 || error.status === 429 || error.status === 408
  }
  return true
}

function stateKey(job: JobPublicResponse): string {
  return `${job.status}|${job.progress}|${job.error ?? ''}|${job.expires_at ?? ''}`
}

// Một luồng theo dõi duy nhất cho mỗi jobId — stream hay poll đều ghi vào đây, nên loop
// cũ bị hủy khi cùng job được theo dõi lại. Tách hai map riêng là bug: một poll cũ và một
// stream mới sẽ cùng theo dõi một job.
const activeTrackers = new Map<string, AbortController>()

export interface SseFrame {
  event: string
  data: string
}

/**
 * Tách các frame đã nguyên vẹn khỏi buffer, trả phần còn lại để nối tiếp chunk sau.
 * Server luôn đóng frame bằng `\n\n` (xem format_event_frame ở backend); `id:`/`retry:`
 * và dòng comment bị bỏ qua vì client này không tự reconnect.
 */
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

/**
 * Mở một stream SSE bằng fetch trực tiếp, không qua apiClient: timeout 30s nội bộ của
 * apiClient sẽ giết stream giữa chừng. Resolve khi server tự đóng, ném khi mạng hỏng,
 * response không ok, hoặc im lặng quá STREAM_SILENCE_MS.
 */
async function openJobEventStream(
  jobId: string,
  options: { signal?: AbortSignal; onFrame: (frame: SseFrame) => void },
): Promise<void> {
  const url = resolveUrl(`/v1/jobs/${jobId}/events`)

  // Controller riêng: watchdog im lặng được phép giết fetch mà không giết cả luồng theo
  // dõi (trackJob còn cần chuyển sang polling sau đó).
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
      // 'include' để khách ẩn danh gửi cookie phiên qua JobAuthDep; không đưa token vào URL.
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
    // { stream: true } là bắt buộc: payload tiếng Việt nhiều byte và một chunk có thể
    // cắt giữa codepoint, thiếu cờ đó thì error thành U+FFFD ngay trên UI.
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
  /**
   * Trang lịch sử job của user đang đăng nhập (Bearer tự gắn qua apiClient).
   * Lọc theo token ở backend — frontend không gửi user_id (§7).
   */
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

  /** Hủy job qua Bearer hoặc cookie phiên ẩn danh, không đưa credential vào URL. */
  async cancelJob(jobId: string): Promise<void> {
    await apiClient.post(`/v1/jobs/${jobId}/cancel`)
  },

  /**
   * Lấy trạng thái Job hiện tại từ FastAPI backend
   */
  async getJobStatus(jobId: string, signal?: AbortSignal): Promise<JobPublicResponse> {
    return apiClient.get<JobPublicResponse>(`/v1/jobs/${jobId}`, { signal })
  },

  /**
   * Theo dõi job bằng setTimeout đệ quy (không chồng request), chỉ báo về UI khi trạng
   * thái đổi, retry có kiểm soát, dừng ngay khi job chạm trạng thái cuối.
   */
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

      // Request đầu tiên ngay lập tức: job vừa tạo xong không phải chờ một nhịp polling.
      timer = setTimeout(() => void tick(), 0)
    })
  },

  /**
   * Theo dõi job qua stream SSE trước, polling làm đường lùi.
   *
   * Một job chỉ còn MỘT request `.../events` thay vì hàng trăm request `jobs/{id}`; server
   * đẩy trạng thái mỗi lần worker ghi DB nên thanh tiến độ đổi ngay, không chờ tới nhịp
   * lấy mẫu kế tiếp. Mọi thất bại của stream — mạng đứt, 503 khi backend tắt flag,
   * Redis chết (`stream-end/transport`), im lặng quá watchdog, frame hỏng — đều rơi về
   * `pollJob` với đúng phần thời gian còn lại của deadline chung, và stream KHÔNG BAO GIỜ
   * được mở lại: auto-reconnect đứng cạnh `--reload` hoặc một cái chớp của CDN sẽ sinh ra
   * đúng cái bão request mà tính năng này xóa bỏ.
   */
  trackJob(jobId: string, options: PollJobOptions = {}): Promise<JobPublicResponse> {
    activeTrackers.get(jobId)?.abort()

    const controller = new AbortController()
    activeTrackers.set(jobId, controller)

    const relayAbort = () => controller.abort()
    options.signal?.addEventListener('abort', relayAbort)

    // Một đồng hồ duy nhất tính ra ngoài cả hai pha: nếu stream và poll mỗi bên có hạn
    // riêng thì một stream im lặng cho phép tổng thời gian chờ vượt quá MAX_WAIT_MS.
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
        // Khi đã chuyển sang pollJob thì map thuộc về controller của pollJob, không xóa nhầm.
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
          // terminal: backend đã phát trạng thái cuối, không cần đọc DB thêm lần nào nữa.
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
          // Caller hủy (unmount, đổi job) hoặc một tracker mới đã tiếp quản job này.
          settle(() => reject(new JobPollCancelled()))
          return
        }

        let polled: JobPublicResponse
        try {
          // pollJob đọc ngay ở tick đầu tiên, nên đó chính là lần đọc dự phòng — không cần
          // gọi getJobStatus() trước rồi mới poll.
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
