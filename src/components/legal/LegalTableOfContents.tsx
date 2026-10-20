import type { LegalSectionContent } from '../../content/legal/types'
import { t } from '../../i18n/langStore'

export interface LegalTableOfContentsProps {
  sections: LegalSectionContent[]
}

export function LegalTableOfContents({ sections }: LegalTableOfContentsProps) {
  const links = (
    <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-1.5">
      {sections.map((s, i) => (
        <li key={s.id}>
          <a
            href={`#${s.id}`}
            className="group flex items-start gap-2.5 clip-corner-btn px-2.5 py-2 text-sm text-soft hover:bg-brand/5 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand transition-colors"
          >
            <span className="mt-px min-w-5 text-[11px] font-semibold tabular-nums text-soft group-hover:text-brand">
              {String(i + 1).padStart(2, '0')}
            </span>
            <span className="leading-5">{s.title}</span>
          </a>
        </li>
      ))}
    </ol>
  )

  return (
    <>
      <details className="lg:hidden overflow-hidden border border-[rgba(255,59,48,0.28)] bg-surface clip-corner-card">
        <summary className="group flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3.5 text-sm font-semibold text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand">
          <span>{t('legal.toc')}</span>
          <span className="flex items-center gap-2">
            <span className="badge-angular border border-edge bg-page px-2 py-0.5 text-[10px] font-bold text-soft">{sections.length}</span>
            <span aria-hidden="true" className="text-lg leading-none text-soft transition-transform group-open:rotate-180">⌄</span>
          </span>
        </summary>
        <nav aria-label={t('legal.toc')} className="border-t border-edge bg-elev/40 p-2">
          {links}
        </nav>
      </details>

      <nav
        aria-label={t('legal.toc')}
        className="hidden border border-[rgba(255,59,48,0.28)] bg-surface clip-corner-card p-4 lg:sticky lg:top-24 lg:block"
      >
        <div className="mb-3 flex items-center justify-between gap-3 px-2.5">
          <p className="text-xs font-bold uppercase tracking-wider text-ink">{t('legal.toc')}</p>
          <span className="badge-angular border border-edge bg-page px-2 py-0.5 text-[10px] font-bold tabular-nums text-soft">{sections.length}</span>
        </div>
        {links}
      </nav>
    </>
  )
}
