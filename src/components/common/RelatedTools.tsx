import { SEO_TOOLS, type ToolConfig } from '../../config/seoTools'
import { ToolCard } from './ToolCard'
import { t } from '../../i18n/langStore'

export interface RelatedToolsProps {
  slugs: string[]
  title?: string
  description?: string
}

export function RelatedTools({
  slugs,
  title,
  description,
}: RelatedToolsProps) {
  const heading = title ?? t('related.title')
  const sub = description ?? t('related.desc')
  const tools: ToolConfig[] = slugs
    .map((slug) => SEO_TOOLS[slug])
    .filter((tool): tool is ToolConfig => Boolean(tool))

  if (tools.length === 0) return null

  return (
    <section data-reveal className="py-12 sm:py-16 border-t border-edge">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12 space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-ink tracking-tight">
            {heading}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            {sub}
          </p>
        </div>

        <div className="stagger grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6" data-reveal-items>
          {tools.map((tool) => (
            <ToolCard key={tool.slug} tool={tool} />
          ))}
        </div>
      </div>
    </section>
  )
}
