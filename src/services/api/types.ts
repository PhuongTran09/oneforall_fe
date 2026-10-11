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
  download_url?: string
  key?: string
  expires_in?: number
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
