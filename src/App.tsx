import { useEffect } from 'react'
import { AppRoutes } from './routes/AppRoutes'
import { statsApi } from './services/api/statsApi'
import './App.css'

// sid ngẫu nhiên theo tab, chỉ để đếm "bao nhiêu phiên đang mở trang". sessionStorage
// nên một tab giữ nguyên sid dù điều hướng bao nhiêu lần (không đếm trùng), tab mới
// là một phiên mới. Không chứa user_id, IP hay bất kỳ định danh nào.
const SID_KEY = 'ofa-presence-sid'
const BEAT_MS = 30_000

export function App() {
  useEffect(() => {
    const sid = sessionStorage.getItem(SID_KEY) ?? crypto.randomUUID()
    sessionStorage.setItem(SID_KEY, sid)

    const beat = () => {
      if (!document.hidden) void statsApi.beat(sid).catch(() => {})
    }
    beat()
    const timer = setInterval(beat, BEAT_MS)
    // Quay lại tab: báo ngay thay vì chờ hết nhịp, nếu không 5 phút cửa sổ có khoảng trống.
    document.addEventListener('visibilitychange', beat)
    return () => {
      clearInterval(timer)
      document.removeEventListener('visibilitychange', beat)
    }
  }, [])

  return <AppRoutes />
}

export default App
