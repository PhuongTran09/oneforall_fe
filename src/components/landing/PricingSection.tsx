import { Check, Sparkles, ArrowRight } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../common/Card'
import { Button } from '../common/Button'

export interface PricingSectionProps {
  onSelectFree: () => void
  onSelectPremium: () => void
}

export function PricingSection({ onSelectFree, onSelectPremium }: PricingSectionProps) {
  const plans = [
    {
      id: 'free',
      name: 'Free Starter',
      badge: 'Miễn phí vĩnh viễn',
      price: '0 đ',
      period: '/ tháng',
      description: 'Phù hợp cho cá nhân xử lý tệp nhanh chóng mà không cần đăng ký tài khoản trả phí.',
      features: [
        'Dung lượng tải lên tối đa 50MB / tệp',
        'Đầy đủ các công cụ: YouTube, TikTok, File, Ảnh',
        'Tốc độ hàng đợi tiêu chuẩn FastAPI',
        'Lưu trữ tệp tải về an toàn trong 3 phút',
        'Không yêu cầu đăng nhập đối với công cụ miễn phí',
      ],
      ctaText: 'Bắt đầu miễn phí',
      ctaVariant: 'secondary' as const,
      isPopular: false,
      onAction: onSelectFree,
    },
    {
      id: 'premium',
      name: 'Professional',
      badge: 'Phổ biến nhất',
      price: '99.000 đ',
      period: '/ tháng',
      description: 'Dành cho người sáng tạo nội dung và doanh nghiệp cần dung lượng lớn và ưu tiên tối đa.',
      features: [
        'Dung lượng tải lên lên tới 2GB / tệp',
        'Ưu tiên hàng đợi Celery cao nhất',
        'Xử lý song song không giới hạn',
        'Tải video YouTube/TikTok độ phân giải 4K',
        'Lưu trữ liên kết tải về an toàn tới 7 ngày',
        'Hỗ trợ kỹ thuật 24/7',
      ],
      ctaText: 'Nâng cấp gói Pro',
      ctaVariant: 'primary' as const,
      isPopular: true,
      onAction: onSelectPremium,
    },
  ]

  return (
    <section id="pricing" className="py-16 sm:py-24 bg-slate-50/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold bg-white text-[#FF3B30]">
            BẢNG GIÁ MINH BẠCH
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Gói dịch vụ phù hợp với mọi nhu cầu
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Chọn gói cước linh hoạt, không chi phí ẩn, bắt đầu miễn phí và nâng cấp khi cần mở rộng quy mô.
          </p>
        </div>

        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={`flex flex-col justify-between p-2 sm:p-4 bg-white ${
                plan.isPopular
                  ? 'border border-slate-200/80 relative overflow-hidden'
                  : 'border border-slate-200/80'
              }`}
            >
              {plan.isPopular && (
                <div className="absolute top-0 right-0 bg-brand-gradient text-white text-[10px] font-bold px-3 py-1 rounded-bl-[8px] tracking-wider uppercase flex items-center gap-1 border-l-2 border-b-2 border border-slate-200/80">
                  <Sparkles className="w-3 h-3" />
                  {plan.badge}
                </div>
              )}

              <div>
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <CardTitle className="text-xl text-slate-900">{plan.name}</CardTitle>
                    {!plan.isPopular && (
                      <span className="text-xs font-mono font-medium text-slate-500 px-2 py-0.5 rounded bg-slate-100">
                        {plan.badge}
                      </span>
                    )}
                  </div>
                  <CardDescription className="text-sm text-slate-500">
                    {plan.description}
                  </CardDescription>

                  <div className="pt-6 pb-2 flex items-baseline gap-1.5">
                    <span className="text-4xl font-extrabold text-slate-900 tracking-tight">
                      {plan.price}
                    </span>
                    <span className="text-slate-500 text-sm">{plan.period}</span>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3 pt-2">
                  <p className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Quyền lợi bao gồm:
                  </p>
                  <ul className="space-y-2.5">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2.5 text-sm text-slate-600">
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
