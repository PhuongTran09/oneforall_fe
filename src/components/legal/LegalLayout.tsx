import { SEOHead } from '../common/SEOHead'
import { LegalSection } from './LegalSection'
import { LegalTableOfContents } from './LegalTableOfContents'
import { t } from '../../i18n/langStore'
import type { LegalDoc } from '../../content/legal/types'

export interface LegalLayoutProps {
  doc: LegalDoc
  siteUrl: string
}

export function LegalLayout({ doc, siteUrl }: LegalLayoutProps) {
  // Host phục vụ trang tĩnh dạng thư mục kèm 307 (/privacy -> /privacy/), nên URL cuối luôn có
  // dấu /; canonical và hreflang phải khai đúng URL đó, cùng quy ước với landing page.
  const viRoute = `${doc.route.replace(/^\/en/, '')}/`
  const enRoute = `/en${viRoute}`

  return (
    <>
      <SEOHead
        title={`${doc.title} | One ForAll`}
        description={doc.description}
        canonicalUrl={`${siteUrl}${doc.route}/`}
        alternates={{ vi: viRoute, en: enRoute }}
      />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        <header className="heading-in mb-7 sm:mb-10 border border-[rgba(255,59,48,0.35)] bg-surface clip-corner-lg card-3d p-5 sm:p-8 lg:p-10">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="inline-flex items-center badge-angular border border-brand/30 bg-brand/10 px-3 py-1 text-[10px] sm:text-xs font-bold tracking-wide text-brand">
              {t('legal.updatedOn')} {doc.lastUpdated}
            </span>
            <span className="text-xs text-soft">
              {doc.sections.length} {t('legal.sections')}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-ink tracking-tight">{doc.title}</h1>
          <p className="text-sm sm:text-base text-soft leading-7 mt-4 max-w-3xl">{doc.intro}</p>
        </header>

        <section aria-label={doc.quickFactsTitle} className="mb-7 sm:mb-10">
          <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-brand-2">{doc.quickFactsTitle}</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {doc.quickFacts.map((fact, index) => (
              <article key={fact.label} className="border border-edge bg-surface clip-corner-card p-4 sm:p-5">
                <div className="mb-2 flex items-center gap-2">
                  <span aria-hidden="true" className="inline-flex h-6 min-w-6 items-center justify-center badge-angular border border-brand/30 bg-brand/10 px-1 text-[10px] font-bold tabular-nums text-brand">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <h3 className="text-sm font-bold text-ink">{fact.label}</h3>
                </div>
                <p className="text-sm leading-6 text-soft">{fact.text}</p>
              </article>
            ))}
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)] gap-5 lg:gap-10 items-start">
          <LegalTableOfContents sections={doc.sections} />
          <div className="min-w-0 space-y-4 sm:space-y-5">
            {doc.sections.map((section, i) => (
              <LegalSection key={section.id} section={section} index={i} />
            ))}
          </div>
        </div>
      </main>
    </>
  )
}
