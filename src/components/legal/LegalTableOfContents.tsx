import type { LegalSectionContent } from '../../content/legal/types'
import { t } from '../../i18n/langStore'

export interface LegalTableOfContentsProps {
  sections: LegalSectionContent[]
}

export function LegalTableOfContents({ sections }: LegalTableOfContentsProps) {
  return (
    <nav
      aria-label={t('legal.toc')}
      className="border border-edge bg-surface p-4 clip-corner-card lg:sticky lg:top-24"
    >
      <p className="text-xs font-bold text-ink uppercase tracking-wider mb-3">{t('legal.toc')}</p>
      <ol className="space-y-2">
        {sections.map((s, i) => (
          <li key={s.id}>
            <a
              href={`#${s.id}`}
              className="text-xs sm:text-sm text-slate-400 hover:text-brand transition-colors"
            >
              {i + 1}. {s.title}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  )
}
