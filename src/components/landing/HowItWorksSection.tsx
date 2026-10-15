import { type CSSProperties } from 'react'
import { UploadCloud, SlidersHorizontal, Cpu, Download, ArrowRight } from 'lucide-react'
import { Card } from '../common/Card'
import { t } from '../../i18n/langStore'

export function HowItWorksSection() {
  const steps = [
    {
      step: '01',
      title: t('howItWorks.s1Title'),
      description: t('howItWorks.s1Desc'),
      icon: <UploadCloud className="w-6 h-6 text-brand" />,
    },
    {
      step: '02',
      title: t('howItWorks.s2Title'),
      description: t('howItWorks.s2Desc'),
      icon: <SlidersHorizontal className="w-6 h-6 text-brand-2" />,
    },
    {
      step: '03',
      title: t('howItWorks.s3Title'),
      description: t('howItWorks.s3Desc'),
      icon: <Cpu className="w-6 h-6 text-indigo-500" />,
    },
    {
      step: '04',
      title: t('howItWorks.s4Title'),
      description: t('howItWorks.s4Desc'),
      icon: <Download className="w-6 h-6 text-emerald-600" />,
    },
  ]

  return (
    <section id="how-it-works" data-reveal className="py-16 sm:py-24 bg-page border-y border-edge">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold bg-surface border border-[rgba(255,59,48,0.35)] text-brand badge-angular">
            {t('howItWorks.badge')}
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-ink tracking-tight">
            {t('howItWorks.title')}
          </h2>
          <p className="text-slate-300 text-xs sm:text-base leading-relaxed">
            {t('howItWorks.desc')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {steps.map((item, index) => (
            <div
              key={item.step}
              className={`relative group pipeline-step${index === 0 ? ' pipeline-first' : ''}`}
              style={{ '--step': index } as CSSProperties}
            >
              <Card className="h-full p-6 flex flex-col justify-between card-tilt">
                <span
                  aria-hidden="true"
                  className="pipeline-flare absolute inset-0 clip-corner-card"
                />
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <span className="step-num text-xl sm:text-2xl font-black font-mono text-slate-400 group-hover:text-brand transition-colors">
                      {item.step}
                    </span>
                    <div className="step-icon w-11 h-11 flex items-center justify-center border border-edge bg-page clip-corner-btn">
                      {item.icon}
                    </div>
                  </div>

                  <h3 className="text-sm sm:text-lg font-bold text-ink mb-2 tracking-tight">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                {index < steps.length - 1 && (
                  <div className="hidden lg:flex justify-end pt-4 text-slate-400">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                )}
              </Card>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
