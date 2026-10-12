import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Check, ShieldCheck, Zap, ChevronDown } from 'lucide-react'
import { SEO_TOOLS, type ToolConfig } from '../config/seoTools'
import { detectFileFormat, resolveRoute } from '../config/conversionMatrix'
import {
  getInitialParamValues,
  getParamFields,
  type ParamOptions,
} from '../config/conversionParams'
import {
  Breadcrumbs,
  SEOHead,
  UrlInputForm,
  FileUploader,
  JobProgress,
  DownloadResult,
  BeforeAfterPreview,
  RelatedTools,
  AdSenseUnit,
} from '../components'
import { openAffiliateTab } from '../utils/affiliate'
import { describeError, sanitizeUserMessage } from '../utils/apiError'
import { showToast } from '../components/feedback/toastStore'
import { hasAcceptedTerms, openConsentModal } from '../components/consent/consentStorage'
import { stripLocale, t, useI18n, withLocale } from '../i18n/langStore'
import { useToolConfig } from '../i18n/toolConfig'
import {
  mediaApi,
  convertApi,
  imageApi,
  jobsApi,
  filesApi,
  JobPollCancelled,
  type JobPublicResponse,
} from '../services'
import {
  clearToolSnapshot,
  getToolSnapshot,
  isJobExpired,
  updateToolSnapshot,
  type ToolFormState,
} from '../utils/toolStateStore'

