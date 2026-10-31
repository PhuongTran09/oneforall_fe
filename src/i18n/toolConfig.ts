import { useMemo } from 'react'
import type { ToolConfig } from '../config/seoTools'
import toolsEn from './tools.en.json'
import { useI18n, type Lang } from './langStore'

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

/** Gộp text EN vào config VI. Tách thành hàm thuần để danh sách (search, grid) dùng được. */
export function localizeTool(tool: ToolConfig, lang: Lang): ToolConfig {
  return lang === 'en' && EN_TOOLS[tool.slug] ? { ...tool, ...EN_TOOLS[tool.slug] } : tool
}

/** Merge text EN vào config VI theo lang hiện tại; spread thay array wholesale nên EN phải đủ từng mảng. */
export function useToolConfig(tool: ToolConfig | undefined): ToolConfig | undefined {
  const { lang } = useI18n()
  return useMemo(() => (tool ? localizeTool(tool, lang) : undefined), [tool, lang])
}

