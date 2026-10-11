import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Video,
  FileSpreadsheet,
  Image as ImageIcon,
  FileText,
  Music,
  Scissors,
} from 'lucide-react'
import type { ToolConfig } from '../../config/seoTools'

function YoutubeIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  )
}

function getToolIcon(category: string, slug?: string) {
  if (slug?.includes('remove-background')) {
    return <Scissors className="w-5 h-5 text-[#FF3B30]" />
  }
  if (slug?.includes('mp3') || category === 'media') {
    return <Music className="w-5 h-5 text-purple-600" />
  }
  if (category === 'youtube') {
    return <YoutubeIcon className="w-5 h-5 text-[#FF3B30]" />
  }
  if (category === 'tiktok') {
    return <Video className="w-5 h-5 text-[#FF6B4A]" />
  }
  if (category === 'image') {
    return <ImageIcon className="w-5 h-5 text-indigo-500" />
  }
  if (category === 'document') {
    return <FileText className="w-5 h-5 text-blue-500" />
  }
  return <FileSpreadsheet className="w-5 h-5 text-emerald-500" />
}

export interface ToolCardProps {
  tool: ToolConfig
}

export function ToolCard({ tool }: ToolCardProps) {
  return (
    <Link
      to={tool.slug}
      className="group flex flex-col justify-between p-5 sm:p-6 rounded-2xl bg-[#14141b] border border-[#2a2a35] hover:border-[#FF3B30]/50 transition-all duration-200 card-3d"
    >
      <div>
        {/* Top Header */}
        <div className="flex items-center justify-between gap-2 mb-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#0a0a0f] border border-[#2a2a35] flex items-center justify-center group-hover:scale-105 group-hover:bg-[#ff3b30]/10 transition-all">
            {getToolIcon(tool.category, tool.slug)}
          </div>
          <span className="text-[11px] font-medium font-mono px-2 py-0.5 rounded-full bg-[#1a1a24] text-slate-300 group-hover:bg-[#ff3b30]/10 group-hover:text-[#FF3B30] transition-colors">
            {tool.badge}
          </span>
        </div>

        {/* Title */}
        <h3 className="font-bold text-white text-base group-hover:text-[#FF3B30] transition-colors leading-snug mb-1.5">
          {tool.h1}
        </h3>

        {/* Subtitle / Description */}
        <p className="text-xs sm:text-sm text-slate-400 line-clamp-2 leading-relaxed">
          {tool.subtitle}
        </p>
      </div>

      {/* Footer Info */}
      <div className="pt-4 mt-4 border-t border-[#2a2a35]/60 flex items-center justify-between">
        <div className="flex items-center gap-1.5 flex-wrap">
          {tool.outputFormats.slice(0, 3).map((fmt) => (
            <span
              key={fmt}
              className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#1a1a24] text-slate-300 uppercase"
            >
              .{fmt}
            </span>
          ))}
          {tool.outputFormats.length > 3 && (
            <span className="text-[10px] text-slate-500">+{tool.outputFormats.length - 3}</span>
          )}
        </div>

        <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#FF3B30] group-hover:translate-x-1 transition-transform">
          <span>Dùng ngay</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </Link>
  )
}
