import { useState, useEffect, useRef, type MouseEvent, type TouchEvent } from 'react'
import { Sparkles, Eye } from 'lucide-react'
import { t } from '../../i18n/langStore'

export interface BeforeAfterPreviewProps {
  originalUrl: string
  processedUrl: string
  originalLabel?: string
  processedLabel?: string
}

export function BeforeAfterPreview({
  originalUrl,
  processedUrl,
  originalLabel,
  processedLabel,
}: BeforeAfterPreviewProps) {
  const originalText = originalLabel ?? t('compare.original')
  const processedText = processedLabel ?? t('compare.processed')
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
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-200">
          <Sparkles className="w-4 h-4 text-brand" />
          <span>{t('compare.title')}</span>
        </div>
        {/* Tab switcher — keep compact rounded inner buttons, outer is clipped */}
        <div className="flex items-center gap-1 bg-brand/10 p-0.5 border border-edge clip-corner-btn text-xs font-medium text-slate-200">
          <button
            type="button"
            onClick={() => setActiveTab('slider')}
            className={`px-2.5 py-1 transition-all cursor-pointer clip-corner-btn ${
              activeTab === 'slider'
                ? 'bg-surface text-ink font-semibold border border-edge'
                : 'hover:text-ink'
            }`}
          >
            {t('compare.slider')}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('side-by-side')}
            className={`px-2.5 py-1 transition-all cursor-pointer clip-corner-btn ${
              activeTab === 'side-by-side'
                ? 'bg-surface text-ink font-semibold border border-edge'
                : 'hover:text-ink'
            }`}
          >
            {t('compare.sideBySide')}
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
          className="relative w-full h-[320px] sm:h-[400px] overflow-hidden select-none cursor-ew-resize border border-edge clip-corner-lg bg-[linear-gradient(45deg,var(--bg-elevated)_25%,transparent_25%),linear-gradient(-45deg,var(--bg-elevated)_25%,transparent_25%),linear-gradient(45deg,transparent_75%,var(--bg-elevated)_75%),linear-gradient(-45deg,transparent_75%,var(--bg-elevated)_75%)] bg-[size:20px_20px] bg-[position:0_0,0_10px,10px_-10px,-10px_0]"
        >
          {/* Background: Processed Image */}
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <img
              src={processedUrl}
              alt={processedText}
              referrerPolicy="no-referrer"
              className="max-h-full max-w-full object-contain pointer-events-none"
            />
          </div>

          {/* Foreground: Original Image clipped by slider */}
          <div
            className="absolute inset-0 overflow-hidden bg-page/40"
            style={{ width: `${sliderPosition}%` }}
          >
            <div className="relative w-full h-full flex items-center justify-center p-4">
              <img
                src={originalUrl}
                alt={originalText}
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
            className="absolute top-0 bottom-0 w-1 bg-brand pointer-events-none z-10"
            style={{ left: `${sliderPosition}%` }}
          >
            {/* Drag handle — square with clip */}
            <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 bg-surface border border-[rgba(255,59,48,0.55)] flex items-center justify-center text-slate-200 clip-corner-btn">
              <div className="flex gap-0.5 items-center">
                {/* These tiny pips are fine as rounded — they're decorative and tiny */}
                <span className="w-0.5 h-3 bg-slate-400 rounded-full" />
                <span className="w-0.5 h-3 bg-slate-400 rounded-full" />
              </div>
            </div>
          </div>

          {/* Labels */}
          <span className="absolute top-3 left-3 z-20 px-2.5 py-1 text-[11px] font-semibold bg-surface text-ink border border-edge clip-corner-btn">
            {originalText}
          </span>
          <span className="absolute top-3 right-3 z-20 px-2.5 py-1 text-[11px] font-semibold bg-brand text-white clip-corner-btn">
            {processedText}
          </span>
        </div>
      ) : (
        /* Side by side */
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="border border-edge bg-surface p-3 space-y-2 clip-corner-card">
            <span className="text-xs font-semibold text-slate-200 flex items-center gap-1">
              <Eye className="w-3.5 h-3.5 text-slate-400" />
              {originalText}
            </span>
            <div className="w-full h-56 bg-page flex items-center justify-center overflow-hidden p-2 clip-corner-card">
              <img
                src={originalUrl}
                alt={originalText}
                className="max-h-full max-w-full object-contain"
              />
            </div>
          </div>

          <div className="border border-[rgba(255,59,48,0.35)] bg-surface p-3 space-y-2 clip-corner-card">
            <span className="text-xs font-semibold text-brand flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              {processedText}
            </span>
            <div className="w-full h-56 flex items-center justify-center overflow-hidden p-2 clip-corner-card bg-[linear-gradient(45deg,var(--bg-elevated)_25%,transparent_25%),linear-gradient(-45deg,var(--bg-elevated)_25%,transparent_25%),linear-gradient(45deg,transparent_75%,var(--bg-elevated)_75%),linear-gradient(-45deg,transparent_75%,var(--bg-elevated)_75%)] bg-[size:16px_16px] bg-[position:0_0,0_8px,8px_-8px,-8px_0]">
              <img
                src={processedUrl}
                alt={processedText}
                referrerPolicy="no-referrer"
                className="max-h-full max-w-full object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
