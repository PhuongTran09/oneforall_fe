import { useOutletContext } from 'react-router-dom'
import {
  SEOHead,
  HeroSection,
  ToolsSection,
  FeaturesSection,
  HowItWorksSection,
  PricingSection,
  FaqSection,
} from '../components'

interface LayoutContext {
  openAuth: (mode: 'login' | 'register') => void
}

export function HomePage() {
  const context = useOutletContext<LayoutContext | null>()

  const handleOpenAuth = (mode: 'login' | 'register') => {
    if (context?.openAuth) {
      context.openAuth(mode)
    }
  }

  const handleSelectFree = () => {
    const toolsElement = document.getElementById('tools')
    if (toolsElement) {
      toolsElement.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const homeFaqs = [
    {
      q: 'OneForAll hỗ trợ những loại công cụ nào?',
      a: 'Nền tảng hỗ trợ toàn diện 4 nhóm công cụ: Tải video YouTube (MP4, MP3), Tải video TikTok không watermark, Chuyển đổi định dạng đa năng (PDF, Word, Excel, Video, Audio), và Bộ công cụ xử lý hình ảnh (Xóa nền BiRefNet AI, Nén WebP, Đổi kích thước pixel).',
    },
    {
      q: 'Dữ liệu và tệp tin của tôi có được bảo mật không?',
      a: 'Tuyệt đối bảo mật. Mọi tệp tin khi tải lên hệ thống được xử lý qua kênh mã hóa an toàn và tự động dọn dẹp khỏi bộ lưu trữ Cloudflare R2 sau khi tải xuống hoàn tất hoặc sau 3 phút.',
    },
    {
      q: 'Các công cụ trên OneForAll có miễn phí không?',
      a: 'Tất cả các tính năng cơ bản như tải YouTube MP4, TikTok MP4, nén ảnh, xóa nền và chuyển đổi file đều hoàn toàn miễn phí cho người dùng và không yêu cầu đăng ký tài khoản bắt buộc.',
    },
  ]

  return (
    <div className="w-full">
      <SEOHead
        title="OneForAll - Nền Tảng Công Cụ Trực Tuyến Đa Năng Cho Mọi Nhu Cầu"
        description="Tải video YouTube & TikTok không watermark, xóa nền ảnh AI, nén ảnh WebP, chuyển đổi PDF, Word, Excel và hơn 50+ định dạng tệp tin trực tuyến miễn phí tốc độ cao."
        canonicalUrl="https://oneforall.app/"
        faqList={homeFaqs}
      />
      <HeroSection onTryFree={() => handleOpenAuth('register')} />
      <ToolsSection />
      <FeaturesSection />
      <HowItWorksSection />
      <PricingSection
        onSelectFree={handleSelectFree}
        onSelectPremium={() => handleOpenAuth('register')}
      />
      <FaqSection />
    </div>
  )
}