export function ToolLandingPage({ configOverride }: { configOverride?: ToolConfig }) {
  const location = useLocation()
  const { lang } = useI18n()
  const tool = useToolConfig(
    configOverride || SEO_TOOLS[stripLocale(location.pathname).path],
  )

  // Snapshot của tool từ lần trước (chỉ trongmemory theo tab — File và blob không bao giờ
  // ghi ra disk/sessionStorage). Kết quả đã hết hạn theo TTL backend thì không khôi phục.
  const snapshot = tool ? getToolSnapshot(tool.slug) : undefined
  const snapshotExpired = isJobExpired(snapshot?.job)
  const resultLive = !!snapshot?.downloadUrl && !snapshotExpired
  // Điều kiện giống effect resume bên dưới: có job dở và chưa hết hạn thì vào trang là loading.
  const hasPendingJob = !!snapshot?.pending && !snapshotExpired

  const [isLoading, setIsLoading] = useState(hasPendingJob)
  const [job, setJob] = useState<JobPublicResponse | null>(
    snapshotExpired ? null : (snapshot?.job ?? null),
  )
  const [downloadUrl, setDownloadUrl] = useState<string | null>(
    resultLive ? (snapshot?.downloadUrl ?? null) : null,
  )
  const [resultFileName, setResultFileName] = useState(snapshot?.fileName ?? '')
  const [resultFormat, setResultFormat] = useState(snapshot?.format ?? '')
  const [originalImagePreview, setOriginalImagePreview] = useState<string | null>(
    snapshotExpired ? null : (snapshot?.previewUrl ?? null),
  )
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(snapshot?.faqIndex ?? null)
  const [errorMessage, setErrorMessage] = useState<string | null>(
    snapshotExpired ? null : (snapshot?.errorMessage ?? null),
  )

  const breadcrumbsData = useMemo(
    () => (tool ? [{ name: tool.badge, url: tool.slug }] : []),
    [tool],
  )

  const toolSlug = tool?.slug
  const resolveParamFields = useCallback(
    (sourceFormat: string | null, targetFormat: string) =>
      getParamFields({ sourceFormat, targetFormat, toolSlug }),
    [toolSlug],
  )

  const handleFormChange = useCallback(
    (form: ToolFormState | null) => {
      if (tool) updateToolSnapshot(tool.slug, { form })
    },
    [tool],
  )

  // Luồng theo dõi hiện tại (SSE, polling là đường lùi). Controller cũ bị hủy mỗi lần gửi
  // tệp mới, đổi tool, hoặc unmount để không bao giờ có hai luồng theo dõi cùng chạy.
  const trackControllerRef = useRef<AbortController | null>(null)

  const beginTracking = useCallback(() => {
    trackControllerRef.current?.abort()
    const controller = new AbortController()
    trackControllerRef.current = controller
    return controller
  }, [])

  const isCurrentTracking = useCallback(
    (controller: AbortController) => trackControllerRef.current === controller,
    [],
  )

  const applyFinishedJob = useCallback(
    (
      finishedJob: JobPublicResponse,
      token: string | null | undefined,
      failureMessage = t('toolsPage.convertFailed'),
    ) => {
      if (tool) updateToolSnapshot(tool.slug, { pending: null })
      setJob(finishedJob)
      if (finishedJob.status === 'completed') {
        setDownloadUrl(filesApi.getDirectDownloadUrl(finishedJob.id, token))
        showToast({ type: 'success', message: t('toolsPage.processSuccess') })
        return
      }
      // cancelled/expired không mang error text từ backend, nên cần lời riêng.
      // job.error có thể là traceback worker (tiếng Anh/nội bộ) → chỉ hiện nếu an toàn.
      const fallbackMessage =
        finishedJob.status === 'failed'
          ? failureMessage
          : t('toolsPage.jobCancelled')
      const safeError = sanitizeUserMessage(finishedJob.error, fallbackMessage)
      setErrorMessage(safeError)
      showToast({
        type: finishedJob.status === 'failed' ? 'error' : 'warning',
        message: safeError,
      })
    },
    [tool],
  )

  useEffect(() => {
    return () => {
      trackControllerRef.current?.abort()
      trackControllerRef.current = null
    }
  }, [toolSlug])

  // Ghi trạng thái vào snapshot để quay lại trang là khôi phục ngay.
  useEffect(() => {
    if (!tool) return
    updateToolSnapshot(tool.slug, {
      job,
      downloadUrl,
      fileName: resultFileName,
      format: resultFormat,
      previewUrl: originalImagePreview,
      errorMessage,
      faqIndex: openFaqIndex,
    })
  }, [tool, job, downloadUrl, resultFileName, resultFormat, originalImagePreview, errorMessage, openFaqIndex])

  // Lỗi từ snapshot cũ (quay lại trang) popup lại một lần; lỗi live do nơi bắt gọi showToast.
  useEffect(() => {
    if (errorMessage) showToast({ type: 'error', message: errorMessage })
    // eslint-disable-next-line react-hooks/exhaustive-deps -- chỉ chạy trên mount, đọc giá trị khởi tạo
  }, [])

  // Quay lại trang khi job còn chạy: theo dõi tiếp job CŨ qua SSE/polling,
  // không gửi lại file và không gọi lại API xử lý.
  useEffect(() => {
    if (!tool) return
    const pending = getToolSnapshot(tool.slug)?.pending
    if (!pending) return
    if (snapshotExpired) {
      updateToolSnapshot(tool.slug, { pending: null })
      return
    }

    const controller = beginTracking()
    jobsApi
      .trackJob(pending.jobId, {
        token: pending.token,
        signal: controller.signal,
        onJob: setJob,
      })
      .then((finishedJob) => {
        if (isCurrentTracking(controller)) applyFinishedJob(finishedJob, pending.token)
      })
      .catch((err) => {
        if (!isCurrentTracking(controller) || err instanceof JobPollCancelled) return
        const message = t('toolsPage.trackFailed')
        setErrorMessage(message)
        showToast({ type: 'error', message })
      })
      .finally(() => {
        if (isCurrentTracking(controller)) {
          trackControllerRef.current = null
          setIsLoading(false)
        }
      })
    return () => controller.abort()
  }, [tool, snapshotExpired, beginTracking, isCurrentTracking, applyFinishedJob])

  // Blob preview của kết quả đã hết hạn: giải phóng khi vào trang (revoke URL không còn
  // tham chiếu là no-op, chạy lặp lại vô hại).
  useEffect(() => {
    if (!tool || !snapshot?.previewUrl || !snapshotExpired) return
    URL.revokeObjectURL(snapshot.previewUrl)
    updateToolSnapshot(tool.slug, { previewUrl: null })
  }, [tool, snapshot, snapshotExpired])

  if (!tool) {
    return (
      <div className="py-20 text-center">
        <h1 className="text-2xl font-bold text-slate-100">{t('toolsPage.notFoundTitle')}</h1>
        <p className="text-sm text-slate-400 mt-2">{t('toolsPage.notFoundDesc')}</p>
      </div>
    )
  }

  const handleReset = () => {
    trackControllerRef.current?.abort()
    trackControllerRef.current = null
    if (tool) clearToolSnapshot(tool.slug)
    setJob(null)
    setDownloadUrl(null)
    if (originalImagePreview) URL.revokeObjectURL(originalImagePreview)
    setOriginalImagePreview(null)
    setErrorMessage(null)
    setIsLoading(false)
  }

  const handleUrlSubmit = async (url: string, format: string) => {
    // Chức năng xử lý (không phải trang công khai) chỉ chạy sau khi người dùng đồng ý điều khoản.
    if (!hasAcceptedTerms()) {
      openConsentModal('main')
      return
    }
    // Mở affiliate đồng bộ trong user gesture (form đã pass validate trước khi gọi đây);
    // popup bị chặn thì window.open trả null — luồng xử lý bên dưới vẫn chạy.
    openAffiliateTab(tool.slug)
    const controller = beginTracking()
    setIsLoading(true)
    setErrorMessage(null)
    setJob(null)
    setDownloadUrl(null)

    try {
      // Xác định operation dựa trên tool config
      const operation = tool.backendOperation === 'extract-audio' ? 'extract-audio' : 'url_download'
      const accepted = await mediaApi.processUrl(url, operation, { format })
      updateToolSnapshot(tool.slug, {
        pending: { jobId: accepted.job_id, token: accepted.download_token ?? null },
      })

      setResultFormat(format)
      // 'sv' locale cho dạng "2026-10-12 15:30" (giờ local) → gọn thành 202610121530
      const stamp = new Date().toLocaleString('sv').slice(0, 16).replace(/[-: ]/g, '')
      setResultFileName(`oneforall_${format}_${stamp}.${format}`)

      const finishedJob = await jobsApi.trackJob(accepted.job_id, {
        token: accepted.download_token,
        signal: controller.signal,
        onJob: setJob,
      })

      if (!isCurrentTracking(controller)) return

      applyFinishedJob(finishedJob, accepted.download_token, t('toolsPage.videoFailed'))
    } catch (err) {
      if (!isCurrentTracking(controller) || err instanceof JobPollCancelled) return
      const { type, message } = describeError(err, t('toolsPage.errorFallback'))
      setErrorMessage(message)
      showToast({ type, message })
    } finally {
      if (isCurrentTracking(controller)) {
        trackControllerRef.current = null
        setIsLoading(false)
      }
    }
  }

  const handleFileSubmit = async (
    file: File,
    format: string,
    options: ParamOptions = {},
  ) => {
    // Ngắt trước khi tạo job: chưa đồng ý điều khoản thì mở modal, không gửi request.
    if (!hasAcceptedTerms()) {
      openConsentModal('main')
      return
    }
    const controller = beginTracking()
    setIsLoading(true)
    setErrorMessage(null)
    setJob(null)
    setDownloadUrl(null)

    // Thu hồi blob cũ để không giữ ảnh gốc trong bộ nhớ sau khi thay tệp
    if (originalImagePreview) URL.revokeObjectURL(originalImagePreview)
    setOriginalImagePreview(file.type.startsWith('image/') ? URL.createObjectURL(file) : null)

    try {
      let accepted
      const targetFormat = format.toLowerCase().replace(/^\./, '')
      setResultFormat(targetFormat)
      setResultFileName(`oneforall_${file.name.replace(/\.[^/.]+$/, '')}.${targetFormat}`)

      if (tool.backendType === 'image_process') {
        const operation = (tool.backendOperation ?? 'compress') as
          | 'compress'
          | 'resize'
          | 'remove_background'
          | 'crop'

        // Background removal always returns PNG and ignores every other option.
        openAffiliateTab(tool.slug) // đồng bộ, trước await đầu tiên -> còn trong user gesture
        accepted = await imageApi.processImage(
          file,
          operation,
          operation === 'remove_background' ? {} : { format: targetFormat, ...options },
        )
      } else {
        const sourceFormat = detectFileFormat(file)
        const route = resolveRoute(sourceFormat, targetFormat)

        if (!route) {
          throw new Error(
            t('toolsPage.unsupportedConversion', {
              source: sourceFormat ? `.${sourceFormat}` : t('common.unknownFile'),
              target: targetFormat,
            }),
          )
        }

        // Route hợp lệ (= dữ liệu đầu vào đạt) mới mở affiliate; vẫn đồng bộ trước await.
        openAffiliateTab(tool.slug)

        if (route.endpoint === 'media-process') {
          accepted = await mediaApi.processMediaFile(file, route.operation, {
            format: targetFormat,
            ...options,
          })
        } else if (route.endpoint === 'image-process') {
          accepted = await imageApi.processImage(file, route.operation, {
            format: route.format,
            ...options,
          })
        } else {
          accepted = await convertApi.convertFile(file, targetFormat, sourceFormat ?? undefined, options)
        }
      }

      updateToolSnapshot(tool.slug, {
        pending: { jobId: accepted.job_id, token: accepted.download_token ?? null },
      })

      const finishedJob = await jobsApi.trackJob(accepted.job_id, {
        token: accepted.download_token,
        signal: controller.signal,
        onJob: setJob,
      })

      if (!isCurrentTracking(controller)) return

      applyFinishedJob(finishedJob, accepted.download_token, t('toolsPage.convertFailed'))
    } catch (err) {
      if (!isCurrentTracking(controller) || err instanceof JobPollCancelled) return
      const { type, message } = describeError(err, t('toolsPage.errorFileFallback'))
      setErrorMessage(message)
      showToast({ type, message })
    } finally {
      if (isCurrentTracking(controller)) {
        trackControllerRef.current = null
        setIsLoading(false)
      }
    }
  }

  // Breadcrumb hiển thị tên công cụ hiện tại; canonical theo locale đang xem
  const canonicalUrl = `https://oneforall.app${withLocale(tool.slug, lang)}`

  return (
    <div className="w-full min-h-screen bg-page">
      {/* 1. Dynamic SEO Metadata & Schema JSON-LD */}
      <SEOHead
        title={tool.title}
        description={tool.metaDescription}
        canonicalUrl={canonicalUrl}
        alternates={{ vi: tool.slug, en: withLocale(tool.slug, 'en') }}
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
            <div className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold bg-surface border border-[rgba(255,59,48,0.35)] text-[#FF3B30] badge-angular">
              <Zap className="w-3.5 h-3.5" />
              <span>{tool.badge}</span>
            </div>

            {/* Semantic Single H1 Header */}
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-ink tracking-tight leading-tight heading-in">
              {tool.h1}
            </h1>

            {/* Subtitle */}
            <p className="text-xs sm:text-base text-slate-300 leading-relaxed max-w-2xl mx-auto">
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
                    key={tool.slug}
                    acceptedTypes={tool.acceptedFileTypes}
                    outputFormats={tool.outputFormats}
                    defaultFormat={tool.defaultFormat}
                    filterTargetsBySource={tool.backendType !== 'image_process'}
                    resolveFields={resolveParamFields}
                    initialParams={getInitialParamValues(tool.slug)}
                    initialForm={snapshot?.form ?? null}
                    onFormChange={handleFormChange}
                    onSubmit={handleFileSubmit}
                    isLoading={isLoading}
                    disabled={isLoading}
                  />
                )}

                {/* Processing Progress Bar */}
                {isLoading && <JobProgress job={job} onRetry={handleReset} />}
              </div>
            ) : (
              /* Khi đã xử lý xong: hiển thị kết quả và download */
              <div className="space-y-6">
                {/* Riêng trang xóa nền: hiển thị so sánh trước/sau trực quan */}
                {tool.slug === '/remove-background' && originalImagePreview && (
                  <BeforeAfterPreview
                    originalUrl={originalImagePreview}
                    processedUrl={downloadUrl}
                    originalLabel={t('toolsPage.originalLabel')}
                    processedLabel={t('toolsPage.removedLabel')}
                  />
                )}

                <DownloadResult
                  downloadUrl={downloadUrl}
                  fileName={resultFileName}
                  format={resultFormat}
                  previewUrl={tool.category === 'image' ? downloadUrl : null}
                  onReset={handleReset}
                />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 3. How It Works Section */}
      <section className="py-14 sm:py-20 bg-page border-y border-edge">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16 space-y-3">
            <h2 className="text-xl sm:text-3xl font-bold text-ink tracking-tight">
              {t('toolsPage.howToUse', { badge: tool.badge })}
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              {t('toolsPage.howToDesc')}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {tool.howItWorksSteps.map((step) => (
              <div
                key={step.step}
                className="relative p-6 bg-surface border border-[rgba(255,59,48,0.22)] transition-all space-y-3 card-3d clip-corner-card"
              >
                <div className="w-10 h-10 flex items-center justify-center font-mono font-bold text-sm text-[#FF3B30]">
                  {step.step}
                </div>
                <h3 className="font-bold text-ink text-sm">
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
            <h2 className="text-xl sm:text-3xl font-bold text-ink tracking-tight">
              {t('toolsPage.whyChoose')}
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              {t('toolsPage.whyChooseDesc')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {tool.features.map((feat) => (
              <div
                key={feat.title}
                className="p-6 bg-surface border border-[rgba(255,59,48,0.22)] space-y-3 card-3d clip-corner-card"
              >
                <div className="w-10 h-10 bg-[#ff3b30]/10 border border-[#ff3b30]/30 flex items-center justify-center text-[#FF3B30] clip-corner-btn">
                  <Check className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-ink text-lg">
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
      <section className="py-12 bg-page border-y border-edge">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-6 sm:p-8 bg-surface border border-[rgba(255,59,48,0.25)] space-y-4 clip-corner-lg card-3d card-3d-dim">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0" />
              <h3 className="font-bold text-ink text-base sm:text-lg">
                {t('toolsPage.formatsTitle')}
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {tool.supportedFormatsDesc}
            </p>
            <div className="pt-2 border-t border-edge text-xs text-slate-400 flex flex-wrap gap-4">
              <span>• {t('toolsPage.securitySsl')}</span>
              <span>• {t('toolsPage.securityAutoDelete')}</span>
              <span>• {t('toolsPage.securityFree')}</span>
            </div>
          </div>
        </div>
      </section>

      {/* 6. FAQ Accordion Section */}
      {tool.faqList.length > 0 && (
        <section className="py-14 sm:py-20">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10 space-y-2">
              <h2 className="text-xl sm:text-3xl font-bold text-ink tracking-tight">
                {t('toolsPage.faqTitle')}
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">
                {t('toolsPage.faqDesc', { badge: tool.badge })}
              </p>
            </div>

            <div className="space-y-3">
              {tool.faqList.map((faq, index) => {
                const isOpen = openFaqIndex === index
                return (
                  <div
                    key={faq.q}
                    className="border border-edge bg-surface overflow-hidden transition-colors clip-corner-card"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                      className="w-full p-5 text-left font-semibold text-ink text-xs sm:text-base flex items-center justify-between gap-4 cursor-pointer hover:bg-[#ff3b30]/5"
                    >
                      <span>{faq.q}</span>
                      <ChevronDown
                        className={`w-5 h-5 text-slate-400 shrink-0 transition-transform duration-200 ${
                          isOpen ? 'rotate-180 text-[#FF3B30]' : ''
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-edge bg-page">
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AdSenseUnit slot={import.meta.env.VITE_ADSENSE_SLOT_BOTTOM ?? ''} />
      </div>
      <RelatedTools slugs={tool.relatedSlugs} />
    </div>
  )
}
