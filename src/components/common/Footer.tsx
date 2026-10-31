import { LayoutGrid, Mail, ShieldCheck, Shuffle, Sparkles } from 'lucide-react'
import { openConsentModal } from '../consent/consentStorage'
import { LocaleLink } from '../../i18n/LocaleLink'
import { LanguageToggle } from '../../i18n/LanguageToggle'
import { t, useI18n } from '../../i18n/langStore'
import { localizeTool } from '../../i18n/toolConfig'
import { SEO_TOOLS } from '../../config/seoTools'
import { TOOL_CATEGORIES } from '../../config/toolCategories'

export function Footer() {
  const currentYear = new Date().getFullYear()
  const { lang } = useI18n()

  // Danh mục + nhãn tool lấy hết từ registry: thêm tool vào SEO_TOOLS là nó tự
  // xuất hiện ở footer. Bốn mảng chép tay trước đây chính là lý do thiếu 2 tool.
  const columns = TOOL_CATEGORIES.map((cat) => ({
    id: cat.id,
    title: t(cat.nameKey),
    to: `/${cat.path}`,
    items: cat.toolSlugs.map((slug) => ({
      to: slug,
      label: localizeTool(SEO_TOOLS[slug], lang).badge,
    })),
  }))

  return (
    <footer className="w-full border-t border-edge bg-page mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid gap-8 mb-12 lg:grid-cols-[minmax(0,24rem)_minmax(0,1fr)]">
          {/* Brand Info */}
          <div className="space-y-4">
            <LocaleLink to="/" className="flex items-center gap-2.5">
              <div className="w-10 h-10 grid place-items-center">
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
            <div className="flex flex-col items-start gap-2">
              <LocaleLink
                to="/tools"
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-ink hover:text-brand transition-colors"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                {t('directory.allTools')}
              </LocaleLink>
              <LocaleLink
                to="/case-opening"
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-slate-400 hover:text-brand transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                {t('footer.caseOpening')}
              </LocaleLink>
              <LocaleLink
                to="/square-spin"
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-slate-400 hover:text-brand transition-colors"
              >
                <Shuffle className="w-3.5 h-3.5" />
                {t('footer.squareSpin')}
              </LocaleLink>
            </div>
          </div>

          {/* 6 nhóm công cụ, mỗi nhóm một cột. Heading là link về trang danh mục
              nên chân trang điều hướng được theo nhóm chứ không chỉ theo tool. */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-8">
            {columns.map((col) => (
              <div key={col.id}>
                <h4 className="text-xs font-bold uppercase tracking-wider mb-3">
                  <LocaleLink to={col.to} className="text-ink hover:text-brand transition-colors">
                    {col.title}
                  </LocaleLink>
                </h4>
                <ul className="space-y-2">
                  {col.items.map((item) => (
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
            ))}
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
