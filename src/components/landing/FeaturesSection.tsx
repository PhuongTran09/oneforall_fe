import { Cpu, Layers, MousePointerClick, ListChecks } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription } from '../common/Card'
import { t } from '../../i18n/langStore'

export function FeaturesSection() {
  const features = [
    {
      icon: <Cpu className="w-6 h-6 text-brand" />,
      title: t('features.f1Title'),
      description: t('features.f1Desc'),
      badge: 'FastAPI Async Engine',
    },
    {
      icon: <Layers className="w-6 h-6 text-brand-2" />,
      title: t('features.f2Title'),
      description: t('features.f2Desc'),
      badge: t('features.f2Badge'),
    },
    {
      icon: <MousePointerClick className="w-6 h-6 text-emerald-600" />,
      title: t('features.f3Title'),
      description: t('features.f3Desc'),
      badge: 'Modern SaaS UX',
    },
    {
      icon: <ListChecks className="w-6 h-6 text-indigo-600" />,
      title: t('features.f4Title'),
      description: t('features.f4Desc'),
      badge: 'Privacy First',
    },
  ]

  return (
    <section id="features" data-reveal className="py-16 sm:py-24 bg-page/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold bg-surface border border-[rgba(255,59,48,0.35)] text-brand badge-angular">
            {t('features.badge')}
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-ink tracking-tight">
            {t('features.title')}
          </h2>
          <p className="text-slate-300 text-xs sm:text-base leading-relaxed">
            {t('features.desc')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {features.map((feat) => (
            <Card key={feat.title} className="p-2 sm:p-4 card-tilt">
              <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="w-12 h-12 flex items-center justify-center shrink-0 bg-page border border-edge clip-corner-btn">
                  {feat.icon}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-base sm:text-lg text-ink">{feat.title}</CardTitle>
                  </div>
                  <span className="inline-block text-[11px] font-mono font-medium text-slate-400">
                    {feat.badge}
                  </span>
                </div>
              </CardHeader>
              <div className="px-6 pb-6 pt-1">
                <CardDescription className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {feat.description}
                </CardDescription>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
