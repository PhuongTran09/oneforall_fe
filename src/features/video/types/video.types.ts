export interface VideoTask {
  id: string
  fileName: string
  fileSize: number
  resolution: string
  status: 'pending' | 'processing' | 'ready' | 'error'
  downloadUrl?: string
  progress?: number
}

export interface VideoTranscodeOptions {
  resolution?: '720p' | '1080p' | 'original'
  codec?: 'h264' | 'hevc' | 'vp9'
  crf?: number
}
