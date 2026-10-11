import { useEffect, useState } from 'react'
import { apiClient } from '../../services/api/client'
import { env } from '../../utils/env'

type StatusState = 'checking' | 'connected' | 'disconnected'

export function BackendStatus() {
  const [status, setStatus] = useState<StatusState>('checking')

  useEffect(() => {
    let isMounted = true

    const check = async () => {
      const result = await apiClient.checkHealth()
      if (isMounted) {
        setStatus(result.ok ? 'connected' : 'disconnected')
      }
    }

    check()
    const timer = setInterval(check, 30000)

    return () => {
      isMounted = false
      clearInterval(timer)
    }
  }, [])

  const dotColors = {
    checking: 'bg-amber-400 animate-pulse',
    connected: 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]',
    disconnected: 'bg-rose-500',
  }

  const statusLabels = {
    checking: 'Đang kết nối...',
    connected: 'FastAPI Active',
    disconnected: 'FastAPI Offline',
  }

  return (
    <div
      className="hidden sm:inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-mono bg-[#1a1a24] border border-[#2a2a35] text-slate-200"
      title={`API Target: ${env.apiBaseUrl} (Proxy: ${env.apiProxyTarget})`}
    >
      <span className={`w-2 h-2 rounded-full ${dotColors[status]}`} aria-hidden="true" />
      <span className="text-[11px] font-medium tracking-tight text-slate-300">
        {statusLabels[status]}
      </span>
    </div>
  )
}
