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



export type ErrorParams = Record<string, string | number>

export interface JobPublicResponse {
  id: string
  type: string
  status: JobStatus
  progress: number
  error: string | null
  error_code?: string | null
  error_params?: ErrorParams | null
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


export interface JobHistoryItem {
  id: string
  type: string
  status: JobStatus
  progress: number
  filename: string | null
  file_size: number | null
  error: string | null
  error_code?: string | null
  error_params?: ErrorParams | null
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




export interface PublicStats {

  active_visitors: number | null

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

  plan?: string | null

  plan_policy?: PlanPolicy | null
  created_at: string
  updated_at: string
}


export interface CreatePaymentRequest {
  plan_id: string

  return_url: string
  cancel_url: string
  error_url?: string
}

export interface CreatePaymentResponse {
  payment_id: string
  order_code: number
  checkout_url?: string | null

  checkout_fields: Record<string, string>
}


export type PaymentStatus = 'pending' | 'paid' | 'cancelled' | 'expired'

export interface PaymentHistoryItem {
  id: string
  order_code: number
  plan_id: string
  amount_vnd: number
  currency: string
  status: PaymentStatus
  created_at: string
  paid_at: string | null
}

export interface PaymentHistoryResponse {
  payments: PaymentHistoryItem[]
}

export interface RequestOptions extends Omit<RequestInit, 'body'> {
  params?: Record<string, string | number | boolean | undefined | null>

  captcha?: 'proactive'

  timeoutMs?: number
}

export interface ApiErrorDetail {
  loc?: (string | number)[]
  msg: string
  type?: string
}


export interface FastApiErrorResponse {
  detail?: string | ApiErrorDetail[] | Record<string, unknown>
  message?: string
  code?: string
  params?: ErrorParams
  max_request_bytes?: number
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
