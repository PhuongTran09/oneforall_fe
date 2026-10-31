import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { LayoutGrid } from 'lucide-react'
import { ToolCard } from './ToolCard'
import { CATEGORY_ICONS } from './toolIcons'
import { TOOL_CATEGORIES } from '../../config/toolCategories'
import type { ToolConfig } from '../../config/seoTools'
import { LocaleLink } from '../../i18n/LocaleLink'
import { t, withLocale } from '../../i18n/langStore'

export interface ToolGridProps {
  tools: ToolConfig[]
  /** Dải điều hướng giữa '/tools' và 6 trang danh mục — bật trên các trang đó, tắt ở nơi khác. */
  showCategoryNav?: boolean
}

const chips = [
  { path: '/tools', labelKey: 'directory.allTools', icon: LayoutGrid },
  ...TOOL_CATEGORIES.map((cat) => ({
    path: `/${cat.path}`,
    labelKey: cat.nameKey,
    icon: CATEGORY_ICONS[cat.id],
  })),
]

export function CategoryNav() {
  const location = useLocation()

  // Mờ dần ở mép phải chỉ hiện khi còn chip bị cuộn ẩn phía sau;
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
    measure()
    return () => {
      rail.removeEventListener('scroll', measure)
      observer.disconnect()
    }
  }, [])

  return (
    <div className="relative">
      <div
        ref={railRef}
        className="flex items-center gap-2 overflow-x-auto scroll-smooth motion-reduce:scroll-auto scrollbar-none py-1 px-1 -mx-1 pb-3 justify-start md:justify-center"
      >
        {chips.map(({ path, labelKey, icon: ChipIcon }) => {
          const isActive = location.pathname === withLocale(path)
          return (
            <LocaleLink
              key={path}
              to={path}
              aria-current={isActive ? 'page' : undefined}
              className={`h-9 sm:h-11 shrink-0 inline-flex items-center gap-2 sm:gap-2.5 px-3 sm:px-4 md:px-5 text-xs sm:text-sm whitespace-nowrap cursor-pointer clip-corner-btn transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#FF3B30] ${
                isActive
                  ? 'bg-brand-gradient text-white font-semibold border border-[rgba(255,107,74,0.6)]'
                  : 'bg-surface text-slate-400 font-medium border border-edge hover:bg-[rgba(255,59,48,0.08)] hover:text-slate-100 hover:border-[rgba(255,59,48,0.35)] hover:-translate-y-px active:translate-y-0'
              }`}
            >
              {/* 18px ở desktop: icon lucide chỉ tô trong 16/24 ô, để 16px cạnh
                  chữ 14px thì nó nhẹ hơn hẳn, trông rời thành hai khối. */}
              <ChipIcon className="w-4 h-4 sm:w-4.5 sm:h-4.5 shrink-0" />
              {t(labelKey)}
            </LocaleLink>
          )
        })}
      </div>
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-y-0 right-0 w-10 bg-linear-to-l from-page to-transparent transition-opacity duration-200 md:hidden ${
          railHasMore ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </div>
  )
}

export function ToolGrid({ tools, showCategoryNav = false }: ToolGridProps) {
  return (
    <div className="space-y-6">
      {showCategoryNav && <CategoryNav />}

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
}
