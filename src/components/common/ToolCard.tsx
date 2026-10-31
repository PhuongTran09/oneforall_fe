import { ArrowRight } from 'lucide-react'
import { ToolIcon } from './toolIcons'
import type { ToolConfig } from '../../config/seoTools'
import { LocaleLink } from '../../i18n/LocaleLink'
import { t } from '../../i18n/langStore'
import { useToolConfig } from '../../i18n/toolConfig'

export interface ToolCardProps {
  tool: ToolConfig
}

export function ToolCard({ tool }: ToolCardProps) {
  const localized = useToolConfig(tool) ?? tool
  return (
    <LocaleLink
      to={tool.slug}
      className="group flex flex-col justify-between p-5 sm:p-6 bg-surface border border-[rgba(255,59,48,0.22)] hover:border-[rgba(255,59,48,0.6)] card-3d card-tilt card-hover-glow clip-corner-card"
    >
      <div>
        {/* Top Header */}
        <div className="flex items-center justify-between gap-2 mb-3.5">
          <div className="w-10 h-10 grid place-items-center bg-page border border-edge text-brand clip-corner-btn group-hover:scale-110 group-hover:rotate-2 group-hover:border-brand/50 group-hover:bg-brand/10 group-hover:shadow-[0_0_14px_rgba(255,59,48,0.25)] transition-all duration-300">
            <ToolIcon category={tool.category} slug={tool.slug} />
          </div>
          <span className="text-[11px] font-medium font-mono px-2 py-0.5 bg-elev text-slate-300 border border-transparent group-hover:border-brand/30 group-hover:bg-brand/10 group-hover:text-brand transition-all">
            {localized.badge}
          </span>
        </div>

        {/* Title */}
        <h3 className="font-bold text-ink text-base group-hover:text-brand transition-colors leading-snug mb-1.5">
          {localized.h1}
        </h3>

        {/* Subtitle / Description */}
        <p className="text-xs sm:text-sm text-slate-400 line-clamp-2 leading-relaxed">
          {localized.subtitle}
        </p>
      </div>

      {/* Footer Info */}
      <div className="pt-4 mt-4 border-t border-edge/50 flex items-center justify-between">
        <div className="flex items-center gap-1.5 flex-wrap">
          {tool.outputFormats.slice(0, 3).map((fmt) => (
            <span
              key={fmt}
              className="text-[10px] font-mono px-1.5 py-0.5 bg-elev text-slate-400 uppercase border border-edge group-hover:border-brand/30 transition-colors"
            >
              .{fmt}
            </span>
          ))}
          {tool.outputFormats.length > 3 && (
            <span className="text-[10px] text-slate-500">+{tool.outputFormats.length - 3}</span>
          )}
        </div>

        <span className="inline-flex items-center gap-1 text-xs font-semibold text-brand group-hover:translate-x-1.5 transition-transform">
          <span>{t('common.useNow')}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </LocaleLink>
  )
}
