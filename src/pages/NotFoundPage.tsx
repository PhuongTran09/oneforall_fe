import { Link } from 'react-router-dom'
import { Home, AlertCircle, ArrowRight } from 'lucide-react'
import { Button } from '../components/common/Button'
import { Card } from '../components/common/Card'
import { SEOHead } from '../components/common/SEOHead'

export function NotFoundPage() {
  const popularTools = [
    { label: 'YouTube sang MP4', to: '/youtube-to-mp4' },
    { label: 'TikTok sang MP4', to: '/tiktok-to-mp4' },
    { label: 'Xóa nền ảnh', to: '/remove-background' },
    { label: 'Chuyển đổi PDF', to: '/pdf-converter' },
    { label: 'Nén dung lượng ảnh', to: '/image-compressor' },
  ]

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <SEOHead
        title="404 - Trang không tồn tại | OneForAll"
        description="Trang bạn tìm kiếm không tồn tại hoặc đã được thay đổi. Khám phá các công cụ trực tuyến miễn phí của OneForAll."
        canonicalUrl="https://oneforall.app/404"
        noindex={true}
      />

      <Card className="max-w-lg w-full p-8 text-center bg-white border border-slate-200/80 space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-red-50 border border-red-200 text-[#FF3B30] flex items-center justify-center mx-auto">
          <AlertCircle className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-mono font-semibold px-2.5 py-0.5 rounded-full bg-red-50 text-[#FF3B30] border border-red-200">
            LỖI 404
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Trang không tồn tại
          </h1>
          <p className="text-sm text-slate-500 leading-relaxed max-w-sm mx-auto">
            Đường dẫn bạn yêu cầu không tìm thấy hoặc đã được chuyển đi. Bạn có thể quay về trang chủ hoặc chọn nhanh các công cụ phổ biến bên dưới.
          </p>
        </div>

        {/* Popular Tools Navigation */}
        <div className="pt-2 border-t border-slate-100 text-left space-y-2">
          <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
            Công cụ phổ biến gợi ý:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {popularTools.map((tool) => (
              <Link
                key={tool.to}
                to={tool.to}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-red-50/50 border border-slate-200/80 hover:border-[#FF3B30]/40 text-xs font-medium text-slate-700 hover:text-[#FF3B30] transition-colors"
              >
                <span>{tool.label}</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </Link>
            ))}
          </div>
        </div>

        <div className="pt-2">
          <Link to="/">
            <Button variant="primary" size="md" fullWidth leftIcon={<Home className="w-4 h-4" />}>
              Quay về trang chủ
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  )
}
