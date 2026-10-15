import { Check, Sparkles, ArrowRight } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../common/Card'
import { Button } from '../common/Button'
import { t } from '../../i18n/langStore'

export interface PricingSectionProps {
  onSelectFree: () => void
  onSelectPremium: () => void
}

export function PricingSection({ onSelectFree, onSelectPremium }: PricingSectionProps) {
  const plans = [
    {
      id: 'free',
      name: 'Free Starter',
      badge: t('pricing.freeBadge'),
      price: t('pricing.freePrice'),
      period: t('pricing.period'),
      description: t('pricing.freeDesc'),
      features: [
        t('pricing.freeF1'),
        t('pricing.freeF2'),
        t('pricing.freeF3'),
        t('pricing.freeF4'),
        t('pricing.freeF5'),
      ],
      ctaText: t('pricing.freeCta'),
      ctaVariant: 'secondary' as const,
      isPopular: false,
      onAction: onSelectFree,
    },
    {
      id: 'premium',
      name: 'Professional',
      badge: t('pricing.proBadge'),
      price: t('pricing.proPrice'),
      period: t('pricing.period'),
      description: t('pricing.proDesc'),
      features: [
        t('pricing.proF1'),
        t('pricing.proF2'),
        t('pricing.proF3'),
        t('pricing.proF4'),
        t('pricing.proF5'),
        t('pricing.proF6'),
      ],
      ctaText: t('pricing.proCta'),
      ctaVariant: 'primary' as const,
      isPopular: true,
      onAction: onSelectPremium,
    },
  ]

  return (
    <section id="pricing" data-reveal className="py-16 sm:py-24 bg-page/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold bg-surface border border-[rgba(255,59,48,0.35)] text-brand badge-angular">
            {t('pricing.badge')}
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-ink tracking-tight">
            {t('pricing.title')}
          </h2>
          <p className="text-slate-300 text-xs sm:text-base leading-relaxed">
            {t('pricing.desc')}
          </p>
        </div>

        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              bordered={false}
              className={`flex flex-col justify-between p-2 sm:p-4 ${
                plan.isPopular
                  ? 'border border-[rgba(255,59,48,0.55)] relative overflow-hidden card-tilt'
                  : 'border border-[rgba(255,59,48,0.22)] card-3d-dim'
              }`}
            >
              {plan.isPopular && (
                <div className="absolute top-0 right-0 bg-brand-gradient text-white text-[10px] font-bold px-3 py-1 tracking-wider uppercase flex items-center gap-1 border-l border-b border-[rgba(255,59,48,0.4)]">
                  <Sparkles className="w-3 h-3" />
                  {plan.badge}
                </div>
              )}

              <div>
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <CardTitle className="text-lg sm:text-xl text-ink">{plan.name}</CardTitle>
                    {!plan.isPopular && (
                      <span className="text-xs font-mono font-medium text-slate-400 px-2 py-0.5 bg-elev">
                        {plan.badge}
                      </span>
                    )}
                  </div>
                  <CardDescription className="text-xs sm:text-sm text-slate-300">
                    {plan.description}
                  </CardDescription>

                  <div className="pt-6 pb-2 flex items-baseline gap-1.5">
                    <span className="text-3xl sm:text-4xl font-extrabold text-ink tracking-tight">
                      {plan.price}
                    </span>
                    <span className="text-slate-400 text-sm">{plan.period}</span>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3 pt-2">
                  <p className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
                    {t('pricing.includes')}
                  </p>
                  <ul className="space-y-2.5">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-300">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </div>

              <CardFooter className="pt-6">
                <Button
                  variant={plan.ctaVariant}
                  size="md"
                  fullWidth
                  onClick={plan.onAction}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  {plan.ctaText}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
