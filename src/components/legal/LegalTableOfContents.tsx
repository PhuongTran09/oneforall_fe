import type { LegalSectionContent } from '../../content/legal/types'

export interface LegalTableOfContentsProps {
  sections: LegalSectionContent[]
}

export function LegalTableOfContents({ sections }: LegalTableOfContentsProps) {
  return (
    <nav
      aria-label="Mục lục"
      className="border border-edge bg-surface p-4 clip-corner-card lg:sticky lg:top-24"
    >
      <p className="text-xs font-bold text-ink uppercase tracking-wider mb-3">Mục lục</p>
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
