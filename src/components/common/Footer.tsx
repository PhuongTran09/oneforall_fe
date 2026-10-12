import { MessageSquare, Mail, ShieldCheck } from 'lucide-react'
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
                <img src="/oneforall.svg" alt="OneForAll Logo" className="w-full h-full object-contain" />
              </div>
              <span className="font-bold text-xl tracking-tight text-ink">
                One<span className="text-brand-gradient">ForAll</span>
              </span>
            </LocaleLink>
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              {t('footer.desc')}
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 bg-elev hover:bg-[#ff3b30]/15 text-slate-400 flex items-center justify-center transition-colors clip-corner-btn"
                aria-label="GitHub Repository"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
              </a>
              <a
                href="https://discord.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 bg-elev hover:bg-[#ff3b30]/15 text-slate-400 flex items-center justify-center transition-colors clip-corner-btn"
                aria-label="Discord Community"
              >
                <MessageSquare className="w-4 h-4" />
              </a>
              <a
                href="mailto:support@oneforall.app"
                className="w-9 h-9 bg-elev hover:bg-[#ff3b30]/15 text-slate-400 flex items-center justify-center transition-colors clip-corner-btn"
                aria-label="Email Support"
              >
                <Mail className="w-4 h-4" />
              </a>
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
                    className="text-xs sm:text-sm text-slate-400 hover:text-[#FF3B30] transition-colors"
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
                    className="text-xs sm:text-sm text-slate-400 hover:text-[#FF3B30] transition-colors"
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
                    className="text-xs sm:text-sm text-slate-400 hover:text-[#FF3B30] transition-colors"
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
                    className="text-xs sm:text-sm text-slate-400 hover:text-[#FF3B30] transition-colors"
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
              <LocaleLink to="/terms" className="text-slate-400 hover:text-[#FF3B30] transition-colors">
                {t('common.terms')}
              </LocaleLink>
              <span aria-hidden="true">•</span>
              <LocaleLink to="/privacy" className="text-slate-400 hover:text-[#FF3B30] transition-colors">
                {t('common.privacy')}
              </LocaleLink>
              <span aria-hidden="true">•</span>
              <button
                type="button"
                onClick={() => openConsentModal('custom')}
                className="text-slate-400 hover:text-[#FF3B30] transition-colors cursor-pointer"
              >
                {t('consent.cookieSettings')}
              </button>
            </div>
            <p>{t('footer.copyright', { year: currentYear })}</p>
          </div>
          <div className="flex items-center gap-1 text-slate-500">
            <LanguageToggle />
          </div>
        </div>
      </div>
    </footer>
  )
}
