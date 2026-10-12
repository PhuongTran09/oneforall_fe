import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { MainLayout } from '../layouts/MainLayout'
import {
  HomePage,
  ToolLandingPage,
  NotFoundPage,
  TermsPage,
  PrivacyPage,
} from '../pages'
import { SEO_TOOLS } from '../config/seoTools'

// Bộ route dùng chung cho cả 2 locale: VI ở "/" và EN ở "/en" (ToolLandingPage tự
// resolve text EN theo lang từ URL). Phải gọi như function ({LocaleRoutes()}) vì
// <Routes> chỉ flatten <Route>/<Fragment>, không render component con.
function LocaleRoutes() {
  const toolSlugs = Object.keys(SEO_TOOLS)

  return (
    <>
      {/* Trang chủ */}
      <Route index element={<HomePage />} />

      {/* Tất cả 15 SEO Landing Pages được định tuyến độc lập */}
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

      {/* Các alias tiện lợi */}
      <Route
        path="image"
        element={<ToolLandingPage configOverride={SEO_TOOLS['/remove-background']} />}
      />
      <Route
        path="video"
        element={<ToolLandingPage configOverride={SEO_TOOLS['/video-converter']} />}
      />

      {/* Trang pháp lý */}
      <Route path="terms" element={<TermsPage />} />
      <Route path="privacy" element={<PrivacyPage />} />

      {/* Trang 404 có điều hướng */}
      <Route path="*" element={<NotFoundPage />} />
    </>
  )
}

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          {LocaleRoutes()}
        </Route>
        <Route path="/en" element={<MainLayout />}>
          {LocaleRoutes()}
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
