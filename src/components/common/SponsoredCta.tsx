import { ArrowUpRight } from 'lucide-react'
import { ADS } from '../../config/ads'
import { t } from '../../i18n/langStore'
import { useAdsDecision } from '../../services/adScripts'

export interface SponsoredCtaProps {
  className?: string
}

// Cùng họ style outline/md của Button.tsx nhưng là <a>: không mặc định giống nút
// chức năng (btn-3d + brand gradient) để tránh nhấn nhầm.
const ctaStyles =
  'inline-flex items-center justify-center gap-2 shrink-0 text-sm font-medium px-4 py-2.5 clip-corner-btn border border-brand/50 bg-transparent text-brand hover:bg-brand/5 hover:border-brand focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF3B30] select-none'

/**
 * Smartlink. Là liên kết THẬT: không window.open, không onClick, không tự focus —
 * chỉ mở khi người dùng chủ động nhấn, và không đường nào luồng Download/Convert/
 * Compress/Remove Background/Start Processing gọi tới nó.
 */
export function SponsoredCta({ className = '' }: SponsoredCtaProps) {
  // quyền hiện quảng cáo định nghĩa một chỗ (useAdsDecision) để CTA và điểm nạp
  // script không bao giờ bất đồng với nhau
  const decision = useAdsDecision()
  if (!ADS.smartlink.enabled || decision !== 'load') return null

  return (
    <aside
      className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 bg-surface border border-edge clip-corner-card ${className}`}
    >
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-wider text-slate-500">{t('common.adLabel')}</p>
        <p className="mt-1 text-xs text-slate-400 leading-relaxed">{t('sponsored.disclosure')}</p>
      </div>
      <a
        href={ADS.smartlink.url}
        target="_blank"
        rel="nofollow sponsored noopener noreferrer"
        className={ctaStyles}
      >
        <span>{t('sponsored.cta')}</span>
        <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
      </a>
    </aside>
  )
}
