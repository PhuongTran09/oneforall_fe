import { SEO_TOOLS, type ToolConfig } from './seoTools'






export type CategoryId = 'downloader' | 'converter' | 'image' | 'document' | 'data' | 'archive'

export interface CategoryDef {
  id: CategoryId

  path: string
  nameKey: string
  h1Key: string
  descKey: string
  seoTitleKey: string
  toolSlugs: string[]
}

const GROUP_MAP: Record<ToolConfig['category'], CategoryId> = {
  youtube: 'downloader',
  tiktok: 'downloader',
  twitter: 'downloader',
  facebook: 'downloader',
  threads: 'downloader',
  convert: 'converter',
  media: 'converter',
  image: 'image',
  document: 'document',
  data: 'data',
  archive: 'archive',
}

const CATEGORY_ORDER: CategoryId[] = ['downloader', 'converter', 'image', 'document', 'data', 'archive']


export const TOOL_CATEGORIES: CategoryDef[] = CATEGORY_ORDER.map((id) => ({
  id,
  path: `tools/${id}`,
  nameKey: `cat.${id}.name`,
  h1Key: `cat.${id}.h1`,
  descKey: `cat.${id}.desc`,
  seoTitleKey: `cat.${id}.seoTitle`,
  toolSlugs: Object.values(SEO_TOOLS)
    .filter((tool) => GROUP_MAP[tool.category] === id)
    .map((tool) => tool.slug),
}))

export const CATEGORY_BY_ID: Record<CategoryId, CategoryDef> = Object.fromEntries(
  TOOL_CATEGORIES.map((cat) => [cat.id, cat]),
) as Record<CategoryId, CategoryDef>

export function categoryOfSlug(slug: string): CategoryDef | undefined {
  const tool = SEO_TOOLS[slug]
  if (!tool) return undefined
  return CATEGORY_BY_ID[GROUP_MAP[tool.category]]
}

export function toolsOfCategory(id: CategoryId): ToolConfig[] {
  return CATEGORY_BY_ID[id].toolSlugs.map((slug) => SEO_TOOLS[slug])
}

export const DIRECTORY_PATHS: string[] = ['/tools', ...TOOL_CATEGORIES.map((cat) => `/${cat.path}`)]
