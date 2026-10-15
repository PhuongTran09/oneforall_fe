export type JobStatus =
  | 'queued'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'expired'

export interface JobAccepted {
  job_id: string
  status: JobStatus
  download_token?: string | null
}

export interface JobPublicResponse {
  id: string
  type: string
  status: JobStatus
  progress: number
  error: string | null
  created_at: string
  started_at: string | null
  completed_at: string | null
  expires_at: string | null
}

export interface PresignedUrlResponse {
  key?: string
  url?: string
  method?: 'GET' | 'PUT'
  expires_in?: number
}

// Lịch sử xử lý — khớp schemas/job.py::JobHistoryItem (KHÔNG có output_key/input_key).
export interface JobHistoryItem {
  id: string
  type: string
  status: JobStatus
  progress: number
  filename: string | null
  file_size: number | null
  error: string | null
  created_at: string
  started_at: string | null
  completed_at: string | null
  expires_at: string | null
  downloadable: boolean
}

export interface JobHistoryPage {
  items: JobHistoryItem[]
  total: number
  page: number
  page_size: number
  total_pages: number
}

export interface JobStats {
  total_completed: number
  files_available: number
}

// Khớp oneforall_be/app/schemas/stats.py — khu live stats công khai ở trang chủ.
// Mỗi số là number | null: null = backend KHÔNG đo được (Redis/DB lỗi), 0 = đo được
// và đúng bằng 0. UI phải phân biệt hai loại, cấm hiện số mẫu.
export interface PublicStats {
  /** Số sid heartbeat còn trong cửa sổ 5 phút gần nhất. */
  active_visitors: number | null
  /** Tổng số job đã xử lý thành công từ trước tới nay. */
  completed_jobs: number | null
}

export interface PlanPolicy {
  max_active_jobs: number
  max_upload_bytes: Record<string, number>
  result_ttl_minutes: number
  ads: boolean
  priority: boolean
}

export interface UserMe {
  id: string
  email: string | null
  username: string
  full_name: string | null
  is_active: boolean
  is_superuser: boolean
  /** Gói dịch vụ — backend chưa trả thì FE fallback user_metadata rồi 'free'. */
  plan?: string | null
  /** Giới hạn gói do BE (PLAN_POLICIES) sinh ra — nguồn duy nhất, không hardcode. */
  plan_policy?: PlanPolicy | null
  created_at: string
  updated_at: string
}

export interface RequestOptions extends Omit<RequestInit, 'body'> {
  params?: Record<string, string | number | boolean | undefined | null>
}

export interface ApiErrorDetail {
  loc?: (string | number)[]
  msg: string
  type?: string
}

export interface FastApiErrorResponse {
  detail?: string | ApiErrorDetail[]
  message?: string
}

export class ApiClientError extends Error {
  public readonly status: number
  public readonly statusText: string
  public readonly details?: unknown

  constructor(status: number, statusText: string, message: string, details?: unknown) {
    super(message)
    this.name = 'ApiClientError'
    this.status = status
    this.statusText = statusText
    this.details = details
  }
}
