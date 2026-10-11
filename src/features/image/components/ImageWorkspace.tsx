import { useState, type ChangeEvent } from 'react'
import { UploadCloud, Image as ImageIcon, CheckCircle2, ArrowRight } from 'lucide-react'
import { Button } from '../../../components/common/Button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../../components/common/Card'
import { imageApi } from '../services/imageApi'
import type { ImageProcessTask } from '../types/image.types'

export function ImageWorkspace() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [task, setTask] = useState<ImageProcessTask | null>(null)
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
      const res = await imageApi.optimizeImage(selectedFile, { quality: 80, format: 'webp' })
      setTask(res)
      setMessage({ text: 'Tối ưu hóa ảnh thành công qua FastAPI backend!', isError: false })
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Xử lý hình ảnh thất bại'
      setMessage({ text: `Lỗi: ${errorMsg}`, isError: true })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 sm:py-16">
      <Card className="bg-[#14141b] border-[#2a2a35] p-6 sm:p-8">
        <CardHeader className="p-0 pb-6 border-b border-[#2a2a35]">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-2xl">Xử lý hình ảnh</CardTitle>
              <span className="text-xs font-mono text-indigo-400">Image Processing Engine</span>
            </div>
          </div>
          <CardDescription>
            Nén thông minh, chuyển định dạng WebP/AVIF và tối ưu dung lượng tệp cho web với backend FastAPI.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-0 pt-6 space-y-6">
          <label
            htmlFor="image-file-input"
            className="flex flex-col items-center justify-center border-2 border-dashed border-[#2a2a35] hover:border-indigo-500/60 rounded-2xl p-8 sm:p-12 text-center cursor-pointer bg-[#0a0a0f] hover:bg-[#1a1a24] transition-all group"
          >
            <input
              id="image-file-input"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform mb-3">
              <UploadCloud className="w-7 h-7" />
            </div>
            {selectedFile ? (
              <div className="space-y-1">
                <p className="text-sm font-semibold text-white">{selectedFile.name}</p>
                <p className="text-xs text-slate-400">
                  Dung lượng: {(selectedFile.size / 1024).toFixed(1)} KB
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                <p className="text-sm font-medium text-slate-100">
                  Kéo thả hoặc nhấp để chọn tệp hình ảnh
                </p>
                <p className="text-xs text-slate-400">Hỗ trợ PNG, JPG, WEBP, AVIF, SVG (tối đa 50MB)</p>
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
              Bắt đầu tối ưu ảnh
            </Button>
          </div>

          {message && (
            <div
              className={`p-4 rounded-xl text-sm border flex items-center gap-3 ${
                message.isError
                  ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                  : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              }`}
            >
              {!message.isError && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
              <span>{message.text}</span>
            </div>
          )}

          {task && (
            <div className="p-4 rounded-xl bg-[#0a0a0f] border border-[#2a2a35] space-y-2">
              <h4 className="text-sm font-semibold text-slate-100">Kết quả xử lý:</h4>
              <p className="text-xs text-slate-400">
                Trạng thái: <strong className="text-emerald-400">{task.status}</strong>
              </p>
              {task.outputUrl && (
                <a
                  href={task.outputUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 underline"
                >
                  Tải ảnh kết quả
                </a>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
