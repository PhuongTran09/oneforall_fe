import { Cpu, Layers, MousePointerClick, ListChecks } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription } from '../common/Card'

export function FeaturesSection() {
  const features = [
    {
      icon: <Cpu className="w-6 h-6 text-[#FF3B30]" />,
      title: 'Tốc độ xử lý vượt trội',
      description:
        'Sức mạnh xử lý bất đồng bộ từ FastAPI giúp nhận, phân giải và stream tệp tin với độ trễ tối thiểu, không gây tắc nghẽn hàng đợi.',
      badge: 'FastAPI Async Engine',
    },
    {
      icon: <Layers className="w-6 h-6 text-[#FF6B4A]" />,
      title: 'Hỗ trợ đa dạng định dạng',
      description:
        'Bao phủ hầu hết các chuẩn tệp hình ảnh, video độ nét cao, âm thanh và tài liệu văn phòng phổ biến nhất hiện nay.',
      badge: '50+ Định dạng',
    },
    {
      icon: <MousePointerClick className="w-6 h-6 text-emerald-600" />,
      title: 'Giao diện trực quan, tinh gọn',
      description:
        'Thao tác kéo thả mượt mà, cấu hình thông số rõ ràng, trải nghiệm không gian làm việc sạch sẽ, không quảng cáo gây xao nhãng.',
      badge: 'Modern SaaS UX',
    },
    {
      icon: <ListChecks className="w-6 h-6 text-indigo-600" />,
      title: 'Bảo mật quyền riêng tư',
      description:
        'Tệp tải lên và tệp kết quả được tự động dọn dẹp khỏi Cloudflare R2 sau khi hoàn thành. Không lưu trữ lịch sử cá nhân.',
      badge: 'Privacy First',
    },
  ]

  return (
    <section id="features" className="py-16 sm:py-24 bg-slate-50/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold bg-white text-[#FF3B30]">
            ƯU ĐIỂM CỐT LÕI
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Thiết kế tối ưu cho hiệu suất và độ tin cậy
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            OneForAll kết hợp giao diện React hiện đại cùng sức mạnh backend FastAPI để mang đến nền tảng xử lý file tin cậy và linh hoạt.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {features.map((feat) => (
            <Card key={feat.title} className="p-2 sm:p-4 bg-white border border-slate-200/80">
              <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="w-12 h-12 flex items-center justify-center shrink-0">
                  {feat.icon}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg text-slate-900">{feat.title}</CardTitle>
                  </div>
                  <span className="inline-block text-[11px] font-mono font-medium text-slate-500">
                    {feat.badge}
                  </span>
                </div>
              </CardHeader>
              <div className="px-6 pb-6 pt-1">
                <CardDescription className="text-sm text-slate-600 leading-relaxed">
                  {feat.description}
                </CardDescription>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
