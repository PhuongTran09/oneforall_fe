import { useState, type ChangeEvent } from 'react'
import { CloudUpload, Image as ImageIcon, CheckCircle2, ArrowRight } from 'lucide-react'
import { Button } from '../../../components/common/Button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../../components/common/Card'
import { imageApi } from '../services/imageApi'
import { describeError, humanSize } from '../../../utils/apiError'
import { useEntitlements } from '../../../services/entitlementsStore'
import { showErrorPopup } from '../../../components/feedback/errorPopupStore'
import { t } from '../../../i18n/langStore'
import type { ImageProcessTask } from '../types/image.types'

export function ImageWorkspace() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [task, setTask] = useState<ImageProcessTask | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null)

  // Trần ảnh hiển thị ở hint lấy từ PLAN_POLICIES qua /users/me — BE không expose caps cho
  // ẩn danh nên không có số thì im lặng, thay vì hardcode "10MB Free" sẽ nói dối user Pro.
  const imageCap = useEntitlements().me?.plan_policy?.max_upload_bytes.image
  const imageHint =
    imageCap === undefined
      ? t('ws.imageDropzoneHint')
      : `${t('ws.imageDropzoneHint')} ${t('ws.imageDropzoneCap', { max: humanSize(imageCap) })}`

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
      const res = await imageApi.optimizeImage(selectedFile, { quality: 80, format: 'webp' })
      setTask(res)
      setMessage({ text: t('ws.imageSuccess'), isError: false })
    } catch (err) {
      const { message } = describeError(err, t('ws.imageFailed'))
      setMessage({ text: message, isError: true })
      showErrorPopup({ message })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="page-container relative">
      <div className="hero-ambient-glow" aria-hidden="true" />
      <Card className="p-6 sm:p-8 card-hover-glow relative z-10">
        <CardHeader className="p-0 pb-6 border-b border-edge">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-brand/10 border border-[rgba(255,59,48,0.30)] flex items-center justify-center text-brand clip-corner-btn shadow-[0_0_12px_rgba(255,59,48,0.2)]">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-2xl">{t('ws.imageTitle')}</CardTitle>
              <span className="text-xs font-mono text-brand">Image Processing Engine</span>
            </div>
          </div>
          <CardDescription>
            {t('ws.imageDesc')}
          </CardDescription>
        </CardHeader>

        <CardContent className="p-0 pt-6 space-y-6">
          <label
            htmlFor="image-file-input"
            className="flex flex-col items-center justify-center border-2 border-dashed border-[rgba(255,59,48,0.30)] hover:border-[rgba(255,59,48,0.70)] p-8 sm:p-12 text-center cursor-pointer bg-page hover:bg-brand/5 transition-all group clip-corner-lg input-3d card-hover-glow"
          >
            <input
              id="image-file-input"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            <div className="w-14 h-14 bg-brand/10 border border-[rgba(255,59,48,0.25)] flex items-center justify-center text-brand animate-float-gentle group-hover:scale-110 group-hover:border-brand/60 group-hover:shadow-[0_0_16px_rgba(255,59,48,0.3)] transition-all mb-3 clip-corner-card">
              <CloudUpload className="w-7 h-7" />
            </div>
            {selectedFile ? (
              <div className="space-y-1">
                <p className="text-sm font-semibold text-ink">{selectedFile.name}</p>
                <p className="text-xs text-slate-400">
                  {t('uploader.fileSize')}: {(selectedFile.size / 1024).toFixed(1)} KB
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                <p className="text-sm font-medium text-slate-100">
                  {t('ws.imageDropzoneTitle')}
                </p>
                <p className="text-xs text-slate-400">{imageHint}</p>
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
              className="btn-shimmer shadow-[0_0_16px_rgba(255,59,48,0.3)]"
            >
              {t('ws.imageStart')}
            </Button>
          </div>

          {message && (
            <div
              className={`p-4 text-sm border flex items-center gap-3 clip-corner-card ${
                message.isError
                  ? 'bg-brand/10 border-brand/30 text-rose-300'
                  : 'bg-emerald-500/10 border-emerald-600/30 text-emerald-300'
              }`}
            >
              {!message.isError && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
              <span>{message.text}</span>
            </div>
          )}

          {task && (
            <div className="p-4 bg-page border border-edge space-y-2 clip-corner-card">
              <h4 className="text-sm font-semibold text-slate-100">{t('ws.imageResult')}:</h4>
              <p className="text-xs text-slate-400">
                {t('ws.status')}: <strong className="text-emerald-400">{task.status}</strong>
              </p>
              {task.outputUrl && (
                <a
                  href={task.outputUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-semibold text-brand hover:text-brand-2 underline"
                >
                  {t('ws.imageDownload')}
                </a>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
