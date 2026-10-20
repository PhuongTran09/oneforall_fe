import type { ReactNode } from 'react'
import type { LegalBlock, LegalInline, LegalSectionContent } from '../../content/legal/types'

function renderInline(part: LegalInline, i: number): ReactNode {
  if (typeof part === 'string') return part
  if ('b' in part) {
    return (
      <strong key={i} className="text-ink font-semibold">
        {part.b}
      </strong>
    )
  }
  return (
    <a key={i} href={part.href} className="text-brand hover:underline break-all">
      {part.a}
    </a>
  )
}

function renderBlock(block: LegalBlock, i: number): ReactNode {
  if (block.type === 'p') {
    return <p key={i}>{block.parts.map(renderInline)}</p>
  }
  return (
    <ul key={i} className="list-disc pl-5 space-y-1">
      {block.items.map((item, j) => (
        <li key={j}>{item.map(renderInline)}</li>
      ))}
    </ul>
  )
}

export interface LegalSectionProps {
  section: LegalSectionContent
  index: number
}

export function LegalSection({ section, index }: LegalSectionProps) {
  const emphasis = section.tone === 'warning'
    ? 'border-[rgba(255,59,48,0.45)] bg-brand/5'
    : 'border-edge bg-surface hover:border-[rgba(255,59,48,0.30)]'

  return (
    <section
      id={section.id}
      aria-labelledby={`${section.id}-heading`}
      className={`scroll-mt-24 border clip-corner-card p-5 sm:p-7 lg:p-8 transition-colors ${emphasis}`}
    >
      <h2 id={`${section.id}-heading`} className="mb-4 flex items-start gap-3 text-base font-bold tracking-tight text-ink sm:text-xl">
        <span aria-hidden="true" className="mt-0.5 inline-flex h-7 min-w-7 items-center justify-center clip-corner-btn border border-brand/30 bg-brand/10 px-1.5 text-xs font-bold tabular-nums text-brand">
          {String(index + 1).padStart(2, '0')}
        </span>
        <span>{section.title}</span>
      </h2>
      <div className="space-y-4 text-sm leading-7 text-slate-300 sm:text-base sm:leading-7 [&_li]:pl-1 [&_ul]:space-y-2 [&_ul]:marker:text-brand [&_p]:max-w-3xl">
        {section.blocks.map(renderBlock)}
      </div>
    </section>
  )
}
