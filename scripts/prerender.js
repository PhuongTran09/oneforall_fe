import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')
const distDir = path.resolve(rootDir, 'dist')

// Đọc seoTools config từ source
const seoToolsPath = path.resolve(rootDir, 'src/config/seoTools.ts')
const seoToolsSource = fs.readFileSync(seoToolsPath, 'utf8')

// Helper parse đơn giản các công cụ từ config seoTools.ts
function extractToolsFromSource(source) {
  const tools = {}
  const blockRegex = /'(\/[a-z0-9-]+)':\s*\{([\s\S]*?)(?=\n  '\/|\n\})/g
  let match

  while ((match = blockRegex.exec(source)) !== null) {
    const slug = match[1]
    const content = match[2]

    const getField = (fieldName) => {
      const fieldRegex = new RegExp(`${fieldName}:\\s*['"]([\\s\\S]*?)['"][,\\n]`)
      const m = content.match(fieldRegex)
      return m ? m[1].replace(/\\'/g, "'").replace(/\\"/g, '"') : ''
    }

    const title = getField('title')
    const metaDescription = getField('metaDescription')
    const h1 = getField('h1')
    const subtitle = getField('subtitle')
    const badge = getField('badge')
    const supportedFormatsDesc = getField('supportedFormatsDesc')

    // Parse FAQ list
    const faqList = []
    const faqMatch = content.match(/faqList:\s*\[([\s\S]*?)\]\s*,/)
    if (faqMatch) {
      const qRegex = /\{\s*q:\s*['"](.*?)['"],\s*a:\s*['"](.*?)['"]\s*\}/g
      let qm
      while ((qm = qRegex.exec(faqMatch[1])) !== null) {
        faqList.push({ q: qm[1], a: qm[2] })
      }
    }

    // Parse how it works
    const steps = []
    const stepsMatch = content.match(/howItWorksSteps:\s*\[([\s\S]*?)\]\s*,/)
    if (stepsMatch) {
      const sRegex = /step:\s*['"](.*?)['"],\s*title:\s*['"](.*?)['"],\s*desc:\s*['"](.*?)['"]/g
      let sm
      while ((sm = sRegex.exec(stepsMatch[1])) !== null) {
        steps.push({ step: sm[1], title: sm[2], desc: sm[3] })
      }
    }

    tools[slug] = {
      slug,
      title,
      metaDescription,
      h1,
      subtitle,
      badge,
      supportedFormatsDesc,
      faqList,
      steps,
    }
  }

  return tools
}

export function runPrerender() {
  if (!fs.existsSync(distDir)) {
    console.error('dist directory does not exist. Run vite build first.')
    return
  }

  const baseTemplatePath = path.resolve(distDir, 'index.html')
  if (!fs.existsSync(baseTemplatePath)) {
    console.error('dist/index.html does not exist.')
    return
  }

  const baseHtml = fs.readFileSync(baseTemplatePath, 'utf8')
  const tools = extractToolsFromSource(seoToolsSource)
  const slugs = Object.keys(tools)

  console.log(`[SEO Prerender] Starting prerender for ${slugs.length} landing pages...`)

  for (const slug of slugs) {
    const tool = tools[slug]
    const canonicalUrl = `https://oneforall.io.vn${tool.slug}`

    // 1. Tạo JSON-LD Schema
    const schemaData = []

    if (tool.faqList && tool.faqList.length > 0) {
      schemaData.push({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: tool.faqList.map((f) => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: {
            '@type': 'Answer',
            text: f.a,
          },
        })),
      })
    }

    schemaData.push({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Trang chủ', item: 'https://oneforall.io.vn/' },
        { '@type': 'ListItem', position: 2, name: tool.badge || 'Công cụ', item: canonicalUrl },
      ],
    })

    const schemaTags = schemaData
      .map((s) => {
        const id = s['@type'] === 'FAQPage' ? 'faq-jsonld' : 'breadcrumb-jsonld'
        return `<script id="${id}" type="application/ld+json">${JSON.stringify(s)}</script>`
      })
      .join('\n    ')

    // 2. Head SEO tags
    const metaTags = `
    <title>${tool.title || 'OneForAll Tools'}</title>
    <meta name="description" content="${tool.metaDescription || ''}" />
    <link rel="canonical" href="${canonicalUrl}" />
    <meta name="robots" content="index, follow" />
    <meta property="og:title" content="${tool.title || ''}" />
    <meta property="og:description" content="${tool.metaDescription || ''}" />
    <meta property="og:url" content="${canonicalUrl}" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="OneForAll" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${tool.title || ''}" />
    <meta name="twitter:description" content="${tool.metaDescription || ''}" />
    ${schemaTags}
`

    // 3. Static Semantic Content Body (được crawlers đọc trực tiếp trước khi JS hydration)
    const prerenderBody = `
    <div id="root">
      <div class="prerendered-content" style="max-width: 1200px; margin: 0 auto; padding: 24px 16px; font-family: sans-serif; color: #0f172a;">
        <nav aria-label="Breadcrumb" style="font-size: 13px; color: #64748b; margin-bottom: 24px;">
          <a href="/" style="color: #64748b; text-decoration: none;">Trang chủ</a> &rsaquo;
          <span>${tool.badge}</span>
        </nav>
        <header style="text-align: center; margin-bottom: 40px;">
          <span style="display: inline-block; padding: 4px 12px; background: #fef2f2; color: #ff3b30; border-radius: 9999px; font-size: 12px; font-weight: 600; margin-bottom: 12px;">${tool.badge}</span>
          <h1 style="font-size: 36px; font-weight: 800; color: #0f172a; margin: 0 0 16px 0; line-height: 1.2;">${tool.h1}</h1>
          <p style="font-size: 16px; color: #475569; max-width: 680px; margin: 0 auto; line-height: 1.6;">${tool.subtitle}</p>
        </header>

        <section style="margin: 48px 0; background: #ffffff; padding: 32px; border-radius: 16px; border: 1px solid #e2e8f0;">
          <h2 style="font-size: 24px; font-weight: 700; margin-bottom: 20px;">Hướng dẫn sử dụng ${tool.badge}</h2>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px;">
            ${tool.steps
              .map(
                (s) => `
              <div style="background: #f8fafc; padding: 16px; border-radius: 12px; border: 1px solid #e2e8f0;">
                <div style="font-size: 14px; font-weight: 700; color: #ff3b30; margin-bottom: 8px;">Bước ${s.step}</div>
                <h3 style="font-size: 16px; font-weight: 600; margin: 0 0 6px 0;">${s.title}</h3>
                <p style="font-size: 13px; color: #475569; margin: 0; line-height: 1.5;">${s.desc}</p>
              </div>`,
              )
              .join('')}
          </div>
        </section>

        ${
          tool.faqList && tool.faqList.length > 0
            ? `
        <section style="margin: 48px 0;">
          <h2 style="font-size: 24px; font-weight: 700; margin-bottom: 20px;">Câu hỏi thường gặp</h2>
          <div style="display: flex; flex-direction: column; gap: 12px;">
            ${tool.faqList
              .map(
                (f) => `
              <div style="background: #ffffff; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0;">
                <h3 style="font-size: 16px; font-weight: 600; margin: 0 0 8px 0; color: #0f172a;">${f.q}</h3>
                <p style="font-size: 14px; color: #475569; margin: 0; line-height: 1.6;">${f.a}</p>
              </div>`,
              )
              .join('')}
          </div>
        </section>`
            : ''
        }
      </div>
    </div>`

    // Thay thế vào template HTML
    let rendered = baseHtml
    // Thay thế title
    rendered = rendered.replace(/<title>[\s\S]*?<\/title>/i, '')
    // Thay thế / inject vào <head>
    rendered = rendered.replace('</head>', `${metaTags}\n  </head>`)
    // Thay thế <div id="root"></div> bằng Prerendered content
    rendered = rendered.replace(/<div id="root">[\s\S]*?<\/div>/i, prerenderBody)

    // Ghi file output
    const outFolder = path.resolve(distDir, slug.replace(/^\//, ''))
    fs.mkdirSync(outFolder, { recursive: true })
    fs.writeFileSync(path.resolve(outFolder, 'index.html'), rendered, 'utf8')
  }

  // 4. Sinh file 404.html cho static hosting
  const notFoundHtml = baseHtml
    .replace(/<title>[\s\S]*?<\/title>/i, '<title>404 - Trang không tồn tại | OneForAll</title>')
    .replace('</head>', '    <meta name="robots" content="noindex, nofollow" />\n  </head>')
  fs.writeFileSync(path.resolve(distDir, '404.html'), notFoundHtml, 'utf8')

  console.log(`[SEO Prerender] Successfully generated static HTML for all ${slugs.length} landing pages + 404.html!`)
}

runPrerender()
