import type { ComponentType } from 'react'
import {
  Archive,
  ArrowLeftRight,
  AtSign,
  Braces,
  Clapperboard,
  Database,
  Download,
  FileArchive,
  FileText,
  FileType,
  Film,
  Image as ImageIcon,
  Images,
  MessagesSquare,
  MonitorPlay,
  Music,
  Ratio,
  Scissors,
  Shrink,
  ThumbsUp,
} from 'lucide-react'
import type { ToolConfig } from '../../config/seoTools'
import type { CategoryId } from '../../config/toolCategories'

export type IconComponent = ComponentType<{ className?: string }>






const CATEGORY_ICONS_BY_CATEGORY: Record<ToolConfig['category'], IconComponent> = {
  youtube: MonitorPlay,
  tiktok: Clapperboard,
  twitter: AtSign,
  facebook: ThumbsUp,
  threads: MessagesSquare,
  convert: ArrowLeftRight,
  media: Music,
  image: ImageIcon,
  document: FileText,
  data: Database,
  archive: Archive,
}






const TOOL_ICONS: Record<string, IconComponent> = {
  '/youtube-downloader': Download,
  '/tiktok-downloader': Clapperboard,
  '/twitter-downloader': AtSign,
  '/facebook-downloader': ThumbsUp,
  '/threads-downloader': MessagesSquare,
  '/video-converter': Film,
  '/audio-converter': Music,
  '/image-converter': Images,
  '/pdf-converter': FileType,
  '/remove-background': Scissors,
  '/image-compressor': Shrink,
  '/image-resizer': Ratio,
  '/data-converter': Braces,
  '/archive-converter': FileArchive,
}


export function ToolIcon({
  category,
  slug,
  className = 'w-5 h-5',
}: {
  category: ToolConfig['category']
  slug?: string
  className?: string
}) {
  const Icon = (slug && TOOL_ICONS[slug]) || CATEGORY_ICONS_BY_CATEGORY[category]
  return <Icon className={className} />
}


export const CATEGORY_ICONS: Record<CategoryId, IconComponent> = {
  downloader: Download,
  converter: ArrowLeftRight,
  image: ImageIcon,
  document: FileText,
  data: Database,
  archive: Archive,
}
