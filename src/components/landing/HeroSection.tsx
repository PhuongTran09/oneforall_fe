import { Fragment, useState } from 'react'
import { ArrowRight, Sparkles, Zap, Shield, FileCheck, Layers } from 'lucide-react'
import { Button } from '../common/Button'
import { PublicLiveStats } from './PublicLiveStats'
import { LocaleLink } from '../../i18n/LocaleLink'
import { t } from '../../i18n/langStore'

export interface HeroSectionProps {
  onTryFree?: () => void
}

const HERO_TAGLINE_COUNT = 4

export function HeroSection({ onTryFree }: HeroSectionProps) {
  // index trong state để đổi VI↔EN không làm nhảy tagline giữa lúc đang đọc
  const [taglineIndex] = useState(() => Math.floor(Math.random() * HERO_TAGLINE_COUNT))

  const headingWords = [
    ...t('hero.titlePre')
      .split(' ')
      .map((word) => ({ word, highlight: false })),
    ...t(`hero.tagline${taglineIndex}`)
      .split(' ')
      .map((word) => ({ word, highlight: true })),
  ]

  const quickTools = [
    { label: 'YouTube to MP4', to: '/youtube-to-mp4', badge: 'Hot' },
    { label: 'TikTok to MP4', to: '/tiktok-to-mp4', badge: 'Fast' },
    { label: t('hero.quickRemoveBg'), to: '/remove-background', badge: 'PNG' },
    { label: t('hero.quickPdf'), to: '/pdf-converter', badge: 'Doc' },
    { label: t('hero.quickCompress'), to: '/image-compressor', badge: 'WebP' },
  ]

  return (
    <section className="relative pt-10 pb-16 sm:pt-16 sm:pb-24 overflow-hidden bg-page">
      {/* Background Cyber Grid & Radiant Ambient Glow */}
      <div className="absolute inset-0 bg-grid-cyber pointer-events-none" aria-hidden="true" />
      <div className="hero-ambient-glow" aria-hidden="true" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto space-y-6">
          {/* Release Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-surface border border-[rgba(255,59,48,0.35)] text-brand text-xs font-bold badge-angular">
            <Sparkles className="w-3.5 h-3.5 text-brand" />
            <span>{t('hero.badge')}</span>
          </div>

          {/* Main Title */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-ink tracking-tight leading-[1.15]">
            {headingWords.map(({ word, highlight }, i) => (
              <Fragment key={`${word}-${i}`}>
                <span
                  className={highlight ? 'hero-word hero-word-hl text-brand-gradient' : 'hero-word'}
                  style={{ animationDelay: `${i * 55}ms` }}
                >
                  {word}
                </span>{' '}
              </Fragment>
            ))}
          </h1>

          {/* Description */}
          <p className="text-sm sm:text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto">
            {t('hero.description')}
          </p>

          {/* Quick Action Tools Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
            <span className="text-xs font-semibold text-slate-400 mr-1">{t('hero.quickAccess')}</span>
            {quickTools.map((tool) => (
              <LocaleLink
                key={tool.to}
                to={tool.to}
                className="group inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-surface/90 hover:bg-surface border border-edge/80 hover:border-brand/60 text-slate-200 hover:text-brand clip-corner-btn transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_0_14px_rgba(255,59,48,0.22)]"
              >
                <span>{tool.label}</span>
                <span className="text-[10px] px-1.5 py-0.5 bg-brand/10 text-brand font-bold border border-brand/20 group-hover:bg-brand group-hover:text-white transition-all">
                  {tool.badge}
                </span>
              </LocaleLink>
            ))}
          </div>

          {/* Feature Highlights Pills */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-6 text-xs sm:text-sm text-slate-400">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              <span>{t('hero.pillInstant')}</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-500" />
              <span>{t('hero.pillSecurity')}</span>
            </div>
            <div className="flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-brand" />
              <span>{t('hero.pillFormats')}</span>
            </div>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-3">
            <a href="#tools" className="w-full sm:w-auto">
              <Button
                variant="primary"
                size="lg"
                rightIcon={<ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                className="w-full sm:w-auto btn-shimmer btn-glow-pulse group"
              >
                {t('hero.exploreCta')}
              </Button>
            </a>
            {onTryFree && (
              <Button
                variant="secondary"
                size="lg"
                onClick={onTryFree}
                leftIcon={<Layers className="w-4 h-4 text-brand" />}
                className="w-full sm:w-auto hover:border-brand/60 hover:shadow-[0_0_16px_rgba(255,59,48,0.2)] transition-all"
              >
                {t('hero.proAccount')}
              </Button>
            )}
          </div>
        </div>

        {/* Public live stats — số thật từ GET /api/v1/public/stats */}
        <div className="mt-12 sm:mt-16 max-w-4xl mx-auto">
          <PublicLiveStats />
        </div>
      </div>
    </section>
  )
}
