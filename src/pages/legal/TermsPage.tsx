import { LegalLayout } from '../../components/legal/LegalLayout'
import { termsEn } from '../../content/legal/terms.en'
import { termsVi } from '../../content/legal/terms.vi'
import { useI18n } from '../../i18n/langStore'

export function TermsPage() {
  const { lang } = useI18n()
  return <LegalLayout doc={lang === 'en' ? termsEn : termsVi} siteUrl="https://oneforall.app" />
}
