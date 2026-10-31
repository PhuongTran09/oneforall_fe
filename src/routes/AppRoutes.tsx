import { lazy } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { MainLayout } from '../layouts/MainLayout'
import { HomePage } from '../pages/HomePage'
import { ToolLandingPage } from '../pages/ToolLandingPage'
import { ToolsPage } from '../pages/ToolsPage'
import { CategoryPage } from '../pages/CategoryPage'
import { NotFoundPage } from '../pages/NotFoundPage'
import { SEO_TOOLS } from '../config/seoTools'
import { TOOL_CATEGORIES } from '../config/toolCategories'
import { useI18n } from '../i18n/langStore'

// Tách code theo route: page nào không nằm trên đường vào đầu thì chỉ tải khi
// người dùng thực sự tới. Trang chủ và landing SEO để nguyên — crawler và người
// vào thẳng URL đó, thêm một vòng xin chunk là nội dung prerender bị chớp.
// React.lazy đòi default export nên phải bọc named export của từng page.
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

// Bộ route dùng chung cho cả 2 locale: VI ở "/" và EN ở "/en" (ToolLandingPage tự
// resolve text EN theo lang từ URL). Phải gọi như function ({LocaleRoutes()}) vì
// <Routes> chỉ flatten <Route>/<Fragment>, không render component con.
function LocaleRoutes() {
  const toolSlugs = Object.keys(SEO_TOOLS)

  return (
    <>
      {/* Trang chủ */}
      <Route index element={<HomePage />} />

      {/* '/tools' + 6 trang danh mục. Path tường minh, không dùng ':param': '/tools/whatever'
          sẽ là bản sao soft-404 của cùng trang; không khớp thì rơi về route '*' hiện tại. */}
      <Route path="tools" element={<ToolsPage />} />
      {TOOL_CATEGORIES.map((cat) => (
        <Route key={cat.id} path={cat.path} element={<CategoryPage categoryId={cat.id} />} />
      ))}

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

      {/* Trang trải nghiệm không thuộc nhóm SEO tools: không nằm trong SEO_TOOLS nên không prerender/sitemap */}
      <Route path="case-opening" element={<CaseOpeningPage />} />
      <Route path="square-spin" element={<SquareSpinPage />} />

      {/* Trang tài khoản: Profile + Lịch sử xử lý (cần đăng nhập — page tự gate) */}
      <Route path="profile" element={<ProfilePage />} />
      <Route path="history" element={<HistoryPage />} />

      {/* Đích redirect của Supabase "Reset password" (route thực, không phải callback OAuth) */}
      <Route path="auth/reset-password" element={<ResetPasswordPage />} />

      {/* Đích SePay redirect về (success/cancel/error) — noindex, không phải trang SEO */}
      <Route path="payment-return" element={<PaymentReturnPage />} />

      {/* Trang pháp lý */}
      <Route path="terms" element={<TermsPage />} />
      <Route path="privacy" element={<PrivacyPage />} />

      {/* Trang 404 có điều hướng */}
      <Route path="*" element={<NotFoundPage />} />
    </>
  )
}

export function AppRoutes() {
  // Subscribe ở đây chứ không phải từng page: <Route element={<X/>}> giữ phần tử
  // ổn định nên MainLayout render lại vẫn không làm page con render lại — đổi VI/EN
  // chỉ ra URL mà chữ vẫn giữ ngôn ngữ cũ.
  useI18n()
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
