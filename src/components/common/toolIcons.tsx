import type { ComponentType } from 'react'
import {
  Archive,
  ArrowLeftRight,
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
  MonitorPlay,
  Music,
  Music2,
  Ratio,
  Scissors,
  Shrink,
  Video,
} from 'lucide-react'
import type { ToolConfig } from '../../config/seoTools'
import type { CategoryId } from '../../config/toolCategories'

export type IconComponent = ComponentType<{ className?: string }>

/**
 * Nhóm nào cũng một nét: toàn bộ là lucide outline, stroke=currentColor, viewBox 24.
 * Brand SVG (fill đặc) từng khiến 4 tool tải media trông khác hẳn 13 tool còn lại, và
 * nó ăn theo màu nền chứ không theo trạng thái hover của thẻ.
 */
const CATEGORY_ICONS_BY_CATEGORY: Record<ToolConfig['category'], IconComponent> = {
  youtube: MonitorPlay,
  tiktok: Clapperboard,
  convert: ArrowLeftRight,
  media: Music,
  image: ImageIcon,
  document: FileText,
  data: Database,
  archive: Archive,
}

/**
 * Icon riêng theo slug — chỉ khác khi hành kháchác thật, để không phải mở hai trang
 * mới biết thẻ nào là nén ảnh, thẻ nào là đổi kích thước. Tool mới chưa có ở đây
 * tự rơi về icon nhóm, nên menu không bao giờ thiếu mục.
 */
const TOOL_ICONS: Record<string, IconComponent> = {
  '/youtube-to-mp3': Music,
  '/youtube-downloader': Download,
  '/tiktok-to-mp4': Video,
  '/tiktok-to-mp3': Music2,
  '/tiktok-downloader': Clapperboard,
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

/** Icon của một tool: slug đi trước rồi tới category. Không màu hardcode — hộp bao quanh quyết định màu. */
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

/** Icon nhận diện nhóm — một map duy nhất cho mega-menu, footer, rail chip và trang danh mục. */
export const CATEGORY_ICONS: Record<CategoryId, IconComponent> = {
  downloader: Download,
  converter: ArrowLeftRight,
  image: ImageIcon,
  document: FileText,
  data: Database,
  archive: Archive,
}
