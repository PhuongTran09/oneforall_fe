import { useState, type ChangeEvent } from 'react'
import { UploadCloud, FileType, CheckCircle2, ArrowRight } from 'lucide-react'
import { Button } from '../../../components/common/Button'
import { SegmentedControl } from '../../../components/common/SegmentedControl'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../../components/common/Card'
import { convertApi } from '../services/convertApi'
import { describeError } from '../../../utils/apiError'
import { showErrorPopup } from '../../../components/feedback/errorPopupStore'
import { t } from '../../../i18n/langStore'
import type { ConvertTask, SupportedFormat } from '../types/convert.types'

const AVAILABLE_FORMATS: SupportedFormat[] = [
  'pdf',
  'docx',
  'xlsx',
  'csv',
  'json',
  'mp3',
  'mp4',
  'webp',
]

export function ConvertWorkspace() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [targetFormat, setTargetFormat] = useState<SupportedFormat>('pdf')
  const [task, setTask] = useState<ConvertTask | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null)

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
      setMessage(null)
    }
  }

  const handleConvert = async () => {
    if (!selectedFile) return
    setIsLoading(true)
    setMessage(null)
    try {
      const res = await convertApi.convertFile(selectedFile, { targetFormat })
      setTask(res)
      setMessage({
        text: t('ws.convertSent', { format: targetFormat.toUpperCase() }),
        isError: false,
      })
    } catch (err) {
      const { message } = describeError(err, t('toolsPage.convertFailed'))
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
            <div className="w-10 h-10 bg-brand/10 border border-[rgba(255,59,48,0.30)] flex items-center justify-center text-brand-2 clip-corner-btn shadow-[0_0_12px_rgba(255,59,48,0.2)]">
              <FileType className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-2xl">{t('ws.convertTitle')}</CardTitle>
              <span className="text-xs font-mono text-brand-2">Universal File Converter</span>
            </div>
          </div>
          <CardDescription>
            {t('ws.convertDesc')}
          </CardDescription>
        </CardHeader>

        <CardContent className="p-0 pt-6 space-y-6">
          <label
            htmlFor="convert-file-input"
            className="flex flex-col items-center justify-center border-2 border-dashed border-[rgba(255,59,48,0.30)] hover:border-[rgba(255,59,48,0.70)] p-8 sm:p-12 text-center cursor-pointer bg-page hover:bg-brand/5 transition-all group clip-corner-lg input-3d card-hover-glow"
          >
            <input
              id="convert-file-input"
              type="file"
              className="hidden"
              onChange={handleFileChange}
            />
            <div className="w-14 h-14 bg-brand/10 border border-[rgba(255,59,48,0.25)] flex items-center justify-center text-brand-2 animate-float-gentle group-hover:scale-110 group-hover:border-brand/60 group-hover:shadow-[0_0_16px_rgba(255,59,48,0.3)] transition-all mb-3 clip-corner-card">
              <UploadCloud className="w-7 h-7" />
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
                  {t('ws.dropzoneTitle')}
                </p>
                <p className="text-xs text-slate-400">{t('ws.dropzoneHint')}</p>
              </div>
            )}
          </label>

          {/* Format selector row */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 bg-page border border-[rgba(255,59,48,0.22)] clip-corner-lg">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-xs font-medium text-slate-200">{t('ws.targetFormat')}</span>
              <SegmentedControl
                options={AVAILABLE_FORMATS}
                value={targetFormat}
                onChange={(fmt) => setTargetFormat(fmt as SupportedFormat)}
                ariaLabel={t('ws.targetFormat')}
              />
            </div>

            <Button
              variant="glow"
              size="md"
              disabled={!selectedFile || isLoading}
              isLoading={isLoading}
              onClick={handleConvert}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              {t('ws.convertNow')}
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
              <h4 className="text-sm font-semibold text-slate-100">{t('ws.result')}:</h4>
              <p className="text-xs text-slate-400">
                {t('ws.status')}: <strong className="text-emerald-400">{task.status}</strong>
              </p>
              {task.resultUrl && (
                <a
                  href={task.resultUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-semibold text-brand-2 hover:text-brand underline"
                >
                  {t('ws.downloadResult', { format: task.targetFormat.toUpperCase() })}
                </a>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
