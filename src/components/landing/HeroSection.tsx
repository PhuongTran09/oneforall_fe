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

/**
 * Pill tắt, nhãn lấy thẳng từ registry: slug nào cũng là trang đã triển khai, đổi
 * ngôn ngữ là đổi nhãn, thêm/bớt tool trong SEO_TOOLS không phải sửa ở đây.
 */
const QUICK_SLUGS = ['/youtube-downloader', '/convert', '/remove-background', '/pdf-converter']

/**
 * Vế sau gạch ngang chạy gradient, vế trước giữ màu chữ thường — cùng nhãn
 * hero-word-hl bản cũ dùng cho tagline.
 */
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
      {/* Nền cắt trong hộp riêng thay vì overflow-hidden trên <section>: ô tìm kiếm
          mở dropdown xuống dưới, nằm trong section cắt-overflow là mất vài kết quả cuối. */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        {/* Parallax: hai lớp nền dịch hai tốc độ (30px / 48px) khi hero cuộn qua, nên
            chúng tách nhau ra = có chiều sâu. Chữ và ô tìm kiếm đứng im — dịch cả nội
            dung thì người đọc bị trôi dòng. data-parallax chỉ chạy ở desktop có chuột
            và tắt hẳn theo prefers-reduced-motion (xem scrollMotion.ts). */}
        <div className="absolute inset-0 bg-grid-cyber" data-parallax="30" />
        <div className="hero-ambient-glow" data-parallax="48" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto space-y-5">
          {/* Release Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-surface border border-[rgba(255,59,48,0.35)] text-brand text-xs font-bold badge-angular">
            <Sparkles className="w-3.5 h-3.5 text-brand" />
            <span>{t('hero.badge')}</span>
          </div>

          {/* Main Title */}
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

          {/* Description */}
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl mx-auto">
            {t('hero.description')}
          </p>

          {/* Tìm công cụ: gõ 2-3 ký tự là ra thẳng trang tool, không phải cuộn. Placeholder
              ngắn — bản dài "Tìm công cụ: tải video…" chiếm hết chỗ của ô trên mobile. */}
          <div className="max-w-xl mx-auto pt-1">
            <ToolSearchField value={query} onChange={setQuery} size="lg" tone="brand" placeholder={t('directory.searchShort')} />
          </div>

          {/* Truy cập nhanh: chỉ là chữ gạch chân, không hộp — hàng này là phụ, để ô
              vuông nữa là tranh nhìn với đúng cái ô tìm kiếm ngay phía trên. */}
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

          {/* CTAs: size="sm" là cỡ trên điện thoại để hai nút chung một hàng, variant sm:
              mới trả về cỡ lg của bản desktop. Không đè bằng class cùng cấp vì Button đã
              sinh sẵn text/px/py — chỉ variant sm: mới chắc thắng theo thứ tự CSS. */}
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

        {/* Public live stats — số thật từ GET /api/v1/public/stats */}
        <div className="mt-12 sm:mt-16 max-w-4xl mx-auto">
          <PublicLiveStats />
        </div>
      </div>
    </section>
  )
}
