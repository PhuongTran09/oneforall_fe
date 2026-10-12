import { Home, AlertCircle, ArrowRight } from 'lucide-react'
import { Button } from '../components/common/Button'
import { Card } from '../components/common/Card'
import { SEOHead } from '../components/common/SEOHead'
import { LocaleLink } from '../i18n/LocaleLink'
import { t } from '../i18n/langStore'

export function NotFoundPage() {
  const popularTools = [
    { label: t('notFound.tool1'), to: '/youtube-to-mp4' },
    { label: t('notFound.tool2'), to: '/tiktok-to-mp4' },
    { label: t('notFound.tool3'), to: '/remove-background' },
    { label: t('notFound.tool4'), to: '/pdf-converter' },
    { label: t('notFound.tool5'), to: '/image-compressor' },
  ]

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 bg-page">
      <SEOHead
        title={t('notFound.seoTitle')}
        description={t('notFound.seoDesc')}
        canonicalUrl="https://oneforall.app/404"
        noindex={true}
      />

      <Card bordered={false} className="max-w-lg w-full p-8 text-center border border-edge space-y-6">
        <div className="w-16 h-16 bg-[#ff3b30]/10 border border-[#ff3b30]/30 text-[#FF3B30] flex items-center justify-center mx-auto clip-corner-card">
          <AlertCircle className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-mono font-semibold px-2.5 py-0.5 bg-[#ff3b30]/10 text-[#FF3B30] border border-[#ff3b30]/30 clip-corner-btn">
            {t('notFound.errorCode')}
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
            {t('notFound.title')}
          </h1>
          <p className="text-sm text-slate-400 leading-relaxed max-w-sm mx-auto">
            {t('notFound.desc')}
          </p>
        </div>

        {/* Popular Tools Navigation */}
        <div className="pt-2 border-t border-edge text-left space-y-2">
          <p className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            {t('notFound.popularTitle')}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {popularTools.map((tool) => (
              <LocaleLink
                key={tool.to}
                to={tool.to}
                className="flex items-center justify-between p-2.5 bg-elev hover:bg-[#ff3b30]/10 border border-edge hover:border-[rgba(255,59,48,0.40)] text-xs font-medium text-slate-200 hover:text-[#FF3B30] transition-colors clip-corner-btn"
              >
                <span>{tool.label}</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </LocaleLink>
            ))}
          </div>
        </div>

        <div className="pt-2">
          <LocaleLink to="/">
            <Button variant="primary" size="md" fullWidth leftIcon={<Home className="w-4 h-4" />}>
              {t('notFound.backHome')}
            </Button>
          </LocaleLink>
        </div>
      </Card>
    </div>
  )
}
