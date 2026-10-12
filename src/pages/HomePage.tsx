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
      <HeroSection onTryFree={() => handleOpenAuth('register')} />
      <ToolsSection />
      <FeaturesSection />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AdSenseUnit slot={import.meta.env.VITE_ADSENSE_SLOT_CONTENT ?? ''} />
      </div>
      <HowItWorksSection />
      <PricingSection
        onSelectFree={handleSelectFree}
        onSelectPremium={() => handleOpenAuth('register')}
      />
      <FaqSection />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AdSenseUnit slot={import.meta.env.VITE_ADSENSE_SLOT_BOTTOM ?? ''} />
      </div>
    </div>
  )
}
