import { SEO_TOOLS } from '../../config/seoTools'
import { ToolGrid } from '../common/ToolGrid'

export function ToolsSection() {
  const allTools = Object.values(SEO_TOOLS)

  return (
    <section id="tools" className="py-16 sm:py-24 bg-white border-y border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold bg-white text-[#FF3B30]">
            HỆ THỐNG CÔNG CỤ TRỰC TUYẾN
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Tất cả công cụ bạn cần trong tầm tay
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Mỗi công cụ có landing page và cấu hình riêng biệt, kết nối trực tiếp với backend xử lý chuyên dụng của OneForAll.
          </p>
        </div>

        {/* Responsive ToolGrid with Category Tabs */}
        <ToolGrid tools={allTools} showCategoryFilter={true} />
      </div>
    </section>
  )
}
