import { useState, type ChangeEvent } from 'react'
import { UploadCloud, Video as VideoIcon, CheckCircle2, ArrowRight } from 'lucide-react'
import { Button } from '../../../components/common/Button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../../components/common/Card'
import { videoApi } from '../services/videoApi'
import { describeError } from '../../../utils/apiError'
import { showToast } from '../../../components/feedback/toastStore'
import { t } from '../../../i18n/langStore'
import type { VideoTask } from '../types/video.types'

export function VideoWorkspace() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [task, setTask] = useState<VideoTask | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null)

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
      setMessage(null)
    }
  }

  const handleProcess = async () => {
    if (!selectedFile) return
    setIsLoading(true)
    setMessage(null)
    try {
      const res = await videoApi.transcodeVideo(selectedFile, { resolution: '1080p', codec: 'h264' })
      setTask(res)
      setMessage({ text: t('ws.videoSuccess'), isError: false })
    } catch (err) {
      const { type, message } = describeError(err, t('ws.videoFailed'))
      setMessage({ text: message, isError: true })
      showToast({ type, message })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="page-container">
      <Card className="p-6 sm:p-8">
        <CardHeader className="p-0 pb-6 border-b border-edge">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-[#ff3b30]/10 border border-[rgba(255,59,48,0.30)] flex items-center justify-center text-[#FF6B4A] clip-corner-btn">
              <VideoIcon className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-2xl">{t('ws.videoTitle')}</CardTitle>
              <span className="text-xs font-mono text-[#FF6B4A]">Video Transcoding Engine</span>
            </div>
          </div>
          <CardDescription>
            {t('ws.videoDesc')}
          </CardDescription>
        </CardHeader>

        <CardContent className="p-0 pt-6 space-y-6">
          <label
            htmlFor="video-file-input"
            className="flex flex-col items-center justify-center border-2 border-dashed border-[rgba(255,59,48,0.30)] hover:border-[rgba(255,59,48,0.60)] p-8 sm:p-12 text-center cursor-pointer bg-page hover:bg-[#ff3b30]/5 transition-all group clip-corner-lg input-3d"
          >
            <input
              id="video-file-input"
              type="file"
              accept="video/*"
              className="hidden"
              onChange={handleFileChange}
            />
            <div className="w-14 h-14 bg-[#ff3b30]/10 border border-[rgba(255,59,48,0.25)] flex items-center justify-center text-[#FF6B4A] group-hover:scale-110 transition-transform mb-3 clip-corner-card">
              <UploadCloud className="w-7 h-7" />
            </div>
            {selectedFile ? (
              <div className="space-y-1">
                <p className="text-sm font-semibold text-ink">{selectedFile.name}</p>
                <p className="text-xs text-slate-400">
                  {t('uploader.fileSize')}: {(selectedFile.size / (1024 * 1024)).toFixed(1)} MB
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                <p className="text-sm font-medium text-slate-100">
                  {t('ws.videoDropzoneTitle')}
                </p>
                <p className="text-xs text-slate-400">{t('ws.videoDropzoneHint')}</p>
              </div>
            )}
          </label>

          <div className="flex justify-end">
            <Button
              variant="glow"
              size="md"
              disabled={!selectedFile || isLoading}
              isLoading={isLoading}
              onClick={handleProcess}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              {t('ws.videoStart')}
            </Button>
          </div>

          {message && (
            <div
              className={`p-4 text-sm border flex items-center gap-3 clip-corner-card ${
                message.isError
                  ? 'bg-[#ff3b30]/10 border-[#ff3b30]/30 text-rose-300'
                  : 'bg-emerald-500/10 border-emerald-600/30 text-emerald-300'
              }`}
            >
              {!message.isError && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
              <span>{message.text}</span>
            </div>
          )}

          {task && (
            <div className="p-4 bg-page border border-edge space-y-2 clip-corner-card">
              <h4 className="text-sm font-semibold text-slate-100">{t('ws.videoTaskInfo')}:</h4>
              <p className="text-xs text-slate-400">
                {t('ws.status')}: <strong className="text-emerald-400">{task.status}</strong>
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
