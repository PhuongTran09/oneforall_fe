import { useMemo, type ReactNode } from 'react'
import { SEO_TOOLS } from '../../config/seoTools'
import { categoryOfSlug } from '../../config/toolCategories'
import { ToolIcon } from './toolIcons'
import { localizeTool } from '../../i18n/toolConfig'
import { t, useI18n } from '../../i18n/langStore'
import type { Lang } from '../../i18n/langStore'

export interface ToolSearchEntry {
  slug: string
  name: string
  hint: string
  icon: ReactNode
  haystack: string
}

/** Bỏ dấu tiếng Việt để "chuyen doi" vẫn tìm ra "Chuyển đổi". */
function fold(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

function buildIndex(lang: Lang): ToolSearchEntry[] {
  return Object.values(SEO_TOOLS).map((tool) => {
    const localized = localizeTool(tool, lang)
    const category = categoryOfSlug(tool.slug)
    const haystack = [
      localized.badge,
      localized.h1,
      localized.subtitle,
      tool.defaultFormat,
      ...tool.outputFormats,
      tool.category,
      category ? t(category.nameKey) : '',
    ]
      .join(' · ')
      .toLowerCase()
    return {
      slug: tool.slug,
      name: localized.h1,
      hint: localized.badge,
      icon: <ToolIcon category={tool.category} slug={tool.slug} className="w-4 h-4" />,
      haystack,
    }
  })
}

/** Điểm càng cao càng đúng ý người gõ: khớp nhãn ngắn > khớp tên > khớp mô tả. */
function scoreEntry(entry: ToolSearchEntry, query: string): number {
  const q = fold(query)
  if (!q) return 0
  const haystack = fold(entry.haystack)
  if (!haystack.includes(q)) return -1
  let score = 10
  if (fold(entry.hint).includes(q)) score += 30
  if (fold(entry.name).includes(q)) score += 20
  if (fold(entry.hint).startsWith(q) || fold(entry.name).startsWith(q)) score += 20
  return score
}

export function useToolSearchIndex(): ToolSearchEntry[] {
  const { lang } = useI18n()
  return useMemo(() => buildIndex(lang), [lang])
}

export function filterTools(index: ToolSearchEntry[], query: string): ToolSearchEntry[] {
  if (!query.trim()) return []
  return index
    .map((entry) => ({ entry, score: scoreEntry(entry, query) }))
    .filter((hit) => hit.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((hit) => hit.entry)
}
