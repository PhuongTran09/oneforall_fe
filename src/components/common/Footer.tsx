import { Link } from 'react-router-dom'
import { MessageSquare, Mail, ShieldCheck, Heart } from 'lucide-react'

export function Footer() {
  const currentYear = new Date().getFullYear()

  const youtubeTools = [
    { label: 'YouTube sang MP4', to: '/youtube-to-mp4' },
    { label: 'YouTube sang MP3', to: '/youtube-to-mp3' },
    { label: 'Trình tải YouTube', to: '/youtube-downloader' },
  ]

  const tiktokTools = [
    { label: 'TikTok sang MP4', to: '/tiktok-to-mp4' },
    { label: 'TikTok sang MP3', to: '/tiktok-to-mp3' },
    { label: 'Trình tải TikTok', to: '/tiktok-downloader' },
  ]

  const convertTools = [
    { label: 'Chuyển đổi File đa năng', to: '/convert' },
    { label: 'Chuyển đổi PDF', to: '/pdf-converter' },
    { label: 'Chuyển đổi Tài liệu', to: '/document-converter' },
    { label: 'Chuyển đổi Video', to: '/video-converter' },
    { label: 'Chuyển đổi âm thanh', to: '/audio-converter' },
  ]

  const imageTools = [
    { label: 'Xóa nền ảnh (Remove BG)', to: '/remove-background' },
    { label: 'Nén dung lượng ảnh', to: '/image-compressor' },
    { label: 'Đổi kích thước ảnh (Resize)', to: '/image-resizer' },
    { label: 'Chuyển đổi định dạng ảnh', to: '/image-converter' },
  ]

  return (
    <footer className="w-full border-t border-[#2a2a35] bg-[#0a0a0f] mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 mb-12">
          {/* Brand Info (col-span-2) */}
          <div className="col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-10 h-10   flex items-center justify-center">
                <img src="/ofa.png" alt="OneForAll Logo" className="w-full h-full object-contain" />
              </div>
              <span className="font-bold text-xl tracking-tight text-white">
                One<span className="text-brand-gradient">ForAll</span>
              </span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              Nền tảng công cụ trực tuyến tất-cả-trong-một: Tải video YouTube, TikTok, chuyển đổi định dạng tài liệu, xử lý và nén ảnh tốc độ cao với FastAPI backend.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-lg bg-[#1a1a24] hover:bg-[#ff3b30]/15 text-slate-400 flex items-center justify-center transition-colors"
                aria-label="GitHub Repository"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
              </a>
              <a
                href="https://discord.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-lg bg-[#1a1a24] hover:bg-[#ff3b30]/15 text-slate-400 flex items-center justify-center transition-colors"
                aria-label="Discord Community"
              >
                <MessageSquare className="w-4 h-4" />
              </a>
              <a
                href="mailto:support@oneforall.app"
                className="w-9 h-9 rounded-lg bg-[#1a1a24] hover:bg-[#ff3b30]/15 text-slate-400 flex items-center justify-center transition-colors"
                aria-label="Email Support"
              >
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Column 1: YouTube Tools */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              YouTube
            </h4>
            <ul className="space-y-2">
              {youtubeTools.map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className="text-xs sm:text-sm text-slate-400 hover:text-[#FF3B30] transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 2: TikTok Tools */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              TikTok
            </h4>
            <ul className="space-y-2">
              {tiktokTools.map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className="text-xs sm:text-sm text-slate-400 hover:text-[#FF3B30] transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Chuyển đổi File */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              Chuyển đổi
            </h4>
            <ul className="space-y-2">
              {convertTools.map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className="text-xs sm:text-sm text-slate-400 hover:text-[#FF3B30] transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Xử lý Ảnh */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              Ảnh & Media
            </h4>
            <ul className="space-y-2">
              {imageTools.map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className="text-xs sm:text-sm text-slate-400 hover:text-[#FF3B30] transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-[#2a2a35]/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-1.5 text-emerald-600 font-medium">
            <ShieldCheck className="w-4 h-4" />
            <span>Mã hóa bảo mật đầu cuối • Tự động dọn dẹp sau 24h</span>
          </div>
          <p>© {currentYear} OneForAll. Bản quyền thuộc về nền tảng công cụ trực tuyến OneForAll.</p>
          <div className="flex items-center gap-1 text-slate-500">
            <span>Phát triển với</span>
            <Heart className="w-3.5 h-3.5 text-[#FF3B30] fill-[#FF3B30]" />
            <span>React + Vite + FastAPI</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
