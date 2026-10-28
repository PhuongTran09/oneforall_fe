import { Mail, ShieldCheck, Sparkles } from 'lucide-react'
import { openConsentModal } from '../consent/consentStorage'
import { LocaleLink } from '../../i18n/LocaleLink'
import { LanguageToggle } from '../../i18n/LanguageToggle'
import { t } from '../../i18n/langStore'

export function Footer() {
  const currentYear = new Date().getFullYear()

  const youtubeTools = [
    { label: t('footer.ytToMp4'), to: '/youtube-to-mp4' },
    { label: t('footer.ytToMp3'), to: '/youtube-to-mp3' },
    { label: t('footer.ytDownloader'), to: '/youtube-downloader' },
  ]

  const tiktokTools = [
    { label: t('footer.ttToMp4'), to: '/tiktok-to-mp4' },
    { label: t('footer.ttToMp3'), to: '/tiktok-to-mp3' },
    { label: t('footer.ttDownloader'), to: '/tiktok-downloader' },
  ]

  const convertTools = [
    { label: t('footer.convertAll'), to: '/convert' },
    { label: t('footer.pdfConverter'), to: '/pdf-converter' },
    { label: t('footer.docConverter'), to: '/document-converter' },
    { label: t('footer.videoConverter'), to: '/video-converter' },
    { label: t('footer.audioConverter'), to: '/audio-converter' },
  ]

  const imageTools = [
    { label: t('footer.removeBg'), to: '/remove-background' },
    { label: t('footer.compressImg'), to: '/image-compressor' },
    { label: t('footer.resizeImg'), to: '/image-resizer' },
    { label: t('footer.convertImg'), to: '/image-converter' },
  ]

  return (
    <footer className="w-full border-t border-edge bg-page mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 mb-12">
          {/* Brand Info (col-span-2) */}
          <div className="col-span-2 space-y-4">
            <LocaleLink to="/" className="flex items-center gap-2.5">
              <div className="w-10 h-10   flex items-center justify-center">
                <img src="/oneforall.svg" alt="One ForAll Logo" className="w-full h-full object-contain" />
              </div>
              <span className="font-bold text-xl tracking-tight text-ink">
                One<span className="text-brand-gradient"> ForAll</span>
              </span>
            </LocaleLink>
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              {t('footer.desc')}
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a
                href="mailto:support@oneforall.io.vn"
                className="w-9 h-9 bg-elev hover:bg-brand/15 text-slate-400 flex items-center justify-center transition-colors clip-corner-btn"
                aria-label="Email Support"
              >
                <Mail className="w-4 h-4" />
              </a>
            </div>
            <div>
              <LocaleLink
                to="/case-opening"
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-slate-400 hover:text-brand transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                {t('footer.caseOpening')}
              </LocaleLink>
            </div>
          </div>

          {/* Column 1: YouTube Tools */}
          <div>
            <h4 className="text-xs font-bold text-ink uppercase tracking-wider mb-3">
              YouTube
            </h4>
            <ul className="space-y-2">
              {youtubeTools.map((item) => (
                <li key={item.to}>
                  <LocaleLink
                    to={item.to}
                    className="text-xs sm:text-sm text-slate-400 hover:text-brand transition-colors"
                  >
                    {item.label}
                  </LocaleLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 2: TikTok Tools */}
          <div>
            <h4 className="text-xs font-bold text-ink uppercase tracking-wider mb-3">
              TikTok
            </h4>
            <ul className="space-y-2">
              {tiktokTools.map((item) => (
                <li key={item.to}>
                  <LocaleLink
                    to={item.to}
                    className="text-xs sm:text-sm text-slate-400 hover:text-brand transition-colors"
                  >
                    {item.label}
                  </LocaleLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Chuyển đổi File */}
          <div>
            <h4 className="text-xs font-bold text-ink uppercase tracking-wider mb-3">
              {t('footer.colConvert')}
            </h4>
            <ul className="space-y-2">
              {convertTools.map((item) => (
                <li key={item.to}>
                  <LocaleLink
                    to={item.to}
                    className="text-xs sm:text-sm text-slate-400 hover:text-brand transition-colors"
                  >
                    {item.label}
                  </LocaleLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Xử lý Ảnh */}
          <div>
            <h4 className="text-xs font-bold text-ink uppercase tracking-wider mb-3">
              {t('footer.colImages')}
            </h4>
            <ul className="space-y-2">
              {imageTools.map((item) => (
                <li key={item.to}>
                  <LocaleLink
                    to={item.to}
                    className="text-xs sm:text-sm text-slate-400 hover:text-brand transition-colors"
                  >
                    {item.label}
                  </LocaleLink>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-edge/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-1.5 text-emerald-600 font-medium">
            <ShieldCheck className="w-4 h-4" />
            <span>{t('footer.storageNote')}</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-3">
              <LocaleLink to="/terms" className="text-slate-400 hover:text-brand transition-colors">
                {t('common.terms')}
              </LocaleLink>
              <span aria-hidden="true">•</span>
              <LocaleLink to="/privacy" className="text-slate-400 hover:text-brand transition-colors">
                {t('common.privacy')}
              </LocaleLink>
              <span aria-hidden="true">•</span>
              <button
                type="button"
                onClick={() => openConsentModal('custom')}
                className="text-slate-400 hover:text-brand transition-colors cursor-pointer"
              >
                {t('consent.cookieSettings')}
              </button>
            </div>
            <p>{t('footer.copyright', { year: currentYear })}</p>
          </div>
          {/* 768–1279: navbar chưa đủ chỗ, xem ghi chú ở Navbar */}
          <div className="hidden min-[768px]:flex xl:hidden items-center gap-1 text-slate-500">
            <LanguageToggle />
          </div>
        </div>
      </div>
    </footer>
  )
}
