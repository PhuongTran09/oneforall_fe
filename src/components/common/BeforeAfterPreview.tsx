import { useState, useEffect, useRef, type MouseEvent, type TouchEvent } from 'react'
import { Sparkles, Eye } from 'lucide-react'

export interface BeforeAfterPreviewProps {
  originalUrl: string
  processedUrl: string
  originalLabel?: string
  processedLabel?: string
}

export function BeforeAfterPreview({
  originalUrl,
  processedUrl,
  originalLabel = 'Ảnh gốc',
  processedLabel = 'Sau khi xóa nền',
}: BeforeAfterPreviewProps) {
  const [sliderPosition, setSliderPosition] = useState(50)
  const [isDragging, setIsDragging] = useState(false)
  const [activeTab, setActiveTab] = useState<'slider' | 'side-by-side'>('slider')
  const [containerWidth, setContainerWidth] = useState<number>(0)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth)
      }
    }
    updateWidth()
    window.addEventListener('resize', updateWidth)
    return () => window.removeEventListener('resize', updateWidth)
  }, [])

  const handleMove = (clientX: number) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = clientX - rect.left
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100))
    setSliderPosition(percentage)
  }

  const handleMouseDown = () => setIsDragging(true)
  const handleMouseUp = () => setIsDragging(false)
  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) handleMove(e.clientX)
  }

  const handleTouchStart = () => setIsDragging(true)
  const handleTouchEnd = () => setIsDragging(false)
  const handleTouchMove = (e: TouchEvent) => {
    if (isDragging && e.touches[0]) handleMove(e.touches[0].clientX)
  }

  return (
    <div className="w-full max-w-3xl mx-auto space-y-3">
      {/* Tab toggle */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
          <Sparkles className="w-4 h-4 text-[#FF3B30]" />
          <span>So sánh trực quan trước / sau</span>
        </div>
        <div className="flex items-center gap-1 bg-red-50 p-0.5 rounded-2xl text-xs font-medium text-slate-700 border border-slate-200/80">
          <button
            type="button"
            onClick={() => setActiveTab('slider')}
            className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
              activeTab === 'slider' ? 'bg-white text-slate-900 font-semibold border border-slate-200/80' : 'hover:text-slate-900'
            }`}
          >
            Thanh trượt
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('side-by-side')}
            className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
              activeTab === 'side-by-side' ? 'bg-white text-slate-900 font-semibold border border-slate-200/80' : 'hover:text-slate-900'
            }`}
          >
            Song song
          </button>
        </div>
      </div>

      {activeTab === 'slider' ? (
        <div
          ref={containerRef}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onMouseMove={handleMouseMove}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onTouchMove={handleTouchMove}
          className="relative w-full h-[320px] sm:h-[400px] rounded-2xl overflow-hidden select-none cursor-ew-resize border border-slate-200/80 bg-[linear-gradient(45deg,#fff1f2_25%,transparent_25%),linear-gradient(-45deg,#fff1f2_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#fff1f2_75%),linear-gradient(-45deg,transparent_75%,#fff1f2_75%)] bg-[size:20px_20px] bg-[position:0_0,0_10px,10px_-10px,-10px_0]"
        >
          {/* Background: Processed Image (Transparent background) */}
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <img
              src={processedUrl}
              alt={processedLabel}
              className="max-h-full max-w-full object-contain pointer-events-none"
            />
          </div>

          {/* Foreground: Original Image (Clipped by slider position) */}
          <div
            className="absolute inset-0 overflow-hidden bg-white/40"
            style={{ width: `${sliderPosition}%` }}
          >
            <div className="relative w-full h-full flex items-center justify-center p-4">
              <img
                src={originalUrl}
                alt={originalLabel}
                className="max-h-full max-w-full object-contain pointer-events-none"
                style={{
                  width: containerWidth > 0 ? `${containerWidth}px` : '100%',
                  maxWidth: 'none',
                }}
              />
            </div>
          </div>

          {/* Vertical divider line */}
          <div
            className="absolute top-0 bottom-0 w-1 bg-[#FF3B30] pointer-events-none z-10"
            style={{ left: `${sliderPosition}%` }}
          >
            <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-2xl bg-white border border-slate-200/80 flex items-center justify-center text-slate-700">
              <div className="flex gap-0.5 items-center">
                <span className="w-0.5 h-3 bg-slate-400 rounded-full" />
                <span className="w-0.5 h-3 bg-slate-400 rounded-full" />
              </div>
            </div>
          </div>

          {/* Badges */}
          <span className="absolute top-3 left-3 z-20 px-2.5 py-1 rounded-[6px] text-[11px] font-semibold bg-slate-900 text-white border-2 border-white">
            {originalLabel}
          </span>
          <span className="absolute top-3 right-3 z-20 px-2.5 py-1 rounded-[6px] text-[11px] font-semibold bg-red-600 text-white border-2 border-white">
            {processedLabel}
          </span>
        </div>
      ) : (
        /* Side by side view */
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-3 space-y-2">
            <span className="text-xs font-semibold text-slate-700 flex items-center gap-1">
              <Eye className="w-3.5 h-3.5 text-slate-400" />
              {originalLabel}
            </span>
            <div className="w-full h-56 rounded-xl bg-slate-50 flex items-center justify-center overflow-hidden p-2">
              <img
                src={originalUrl}
                alt={originalLabel}
                className="max-h-full max-w-full object-contain"
              />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-3 space-y-2">
            <span className="text-xs font-semibold text-[#FF3B30] flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              {processedLabel}
            </span>
            <div className="w-full h-56 rounded-xl flex items-center justify-center overflow-hidden p-2 bg-[linear-gradient(45deg,#f1f5f9_25%,transparent_25%),linear-gradient(-45deg,#f1f5f9_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#f1f5f9_75%),linear-gradient(-45deg,transparent_75%,#f1f5f9_75%)] bg-[size:16px_16px] bg-[position:0_0,0_8px,8px_-8px,-8px_0]">
              <img
                src={processedUrl}
                alt={processedLabel}
                className="max-h-full max-w-full object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
