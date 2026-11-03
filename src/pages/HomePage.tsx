import { useOutletContext } from 'react-router-dom'
import {
  SEOHead,
  HeroSection,
  ToolsSection,
  ValueBandSection,
  GoogleApiSection,
  PricingSection,
  FaqSection,
  AdSenseUnit,
} from '../components'
import { t, useI18n } from '../i18n/langStore'
import { useAuth } from '../services/authStore'
import { scrollToSection } from '../utils/scrollMotion'

interface LayoutContext {
  openAuth: (mode: 'login' | 'register') => void
  openPro: () => void
}

export function HomePage() {
  const { lang } = useI18n()
  const context = useOutletContext<LayoutContext | null>()
  const { session } = useAuth()

  const handleOpenAuth = (mode: 'login' | 'register') => {
    if (context?.openAuth) {
      context.openAuth(mode)
    }
  }

  const handleSelectFree = () => {
    scrollToSection('tools')
  }



  const handleProAccount = () => {
    if (!session) {
      handleOpenAuth('register')
      return
    }
    handleSelectPremium()
  }

  const handleSelectPremium = () => {
    scrollToSection('pricing')
  }

  const homeFaqs = Array.from({ length: 10 }, (_, i) => ({
    q: t(`homeFaq.q${i}`),
    a: t(`homeFaq.a${i}`),
  }))

  return (
    <div className="w-full">
      <SEOHead
        title={t('home.seoTitle')}
        description={t('home.seoDesc')}
        canonicalUrl={`https://oneforall.io.vn${lang === 'en' ? '/en/' : '/'}`}
        alternates={{ vi: '/', en: '/en/' }}
        faqList={homeFaqs}
      />
      <HeroSection onTryFree={handleProAccount} />
      <ToolsSection />
      <ValueBandSection />
      <GoogleApiSection />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AdSenseUnit slot={import.meta.env.VITE_ADSENSE_SLOT_CONTENT ?? ''} />
      </div>
      <PricingSection
        onSelectFree={handleSelectFree}
        onSelectPremium={() => context?.openPro()}
      />
      <FaqSection />
      {session === null && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AdSenseUnit slot={import.meta.env.VITE_ADSENSE_SLOT_BOTTOM ?? ''} />
        </div>
      )}
    </div>
  )
}
