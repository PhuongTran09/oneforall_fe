import { useOutletContext } from 'react-router-dom'
import {
  SEOHead,
  HeroSection,
  ToolsSection,
  FeaturesSection,
  HowItWorksSection,
  PricingSection,
  FaqSection,
  AdSenseUnit,
} from '../components'
import { t } from '../i18n/langStore'
import { useAuth } from '../services/authStore'

interface LayoutContext {
  openAuth: (mode: 'login' | 'register') => void
  openPro: () => void
}

export function HomePage() {
  const context = useOutletContext<LayoutContext | null>()
  const { session } = useAuth()

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

  // CTA "Tài khoản Pro" ở hero: chưa đăng nhập thì chưa có gì để mua → mở modal auth;
  // đã đăng nhập thì cuộn xuống bảng gói Free/Pro trên chính trang này.
  const handleProAccount = () => {
    if (!session) {
      handleOpenAuth('register')
      return
    }
    handleSelectPremium()
  }

  const handleSelectPremium = () => {
    const pricingElement = document.getElementById('pricing')
    if (pricingElement) {
      pricingElement.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const homeFaqs = [
    { q: t('homeFaq.q0'), a: t('homeFaq.a0') },
    { q: t('homeFaq.q1'), a: t('homeFaq.a1') },
    { q: t('homeFaq.q3'), a: t('homeFaq.a3') },
  ]

  return (
    <div className="w-full">
      <SEOHead
        title={t('home.seoTitle')}
        description={t('home.seoDesc')}
        canonicalUrl="https://oneforall.app/"
        faqList={homeFaqs}
      />
      <HeroSection onTryFree={handleProAccount} />
      <ToolsSection />
      <FeaturesSection />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AdSenseUnit slot={import.meta.env.VITE_ADSENSE_SLOT_CONTENT ?? ''} />
      </div>
      <HowItWorksSection />
      <PricingSection
        onSelectFree={handleSelectFree}
        onSelectPremium={() => context?.openPro()}
      />
      <FaqSection />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AdSenseUnit slot={import.meta.env.VITE_ADSENSE_SLOT_BOTTOM ?? ''} />
      </div>
    </div>
  )
}
