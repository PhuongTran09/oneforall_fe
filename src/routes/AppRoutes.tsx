import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { MainLayout } from '../layouts/MainLayout'
import {
  HomePage,
  ToolLandingPage,
  NotFoundPage,
} from '../pages'
import { SEO_TOOLS } from '../config/seoTools'

export function AppRoutes() {
  const toolSlugs = Object.keys(SEO_TOOLS)

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
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

          {/* Trang 404 có điều hướng */}
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
