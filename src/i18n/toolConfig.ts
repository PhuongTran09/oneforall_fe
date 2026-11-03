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


const EN_TOOLS = toolsEn as Record<string, ToolTextOverride>


export function localizeTool(tool: ToolConfig, lang: Lang): ToolConfig {
  return lang === 'en' && EN_TOOLS[tool.slug] ? { ...tool, ...EN_TOOLS[tool.slug] } : tool
}


export function useToolConfig(tool: ToolConfig | undefined): ToolConfig | undefined {
  const { lang } = useI18n()
  return useMemo(() => (tool ? localizeTool(tool, lang) : undefined), [tool, lang])
}

