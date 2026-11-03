import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { getSavedLangPref, syncLangFromPath } from './langStore'


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
