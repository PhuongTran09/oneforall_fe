import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { getSavedLangPref, syncLangFromPath } from './langStore'

// Chỉ auto-redirect 1 lần mỗi lần tải trang — không loop khi user chủ động về /
let autoRedirectDone = false

export function LangRouteSync() {
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    syncLangFromPath(location.pathname)
  }, [location.pathname])

  useEffect(() => {
    if (autoRedirectDone) return
    autoRedirectDone = true
    if (location.pathname === '/' && getSavedLangPref() === 'en') {
      navigate('/en', { replace: true })
    }
  }, [location.pathname, navigate])

  return null
}
