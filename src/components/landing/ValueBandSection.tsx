import { Cpu, Download, Layers, ListChecks, MousePointerClick, SlidersHorizontal, CloudUpload } from 'lucide-react'
import { SectionHeading } from '../common/SectionHeading'
import { usePinnedCardScroll } from '../../hooks/usePinnedCardScroll'
import { t } from '../../i18n/langStore'

/**
 * Một dải gộp "Ưu điểm cốt lõi" + "Cách thức hoạt động": hai section trước đây
 * chiếm hơn một viewport cho cùng một message. Toàn bộ 8 dòng copy vẫn còn.
 */
const STEPS = [
  { key: 's1', icon: <CloudUpload className="w-5 h-5 text-brand" /> },
  { key: 's2', icon: <SlidersHorizontal className="w-5 h-5 text-brand" /> },
  { key: 's3', icon: <Cpu className="w-5 h-5 text-brand" /> },
  { key: 's4', icon: <Download className="w-5 h-5 text-brand" /> },
]

const VALUES = [
  { key: 'f1', icon: <Cpu className="w-4 h-4 text-brand" /> },
  { key: 'f2', icon: <Layers className="w-4 h-4 text-brand" /> },
  { key: 'f3', icon: <MousePointerClick className="w-4 h-4 text-brand" /> },
  { key: 'f4', icon: <ListChecks className="w-4 h-4 text-brand" /> },
]

export function ValueBandSection() {
  const { rootRef, enabled } = usePinnedCardScroll()

  return (
    <section
      id="how-it-works"
      data-reveal
      /* [data-pin] bật toàn bộ layout ghim trong index.css; không có nó thì bốn thẻ vẫn là
         lưới grid như cũ — mobile, cửa sổ thấp, reduced-motion và trình duyệt tắt JS đều
         đi theo nhánh này. */
      data-pin={enabled ? 'on' : undefined}
      className="py-14 sm:py-20 bg-page border-y border-edge"
    >
      <div ref={rootRef} className="pin-root max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="pin-stage">
          <SectionHeading badge={t('homeBand.badge')} title={t('homeBand.title')} desc={t('homeBand.desc')} />

          <div className="pin-viewport">
            <ol className="stagger pin-track grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" data-reveal-items>
              {STEPS.map((item, index) => (
                <li key={item.key} className="p-4 bg-surface border border-edge clip-corner-card">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-9 h-9 shrink-0 grid place-items-center bg-page border border-edge clip-corner-btn">
                      {item.icon}
                    </span>
                    <span className="text-[10px] font-mono uppercase tracking-[0.14em] text-slate-500">
                      {t('homeBand.stepLabel', { n: String(index + 1).padStart(2, '0') })}
                    </span>
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-ink tracking-tight mb-1">
                    {t(`howItWorks.${item.key}Title`)}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">{t(`howItWorks.${item.key}Desc`)}</p>
                </li>
              ))}
            </ol>
          </div>

          <div className="pin-rail" aria-hidden="true">
            <span className="pin-rail-fill" />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6 mt-10">
          {VALUES.map((item) => (
            <li key={item.key} className="flex items-start gap-3">
              <span className="w-8 h-8 shrink-0 grid place-items-center bg-surface border border-edge clip-corner-btn">
                {item.icon}
              </span>
              <div className="min-w-0 space-y-1">
                <h3 className="text-sm sm:text-base font-bold text-ink tracking-tight">
                  {t(`features.${item.key}Title`)}
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">{t(`features.${item.key}Desc`)}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
