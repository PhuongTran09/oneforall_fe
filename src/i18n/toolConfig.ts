import { useMemo } from 'react'
import type { ToolConfig } from '../config/seoTools'
import toolsEn from './tools.en.json'
import { useI18n } from './langStore'

type ToolTextOverride = Partial<
  Pick<
    ToolConfig,
    | 'title'
    | 'metaDescription'
    | 'h1'
    | 'subtitle'
    | 'badge'
    | 'supportedFormatsDesc'
    | 'introParagraphs'
    | 'howItWorksSteps'
    | 'features'
    | 'faqList'
  >
>

// Text EN theo slug (prerender.js đọc cùng file JSON này khi build)
const EN_TOOLS = toolsEn as Record<string, ToolTextOverride>

/** Merge text EN vào config VI theo lang hiện tại; spread thay array wholesale nên EN phải đủ từng mảng. */
export function useToolConfig(tool: ToolConfig | undefined): ToolConfig | undefined {
  const { lang } = useI18n()
  return useMemo(
    () => (tool && lang === 'en' && EN_TOOLS[tool.slug] ? { ...tool, ...EN_TOOLS[tool.slug] } : tool),
    [tool, lang],
  )
}

