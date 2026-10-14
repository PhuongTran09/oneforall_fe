import { ChevronRight, Home } from 'lucide-react'
import { LocaleLink } from '../../i18n/LocaleLink'
import { t } from '../../i18n/langStore'

export interface BreadcrumbItem {
  name: string
  url: string
}

export interface BreadcrumbsProps {
  items: BreadcrumbItem[]
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className="py-3 px-4 sm:px-0">
      <ol className="flex items-center flex-wrap gap-1.5 text-xs sm:text-sm text-slate-400">
        <li className="inline-flex items-center">
          <LocaleLink
            to="/"
            className="inline-flex items-center gap-1 text-slate-400 hover:text-brand transition-colors"
          >
            <Home className="w-3.5 h-3.5" />
            <span>{t('common.home')}</span>
          </LocaleLink>
        </li>

        {items.map((item, index) => {
          const isLast = index === items.length - 1
          return (
            <li key={`${item.url}-${index}`} className="inline-flex items-center gap-1.5">
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              {isLast ? (
                <span className="font-semibold text-slate-100" aria-current="page">
                  {item.name}
                </span>
              ) : (
                <LocaleLink
                  to={item.url}
                  className="text-slate-400 hover:text-brand transition-colors"
                >
                  {item.name}
                </LocaleLink>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
