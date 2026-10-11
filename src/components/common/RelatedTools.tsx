import { SEO_TOOLS, type ToolConfig } from '../../config/seoTools'
import { ToolCard } from './ToolCard'

export interface RelatedToolsProps {
  slugs: string[]
  title?: string
  description?: string
}

export function RelatedTools({
  slugs,
  title = 'Công cụ liên quan có thể bạn cần',
  description = 'Khám phá thêm các tiện ích chuyển đổi và xử lý đa phương tiện tốc độ cao khác trên OneForAll.',
}: RelatedToolsProps) {
  const tools: ToolConfig[] = slugs
    .map((slug) => SEO_TOOLS[slug])
    .filter((tool): tool is ToolConfig => Boolean(tool))

  if (tools.length === 0) return null

  return (
    <section className="py-12 sm:py-16 border-t border-[#2a2a35]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12 space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            {title}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            {description}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {tools.map((tool) => (
            <ToolCard key={tool.slug} tool={tool} />
          ))}
        </div>
      </div>
    </section>
  )
}
