import { useEffect, useRef } from 'react'
import { t } from '../../i18n/langStore'
import { useAdsDecision } from '../../services/adScripts'

const enabled = import.meta.env.VITE_ADSENSE_ENABLED === 'true'
const client = import.meta.env.VITE_ADSENSE_CLIENT

let scriptRequested = false

function loadAdSenseScript() {
  if (scriptRequested || !client) return
  if (document.querySelector('script[src^="https://pagead2.googlesyndication.com"]')) {
    scriptRequested = true
    return
  }
  const script = document.createElement('script')
  script.async = true
  script.crossOrigin = 'anonymous'
  script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(client)}`
  document.head.appendChild(script)
  scriptRequested = true
}

export interface AdSenseUnitProps {
  slot: string
  className?: string
}

export function AdSenseUnit({ slot, className = '' }: AdSenseUnitProps) {
  const adsDecision = useAdsDecision()
  const active = enabled && !!client && !!slot && adsDecision === 'load'
  const pushed = useRef(false)

  useEffect(() => {
    if (!active || pushed.current) return
    pushed.current = true
    loadAdSenseScript()
    try {
      ((window as unknown as { adsbygoogle?: unknown[] }).adsbygoogle =
        (window as unknown as { adsbygoogle?: unknown[] }).adsbygoogle || []).push({})
    } catch {
      // shortcut: AdSense tự xử lý slot chưa sẵn sàng, FE không retry — nâng cấp nếu cần đo fill rate
    }
  }, [active])

  if (!active) return null

  return (
    <div className={`w-full py-6 ${className}`}>
      <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-2">{t('common.adLabel')}</p>
      {/* Chỗ trống tối thiểu để quảng cáo chưa tải không làm nhảy layout */}
      <div className="min-h-[90px] sm:min-h-[250px] clip-corner-card border border-edge bg-surface">
        <ins
          className="adsbygoogle"
          style={{ display: 'block' }}
          data-ad-client={client}
          data-ad-slot={slot}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>
    </div>
  )
}
