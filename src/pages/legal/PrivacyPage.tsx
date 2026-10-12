import { LegalLayout } from '../../components/legal/LegalLayout'
import { privacyEn } from '../../content/legal/privacy.en'
import { privacyVi } from '../../content/legal/privacy.vi'
import { useI18n } from '../../i18n/langStore'

export function PrivacyPage() {
  const { lang } = useI18n()
  return <LegalLayout doc={lang === 'en' ? privacyEn : privacyVi} siteUrl="https://oneforall.app" />
}
