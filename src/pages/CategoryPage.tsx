import { useMemo } from 'react'
import { ArrowRight } from 'lucide-react'
import { Breadcrumbs, CategoryNav, SEOHead, ToolGrid } from '../components'
import { mergePairs } from '../config/formatSuggestions'
import { CATEGORY_BY_ID, toolsOfCategory, type CategoryId } from '../config/toolCategories'
import { LocaleLink } from '../i18n/LocaleLink'
import { t, useI18n, withLocale } from '../i18n/langStore'

export interface CategoryPageProps {
  categoryId: CategoryId
}

export function CategoryPage({ categoryId }: CategoryPageProps) {
  const { lang } = useI18n()
  const cat = CATEGORY_BY_ID[categoryId]
  const tools = useMemo(() => toolsOfCategory(categoryId), [categoryId])

  const breadcrumbs = useMemo(
    () => [
      { name: t('directory.crumb'), url: '/tools' },
      { name: t(cat.nameKey), url: `/${cat.path}` },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps -- t() đọc store module, lang mới là trigger
    [lang, cat.nameKey, cat.path],
  )

  // Cặp định dạng đã được resolveRoute() kiểm chứng — nhóm nào không chuyển định dạng
  // (downloader, image_process) thì dải này rỗng và block không render.
  const pairs = useMemo(() => mergePairs(tools), [tools])

  return (
    <div className="w-full min-h-screen bg-page">
      <SEOHead
        title={t(cat.seoTitleKey)}
        description={t(cat.descKey)}
        canonicalUrl={`https://oneforall.io.vn${withLocale(`/${cat.path}`, lang)}`}
        alternates={{
          vi: withLocale(`/${cat.path}`, 'vi'),
          en: withLocale(`/${cat.path}`, 'en'),
        }}
        breadcrumbs={breadcrumbs}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-2">
        <Breadcrumbs items={breadcrumbs} />
      </div>

      <section className="pb-14 sm:pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-8">
            <h1 className="text-2xl sm:text-4xl font-extrabold text-ink tracking-tight">
              {t(cat.h1Key)}
            </h1>
            <p className="text-slate-300 text-xs sm:text-base leading-relaxed">{t(cat.descKey)}</p>
          </div>

          <div className="mb-8">
            <CategoryNav />
          </div>

          {pairs.length > 0 && (
            <div className="mb-10 p-5 sm:p-6 bg-surface border border-edge clip-corner-card">
              <h2 className="text-xs sm:text-sm font-bold text-ink uppercase tracking-wide mb-3">
                {t('formatPicker.popularTitle')}
              </h2>
              <div className="flex flex-wrap gap-2">
                {pairs.map((pair) => (
                  <LocaleLink
                    key={`${pair.slug}-${pair.from}-${pair.to}`}
                    to={pair.slug}
                    className="inline-flex items-center gap-1.5 h-8 px-3 text-[11px] sm:text-xs font-mono uppercase text-slate-300 bg-page border border-edge hover:text-brand hover:border-[rgba(255,59,48,0.5)] transition-colors clip-corner-btn"
                  >
                    {pair.from}
                    <ArrowRight className="w-3 h-3 text-brand" aria-hidden="true" />
                    {pair.to}
                  </LocaleLink>
                ))}
              </div>
            </div>
          )}

          <p className="text-xs sm:text-sm text-slate-400 mb-5">
            {t('directory.count', { count: tools.length })}
          </p>
          <ToolGrid tools={tools} />

          <div className="mt-12 text-center">
            <LocaleLink
              to="/tools"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-brand hover:underline"
            >
              {t('directory.allTools')}
              <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </LocaleLink>
          </div>
        </div>
      </section>
    </div>
  )
}
