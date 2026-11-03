import { useEffect } from 'react'
import { AppRoutes } from './routes/AppRoutes'
import { statsApi } from './services/api/statsApi'
import './App.css'




const SID_KEY = 'ofa-presence-sid'
const BEAT_MS = 60_000
const MIN_BEAT_GAP_MS = 5_000
let lastBeatAt = 0
let beatInFlight: Promise<void> | null = null

export function App() {
  useEffect(() => {
    const sid = sessionStorage.getItem(SID_KEY) ?? crypto.randomUUID()
    sessionStorage.setItem(SID_KEY, sid)

    const beat = () => {
      if (document.hidden || beatInFlight || Date.now() - lastBeatAt < MIN_BEAT_GAP_MS) return
      lastBeatAt = Date.now()
      beatInFlight = statsApi.beat(sid).catch(() => {}).finally(() => {
        beatInFlight = null
      })
    }
    beat()
    const timer = setInterval(beat, BEAT_MS)

    document.addEventListener('visibilitychange', beat)
    return () => {
      clearInterval(timer)
      document.removeEventListener('visibilitychange', beat)
    }
  }, [])

  return <AppRoutes />
}

export default App
