import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import {
  Breadcrumbs,
  CategoryNav,
  SEOHead,
  ToolCard,
  ToolGrid,
  ToolSearchField,
  filterTools,
  useToolSearchIndex,
} from '../components'
import { CATEGORY_ICONS } from '../components/common/toolIcons'
import { SEO_TOOLS } from '../config/seoTools'
import { TOOL_CATEGORIES } from '../config/toolCategories'
import { LocaleLink } from '../i18n/LocaleLink'
import { t, useI18n, withLocale } from '../i18n/langStore'

export function ToolsPage() {
  const { lang } = useI18n()
  const [searchParams, setSearchParams] = useSearchParams()
  const query = searchParams.get('q') ?? ''
  const index = useToolSearchIndex()

  const breadcrumbs = useMemo(
    () => [{ name: t('directory.crumb'), url: '/tools' }],
    // eslint-disable-next-line react-hooks/exhaustive-deps -- t() đọc store module, lang mới là trigger
    [lang],
  )

  const matched = useMemo(() => {
    const slugs = filterTools(index, query).map((entry) => entry.slug)
    return slugs.map((slug) => SEO_TOOLS[slug])
  }, [index, query])

  // Canonical giữ sạch '?q=' — tham số chỉ là trạng thái hiển thị, không phải URL để index.
  const setQuery = (next: string) => {
    const trimmed = next.trim()
    setSearchParams(trimmed ? { q: trimmed } : {}, { replace: true })
  }

  return (
    <div className="w-full min-h-screen bg-page">
      <SEOHead
        title={t('directory.seoTitle')}
        description={t('directory.seoDesc')}
        canonicalUrl={`https://oneforall.io.vn${withLocale('/tools', lang)}`}
        alternates={{ vi: withLocale('/tools', 'vi'), en: withLocale('/tools', 'en') }}
        breadcrumbs={breadcrumbs}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-2">
        <Breadcrumbs items={breadcrumbs} />
      </div>

      <section className="pb-14 sm:pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-8">
            <h1 className="text-2xl sm:text-4xl font-extrabold text-ink tracking-tight">
              {t('directory.h1')}
            </h1>
            <p className="text-slate-300 text-xs sm:text-base leading-relaxed">
              {t('directory.intro')}
            </p>
          </div>

          <div className="max-w-xl mx-auto mb-10">
            <ToolSearchField
              dropdown={false}
              size="lg"
              value={query}
              onChange={setQuery}
            />
          </div>

          {query.trim() ? (
            matched.length > 0 ? (
              <div className="space-y-5">
                <p className="text-xs sm:text-sm text-slate-400">
                  {t('directory.count', { count: matched.length })}
                </p>
                <ToolGrid tools={matched} />
              </div>
            ) : (
              <div className="space-y-6">
                <div className="text-center space-y-2 py-6">
                  <p className="text-sm sm:text-base text-ink">
                    {t('directory.noResult', { q: query })}
                  </p>
                  <p className="text-xs sm:text-sm text-slate-400">{t('directory.noResultHint')}</p>
                </div>
                <CategoryNav />
              </div>
            )
          ) : (
            <div className="space-y-10 sm:space-y-12">
              {TOOL_CATEGORIES.map((cat) => {
                const GroupIcon = CATEGORY_ICONS[cat.id]
                return (
                  <section key={cat.id} id={cat.id} className="space-y-4">
                    <div className="flex items-center justify-between gap-4 border-b border-edge pb-3">
                      <h2 className="flex items-center gap-2.5 text-base sm:text-xl font-bold text-ink tracking-tight">
                        <span className="w-8 h-8 shrink-0 grid place-items-center bg-surface border border-edge text-brand clip-corner-btn">
                          <GroupIcon className="w-4 h-4" />
                        </span>
                        {t(cat.nameKey)}
                      </h2>
                      <LocaleLink
                        to={`/${cat.path}`}
                        className="shrink-0 inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-brand hover:underline"
                      >
                        {t('directory.viewAll', { count: cat.toolSlugs.length })}
                        <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                      </LocaleLink>
                    </div>

                    <div
                      className="stagger grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
                      data-reveal-items
                    >
                      {cat.toolSlugs.map((slug) => (
                        <ToolCard key={slug} tool={SEO_TOOLS[slug]} />
                      ))}
                    </div>
                  </section>
                )
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
