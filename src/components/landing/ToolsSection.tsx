import { ArrowRight } from 'lucide-react'
import { SectionHeading } from '../common/SectionHeading'
import { ToolCard } from '../common/ToolCard'
import { CategoryNav } from '../common/ToolGrid'
import { CATEGORY_ICONS } from '../common/toolIcons'
import { SEO_TOOLS } from '../../config/seoTools'
import { TOOL_CATEGORIES } from '../../config/toolCategories'
import { LocaleLink } from '../../i18n/LocaleLink'
import { t } from '../../i18n/langStore'

/**
 * Số thẻ tối đa mỗi nhóm trên trang chủ. Registry thật có 17 tool, chia 6/4/3/2/1/1 —
 * nhóm nào dưới trần thì hiện hết, không giấu cái nào sau một liên kết.
 */
const PREVIEW_SIZE = 3

/**
 * Thừa đúng một thẻ mà vẫn giấu nó rồi bảo "xem tất cả" là tự thêm một cú bấm để tìm lại
 * một công cụ có thật — thà để lưới lẻ một ô.
 */
const visibleSlugs = (slugs: string[]): string[] =>
  slugs.length <= PREVIEW_SIZE + 1 ? slugs : slugs.slice(0, PREVIEW_SIZE)

export function ToolsSection() {
  return (
    <section id="tools" data-reveal className="py-16 sm:py-24 bg-page border-y border-edge">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          badge={t('toolsSection.badge')}
          title={t('toolsSection.title')}
          desc={t('toolsSection.desc')}
        />

        {/* Dải chip của chính trang '/tools' — dùng lại để người đọc thấy hết sáu nhóm
            trước khi cuộn, thay vì phải lần từng tiêu đề nhóm. Link trỏ đúng trang danh
            mục đã có trong router, không thêm route mới. */}
        <div className="mt-8 mb-10">
          <CategoryNav />
        </div>

        <div className="space-y-10 sm:space-y-12">
          {TOOL_CATEGORIES.map((cat) => {
            const GroupIcon = CATEGORY_ICONS[cat.id]
            const shown = visibleSlugs(cat.toolSlugs)
            const hidden = cat.toolSlugs.length - shown.length
            const tools = shown.map((slug) => SEO_TOOLS[slug])
            return (
              <div key={cat.id} className="space-y-4">
                <div className="flex items-center justify-between gap-4 border-b border-edge pb-3">
                  <h3 className="flex items-center gap-2.5 text-sm sm:text-lg font-bold text-ink tracking-tight">
                    <span className="w-8 h-8 shrink-0 grid place-items-center bg-surface border border-edge text-brand clip-corner-btn">
                      <GroupIcon className="w-4 h-4" />
                    </span>
                    {t(cat.nameKey)}
                  </h3>
                  {hidden > 0 && (
                    <LocaleLink
                      to={`/${cat.path}`}
                      className="shrink-0 inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-brand hover:underline"
                    >
                      {t('directory.viewAll', { count: cat.toolSlugs.length })}
                      <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                    </LocaleLink>
                  )}
                </div>

                <div
                  className="stagger grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
                  data-reveal-items
                >
                  {tools.map((tool) => (
                    <ToolCard key={tool.slug} tool={tool} />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
