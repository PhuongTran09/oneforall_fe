import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ToastProvider } from './components/feedback/ToastProvider'
import { ErrorBoundary } from './components/feedback/ErrorBoundary'
import { ErrorPopupViewport } from './components/feedback/ErrorPopupViewport'
import { CaptchaModal } from './components/feedback/CaptchaModal'
import { BackendStatusBanner } from './components/feedback/BackendStatusBanner'
import { initCardMotion } from './utils/cardMotion'
import { applyTheme, getTheme } from './utils/theme'
import { initLang } from './i18n/langStore'

initCardMotion()
applyTheme(getTheme())
initLang()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <ToastProvider>
        <App />
        <ErrorPopupViewport />
        <CaptchaModal />
        <BackendStatusBanner />
      </ToastProvider>
    </ErrorBoundary>
  </StrictMode>,
)

// root.render() chỉ lịch công việc chứ chưa chắc đã paint xong; gỡ boot-loader ở hai
// frame sau để không lộ một nhịp màn hình trống.
requestAnimationFrame(() =>
  requestAnimationFrame(() => document.getElementById('boot-loader')?.remove()),
)
