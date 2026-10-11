export type SupportedFormat =
  | 'pdf'
  | 'docx'
  | 'xlsx'
  | 'csv'
  | 'json'
  | 'mp3'
  | 'wav'
  | 'mp4'
  | 'webp'

export interface ConvertTask {
  id: string
  fileName: string
  sourceFormat: string
  targetFormat: SupportedFormat
  status: 'queued' | 'converting' | 'done' | 'failed'
  resultUrl?: string
  error?: string
}

export interface ConvertOptions {
  targetFormat: SupportedFormat
  qualityPreset?: 'standard' | 'high'
}
