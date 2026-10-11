import { ArrowRight, Sparkles, Zap, Shield, FileCheck, Layers } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '../common/Button'
import { Card } from '../common/Card'

export interface HeroSectionProps {
  onTryFree?: () => void
}

export function HeroSection({ onTryFree }: HeroSectionProps) {
  const quickTools = [
    { label: 'YouTube to MP4', to: '/youtube-to-mp4', badge: 'Hot' },
    { label: 'TikTok to MP4', to: '/tiktok-to-mp4', badge: 'Fast' },
    { label: 'Xóa nền ảnh', to: '/remove-background', badge: 'AI' },
    { label: 'Chuyển đổi PDF', to: '/pdf-converter', badge: 'Doc' },
    { label: 'Nén ảnh', to: '/image-compressor', badge: 'WebP' },
  ]

  return (
    <section className="relative pt-10 pb-16 sm:pt-16 sm:pb-24 overflow-hidden bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto space-y-6">
          {/* Release Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white text-[#FF3B30] text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-[#FF3B30]" />
            <span>OneForAll SaaS • Xử lý đa phương tiện tốc độ cao</span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
            Nền tảng công cụ trực tuyến{' '}
            <span className="text-brand-gradient">
              tất-cả-trong-một
            </span>{' '}
            cho mọi nhu cầu
          </h1>

          {/* Description */}
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
            Tải video YouTube & TikTok không watermark, xóa nền ảnh thông minh, nén dung lượng và chuyển đổi hơn 50+ định dạng tài liệu tức thì qua backend FastAPI và Celery bất đồng bộ.
          </p>

          {/* Quick Action Tools Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
            <span className="text-xs font-semibold text-slate-500 mr-1">Truy cập nhanh:</span>
            {quickTools.map((t) => (
              <Link
                key={t.to}
                to={t.to}
                className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold bg-white text-slate-700 hover:text-[#FF3B30]"
              >
                <span>{t.label}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-red-50 text-[#FF3B30] font-bold">
                  {t.badge}
                </span>
              </Link>
            ))}
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-3">
            <a href="#tools" className="w-full sm:w-auto">
              <Button
                variant="primary"
                size="lg"
                rightIcon={<ArrowRight className="w-5 h-5" />}
                className="w-full sm:w-auto"
              >
                Khám phá toàn bộ công cụ
              </Button>
            </a>
            {onTryFree && (
              <Button
                variant="secondary"
                size="lg"
                onClick={onTryFree}
                leftIcon={<Layers className="w-4 h-4 text-slate-600" />}
                className="w-full sm:w-auto"
              >
                Tài khoản Pro
              </Button>
            )}
          </div>

          {/* Feature Highlights Pills */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs sm:text-sm text-slate-500">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              <span>Xử lý luồng tức thì</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-500" />
              <span>Bảo mật, tự hủy sau 3 phút</span>
            </div>
            <div className="flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-[#FF3B30]" />
              <span>Hỗ trợ 50+ định dạng</span>
            </div>
          </div>
        </div>

        {/* Hero Interactive Preview Mockup */}
        <div className="mt-12 sm:mt-16 max-w-4xl mx-auto">
          <Card hoverEffect={false} className="border border-slate-200/80 bg-white p-4 sm:p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-400" />
                <span className="w-3 h-3 rounded-full bg-amber-400" />
                <span className="w-3 h-3 rounded-full bg-emerald-400" />
                <span className="ml-2 text-xs font-mono text-slate-400">oneforall.internal/engine/cluster</span>
              </div>
              <span className="text-xs font-mono px-2.5 py-0.5 rounded-2xl bg-emerald-50 text-emerald-700 border-2 border-emerald-500 font-bold">
                FastAPI 200 OK • Celery Active
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 rounded-2xl bg-white border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-[#FF3B30] font-semibold">IMAGE REMOVE BG</span>
                  <span className="text-[11px] px-1.5 py-0.5 rounded-[6px] bg-red-100 text-[#FF3B30] border border-amber-200 font-bold">BiRefNet AI</span>
                </div>
                <p className="text-sm font-medium text-slate-800 truncate">portrait_sample.png</p>
                <div className="w-full h-2 overflow-hidden">
                  <div className="bg-brand-gradient h-full w-full" />
                </div>
                <div className="flex justify-between text-[11px] text-slate-500 pt-1">
                  <span>PNG → Transparent</span>
                  <span className="text-emerald-600 font-semibold">Hoàn tất (0.4s)</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-[#FF6B4A] font-semibold">YOUTUBE MEDIA</span>
                  <span className="text-[11px] px-1.5 py-0.5 rounded-[6px] bg-amber-100 text-amber-900 border border-amber-500 font-bold">1080p MP4</span>
                </div>
                <p className="text-sm font-medium text-slate-800 truncate">music_video_hd.mp4</p>
                <div className="w-full h-2 overflow-hidden">
                  <div className="bg-brand-gradient h-full w-[88%] animate-pulse" />
                </div>
                <div className="flex justify-between text-[11px] text-slate-500 pt-1">
                  <span>yt-dlp Stream</span>
                  <span className="text-amber-600 font-semibold">88% (Đang ghép kênh)</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-indigo-600 font-semibold">DOCUMENT CONVERT</span>
                  <span className="text-[11px] px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-700 font-medium">DOCX → PDF</span>
                </div>
                <p className="text-sm font-medium text-slate-800 truncate">bao_cao_tai_chinh.docx</p>
                <div className="w-full h-2 overflow-hidden">
                  <div className="bg-[#2563eb] h-full w-full" />
                </div>
                <div className="flex justify-between text-[11px] text-slate-500 pt-1">
                  <span>Format Conversion</span>
                  <span className="text-emerald-600 font-semibold">Sẵn sàng tải về</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  )
}
