import { Ban, KeyRound, ShieldCheck } from 'lucide-react'
import { Card, CardDescription, CardHeader, CardTitle } from '../common/Card'
import { LocaleLink } from '../../i18n/LocaleLink'
import { t } from '../../i18n/langStore'

export function GoogleApiSection() {
  const items = [
    {
      icon: <ShieldCheck className="w-6 h-6 text-brand" />,
      title: t('googleApi.purposeTitle'),
      description: t('googleApi.purposeDesc'),
      highlight: false,
    },
    {
      icon: <KeyRound className="w-6 h-6 text-brand-2" />,
      title: t('googleApi.authTitle'),
      description: t('googleApi.authDesc'),
      highlight: false,
    },
    {
      icon: <Ban className="w-6 h-6 text-brand" />,
      title: t('googleApi.nciiTitle'),
      description: t('googleApi.nciiDesc'),
      highlight: true,
    },
  ]

  return (
    <section id="google-api" data-reveal className="py-16 sm:py-24 bg-page border-t border-edge">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold bg-surface border border-[rgba(255,59,48,0.35)] text-brand badge-angular">
            {t('googleApi.badge')}
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-ink tracking-tight">
            {t('googleApi.title')}
          </h2>
          <p className="text-slate-300 text-xs sm:text-base leading-relaxed">{t('googleApi.desc')}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {items.map((item) => (
            <Card
              key={item.title}
              hoverEffect={false}
              className={item.highlight ? 'bg-brand/10 border-[rgba(255,59,48,0.45)]' : ''}
            >
              <CardHeader className="flex flex-col items-start gap-4">
                <div className="w-12 h-12 flex items-center justify-center shrink-0 bg-page border border-edge clip-corner-btn">
                  {item.icon}
                </div>
                <CardTitle className="text-base sm:text-lg text-ink">{item.title}</CardTitle>
                <CardDescription className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {item.description}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>

        <p className="mt-8 text-center text-xs sm:text-sm text-slate-400">
          {t('googleApi.policySee')}{' '}
          <LocaleLink to="/terms" className="text-brand hover:underline">
            {t('common.terms')}
          </LocaleLink>{' '}
          ·{' '}
          <LocaleLink to="/privacy" className="text-brand hover:underline">
            {t('common.privacy')}
          </LocaleLink>
        </p>
      </div>
    </section>
  )
}
