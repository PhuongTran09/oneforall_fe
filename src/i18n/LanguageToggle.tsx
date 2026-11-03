import { useLocation, useNavigate } from 'react-router-dom'
import { SegmentedControl } from '../components/common/SegmentedControl'
import { stripLocale, t, useI18n, withLocale, type Lang } from './langStore'

const OPTIONS = ['VI', 'EN']


export function LanguageToggle() {
  const { lang } = useI18n()
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <SegmentedControl
      size="sm"
      options={OPTIONS}
      value={lang.toUpperCase()}
      ariaLabel={t('common.language')}
      onChange={(option) => {
        const next: Lang = option.toLowerCase() as Lang
        const { path } = stripLocale(location.pathname)
        navigate(withLocale(path, next))
      }}
    />
  )
}
