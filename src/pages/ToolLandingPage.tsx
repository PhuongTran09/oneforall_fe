import { useState, useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import { Check, ShieldCheck, Zap, Info, ChevronDown } from 'lucide-react'
import { SEO_TOOLS, type ToolConfig } from '../config/seoTools'
import { detectFileFormat, resolveRoute } from '../config/conversionMatrix'
import {
  Breadcrumbs,
  SEOHead,
  UrlInputForm,
  FileUploader,
  JobProgress,
  DownloadResult,
  BeforeAfterPreview,
  RelatedTools,
} from '../components'
import {
  mediaApi,
  convertApi,
  imageApi,
  jobsApi,
  filesApi,
  type JobPublicResponse,
} from '../services'

export function ToolLandingPage({ configOverride }: { configOverride?: ToolConfig }) {
  const location = useLocation()
  const tool: ToolConfig | undefined = configOverride || SEO_TOOLS[location.pathname]

  const [isLoading, setIsLoading] = useState(false)
  const [job, setJob] = useState<JobPublicResponse | null>(null)
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)
  const [downloadToken, setDownloadToken] = useState<string | null>(null)
  const [resultFileName, setResultFileName] = useState<string>('')
  const [resultFormat, setResultFormat] = useState<string>('')
  const [originalImagePreview, setOriginalImagePreview] = useState<string | null>(null)
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const breadcrumbsData = useMemo(
    () => (tool ? [{ name: tool.badge, url: tool.slug }] : []),
    [tool],
  )

  if (!tool) {
    return (
      <div className="py-20 text-center">
        <h1 className="text-2xl font-bold text-slate-100">Không tìm thấy công cụ</h1>
        <p className="text-sm text-slate-400 mt-2">Vui lòng quay lại trang chủ.</p>
      </div>
    )
  }

  const handleReset = () => {
    setJob(null)
    setDownloadUrl(null)
    setDownloadToken(null)
    setOriginalImagePreview(null)
    setErrorMessage(null)
    setIsLoading(false)
  }

  const handleUrlSubmit = async (url: string, format: string) => {
    setIsLoading(true)
    setErrorMessage(null)
    setJob(null)
    setDownloadUrl(null)

    try {
      // Xác định operation dựa trên tool config
      const operation = tool.backendOperation === 'extract-audio' ? 'extract-audio' : 'url_download'
      const accepted = await mediaApi.processUrl(url, operation, { format })

      setDownloadToken(accepted.download_token || null)
      setResultFormat(format)
      setResultFileName(`oneforall_${format}_${Date.now()}.${format}`)

      // Bắt đầu polling trạng thái job
      const finishedJob = await jobsApi.pollJob(
        accepted.job_id,
        accepted.download_token,
        (progressJob) => {
          setJob(progressJob)
        },
      )

      setJob(finishedJob)
      if (finishedJob.status === 'completed') {
        const finalUrl = filesApi.getDirectDownloadUrl(finishedJob.id, accepted.download_token)
        setDownloadUrl(finalUrl)
      } else if (finishedJob.status === 'failed') {
        setErrorMessage(finishedJob.error || 'Xử lý video thất bại. Vui lòng kiểm tra lại đường dẫn.')
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Có lỗi xảy ra khi xử lý tác vụ'
      setErrorMessage(msg)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileSubmit = async (file: File, format: string) => {
    setIsLoading(true)
    setErrorMessage(null)
    setJob(null)
    setDownloadUrl(null)

    // Lưu preview nếu là hình ảnh
    if (file.type.startsWith('image/')) {
      const origPreview = URL.createObjectURL(file)
      setOriginalImagePreview(origPreview)
    }

    try {
      let accepted
      const targetFormat = format.toLowerCase().replace(/^\./, '')
      setResultFormat(targetFormat)
      setResultFileName(`oneforall_${file.name.replace(/\.[^/.]+$/, '')}.${targetFormat}`)

      if (tool.backendType === 'image_process') {
        let op: 'compress' | 'resize' | 'remove_background' | 'crop' = 'compress'
        let opts = {}

        if (tool.slug === '/remove-background') {
          op = 'remove_background'
        } else if (tool.slug === '/image-compressor') {
          op = 'compress'
          opts = { quality: 80 }
        } else if (tool.slug === '/image-resizer') {
          op = 'resize'
          opts = { width: 1200 }
        }

        accepted = await imageApi.processImage(file, op, opts)
      } else {
        const sourceFormat = detectFileFormat(file)
        const route = resolveRoute(sourceFormat, targetFormat)

        if (!route) {
          throw new Error(
            `Chưa hỗ trợ chuyển đổi từ ${
              sourceFormat ? `.${sourceFormat}` : 'tệp không xác định'
            } sang .${targetFormat}.`,
          )
        }

        accepted =
          route.endpoint === 'media-process'
            ? await mediaApi.processMediaFile(file, route.operation, { format: targetFormat })
            : await convertApi.convertFile(file, targetFormat)
      }

      setDownloadToken(accepted.download_token || null)

      // Bắt đầu polling trạng thái job
      const finishedJob = await jobsApi.pollJob(
        accepted.job_id,
        accepted.download_token,
        (progressJob) => {
          setJob(progressJob)
        },
      )

      setJob(finishedJob)
      if (finishedJob.status === 'completed') {
        const finalUrl = filesApi.getDirectDownloadUrl(finishedJob.id, accepted.download_token)
        setDownloadUrl(finalUrl)
      } else if (finishedJob.status === 'failed') {
        setErrorMessage(finishedJob.error || 'Chuyển đổi tệp thất bại. Vui lòng thử lại.')
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Có lỗi xảy ra khi xử lý tệp tin'
      setErrorMessage(msg)
    } finally {
      setIsLoading(false)
    }
  }

  // Breadcrumb hiển thị tên công cụ hiện tại
  const canonicalUrl = `https://oneforall.app${tool.slug}`

  return (
    <div className="w-full min-h-screen bg-[#0a0a0f]">
      {/* 1. Dynamic SEO Metadata & Schema JSON-LD */}
      <SEOHead
        title={tool.title}
        description={tool.metaDescription}
        canonicalUrl={canonicalUrl}
        breadcrumbs={breadcrumbsData}
        faqList={tool.faqList}
      />

      {/* Top Banner Navigation: Breadcrumbs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-2">
        <Breadcrumbs items={breadcrumbsData} />
      </div>

      {/* 2. Hero Interactive Workspace */}
      <section className="relative pt-6 pb-14 sm:pb-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-8 sm:mb-10">
            {/* Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold bg-[#14141b] border border-[rgba(255,59,48,0.35)] text-[#FF3B30] badge-angular">
              <Zap className="w-3.5 h-3.5" />
              <span>{tool.badge}</span>
            </div>

            {/* Semantic Single H1 Header */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
              {tool.h1}
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl mx-auto">
              {tool.subtitle}
            </p>
          </div>

          {/* Interactive Input Form */}
          <div className="max-w-3xl mx-auto">
            {/* Nếu chưa có kết quả thành công, hiển thị Form nhập liệu */}
            {!downloadUrl ? (
              <div className="space-y-4">
                {tool.inputType === 'url' ? (
                  <UrlInputForm
                    platform={tool.urlPlatform}
                    formats={tool.outputFormats}
                    defaultFormat={tool.defaultFormat}
                    onSubmit={handleUrlSubmit}
                    isLoading={isLoading}
                    disabled={isLoading}
                  />
                ) : (
                  <FileUploader
                    acceptedTypes={tool.acceptedFileTypes}
                    outputFormats={tool.outputFormats}
                    defaultFormat={tool.defaultFormat}
                    filterTargetsBySource={tool.backendType !== 'image_process'}
                    onSubmit={handleFileSubmit}
                    isLoading={isLoading}
                    disabled={isLoading}
                  />
                )}

                {/* Processing Progress Bar */}
                {isLoading && <JobProgress job={job} onRetry={handleReset} />}

                {/* Error message */}
                {errorMessage && (
                  <div className="p-4 bg-[#ff3b30]/10 border border-[#ff3b30]/30 text-rose-300 text-sm flex items-start gap-2.5 clip-corner-card">
                    <Info className="w-5 h-5 text-[#ff3b30] shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold">Đã xảy ra lỗi</p>
                      <p className="text-xs sm:text-sm mt-0.5">{errorMessage}</p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Khi đã xử lý xong: hiển thị kết quả và download */
              <div className="space-y-6">
                {/* Riêng trang xóa nền: hiển thị so sánh trước/sau trực quan */}
                {tool.slug === '/remove-background' && originalImagePreview && (
                  <BeforeAfterPreview
                    originalUrl={originalImagePreview}
                    processedUrl={downloadUrl}
                    originalLabel="Ảnh gốc"
                    processedLabel="Ảnh đã xóa nền"
                  />
                )}

                <DownloadResult
                  jobId={job?.id || 'job-completed'}
                  downloadToken={downloadToken}
                  downloadUrl={downloadUrl}
                  fileName={resultFileName}
                  format={resultFormat}
                  previewUrl={tool.category === 'image' ? originalImagePreview : null}
                  onReset={handleReset}
                />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 3. How It Works Section */}
      <section className="py-14 sm:py-20 bg-[#0a0a0f] border-y border-[#2a2a35]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16 space-y-3">
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Hướng dẫn sử dụng {tool.badge}
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              Chỉ với 4 bước đơn giản, bạn có thể hoàn tất tác vụ chỉ trong chớp mắt mà không cần kiến thức kỹ thuật.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {tool.howItWorksSteps.map((step) => (
              <div
                key={step.step}
                className="relative p-6 bg-[#14141b] border border-[rgba(255,59,48,0.22)] transition-all space-y-3 card-3d clip-corner-card"
              >
                <div className="w-10 h-10 flex items-center justify-center font-mono font-bold text-sm text-[#FF3B30]">
                  {step.step}
                </div>
                <h3 className="font-bold text-white text-base">
                  {step.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Features Section */}
      <section className="py-14 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Tại sao nên chọn OneForAll?
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              Tối ưu cho cả người dùng phổ thông lẫn các nhà sáng tạo nội dung chuyên nghiệp.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {tool.features.map((feat) => (
              <div
                key={feat.title}
                className="p-6 bg-[#14141b] border border-[rgba(255,59,48,0.22)] space-y-3 card-3d clip-corner-card"
              >
                <div className="w-10 h-10 bg-[#ff3b30]/10 border border-[#ff3b30]/30 flex items-center justify-center text-[#FF3B30] clip-corner-btn">
                  <Check className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-white text-lg">
                  {feat.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {feat.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Supported Formats & Security Notice */}
      <section className="py-12 bg-[#0a0a0f] border-y border-[#2a2a35]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-6 sm:p-8 bg-[#14141b] border border-[rgba(255,59,48,0.25)] space-y-4 clip-corner-lg card-3d card-3d-dim">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0" />
              <h3 className="font-bold text-white text-base sm:text-lg">
                Định dạng hỗ trợ & Quy chuẩn an toàn
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {tool.supportedFormatsDesc}
            </p>
            <div className="pt-2 border-t border-[#2a2a35] text-xs text-slate-400 flex flex-wrap gap-4">
              <span>• Mã hóa SSL 256-bit trong quá trình truyền tải</span>
              <span>• Tự động xóa tệp sau khi hoàn thành</span>
              <span>• Miễn phí 100%, không dính quảng cáo che khuất</span>
            </div>
          </div>
        </div>
      </section>

      {/* 6. FAQ Accordion Section */}
      {tool.faqList.length > 0 && (
        <section className="py-14 sm:py-20">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10 space-y-2">
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Câu hỏi thường gặp
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">
                Giải đáp mọi thắc mắc khi sử dụng {tool.badge}
              </p>
            </div>

            <div className="space-y-3">
              {tool.faqList.map((faq, index) => {
                const isOpen = openFaqIndex === index
                return (
                  <div
                    key={faq.q}
                    className="border border-[#2a2a35] bg-[#14141b] overflow-hidden transition-colors clip-corner-card"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                      className="w-full p-5 text-left font-semibold text-white text-sm sm:text-base flex items-center justify-between gap-4 cursor-pointer hover:bg-[#ff3b30]/5"
                    >
                      <span>{faq.q}</span>
                      <ChevronDown
                        className={`w-5 h-5 text-slate-400 shrink-0 transition-transform duration-200 ${
                          isOpen ? 'rotate-180 text-[#FF3B30]' : ''
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-[#2a2a35] bg-[#0a0a0f]">
                        {faq.a}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* 7. Related Tools Section (Internal Linking) */}
      <RelatedTools slugs={tool.relatedSlugs} />
    </div>
  )
}
