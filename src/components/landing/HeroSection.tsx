import { Fragment, useState } from 'react'
import { ArrowRight, Layers, Sparkles } from 'lucide-react'
import { Button } from '../common/Button'
import { PublicLiveStats } from './PublicLiveStats'
import { ToolSearchField } from '../common/ToolSearch'
import { LocaleLink } from '../../i18n/LocaleLink'
import { SEO_TOOLS } from '../../config/seoTools'
import { localizeTool } from '../../i18n/toolConfig'
import { t, useI18n } from '../../i18n/langStore'

export interface HeroSectionProps {
  onTryFree?: () => void
}





const QUICK_SLUGS = ['/youtube-downloader', '/convert', '/remove-background', '/pdf-converter']





function titleWords(title: string) {
  const dash = title.search(/[–—-]/)
  let offset = 0
  return title.split(' ').map((word) => {
    const at = offset
    offset += word.length + 1
    return { word, highlight: dash >= 0 && at > dash }
  })
}

export function HeroSection({ onTryFree }: HeroSectionProps) {
  const [query, setQuery] = useState('')
  const { lang } = useI18n()

  const quickTools = QUICK_SLUGS.flatMap((slug) => {
    const tool = SEO_TOOLS[slug]
    return tool ? [{ to: slug, label: localizeTool(tool, lang).badge }] : []
  })

  return (
    <section className="cv-skip relative pt-8 pb-10 sm:pt-12 sm:pb-14 bg-page">


      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">




        <div className="absolute inset-0 bg-grid-cyber" data-parallax="30" />
        <div className="hero-ambient-glow" data-parallax="48" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto space-y-5">

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-surface border border-[rgba(255,59,48,0.35)] text-brand text-xs font-bold badge-angular">
            <Sparkles className="w-3.5 h-3.5 text-brand" />
            <span>{t('hero.badge')}</span>
          </div>


          <h1 className="text-3xl sm:text-5xl font-extrabold text-ink tracking-tight leading-[1.15]">
            {titleWords(t('hero.title')).map(({ word, highlight }, i) => (
              <Fragment key={`${word}-${i}`}>
                <span
                  className={highlight ? 'hero-word hero-word-hl text-brand-gradient' : 'hero-word'}
                  style={{ animationDelay: `${i * 62}ms` }}
                >
                  {word}
                </span>{' '}
              </Fragment>
            ))}
          </h1>


          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl mx-auto">
            {t('hero.description')}
          </p>



          <div className="max-w-xl mx-auto pt-1">
            <ToolSearchField value={query} onChange={setQuery} size="lg" tone="brand" placeholder={t('directory.searchShort')} />
          </div>



          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5">
            <span className="text-xs font-semibold text-slate-400 mr-1">{t('hero.quickAccess')}</span>
            {quickTools.map((tool) => (
              <LocaleLink
                key={tool.to}
                to={tool.to}
                className="text-xs font-semibold text-slate-200 underline decoration-slate-500/70 decoration-2 underline-offset-4 hover:text-brand hover:decoration-brand/70 transition-colors duration-200"
              >
                {tool.label}
              </LocaleLink>
            ))}
          </div>




          <div className="flex flex-row items-center justify-center gap-2 sm:gap-3.5 pt-2">
            <a href="#tools">
              <Button
                variant="primary"
                size="sm"
                rightIcon={<ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />}
                className="sm:text-base sm:px-6 sm:py-3.5 sm:gap-2.5 btn-shimmer btn-glow-pulse group"
              >
                {t('hero.exploreCta')}
              </Button>
            </a>
            {onTryFree && (
              <Button
                variant="secondary"
                size="sm"
                onClick={onTryFree}
                leftIcon={<Layers className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-brand" />}
                className="sm:text-base sm:px-6 sm:py-3.5 sm:gap-2.5 hover:border-brand/60 transition-colors"
              >
                {t('hero.proAccount')}
              </Button>
            )}
          </div>
        </div>


        <div className="mt-12 sm:mt-16 max-w-4xl mx-auto">
          <PublicLiveStats />
        </div>
      </div>
    </section>
  )
}
