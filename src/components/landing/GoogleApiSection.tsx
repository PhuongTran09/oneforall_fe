import { ShieldCheck } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../common/Card'
import { LocaleLink } from '../../i18n/LocaleLink'
import { SectionHeading } from '../common/SectionHeading'
import { t } from '../../i18n/langStore'

export function GoogleApiSection() {
  return (
    <section id="signin-safety" data-reveal className="py-16 sm:py-24 bg-page border-t border-edge">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading badge={t('googleApi.badge')} title={t('googleApi.title')} />

        <div className="max-w-4xl mx-auto" data-reveal-items>
          <Card hoverEffect={false} className="card-tilt">
            <CardHeader className="flex items-start gap-4">
              <div className="w-12 h-12 flex items-center justify-center shrink-0 bg-page border border-edge clip-corner-btn">
                <ShieldCheck className="w-6 h-6 text-brand" />
              </div>
              <div>
                <CardTitle className="text-base sm:text-lg text-ink">{t('googleApi.purposeTitle')}</CardTitle>
                <CardDescription className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {t('googleApi.purposeDesc')}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed">
              <p><strong className="text-ink">{t('googleApi.authTitle')}:</strong> {t('googleApi.authDesc')}</p>
              <p><strong className="text-ink">{t('googleApi.nciiTitle')}:</strong> {t('googleApi.nciiDesc')}</p>
            </CardContent>
          </Card>
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
