import { Link, type LinkProps } from 'react-router-dom'
import { useI18n, withLocale } from './langStore'

export type LocaleLinkProps = Omit<LinkProps, 'to'> & { to: string }

/** Link nội bộ tự thêm prefix /en khi đang ở UI tiếng Anh. */
export function LocaleLink({ to, ...rest }: LocaleLinkProps) {
  const { lang } = useI18n()
  return <Link to={withLocale(to, lang)} {...rest} />
}
