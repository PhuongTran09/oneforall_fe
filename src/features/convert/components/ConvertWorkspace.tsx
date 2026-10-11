import { useState, type ChangeEvent } from 'react'
import { UploadCloud, FileType, CheckCircle2, ArrowRight } from 'lucide-react'
import { Button } from '../../../components/common/Button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../../components/common/Card'
import { convertApi } from '../services/convertApi'
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
        text: `Đã gửi yêu cầu chuyển đổi sang định dạng ${targetFormat.toUpperCase()}!`,
        isError: false,
      })
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Chuyển đổi tệp thất bại'
      setMessage({ text: `Lỗi: ${errorMsg}`, isError: true })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="page-container">
      <Card className="bg-[#14141b] border border-[rgba(255,59,48,0.25)] p-6 sm:p-8">
        <CardHeader className="p-0 pb-6 border-b border-[#2a2a35]">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-[#ff3b30]/10 border border-[rgba(255,59,48,0.30)] flex items-center justify-center text-[#FF6B4A] clip-corner-btn">
              <FileType className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-2xl">Chuyển đổi định dạng</CardTitle>
              <span className="text-xs font-mono text-[#FF6B4A]">Universal File Converter</span>
            </div>
          </div>
          <CardDescription>
            Chuyển đổi linh hoạt giữa các định dạng tài liệu, hình ảnh, âm thanh và bảng tính.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-0 pt-6 space-y-6">
          <label
            htmlFor="convert-file-input"
            className="flex flex-col items-center justify-center border-2 border-dashed border-[rgba(255,59,48,0.30)] hover:border-[rgba(255,59,48,0.60)] p-8 sm:p-12 text-center cursor-pointer bg-[#0a0a0f] hover:bg-[#ff3b30]/5 transition-all group clip-corner-lg input-3d"
          >
            <input
              id="convert-file-input"
              type="file"
              className="hidden"
              onChange={handleFileChange}
            />
            <div className="w-14 h-14 bg-[#ff3b30]/10 border border-[rgba(255,59,48,0.25)] flex items-center justify-center text-[#FF6B4A] group-hover:scale-110 transition-transform mb-3 clip-corner-card">
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
                  Kéo thả hoặc nhấp để chọn tệp cần chuyển đổi
                </p>
                <p className="text-xs text-slate-400">Tài liệu, âm thanh, video hoặc bảng tính dữ liệu</p>
              </div>
            )}
          </label>

          {/* Format selector row */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 bg-[#0a0a0f] border border-[rgba(255,59,48,0.22)] clip-corner-lg">
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium text-slate-200">Định dạng muốn chuyển đổi:</span>
              <select
                value={targetFormat}
                onChange={(e) => setTargetFormat(e.target.value as SupportedFormat)}
                className="px-3 py-1.5 bg-[#14141b] border border-[#2a2a35] text-xs font-mono text-white focus:outline-none focus:border-[#ff3b30] clip-corner-btn"
              >
                {AVAILABLE_FORMATS.map((fmt) => (
                  <option key={fmt} value={fmt}>
                    .{fmt.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            <Button
              variant="glow"
              size="md"
              disabled={!selectedFile || isLoading}
              isLoading={isLoading}
              onClick={handleConvert}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Chuyển đổi ngay
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
            <div className="p-4 bg-[#0a0a0f] border border-[#2a2a35] space-y-2 clip-corner-card">
              <h4 className="text-sm font-semibold text-slate-100">Kết quả:</h4>
              <p className="text-xs text-slate-400">
                Trạng thái: <strong className="text-emerald-400">{task.status}</strong>
              </p>
              {task.resultUrl && (
                <a
                  href={task.resultUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-semibold text-[#FF6B4A] hover:text-[#FF3B30] underline"
                >
                  Tải tệp thành phẩm ({task.targetFormat.toUpperCase()})
                </a>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
