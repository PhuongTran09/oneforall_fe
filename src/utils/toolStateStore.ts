import type { JobPublicResponse } from '../services'
import type { ParamValues } from '../config/conversionParams'

export interface ToolFormState {
  file: File
  format: string
  params: ParamValues
}

export interface ToolSnapshot {
  form: ToolFormState | null
  job: JobPublicResponse | null
  /** Job đang chạy khi người dùng rời trang — quay lại thì theo dõi tiếp, không gửi lại file. */
  pending: { jobId: string; downloadToken?: string | null } | null
  downloadUrl: string | null
  fileName: string
  format: string
  previewUrl: string | null
  errorMessage: string | null
  faqIndex: number | null
}

const snapshots = new Map<string, Partial<ToolSnapshot>>()

export function getToolSnapshot(slug: string): Partial<ToolSnapshot> | undefined {
  return snapshots.get(slug)
}

export function updateToolSnapshot(slug: string, patch: Partial<ToolSnapshot>): void {
  snapshots.set(slug, { ...snapshots.get(slug), ...patch })
}

export function clearToolSnapshot(slug: string): void {
  snapshots.delete(slug)
}

/** Job bị xóa ở nơi khác (trang Lịch sử) → gỡ nó khỏi snapshot của mọi tool đang giữ, */
export function forgetJobInToolSnapshots(jobId: string): void {
  for (const [slug, snap] of snapshots) {
    if (snap.job?.id !== jobId && snap.pending?.jobId !== jobId) continue
    if (snap.previewUrl?.startsWith('blob:')) URL.revokeObjectURL(snap.previewUrl)
    snapshots.set(slug, { form: snap.form, faqIndex: snap.faqIndex })
  }
}

export function isJobExpired(job: JobPublicResponse | null | undefined): boolean {
  return !!job?.expires_at && Date.parse(job.expires_at) <= Date.now()
}
