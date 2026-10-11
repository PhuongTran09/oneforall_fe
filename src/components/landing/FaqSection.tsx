import { useState } from 'react'
import { ChevronDown, HelpCircle } from 'lucide-react'
import { Card } from '../common/Card'

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const faqs = [
    {
      q: 'OneForAll hỗ trợ những loại công cụ nào?',
      a: 'Nền tảng hỗ trợ toàn diện 4 nhóm công cụ lớn: Tải video YouTube (MP4, MP3), Tải video TikTok không watermark, Chuyển đổi định dạng đa năng (PDF, Word, Excel, Video, Audio), và Bộ công cụ xử lý hình ảnh (Xóa nền BiRefNet AI, Nén dung lượng WebP, Đổi kích thước pixel).',
    },
    {
      q: 'Dữ liệu và tệp tin của tôi có được bảo mật không?',
      a: 'Tuyệt đối bảo mật. Mọi tệp tin khi tải lên hệ thống được xử lý qua kênh mã hóa an toàn và tự động dọn dẹp khỏi bộ lưu trữ Cloudflare R2 sau khi tải xuống hoàn tất hoặc sau 3 phút. Chúng tôi không lưu trữ, xem trước hay chia sẻ dữ liệu của bạn.',
    },
    {
      q: 'Tôi có cần cài đặt phần mềm nào về máy không?',
      a: 'Không. OneForAll hoạt động hoàn toàn trên trình duyệt web thông qua công nghệ đám mây. Bạn chỉ cần truy cập trang công cụ tương ứng và FastAPI backend sẽ đảm nhận toàn bộ quá trình xử lý phức tạp.',
    },
    {
      q: 'Các công cụ trên OneForAll có miễn phí không?',
      a: 'Tất cả các tính năng cơ bản như tải YouTube MP4, TikTok MP4, nén ảnh, xóa nền và chuyển đổi file đều hoàn toàn miễn phí cho người dùng và không yêu cầu đăng ký tài khoản bắt buộc.',
    },
    {
      q: 'Tốc độ xử lý của nền tảng như thế nào?',
      a: 'Hệ thống sử dụng backend FastAPI với kiến trúc Celery worker phân tán, cho phép xử lý hình ảnh và chuyển đổi văn bản gần như tức thì (dưới 1 giây với hầu hết tệp thông thường).',
    },
  ]

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <section id="faq" className="py-16 sm:py-24 bg-[#0a0a0f] border-t border-[#2a2a35]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold bg-[#14141b] border border-[rgba(255,59,48,0.35)] text-[#FF3B30] badge-angular">
            HỎI ĐÁP THƯỜNG GẶP
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Giải đáp thắc mắc về OneForAll
          </h2>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Những thông tin cần thiết giúp bạn hiểu rõ hơn về tính năng, bảo mật và khả năng xử lý tệp của hệ thống.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index
            return (
              <Card
                key={faq.q}
                hoverEffect={false}
                className={`transition-colors clip-corner-card ${
                  isOpen ? 'bg-[#ff3b30]/10 border-[rgba(255,59,48,0.45)]' : 'bg-[#14141b] border-[rgba(255,59,48,0.18)]'
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggle(index)}
                  className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 cursor-pointer focus:outline-none"
                  aria-expanded={isOpen}
                >
                  <div className="flex items-center gap-3">
                    <HelpCircle className="w-5 h-5 text-[#FF3B30] shrink-0" />
                    <span className="font-bold text-white text-base sm:text-lg">
                      {faq.q}
                    </span>
                  </div>
                  <ChevronDown
                    className={`w-5 h-5 text-slate-400 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-[#FF3B30]' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 sm:px-6 pb-6 pt-0 border-t border-[#2a2a35]/60 mt-1">
                    <p className="text-sm text-slate-300 leading-relaxed pt-3">
                      {faq.a}
                    </p>
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
