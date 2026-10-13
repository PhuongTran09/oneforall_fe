import { useEffect, useRef, useState, type ComponentType } from 'react'
import { ArrowLeftRight, Image as ImageIcon, LayoutGrid, Video } from 'lucide-react'
import { ToolCard, YoutubeIcon } from './ToolCard'
import type { ToolConfig } from '../../config/seoTools'
import { t } from '../../i18n/langStore'

export interface ToolGridProps {
  tools: ToolConfig[]
  showCategoryFilter?: boolean
}

const categories: { id: string; icon: ComponentType<{ className?: string }> }[] = [
  { id: 'all', icon: LayoutGrid },
  { id: 'youtube', icon: YoutubeIcon },
  { id: 'tiktok', icon: Video },
  { id: 'convert', icon: ArrowLeftRight },
  { id: 'image', icon: ImageIcon },
]

function categoryLabel(id: string): string {
  switch (id) {
    case 'all':
      return t('toolsGrid.all')
    case 'youtube':
      return t('toolsGrid.ytDownloader')
    case 'tiktok':
      return t('toolsGrid.ttDownloader')
    case 'convert':
      return t('toolsGrid.convert')
    case 'image':
      return t('toolsGrid.image')
    default:
      return id
  }
}

export function ToolGrid({ tools, showCategoryFilter = true }: ToolGridProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const filteredTools = selectedCategory === 'all'
    ? tools
    : tools.filter((tool) => {
        if (selectedCategory === 'convert') {
          return tool.category === 'convert' || tool.category === 'document' || tool.category === 'media'
        }
        return tool.category === selectedCategory
      })

  // Mờ dần ở mép phải chỉ hiện khi còn danh mục bị cuộnHidden phía sau;
  // ResizeObserver đo lại khi đổi breakpoint, scroll listener đo khi vuốt.
  const railRef = useRef<HTMLDivElement>(null)
  const [railHasMore, setRailHasMore] = useState(false)

  useEffect(() => {
    const rail = railRef.current
    if (!rail) return
    const measure = () =>
      setRailHasMore(rail.scrollLeft + rail.clientWidth < rail.scrollWidth - 4)
    rail.addEventListener('scroll', measure, { passive: true })
    const observer = new ResizeObserver(measure)
    observer.observe(rail)
    return () => {
      rail.removeEventListener('scroll', measure)
      observer.disconnect()
    }
  }, [])

  return (
    <div className="space-y-6">
      {showCategoryFilter && (
        <div className="relative">
          <div
            ref={railRef}
            className="flex items-center gap-2 overflow-x-auto scroll-smooth motion-reduce:scroll-auto scrollbar-none py-1 px-1 -mx-1 pb-3 justify-start md:justify-center"
          >
            {categories.map((cat) => {
              const isActive = selectedCategory === cat.id
              const CatIcon = cat.icon
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  aria-pressed={isActive}
                  className={`h-9 sm:h-11 shrink-0 inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 md:px-5 text-xs sm:text-sm whitespace-nowrap cursor-pointer clip-corner-btn transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#FF3B30] ${
                    isActive
                      ? 'bg-brand-gradient text-white font-semibold border border-[rgba(255,107,74,0.6)]'
                      : 'bg-surface text-slate-400 font-medium border border-edge hover:bg-[rgba(255,59,48,0.08)] hover:text-slate-100 hover:border-[rgba(255,59,48,0.35)] hover:-translate-y-px active:translate-y-0'
                  }`}
                >
                  <CatIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                  {categoryLabel(cat.id)}
                </button>
              )
            })}
          </div>
          <div
            aria-hidden="true"
            className={`pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-page to-transparent transition-opacity duration-200 md:hidden ${
              railHasMore ? 'opacity-100' : 'opacity-0'
            }`}
          />
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {filteredTools.map((tool) => (
          <ToolCard key={tool.slug} tool={tool} />
        ))}
      </div>
    </div>
  )
}
