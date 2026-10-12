import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ToastProvider } from './components/feedback/ToastProvider'
import { initCardMotion } from './utils/cardMotion'
import { applyTheme, getTheme } from './utils/theme'
import { initLang } from './i18n/langStore'

initCardMotion()
applyTheme(getTheme())
initLang()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ToastProvider>
      <App />
    </ToastProvider>
  </StrictMode>,
)
