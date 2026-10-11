import { useState } from 'react'
import { ToolCard } from './ToolCard'
import type { ToolConfig } from '../../config/seoTools'

export interface ToolGridProps {
  tools: ToolConfig[]
  showCategoryFilter?: boolean
}

export function ToolGrid({ tools, showCategoryFilter = true }: ToolGridProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const categories = [
    { id: 'all', label: 'Tất cả công cụ' },
    { id: 'youtube', label: 'YouTube Downloader' },
    { id: 'tiktok', label: 'TikTok Downloader' },
    { id: 'convert', label: 'Chuyển đổi File' },
    { id: 'image', label: 'Xử lý Ảnh' },
  ]

  const filteredTools = selectedCategory === 'all'
    ? tools
    : tools.filter((tool) => {
        if (selectedCategory === 'convert') {
          return tool.category === 'convert' || tool.category === 'document' || tool.category === 'media'
        }
        return tool.category === selectedCategory
      })

  return (
    <div className="space-y-6">
      {showCategoryFilter && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none justify-start md:justify-center">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-brand-gradient text-white shadow-brand-sm font-semibold'
                  : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200/90 hover:bg-slate-50'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {filteredTools.map((tool) => (
          <ToolCard key={tool.slug} tool={tool} />
        ))}
      </div>
    </div>
  )
}
