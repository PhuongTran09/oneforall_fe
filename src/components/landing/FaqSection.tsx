import { useState } from 'react'
import { ChevronDown, HelpCircle } from 'lucide-react'
import { Card } from '../common/Card'
import { SectionHeading } from '../common/SectionHeading'
import { t } from '../../i18n/langStore'

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const faqs = [0, 1, 2, 3, 4, 5].map((i) => ({
    q: t(`homeFaq.q${i}`),
    a: t(`homeFaq.a${i}`),
  }))

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <section id="faq" data-reveal className="py-16 sm:py-24 bg-page border-t border-edge">
      <div className="max-w-4xl lg:max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Sáu câu hỏi dài hơn một màn hình: từ lg ghim tiêu đề sang cột trái để lúc
            cuộn xuống câu 5-6 vẫn thấy mình đang ở mục Hỏi đáp. Cột này không dính
            header (top 96px = 72px header + khoảng thở). */}
        <div className="lg:grid lg:grid-cols-[minmax(0,18rem)_minmax(0,1fr)] lg:gap-10 lg:items-start">
          <div className="lg:sticky lg:top-[96px]">
            <SectionHeading
              badge={t('homeFaq.badge')}
              title={t('homeFaq.title')}
              desc={t('homeFaq.desc')}
              className="lg:text-left lg:mb-0"
            />
          </div>

          <div className="space-y-3">
            {faqs.map((faq, index) => {
              const isOpen = openIndex === index
              return (
                <Card
                  key={faq.q}
                  hoverEffect={false}
                  className={`transition-colors clip-corner-card ${
                    isOpen ? 'bg-brand/10 border-[rgba(255,59,48,0.45)]' : 'bg-surface border-[rgba(255,59,48,0.18)]'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggle(index)}
                    className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 cursor-pointer focus:outline-none"
                    aria-expanded={isOpen}
                  >
                    <div className="flex items-center gap-3">
                      <HelpCircle className="w-5 h-5 text-brand shrink-0" />
                      <span className="font-bold text-ink text-sm sm:text-lg">
                        {faq.q}
                      </span>
                    </div>
                    <ChevronDown
                      className={`w-5 h-5 text-slate-400 shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-brand' : ''
                      }`}
                    />
                  </button>

                  <div className="acc" data-open={isOpen}>
                    <div>
                      <div className="px-5 sm:px-6 pb-6 pt-0 border-t border-edge/60 mt-1">
                        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed pt-3">
                          {faq.a}
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
