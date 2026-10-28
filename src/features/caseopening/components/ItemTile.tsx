import { t } from '../../../i18n/langStore'
import { contrastInk } from '../utils/contrast'

export interface ItemTileProps {
  name: string
  color: string
  rarityColor: string
  imageUrl?: string
  size?: 'sm' | 'md' | 'lg'
  showName?: boolean
  className?: string
}

const SIZES: Record<NonNullable<ItemTileProps['size']>, string> = {
  sm: 'w-full aspect-square',
  md: 'w-20 sm:w-24 lg:w-28 aspect-square',
  lg: 'w-32 sm:w-40 aspect-square',
}

/** Ảnh người dùng tải lên là tuỳ chọn — không có ảnh thì ô màu vẫn là vật phẩm hợp lệ. */
export function ItemTile({ name, color, rarityColor, imageUrl, size = 'sm', showName = false, className = '' }: ItemTileProps) {
  return (
    <div className={`flex flex-col gap-1 min-w-0 ${className}`}>
      <div
        className={`relative overflow-hidden clip-corner-btn border border-edge ${SIZES[size]}`}
        style={{ background: `linear-gradient(145deg, ${color} 0%, rgba(0,0,0,0.55) 100%)` }}
      >
        {imageUrl ? (
          <img src={imageUrl} alt="" decoding="async" className="w-full h-full object-contain p-1.5" />
        ) : (
          <span
            className="absolute inset-0 flex items-center justify-center text-[10px] font-mono uppercase tracking-wider"
            style={{ color: contrastInk(color) }}
          >
            {t('case.noImage')}
          </span>
        )}
        <span className="absolute inset-x-0 bottom-0 h-1" style={{ background: rarityColor }} aria-hidden="true" />
      </div>
      {showName && <span className="truncate text-xs text-soft" title={name}>{name}</span>}
    </div>
  )
}
