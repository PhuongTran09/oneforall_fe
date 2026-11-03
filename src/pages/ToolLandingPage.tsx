import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Check, ShieldCheck, Zap, ChevronDown } from 'lucide-react'
import { SEO_TOOLS, type ToolConfig } from '../config/seoTools'
import { detectFileFormat, resolveRoute } from '../config/conversionMatrix'
import { toolFormatPairs } from '../config/formatSuggestions'
import { categoryOfSlug } from '../config/toolCategories'
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
  ToolFooterActions,
} from '../components'
import { openAffiliateTab } from '../utils/affiliate'
import { openSmartlinkTab, useAdsDecision } from '../services/adScripts'
import { describeError, describeJobError } from '../utils/apiError'
import { showToast } from '../components/feedback/toastStore'
import { showErrorPopup } from '../components/feedback/errorPopupStore'
import { hasAcceptedTerms, openConsentModal } from '../components/consent/consentStorage'
import { stripLocale, t, useI18n, withLocale } from '../i18n/langStore'
import { useToolConfig } from '../i18n/toolConfig'
import {
  mediaApi,
  convertApi,
  imageApi,
  jobsApi,
  filesApi,
  ensureAnonymousSession,
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
import { getLenisInstance } from '../hooks/useSmoothScroll'




const RASTER_PREVIEW_FORMATS = new Set(['jpg', 'jpeg', 'png', 'webp', 'gif', 'avif', 'bmp', 'ico'])

export function ToolLandingPage({ configOverride }: { configOverride?: ToolConfig }) {
  const location = useLocation()
  const adsGate = useAdsDecision()
  const { lang } = useI18n()
  const tool = useToolConfig(
    configOverride || SEO_TOOLS[stripLocale(location.pathname).path],
  )



  const snapshot = tool ? getToolSnapshot(tool.slug) : undefined
  const snapshotExpired = isJobExpired(snapshot?.job)
  const resultLive = !!snapshot?.downloadUrl && !snapshotExpired

  const hasPendingJob = !!snapshot?.pending && !snapshotExpired

  const [isLoading, setIsLoading] = useState(hasPendingJob)
  const [isCancelling, setIsCancelling] = useState(false)
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


  const [errorMessage, setErrorMessage] = useState<string | null>(null)



  const breadcrumbsData = useMemo(() => {
    if (!tool) return []
    const category = categoryOfSlug(tool.slug)
    const trail = [{ name: t('directory.crumb'), url: '/tools' }]
    if (category) trail.push({ name: t(category.nameKey), url: `/${category.path}` })
    trail.push({ name: tool.badge, url: tool.slug })
    return trail
  }, [tool])

  const toolSlug = tool?.slug
  const popularConversions = useMemo(() => (tool ? toolFormatPairs(tool) : []), [tool])

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
      const fallbackMessage =
        finishedJob.status === 'failed'
          ? failureMessage
          : t('toolsPage.jobCancelled')
      const safeError = describeJobError(finishedJob, fallbackMessage)
      setErrorMessage(safeError)
      showErrorPopup({ message: safeError })
    },
    [tool],
  )

  useEffect(() => {
    return () => {
      trackControllerRef.current?.abort()
      trackControllerRef.current = null
    }
  }, [toolSlug])

  useEffect(() => {
    if (!tool) return
    updateToolSnapshot(tool.slug, {
      job,
      downloadUrl,
      fileName: resultFileName,
      format: resultFormat,
      previewUrl: originalImagePreview,
      errorMessage,
      errorLang: errorMessage ? lang : null,
      faqIndex: openFaqIndex,
    })
  }, [tool, job, downloadUrl, resultFileName, resultFormat, originalImagePreview, errorMessage, openFaqIndex, lang])

  useEffect(() => {
    if (!tool || !snapshot?.errorMessage || !snapshot.errorLang) return
    if (snapshot.errorLang === stripLocale(location.pathname).lang) {
      showErrorPopup({ message: snapshot.errorMessage })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- chỉ chạy trên mount, đọc giá trị khởi tạo
  }, [])

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
        signal: controller.signal,
        onJob: setJob,
      })
      .then((finishedJob) => {
        if (isCurrentTracking(controller)) applyFinishedJob(finishedJob, pending.downloadToken)
      })
      .catch((err) => {
        if (!isCurrentTracking(controller) || err instanceof JobPollCancelled) return
        const { message } = describeError(err, t('toolsPage.trackFailed'))
        setErrorMessage(message)
        showErrorPopup({ message })
      })
      .finally(() => {
        if (isCurrentTracking(controller)) {
          trackControllerRef.current = null
          setIsLoading(false)
        }
      })
    return () => controller.abort()
  }, [tool, snapshotExpired, beginTracking, isCurrentTracking, applyFinishedJob])

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
    requestAnimationFrame(() => {
      const lenis = getLenisInstance()
      if (lenis) {
        lenis.scrollTo(0)
        return
      }
      window.scrollTo({ top: 0, behavior: 'smooth' })
    })
  }

  const handleCancelCurrent = async () => {
    const jobId = job?.id
    if (!jobId || isCancelling) return
    setIsCancelling(true)
    try {
      await jobsApi.cancelJob(jobId)
    } catch (err) {
      showErrorPopup({ message: describeError(err, t('job.cancelError')).message })
    } finally {
      setIsCancelling(false)
    }
  }


  const openSponsoredTabs = (key: string) => {
    if (adsGate === 'load') openAffiliateTab(key)
    openSmartlinkTab(adsGate)
  }

  const requireTerms = () => {
    if (hasAcceptedTerms()) return true
    openConsentModal('main')
    showToast({ type: 'warning', message: t('toolsPage.termsRequired') })
    return false
  }

  const handleUrlSubmit = async (url: string, format: string, quality: string, slides?: number[]) => {
    if (!requireTerms()) return
    openSponsoredTabs(tool.slug)
    const controller = beginTracking()
    setIsLoading(true)
    setErrorMessage(null)
    setJob(null)
    setDownloadUrl(null)

    try {
      await ensureAnonymousSession()
      const operation = tool.backendOperation === 'extract-audio' ? 'extract-audio' : 'url_download'
      const accepted = await mediaApi.processUrl(url, operation, { format, quality, slides })
      updateToolSnapshot(tool.slug, {
        pending: { jobId: accepted.job_id, downloadToken: accepted.download_token },
      })

      setResultFormat(format)
      const stamp = new Date().toLocaleString('sv').slice(0, 16).replace(/[-: ]/g, '')
      setResultFileName(`oneforall_${format}_${stamp}.${format}`)

      const finishedJob = await jobsApi.trackJob(accepted.job_id, {
        signal: controller.signal,
        onJob: setJob,
      })

      if (!isCurrentTracking(controller)) return

      applyFinishedJob(finishedJob, accepted.download_token, t('toolsPage.videoFailed'))
    } catch (err) {
      if (!isCurrentTracking(controller) || err instanceof JobPollCancelled) return
      const { message } = describeError(err, t('toolsPage.errorFallback'))
      setErrorMessage(message)
      showErrorPopup({ message })
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
    if (!requireTerms()) return
    const controller = beginTracking()
    setIsLoading(true)
    setErrorMessage(null)
    setJob(null)
    setDownloadUrl(null)

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

        openSponsoredTabs(tool.slug)
        await ensureAnonymousSession()
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

        openSponsoredTabs(tool.slug)
        await ensureAnonymousSession()

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
        pending: { jobId: accepted.job_id, downloadToken: accepted.download_token },
      })

      const finishedJob = await jobsApi.trackJob(accepted.job_id, {
        signal: controller.signal,
        onJob: setJob,
      })

      if (!isCurrentTracking(controller)) return

      applyFinishedJob(finishedJob, accepted.download_token, t('toolsPage.convertFailed'))
    } catch (err) {
      if (!isCurrentTracking(controller) || err instanceof JobPollCancelled) return
      const { message } = describeError(err, t('toolsPage.errorFileFallback'))
      setErrorMessage(message)
      showErrorPopup({ message })
    } finally {
      if (isCurrentTracking(controller)) {
        trackControllerRef.current = null
        setIsLoading(false)
      }
    }
  }

  const canonicalUrl = `https://oneforall.io.vn${withLocale(tool.slug, lang)}`

  return (
    <div className="w-full min-h-screen bg-page">

      <SEOHead
        title={tool.title}
        description={tool.metaDescription}
        canonicalUrl={canonicalUrl}
        alternates={{ vi: withLocale(tool.slug, 'vi'), en: withLocale(tool.slug, 'en') }}
        breadcrumbs={breadcrumbsData}
        faqList={tool.faqList}
      />


      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-2">
        <Breadcrumbs items={breadcrumbsData} />
      </div>


      <section className="relative pt-6 pb-14 sm:pb-20 overflow-hidden">



        <div className="absolute inset-0 bg-grid-cyber pointer-events-none" aria-hidden="true" data-parallax="30" />
        <div className="hero-ambient-glow" aria-hidden="true" data-parallax="48" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-8 sm:mb-10">

            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 text-xs font-bold bg-surface/90 border border-brand/40 text-brand badge-angular badge-radar shadow-[0_0_12px_rgba(255,59,48,0.2)]">
              <Zap className="w-3.5 h-3.5" />
              <span>{tool.badge}</span>
            </div>


            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-ink tracking-tight leading-tight heading-in">
              {tool.h1}
            </h1>


            <p className="text-xs sm:text-base text-slate-300 leading-relaxed max-w-2xl mx-auto">
              {tool.subtitle}
            </p>
          </div>


          <div className="max-w-3xl mx-auto">

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
                    popularConversions={popularConversions}
                    resolveFields={resolveParamFields}
                    initialParams={getInitialParamValues(tool.slug)}
                    initialForm={snapshot?.form ?? null}
                    onFormChange={handleFormChange}
                    onSubmit={handleFileSubmit}
                    isLoading={isLoading}
                    disabled={isLoading}
                  />
                )}


                {isLoading && (
                  <JobProgress
                    job={job}
                    onRetry={handleReset}
                    onCancel={handleCancelCurrent}
                    isCancelling={isCancelling}
                  />
                )}
              </div>
            ) : (

              <div className="space-y-6">

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
                  previewUrl={
                    RASTER_PREVIEW_FORMATS.has(resultFormat.toLowerCase()) ? downloadUrl : null
                  }
                  onReset={handleReset}
                />


                <ToolFooterActions />
              </div>
            )}


            {!downloadUrl && tool.introParagraphs?.length ? (
              <div className="mt-8 space-y-3">
                {tool.introParagraphs.map((para) => (
                  <p key={para} className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                    {para}
                  </p>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </section>


      <section data-reveal className="py-14 sm:py-20 bg-page border-y border-edge">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16 space-y-3">
            <h2 className="text-xl sm:text-3xl font-bold text-ink tracking-tight">
              {t('toolsPage.howToUse', { badge: tool.badge })}
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              {t('toolsPage.howToDesc')}
            </p>
          </div>

          <div className="stagger grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" data-reveal-items>
            {tool.howItWorksSteps.map((step) => (
              <div
                key={step.step}
                className="relative p-6 bg-surface border border-[rgba(255,59,48,0.22)] transition-all space-y-3 card-3d card-tilt clip-corner-card"
              >
                <div className="w-10 h-10 flex items-center justify-center font-mono font-bold text-sm text-brand">
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


      <section data-reveal className="py-14 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
            <h2 className="text-xl sm:text-3xl font-bold text-ink tracking-tight">
              {t('toolsPage.whyChoose')}
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              {t('toolsPage.whyChooseDesc')}
            </p>
          </div>

          <div className="stagger grid grid-cols-1 md:grid-cols-3 gap-6" data-reveal-items>
            {tool.features.map((feat) => (
              <div
                key={feat.title}
                className="p-6 bg-surface border border-[rgba(255,59,48,0.22)] space-y-3 card-3d card-tilt clip-corner-card"
              >
                <div className="w-10 h-10 bg-brand/10 border border-brand/30 flex items-center justify-center text-brand clip-corner-btn">
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


      <section data-reveal className="py-12 bg-page border-y border-edge">
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


      {tool.faqList.length > 0 && (
        <section data-reveal className="py-14 sm:py-20">
          <div className="max-w-3xl lg:max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">



            <div className="lg:grid lg:grid-cols-[minmax(0,18rem)_minmax(0,1fr)] lg:gap-10 lg:items-start">
              <div className="lg:sticky lg:top-[96px]">
                <div className="text-center mb-10 space-y-2 lg:text-left lg:mb-0">
                  <h2 className="text-xl sm:text-3xl font-bold text-ink tracking-tight">
                    {t('toolsPage.faqTitle')}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-400">
                    {t('toolsPage.faqDesc', { badge: tool.badge })}
                  </p>
                </div>
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
                        className="w-full p-5 text-left font-semibold text-ink text-xs sm:text-base flex items-center justify-between gap-4 cursor-pointer hover:bg-brand/5"
                      >
                        <span>{faq.q}</span>
                        <ChevronDown
                          className={`w-5 h-5 text-slate-400 shrink-0 transition-transform duration-200 ${
                            isOpen ? 'rotate-180 text-brand' : ''
                          }`}
                        />
                      </button>
                      <div className="acc" data-open={isOpen}>
                        <div>
                          <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-edge bg-page">
                            {faq.a}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </section>
      )}


      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AdSenseUnit slot={import.meta.env.VITE_ADSENSE_SLOT_BOTTOM ?? ''} />
      </div>
      <RelatedTools slugs={tool.relatedSlugs} />
    </div>
  )
}
