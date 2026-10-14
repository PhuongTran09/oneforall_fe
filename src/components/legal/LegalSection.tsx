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
  return (
    <section
      id={section.id}
      className="scroll-mt-24 border border-edge bg-surface p-5 sm:p-7 clip-corner-card"
    >
      <h2 className="text-base sm:text-xl font-bold text-ink tracking-tight mb-3">
        {index + 1}. {section.title}
      </h2>
      <div className="text-xs sm:text-sm text-slate-300 leading-relaxed space-y-3">
        {section.blocks.map(renderBlock)}
      </div>
    </section>
  )
}
