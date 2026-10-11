import { UploadCloud, SlidersHorizontal, Cpu, Download, ArrowRight } from 'lucide-react'
import { Card } from '../common/Card'

export function HowItWorksSection() {
  const steps = [
    {
      step: '01',
      title: 'Tải lên hoặc dán URL',
      description: 'Dán đường dẫn video YouTube / TikTok hoặc kéo thả tệp tin từ thiết bị của bạn.',
      icon: <UploadCloud className="w-6 h-6 text-[#FF3B30]" />,
    },
    {
      step: '02',
      title: 'Chọn công cụ & tùy chọn',
      description: 'Lựa chọn định dạng đích (MP4, MP3, PDF, PNG...), thiết lập độ phân giải hoặc chất lượng.',
      icon: <SlidersHorizontal className="w-6 h-6 text-[#FF6B4A]" />,
    },
    {
      step: '03',
      title: 'Xử lý tự động',
      description: 'Backend FastAPI tiếp nhận, khởi chạy Celery worker xử lý bất đồng bộ tốc độ cao.',
      icon: <Cpu className="w-6 h-6 text-indigo-500" />,
    },
    {
      step: '04',
      title: 'Tải về kết quả',
      description: 'Nhận tệp tin thành phẩm chất lượng cao ngay lập tức qua liên kết tải an toàn.',
      icon: <Download className="w-6 h-6 text-emerald-600" />,
    },
  ]

  return (
    <section id="how-it-works" className="py-16 sm:py-24 bg-[#0a0a0f] border-y border-[#2a2a35]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold bg-[#14141b] text-[#FF3B30]">
            QUY TRÌNH TINH GỌN
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Cách thức hoạt động của OneForAll
          </h2>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Quy trình 4 bước đơn giản, trực quan giúp bạn hoàn thành mọi tác vụ xử lý tệp chỉ trong vài giây.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {steps.map((item, index) => (
            <div key={item.step} className="relative group">
              <Card className="h-full p-6 bg-[#14141b] border border-[#2a2a35] hover:border-[#FF3B30]/40 flex flex-col justify-between card-3d">
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <span className="text-2xl font-black font-mono text-slate-400 group-hover:text-[#FF3B30] transition-colors">
                      {item.step}
                    </span>
                    <div className="w-11 h-11 flex items-center justify-center">
                      {item.icon}
                    </div>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-white mb-2 tracking-tight">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                {index < steps.length - 1 && (
                  <div className="hidden lg:flex justify-end pt-4 text-slate-400">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                )}
              </Card>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
