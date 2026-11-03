import { lazy } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { MainLayout } from '../layouts/MainLayout'
import { SmoothScrollProvider } from '../components/common/SmoothScrollProvider'
import { HomePage } from '../pages/HomePage'
import { ToolLandingPage } from '../pages/ToolLandingPage'
import { ToolsPage } from '../pages/ToolsPage'
import { CategoryPage } from '../pages/CategoryPage'
import { NotFoundPage } from '../pages/NotFoundPage'
import { SEO_TOOLS } from '../config/seoTools'
import { TOOL_CATEGORIES } from '../config/toolCategories'
import { useI18n, withLocale } from '../i18n/langStore'





const CaseOpeningPage = lazy(() =>
  import('../pages/CaseOpeningPage').then((m) => ({ default: m.CaseOpeningPage })),
)
const SquareSpinPage = lazy(() =>
  import('../pages/SquareSpinPage').then((m) => ({ default: m.SquareSpinPage })),
)
const ProfilePage = lazy(() => import('../pages/ProfilePage').then((m) => ({ default: m.ProfilePage })))
const HistoryPage = lazy(() => import('../pages/HistoryPage').then((m) => ({ default: m.HistoryPage })))
const ResetPasswordPage = lazy(() =>
  import('../pages/ResetPasswordPage').then((m) => ({ default: m.ResetPasswordPage })),
)
const PaymentReturnPage = lazy(() =>
  import('../pages/PaymentReturnPage').then((m) => ({ default: m.PaymentReturnPage })),
)
const TermsPage = lazy(() => import('../pages/legal/TermsPage').then((m) => ({ default: m.TermsPage })))
const PrivacyPage = lazy(() =>
  import('../pages/legal/PrivacyPage').then((m) => ({ default: m.PrivacyPage })),
)





const LEGACY_TOOL_PATHS: Record<string, string> = {
  'youtube-to-mp4': '/youtube-downloader',
  'youtube-to-mp3': '/youtube-downloader',
  'tiktok-to-mp4': '/tiktok-downloader',
  'tiktok-to-mp3': '/tiktok-downloader',
}




function LocaleRoutes() {
  const toolSlugs = Object.keys(SEO_TOOLS)

  return (
    <>

      <Route index element={<HomePage />} />



      <Route path="tools" element={<ToolsPage />} />
      {TOOL_CATEGORIES.map((cat) => (
        <Route key={cat.id} path={cat.path} element={<CategoryPage categoryId={cat.id} />} />
      ))}


      {toolSlugs.map((slug) => {
        const cleanPath = slug.replace(/^\//, '')
        return (
          <Route
            key={slug}
            path={cleanPath}
            element={<ToolLandingPage configOverride={SEO_TOOLS[slug]} />}
          />
        )
      })}


      {Object.entries(LEGACY_TOOL_PATHS).map(([from, to]) => (
        <Route key={from} path={from} element={<Navigate to={withLocale(to)} replace />} />
      ))}


      <Route
        path="image"
        element={<ToolLandingPage configOverride={SEO_TOOLS['/remove-background']} />}
      />
      <Route
        path="video"
        element={<ToolLandingPage configOverride={SEO_TOOLS['/video-converter']} />}
      />


      <Route path="case-opening" element={<CaseOpeningPage />} />
      <Route path="square-spin" element={<SquareSpinPage />} />


      <Route path="profile" element={<ProfilePage />} />
      <Route path="history" element={<HistoryPage />} />


      <Route path="auth/reset-password" element={<ResetPasswordPage />} />


      <Route path="payment-return" element={<PaymentReturnPage />} />


      <Route path="terms" element={<TermsPage />} />
      <Route path="privacy" element={<PrivacyPage />} />


      <Route path="*" element={<NotFoundPage />} />
    </>
  )
}

export function AppRoutes() {



  useI18n()
  return (
    <BrowserRouter>



      <SmoothScrollProvider>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            {LocaleRoutes()}
          </Route>
          <Route path="/en" element={<MainLayout />}>
            {LocaleRoutes()}
          </Route>
        </Routes>
      </SmoothScrollProvider>
    </BrowserRouter>
  )
}
