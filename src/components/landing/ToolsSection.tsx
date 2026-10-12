import { SEO_TOOLS } from '../../config/seoTools'
import { ToolGrid } from '../common/ToolGrid'
import { t } from '../../i18n/langStore'

export function ToolsSection() {
  const allTools = Object.values(SEO_TOOLS)

  return (
    <section id="tools" className="py-16 sm:py-24 bg-page border-y border-edge">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold bg-surface border border-[rgba(255,59,48,0.35)] text-[#FF3B30] badge-angular">
            {t('toolsSection.badge')}
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-ink tracking-tight">
            {t('toolsSection.title')}
          </h2>
          <p className="text-slate-300 text-xs sm:text-base leading-relaxed">
            {t('toolsSection.desc')}
          </p>
        </div>

        {/* Responsive ToolGrid with Category Tabs */}
        <ToolGrid tools={allTools} showCategoryFilter={true} />
      </div>
    </section>
  )
}
