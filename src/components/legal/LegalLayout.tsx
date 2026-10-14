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
  return (
    <>
      <SEOHead
        title={`${doc.title} | One ForAll`}
        description={doc.description}
        canonicalUrl={`${siteUrl}${doc.route}`}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
        <div className="mb-8 heading-in">
          <h1 className="text-2xl sm:text-4xl font-extrabold text-ink tracking-tight">{doc.title}</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-2">{t('legal.updatedOn')} {doc.lastUpdated}</p>
          <p className="text-xs sm:text-base text-slate-300 leading-relaxed mt-3 max-w-3xl">{doc.intro}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6 lg:gap-10 items-start">
          <LegalTableOfContents sections={doc.sections} />
          <div className="space-y-6">
            {doc.sections.map((section, i) => (
              <LegalSection key={section.id} section={section} index={i} />
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
