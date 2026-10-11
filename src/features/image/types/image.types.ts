export interface ImageProcessTask {
  id: string
  fileName: string
  fileSize: number
  format: 'png' | 'jpeg' | 'webp' | 'avif'
  status: 'idle' | 'processing' | 'completed' | 'failed'
  outputUrl?: string
  error?: string
}

export interface ImageOptimizationOptions {
  quality?: number
  maxWidth?: number
  maxHeight?: number
  format?: 'png' | 'jpeg' | 'webp' | 'avif'
}
