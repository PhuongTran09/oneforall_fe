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

// root.render() chỉ lịch công việc chứ chưa chắc đã paint xong; gỡ shell ở hai frame sau để
// nội dung thật đã lên màn trước khi lớp phủ biến mất — một nhịp, không phải hai.
// Shell là #prerender-shell do scripts/prerender.js đặt làm ANH EM của #root (nằm ngoài nên
// commit đầu của createRoot không xoá được nó), vì vậy chỗ gỡ nó thuộc về file này.
requestAnimationFrame(() =>
  requestAnimationFrame(() => document.getElementById('prerender-shell')?.remove()),
)
