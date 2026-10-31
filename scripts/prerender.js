import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')
const distDir = path.resolve(rootDir, 'dist')
const SITE = 'https://oneforall.io.vn'
const canonicalToolPath = (slug) => `/${slug.replace(/^\/+|\/+$/g, '')}/`

// ─── Cấu hình chỉnh tay ──────────────────────────────────────────────────────
// Dict là nguồn copy duy nhất: HTML tĩnh lấy nhãn từ đây thay vì soạn lại trong
// file này, nên bản prerender và bản hydrate không thể nói khác nhau về cùng một URL.
const DICTS = { vi: loadDict('dict.vi.ts', 'vi'), en: loadDict('dict.en.ts', 'en') }

// Title/description/OG của trang chủ giữ nguyên theo index.html; chỉ h1 + intro là đọc dict.
const HOME = { h1: DICTS.vi.hero.title, intro: DICTS.vi.hero.description }
const HOME_EN = {
  title: 'One ForAll - The Versatile Online Tools Platform for Every Need',
  description:
    'Use One ForAll to get media from supported links, convert file formats and process images with online tools.',
  h1: DICTS.en.hero.title,
  intro: DICTS.en.hero.description,
}
// URL tĩnh khác muốn đưa vào sitemap (vd. '/privacy', '/terms', '/contact').
// '/case-opening' và '/square-spin' là trang tính năng: không có landing page prerender,
// chỉ khai báo để crawler biết đường này tồn tại; nội dung do SPA render.
const EXTRA_SITEMAP_PATHS = ['/privacy', '/terms', '/case-opening', '/square-spin']

// Nhóm công cụ cho '/tools/<id>'. Phải khớp GROUP_MAP trong src/config/toolCategories.ts;
// checkDirectory() dưới kia bắt buộc các nhóm phủ đúng danh sách slug đã parse, nên nếu
// registry thêm category mà chưa thêm vào đây thì build chết thay vì âm thầm thiếu trang.
const GROUP_BY_CATEGORY = {
  youtube: 'downloader',
  tiktok: 'downloader',
  convert: 'converter',
  media: 'converter',
  image: 'image',
  document: 'document',
  data: 'data',
  archive: 'archive',
}
const CATEGORY_ORDER = ['downloader', 'converter', 'image', 'document', 'data', 'archive']

// 7 trang danh mục: '/tools' (null = gộp hết) và 6 nhóm. path là đường dẫn locale-relative
// không có '/' cuối — canonical tự thêm. Nhãn đọc từ dict nên HTML tĩnh trùng từng ký tự
// với những gì SPA render, giống cách validateLegal() so chuỗi pháp lý.
const DIRECTORY = [
  { path: '/tools', group: null },
  ...CATEGORY_ORDER.map((group) => ({ path: `/tools/${group}`, group })),
]

// Trang pháp lý: nội dung lấy nguyên văn từ src/content/legal (module data thuần). Không soạn
// chính sách trong file này — prerender chỉ render lại đúng những gì SPA đang render.
const LEGAL = [
  { file: 'privacy.vi.ts', name: 'privacyVi', lang: 'vi', dir: 'privacy' },
  { file: 'privacy.en.ts', name: 'privacyEn', lang: 'en', dir: 'en/privacy' },
  { file: 'terms.vi.ts', name: 'termsVi', lang: 'vi', dir: 'terms' },
  { file: 'terms.en.ts', name: 'termsEn', lang: 'en', dir: 'en/terms' },
]
// Nhãn dùng cho HTML tĩnh; validateLegal() so từng chuỗi với dict để không lệch SPA.
const LEGAL_LABELS = {
  vi: { toc: 'Mục lục', updatedOn: 'Cập nhật ngày:', home: 'Trang chủ' },
  en: { toc: 'Contents', updatedOn: 'Last updated:', home: 'Home' },
}

// ─── Tiện ích ────────────────────────────────────────────────────────────────
const esc = (s = '') =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

// JSON-LD nằm trong <script>: chỉ cần chặn "<" để không thoát được thẻ script.
const jsonLd = (obj) => JSON.stringify(obj).replace(/</g, '\\u003c')

// ─── Parser seoTools.ts (đọc đúng chuỗi, không phụ thuộc regex lười) ─────────
function readString(src, i) {
  const q = src[i]
  let out = ''
  let j = i + 1
  while (j < src.length && src[j] !== q) {
    if (src[j] === '\\') {
      const n = src[j + 1]
      out += n === 'n' ? '\n' : n
      j += 2
    } else {
      out += src[j++]
    }
  }
  return [out, j + 1]
}

function extractBlock(src, openIdx, open, close) {
  let depth = 0
  for (let i = openIdx; i < src.length; i++) {
    const c = src[i]
    if (c === "'" || c === '"' || c === '`') {
      i = readString(src, i)[1] - 1
      continue
    }
    if (c === open) depth++
    else if (c === close && --depth === 0) return src.slice(openIdx + 1, i)
  }
  return ''
}

function getString(src, name, from = 0) {
  const re = new RegExp(`(?<![A-Za-z0-9_])${name}:\\s*(['"\`])`, 'g')
  re.lastIndex = from
  const m = re.exec(src)
  if (!m) return null
  const [val, end] = readString(src, m.index + m[0].length - 1)
  return { val, end }
}

function getArray(src, name) {
  const m = new RegExp(`(?<![A-Za-z0-9_])${name}:\\s*\\[`).exec(src)
  return m ? extractBlock(src, m.index + m[0].length - 1, '[', ']') : ''
}

function parseObjects(arraySrc, fields) {
  const out = []
  let pos = 0
  for (;;) {
    const obj = {}
    for (const f of fields) {
      const r = getString(arraySrc, f, pos)
      if (!r) return out
      obj[f] = r.val
      pos = r.end
    }
    out.push(obj)
  }
}

function parseStringArray(arraySrc) {
  const out = []
  let pos = 0
  for (;;) {
    const m = /['"`]/.exec(arraySrc.slice(pos))
    if (!m) return out
    const [val, end] = readString(arraySrc, pos + m.index)
    out.push(val)
    pos = end
  }
}

function parseTools(src) {
  const tools = {}
  const re = /^ {2}'(\/[a-z0-9-]+)':\s*\{/gm
  let m
  while ((m = re.exec(src))) {
    const body = extractBlock(src, m.index + m[0].length - 1, '{', '}')
    const s = (n) => getString(body, n)?.val ?? ''
    tools[m[1]] = {
      slug: m[1],
      category: s('category'),
      badge: s('badge'),
      title: s('title'),
      metaDescription: s('metaDescription'),
      h1: s('h1'),
      subtitle: s('subtitle'),
      supportedFormatsDesc: s('supportedFormatsDesc'),
      introParagraphs: parseStringArray(getArray(body, 'introParagraphs')),
      steps: parseObjects(getArray(body, 'howItWorksSteps'), ['step', 'title', 'desc']),
      features: parseObjects(getArray(body, 'features'), ['title', 'desc']),
      faqList: parseObjects(getArray(body, 'faqList'), ['q', 'a']),
      related: [...getArray(body, 'relatedSlugs').matchAll(/['"](\/[a-z0-9-]+)['"]/g)].map((x) => x[1]),
    }
  }
  return tools
}

// ─── Đọc module pháp lý + nhãn dict ──────────────────────────────────────────
// Bỏ `import type` rồi biến `export const X: LegalDoc =` thành `const X =`, chạy qua
// new Function: không thêm dependency build, và nếu dạng khai báo đổi thì build chết tại đây
// thay vì âm thinh sinh HTML rỗng. shortcut: thân hàm chỉ là một file data đã chốt trong repo,
// không có input lúc build; nếu ai đó cho nội dung pháp lý vào chỗ có input ngoài thì phải
// chuyển sang đọc JSON bằng fs.readFileSync + JSON.parse.
function loadLegal(file, name) {
  const src = fs.readFileSync(path.resolve(rootDir, 'src/content/legal', file), 'utf8')
  const js = src
    .replace(/^import type .*\r?\n/gm, '')
    .replace(`export const ${name}: LegalDoc =`, `const ${name} =`)
  if (!js.includes(`const ${name} =`)) {
    throw new Error(`${file}: không nhận dạng "export const ${name}: LegalDoc =" — cập nhật loadLegal()`)
  }
  return new Function(`${js}\nreturn ${name}`)()
}

// Dict i18n cũng là module data thuần (chỉ có `import type`/`export type`) → đọc bằng cùng
// trick. Trang danh mục lấy nhãn từ đây thay vì soạn lại trong file này: soạn lại là có
// ngay bản copy khác với SPA cho cùng một URL.
function loadDict(file, name) {
  const src = fs.readFileSync(path.resolve(rootDir, 'src/i18n', file), 'utf8')
  const js = src
    .replace(/^import type .*\r?\n/gm, '')
    .replace(/^export type .*\r?\n/gm, '')
    .replace(/export const (\w+)(:\s*\w+)? =/g, 'const $1 =')
  if (!js.includes(`const ${name} =`)) {
    throw new Error(`${file}: không nhận dạng "export const ${name}" — cập nhật loadDict()`)
  }
  // new Function chỉ an toàn vì thứ nó compile là module data đã chốt trong repo. Chặn dấu
  // hiệu code runtime SAU khi đã bỏ nội dung chuỗi — không chặn thì prose như
  // "Paste the URL to process..." bị bắt làm `process.` và build chết oan.
  const codeOnly = js.replace(/"(?:[^"\\]|\\.)*"/g, '""').replace(/'(?:[^'\\]|\\.)*'/g, "''")
  if (/`|\brequire\s*\(|\bimport\s*\(|\beval\s*\(|\bnew\s+Function\b|\bprocess\.|\bglobalThis\b/.test(codeOnly)) {
    throw new Error(`${file}: không phải module data thuần — loadDict() từ chối compile`)
  }
  return new Function(`${js}\nreturn ${name}`)()
}

function dictValue(dictFile, block, key) {
  const src = fs.readFileSync(path.resolve(rootDir, 'src/i18n', dictFile), 'utf8')
  const start = src.indexOf(`"${block}": {`)
  const body = start < 0 ? '' : src.slice(start, src.indexOf('\n  }', start))
  const m = new RegExp(`"${key}": "([^"]*)"`).exec(body)
  if (!m) throw new Error(`${dictFile}: không đọc được ${block}.${key}`)
  return m[1]
}

function validateLegal(entries) {
  const errors = []
  for (const e of entries) {
    const d = e.doc
    const L = LEGAL_LABELS[e.lang]
    const dictFile = e.lang === 'en' ? 'dict.en.ts' : 'dict.vi.ts'
    for (const key of ['toc', 'updatedOn']) {
      const got = dictValue(dictFile, 'legal', key)
      if (got !== L[key]) errors.push(`${e.file}: nhãn ${key} "${L[key]}" lệch dict "${got}"`)
    }
    if (d.route !== `/${e.dir}`) errors.push(`${e.file}: route "${d.route}" != "/${e.dir}"`)
    for (const f of ['title', 'description', 'lastUpdated', 'intro'])
      if (!d[f]) errors.push(`${e.file}: thiếu ${f}`)
    if (d.description && (d.description.length < 50 || d.description.length > 165))
      errors.push(`${e.file}: description ${d.description.length} ký tự (nên 50–165)`)
    if (!Array.isArray(d.sections) || !d.sections.length) errors.push(`${e.file}: không có section`)
    const ids = new Set()
    for (const s of d.sections ?? []) {
      if (!/^[\w-]+$/.test(s.id ?? '')) errors.push(`${e.file}: id section "${s.id}" không dùng được làm anchor`)
      if (ids.has(s.id)) errors.push(`${e.file}: trùng anchor "${s.id}"`)
      ids.add(s.id)
      if (!s.title) errors.push(`${e.file}: section "${s.id}" thiếu title`)
      for (const b of s.blocks ?? []) {
        const items = b.type === 'p' ? [b.parts] : b.type === 'ul' ? b.items : null
        if (!items) {
          errors.push(`${e.file}: section "${s.id}" có block type "${b.type}" lạ`)
          continue
        }
        for (const item of items)
          for (const p of item ?? [])
            if (p && typeof p === 'object' && 'href' in p && !/^(?:https?:|mailto:|\/)/.test(p.href))
              errors.push(`${e.file}: section "${s.id}" href không an toàn "${p.href}"`)
      }
    }
  }
  return errors
}

// ─── Kiểm tra dữ liệu: lỗi → fail build, cảnh báo → chỉ in ra ────────────────
function validate(tools, src) {
  const errors = []
  const warns = []
  const declared = (src.match(/^\s*slug:\s*'\//gm) || []).length
  const slugs = Object.keys(tools)
  if (declared !== slugs.length) errors.push(`seoTools.ts khai báo ${declared} slug nhưng parse được ${slugs.length}`)

  const seenTitles = new Map()
  const seenDesc = new Map()
  for (const slug of slugs) {
    const t = tools[slug]
    for (const f of ['title', 'metaDescription', 'h1', 'subtitle', 'badge'])
      if (!t[f]) errors.push(`${slug}: thiếu ${f}`)
    if (!t.steps.length) warns.push(`${slug}: không có howItWorksSteps`)
    if (!t.faqList.length) warns.push(`${slug}: không có FAQ`)
    if (t.title.length > 65) warns.push(`${slug}: title ${t.title.length} ký tự (>65, dễ bị cắt)`)
    if (t.metaDescription.length < 70 || t.metaDescription.length > 165)
      warns.push(`${slug}: description ${t.metaDescription.length} ký tự (nên 70–165)`)
    for (const r of t.related) if (!tools[r]) warns.push(`${slug}: relatedSlugs trỏ tới ${r} không tồn tại`)
    if (seenTitles.has(t.title)) errors.push(`${slug}: trùng title với ${seenTitles.get(t.title)}`)
    if (seenDesc.has(t.metaDescription)) errors.push(`${slug}: trùng description với ${seenDesc.get(t.metaDescription)}`)
    seenTitles.set(t.title, slug)
    seenDesc.set(t.metaDescription, slug)
  }

  // Trang mồ côi: không trang nào trỏ tới (ngoài trang chủ vốn liệt kê hết).
  const linked = new Set(slugs.flatMap((s) => tools[s].related))
  for (const slug of slugs) if (!linked.has(slug)) warns.push(`${slug}: không có trang công cụ nào link tới (chỉ có link từ trang chủ)`)

  return { errors, warns }
}

// ─── HTML helpers ────────────────────────────────────────────────────────────
const CSS = `<style>
body{margin:0;background:#f5f6fa}
.pr{max-width:1100px;margin:0 auto;padding:24px 16px;font-family:system-ui,-apple-system,sans-serif;color:#0f172a;line-height:1.6;background:#f5f6fa;min-height:100vh;box-sizing:border-box}
.pr nav{font-size:13px;color:#64748b;margin-bottom:24px}.pr a{color:#2563eb}
.pr h1{font-size:34px;line-height:1.2;margin:0 0 12px}.pr h2{font-size:22px;margin:36px 0 14px}.pr h3{font-size:16px;margin:0 0 6px}
.pr p{margin:0 0 8px;color:#475569}.pr ul{padding-left:20px}
.pr .grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:14px}
.pr .card{border:1px solid #e2e8f0;border-radius:12px;padding:16px;background:#f8fafc}
</style>`

function injectRoot(html, body) {
  const re = /<div id="root">\s*<\/div>/i
  if (!re.test(html)) throw new Error('Không tìm thấy <div id="root"></div> trong dist/index.html')
  return html.replace(re, () => body) // dùng hàm: tránh "$&", "$1" trong nội dung bị hiểu là pattern
}

function injectHead(html, tags) {
  return html.replace('</head>', () => `${tags}\n  </head>`)
}

// index.html mang head của trang chủ. Trang con tự sinh bộ thẻ riêng nên phải bỏ bản kế thừa,
// nếu không một URL sẽ có 2 canonical. og:image giữ lại. JSON-LD WebSite chỉ thuộc trang chủ.
const INHERITED_SEO =
  /rel=["']canonical["']|name=["']description["']|name=["']twitter:[^"']+["']|property=["']og:(?!image)[^"']*["']/

function stripInheritedSeo(html) {
  return html.replace(/<head>[\s\S]*?<\/head>/i, (head) =>
    head
      .replace(/<script[^>]*application\/ld\+json[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<(?:link|meta)\b[\s\S]*?>/gi, (tag) => (INHERITED_SEO.test(tag.replace(/\s+/g, ' ')) ? '' : tag)),
  )
}

function landingBody(tool, tools) {
  const steps = tool.steps
    .map(
      (s) => `<div class="card"><p><strong>Bước ${esc(s.step)}</strong></p><h3>${esc(s.title)}</h3><p>${esc(s.desc)}</p></div>`,
    )
    .join('')
  const features = tool.features
    .map((f) => `<div class="card"><h3>${esc(f.title)}</h3><p>${esc(f.desc)}</p></div>`)
    .join('')
  const faq = tool.faqList
    .map((f) => `<div class="card"><h3>${esc(f.q)}</h3><p>${esc(f.a)}</p></div>`)
    .join('')
  const related = tool.related
    .filter((s) => tools[s])
    .map((s) => `<li><a href="${esc(canonicalToolPath(s))}">${esc(tools[s].badge)}</a></li>`)
    .join('')

  return `<div id="root">${CSS}
<div class="pr prerendered-content">
  ${toolCrumbNav(tool, 'vi')}
  <header>
    <h1>${esc(tool.h1)}</h1>
    <p>${esc(tool.subtitle)}</p>
    ${(tool.introParagraphs ?? []).map((p) => `<p>${esc(p)}</p>`).join('')}
  </header>
  ${tool.steps.length ? `<section><h2>Hướng dẫn sử dụng ${esc(tool.badge)}</h2><div class="grid">${steps}</div></section>` : ''}
  ${tool.features.length ? `<section><h2>Tính năng nổi bật</h2><div class="grid">${features}</div></section>` : ''}
  ${tool.supportedFormatsDesc ? `<section><h2>Định dạng được hỗ trợ</h2><p>${esc(tool.supportedFormatsDesc)}</p></section>` : ''}
  ${tool.faqList.length ? `<section><h2>Câu hỏi thường gặp</h2><div class="grid">${faq}</div></section>` : ''}
  ${related ? `<section><h2>Công cụ liên quan</h2><ul>${related}</ul></section>` : ''}
</div></div>`
}

function localePath(slug, lang) {
  return `${lang === 'en' ? '/en' : ''}${canonicalToolPath(slug)}`
}

/**
 * Breadcrumb trang tool: Home → Tools → nhóm → tool. SPA thêm Home sẵn ở cả 2 nơi
 * (Breadcrumbs + SEOHead), nên phần còn lại lấy đúng nhãn mà dict SPA đang đọc.
 */
function toolCrumbTrail(tool, lang) {
  const dict = DICTS[lang]
  const trail = [
    { name: LEGAL_LABELS[lang].home, href: lang === 'en' ? '/en/' : '/' },
    { name: dict.directory.crumb, href: localePath('/tools', lang) },
  ]
  const group = GROUP_BY_CATEGORY[tool.category]
  if (group) {
    const cat = dict.cat?.[group]
    if (!cat) throw new Error(`dict thiếu cat.${group}`)
    trail.push({ name: cat.name, href: localePath(`/tools/${group}`, lang) })
  }
  return trail
}

function toolCrumbNav(tool, lang) {
  const links = toolCrumbTrail(tool, lang)
    .map((c) => `<a href="${esc(c.href)}">${esc(c.name)}</a>`)
    .join(' &rsaquo; ')
  return `<nav aria-label="Breadcrumb">${links} &rsaquo; <span>${esc(tool.badge)}</span></nav>`
}

function toolCrumbSchema(tool, lang, toolUrl) {
  const items = [
    ...toolCrumbTrail(tool, lang).map((c) => ({ name: c.name, item: `${SITE}${c.href}` })),
    { name: tool.badge, item: toolUrl },
  ]
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((b, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: b.name,
      item: b.item,
    })),
  }
}

function landingBodyEnglish(tool, tools) {
  const steps = tool.steps
    .map((s) => `<div class="card"><p><strong>Step ${esc(s.step)}</strong></p><h3>${esc(s.title)}</h3><p>${esc(s.desc)}</p></div>`)
    .join('')
  const features = tool.features
    .map((f) => `<div class="card"><h3>${esc(f.title)}</h3><p>${esc(f.desc)}</p></div>`)
    .join('')
  const faq = tool.faqList
    .map((f) => `<div class="card"><h3>${esc(f.q)}</h3><p>${esc(f.a)}</p></div>`)
    .join('')
  const related = tool.related
    .filter((s) => tools[s])
    .map((s) => `<li><a href="${esc(localePath(s, 'en'))}">${esc(tools[s].badge)}</a></li>`)
    .join('')

  return `<div id="root">${CSS}
<div class="pr prerendered-content">
  ${toolCrumbNav(tool, 'en')}
  <header><h1>${esc(tool.h1)}</h1><p>${esc(tool.subtitle)}</p>${(tool.introParagraphs ?? []).map((p) => `<p>${esc(p)}</p>`).join('')}</header>
  ${tool.steps.length ? `<section><h2>How to use ${esc(tool.badge)}</h2><div class="grid">${steps}</div></section>` : ''}
  ${tool.features.length ? `<section><h2>Key features</h2><div class="grid">${features}</div></section>` : ''}
  ${tool.supportedFormatsDesc ? `<section><h2>Supported formats</h2><p>${esc(tool.supportedFormatsDesc)}</p></section>` : ''}
  ${tool.faqList.length ? `<section><h2>Frequently asked questions</h2><div class="grid">${faq}</div></section>` : ''}
  ${related ? `<section><h2>Related tools</h2><ul>${related}</ul></section>` : ''}
</div></div>`
}

/**
 * Khối danh mục trên trang chủ: đúng 6 nhóm theo thứ tự SPA, nhãn lấy từ dict mà
 * SPA đọc. Trước đây nhóm theo category (8 nhãn soạn tay trong file này) nên HTML
 * tĩnh và bản hydrate mô tả trang chủ khác nhau.
 */
function homeSections(tools, lang) {
  const byGroup = groupTools(tools)
  const dict = DICTS[lang]
  return CATEGORY_ORDER.filter((group) => byGroup[group].length > 0)
    .map((group) => {
      const items = byGroup[group]
        .map((t) => `<li><a href="${esc(localePath(t.slug, lang))}">${esc(t.badge)}</a> – ${esc(t.subtitle)}</li>`)
        .join('')
      return `<section id="group-${esc(group)}"><h2><a href="${esc(localePath(`/tools/${group}`, lang))}">${esc(dict.cat[group].name)}</a></h2><ul>${items}</ul></section>`
    })
    .join('')
}

/** Dải "vì sao chọn" — cùng bộ copy với ValueBandSection của SPA, đọc từ dict. */
function homeValueBand(lang) {
  const dict = DICTS[lang]
  const steps = ['s1', 's2', 's3', 's4']
    .map(
      (key, i) =>
        `<li><strong>${esc(dict.homeBand.stepLabel.replace('{n}', String(i + 1).padStart(2, '0')))}</strong> — ${esc(
          dict.howItWorks[`${key}Title`],
        )}: ${esc(dict.howItWorks[`${key}Desc`])}</li>`,
    )
    .join('')
  const values = ['f1', 'f2', 'f3', 'f4']
    .map((key) => `<li><strong>${esc(dict.features[`${key}Title`])}</strong> — ${esc(dict.features[`${key}Desc`])}</li>`)
    .join('')
  return `<section id="how-it-works"><h2>${esc(dict.homeBand.title)}</h2><p>${esc(dict.homeBand.desc)}</p><ol>${steps}</ol><ul>${values}</ul></section>`
}

function homeBodyEnglish(tools) {
  const sections = homeSections(tools, 'en')
  const valueBand = homeValueBand('en')
  return `<div id="root">${CSS}
<div class="pr prerendered-content"><header><h1>${esc(HOME_EN.h1)}</h1><p>${esc(HOME_EN.intro)}</p><p>Google Sign-In lets you authenticate and use supported account features.</p><nav aria-label="Legal and support"><a href="/en/privacy">Privacy Policy</a> · <a href="/en/terms">Terms of Use</a> · <a href="mailto:support@oneforall.io.vn">support@oneforall.io.vn</a></nav></header>${sections}${valueBand}<section id="google-api"><h2>Google API usage and content safety commitment</h2><p>One ForAll is an online tools platform: downloading media from supported links, converting file and document formats, and processing images such as compression, resizing and background removal.</p><p>Google Sign-In is used only to verify identity and support account sign-in, with the openid, email and profile scopes. Data received through Google APIs is not used to train AI models, is not shared with third parties, and is not used for advertising.</p><p><strong>One ForAll does not use Google APIs to create, edit, generate, or distribute AI-generated Non-Consensual Intimate Imagery (AI NCII). This conduct is strictly prohibited across the platform; violating accounts are permanently locked and their data is deleted immediately.</strong></p><p>See the full rules in the <a href="/en/terms">Terms of Use</a> and <a href="/en/privacy">Privacy Policy</a>.</p></section></div></div>`
}

function homeBody(tools) {
  const sections = homeSections(tools, 'vi')
  const valueBand = homeValueBand('vi')
  return `<div id="root">${CSS}
<div class="pr prerendered-content">
  <header><h1>${esc(HOME.h1)}</h1><p>${esc(HOME.intro)}</p><p>Google Sign-In giúp bạn xác thực và sử dụng các chức năng tài khoản được hỗ trợ.</p><nav aria-label="Chính sách và hỗ trợ"><a href="/privacy">Chính sách quyền riêng tư</a> · <a href="/terms">Điều khoản sử dụng</a> · <a href="mailto:support@oneforall.io.vn">support@oneforall.io.vn</a></nav></header>
  ${sections}
  ${valueBand}
  <section id="google-api"><h2>Mục đích sử dụng Google API và cam kết an toàn nội dung</h2><p>One ForAll là nền tảng công cụ trực tuyến: tải media từ những liên kết được hỗ trợ, chuyển đổi định dạng tệp và tài liệu, xử lý hình ảnh như nén, đổi kích thước và xóa nền.</p><p>Google Sign-In chỉ được dùng để xác minh danh tính và hỗ trợ đăng nhập tài khoản, với các quyền openid, email và profile. Dữ liệu nhận qua Google API không dùng để huấn luyện mô hình AI, không chia sẻ cho bên thứ ba và không dùng cho mục đích quảng cáo.</p><p><strong>One ForAll không sử dụng Google API để tạo, chỉnh sửa, sinh hoặc phát tán hình ảnh thân mật cá nhân không có sự đồng thuận do AI tạo ra (AI-generated Non-Consensual Intimate Imagery – AI NCII). Hành vi này bị nghiêm cấm trên toàn nền tảng; tài khoản vi phạm sẽ bị khóa vĩnh viễn và dữ liệu bị xóa ngay lập tức.</strong></p><p>Xem quy định chi tiết trong <a href="/terms">Điều khoản sử dụng</a> và <a href="/privacy">Chính sách quyền riêng tư</a>.</p></section>
</div></div>`
}

function legalBody(doc, lang) {
  const L = LEGAL_LABELS[lang]
  const inline = (p) =>
    typeof p === 'string' ? esc(p) : 'b' in p ? `<strong>${esc(p.b)}</strong>` : `<a href="${esc(p.href)}">${esc(p.a)}</a>`
  const block = (b) =>
    b.type === 'p'
      ? `<p>${b.parts.map(inline).join('')}</p>`
      : `<ul>${b.items.map((item) => `<li>${item.map(inline).join('')}</li>`).join('')}</ul>`
  const toc = doc.sections.map((s, i) => `<li><a href="#${esc(s.id)}">${i + 1}. ${esc(s.title)}</a></li>`).join('')
  const sections = doc.sections
    .map((s, i) => `<section id="${esc(s.id)}"><h2>${i + 1}. ${esc(s.title)}</h2>${s.blocks.map(block).join('')}</section>`)
    .join('')
  return `<div id="root">${CSS}
<div class="pr prerendered-content">
  <nav aria-label="Breadcrumb"><a href="${lang === 'en' ? '/en/' : '/'}">${esc(L.home)}</a> &rsaquo; <span>${esc(doc.title)}</span></nav>
  <header><h1>${esc(doc.title)}</h1><p>${esc(L.updatedOn)} ${esc(doc.lastUpdated)}</p><p>${esc(doc.intro)}</p></header>
  <nav aria-label="${esc(L.toc)}"><p><strong>${esc(L.toc)}</strong></p><ol>${toc}</ol></nav>
  ${sections}
</div></div>`
}

function legalHead(doc, lang, ogImage) {
  // Host phục vụ thư mục kèm 307 /privacy -> /privacy/, nên canonical/hreflang phải mang dấu /
  // cuối và trỏ đúng URL của chính ngôn ngữ đang render.
  const clean = doc.route.replace(/^\/en/, '')
  const viUrl = `${SITE}${clean}/`
  const enUrl = `${SITE}/en${clean}/`
  const url = lang === 'en' ? enUrl : viUrl
  return `
    <title>${esc(`${doc.title} | One ForAll`)}</title>
    <meta name="description" content="${esc(doc.description)}" />
    <link rel="canonical" href="${esc(url)}" />
    <meta name="robots" content="index, follow" />
    <meta property="og:title" content="${esc(doc.title)}" />
    <meta property="og:description" content="${esc(doc.description)}" />
    <meta property="og:url" content="${esc(url)}" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="One ForAll" />
    <meta property="og:locale" content="${lang === 'en' ? 'en_US' : 'vi_VN'}" />
    <link rel="alternate" hreflang="vi" href="${esc(viUrl)}" data-hreflang="vi" />
    <link rel="alternate" hreflang="en" href="${esc(enUrl)}" data-hreflang="en" />
    <link rel="alternate" hreflang="x-default" href="${esc(viUrl)}" data-hreflang="x-default" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${esc(doc.title)}" />
    <meta name="twitter:description" content="${esc(doc.description)}" />
    ${ogImage ? `<meta name="twitter:image" content="${esc(ogImage)}" />` : ''}
`
}

// ─── Trang danh mục '/tools' + 6 nhóm ────────────────────────────────────────
/** Tool của từng nhóm, suy từ category đã parse — cùng GROUP_MAP với toolCategories.ts. */
function groupTools(tools) {
  const groups = Object.fromEntries(CATEGORY_ORDER.map((g) => [g, []]))
  for (const tool of Object.values(tools)) {
    const group = GROUP_BY_CATEGORY[tool.category]
    if (!group) {
      throw new Error(`${tool.slug}: category "${tool.category}" chưa có trong GROUP_BY_CATEGORY`)
    }
    groups[group].push(tool)
  }
  return groups
}

/** title/mô tả/h1/intros của một trang danh mục, đọc theo dict đang dùng. */
function directoryMeta(entry, dict) {
  if (entry.group === null) {
    const d = dict.directory
    return {
      title: d.seoTitle,
      description: d.seoDesc,
      h1: d.h1,
      intro: d.intro,
      label: d.allTools,
    }
  }
  const cat = dict.cat?.[entry.group]
  if (!cat) throw new Error(`dict thiếu cat.${entry.group}`)
  return { title: cat.seoTitle, description: cat.desc, h1: cat.h1, intro: cat.desc, label: cat.name }
}

/** URL locale-relative, có '/' cuối như host 307 về. */
function directoryUrl(path, lang) {
  return `${lang === 'en' ? '/en' : ''}${path}/`
}

function directoryBody(entry, dict, lang, groups) {
  const meta = directoryMeta(entry, dict, lang)
  const home = lang === 'en' ? '/en/' : '/'
  const count = (n) => dict.directory.count.replace('{count}', String(n))
  const link = (t) => `<li><a href="${esc(localePath(t.slug, lang))}">${esc(t.badge)}</a> – ${esc(t.subtitle)}</li>`
  const list = (tools) => `<ul>${tools.map(link).join('')}</ul>`
  const rail = CATEGORY_ORDER.map(
    (g) => `<li><a href="${esc(directoryUrl(`/tools/${g}`, lang))}">${esc(dict.cat[g].name)}</a> – ${esc(count(groups[g].length))}</li>`,
  ).join('')

  const crumb =
    entry.group === null
      ? `<nav aria-label="Breadcrumb"><a href="${home}">${esc(LEGAL_LABELS[lang].home)}</a> &rsaquo; <span>${esc(dict.directory.crumb)}</span></nav>`
      : `<nav aria-label="Breadcrumb"><a href="${home}">${esc(LEGAL_LABELS[lang].home)}</a> &rsaquo; <a href="${esc(directoryUrl('/tools', lang))}">${esc(dict.directory.crumb)}</a> &rsaquo; <span>${esc(meta.label)}</span></nav>`

  const main =
    entry.group === null
      ? CATEGORY_ORDER.map(
          (g) =>
            `<section id="${g}"><h2><a href="${esc(directoryUrl(`/tools/${g}`, lang))}">${esc(dict.cat[g].name)}</a></h2><p>${esc(dict.cat[g].desc)}</p>${list(groups[g])}</section>`,
        ).join('')
      : `<section id="${entry.group}">${list(groups[entry.group])}</section>
  <section><h2>${esc(dict.directory.h1)}</h2><ul>${rail}</ul></section>
  <p><a href="${esc(directoryUrl('/tools', lang))}">${esc(dict.directory.viewAll.replace('{count}', String(Object.values(groups).reduce((n, l) => n + l.length, 0))))}</a></p>`

  return `<div id="root">${CSS}
<div class="pr prerendered-content">
  ${crumb}
  <header><h1>${esc(meta.h1)}</h1><p>${esc(meta.intro)}</p></header>
  ${main}
</div></div>`
}

function directoryHead(entry, dict, lang, ogImage) {
  const meta = directoryMeta(entry, dict, lang)
  const viUrl = `${SITE}${entry.path}/`
  const enUrl = `${SITE}/en${entry.path}/`
  const url = lang === 'en' ? enUrl : viUrl
  const crumbs = [{ name: dict.directory.crumb, path: '/tools' }]
  if (entry.group !== null) crumbs.push({ name: meta.label, path: entry.path })

  const schemas = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: meta.title,
      url,
      description: meta.description,
      applicationCategory: 'MultimediaApplication',
      operatingSystem: 'Any',
      inLanguage: lang,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'VND' },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: LEGAL_LABELS[lang].home, item: lang === 'en' ? `${SITE}/en/` : `${SITE}/` },
        ...crumbs.map((c, i) => ({
          '@type': 'ListItem',
          position: i + 2,
          name: c.name,
          item: `${SITE}${directoryUrl(c.path, lang)}`,
        })),
      ],
    },
  ]
  const ids = { BreadcrumbList: 'breadcrumb-jsonld', WebApplication: 'webapp-jsonld' }
  const ld = schemas
    .map((s) => `<script id="${ids[s['@type']]}" type="application/ld+json">${jsonLd(s)}</script>`)
    .join('\n    ')

  return `
    <title>${esc(meta.title)}</title>
    <meta name="description" content="${esc(meta.description)}" />
    <link rel="canonical" href="${esc(url)}" />
    <meta name="robots" content="index, follow" />
    <meta property="og:title" content="${esc(meta.title)}" />
    <meta property="og:description" content="${esc(meta.description)}" />
    <meta property="og:url" content="${esc(url)}" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="One ForAll" />
    <meta property="og:locale" content="${lang === 'en' ? 'en_US' : 'vi_VN'}" />
    <link rel="alternate" hreflang="vi" href="${esc(viUrl)}" data-hreflang="vi" />
    <link rel="alternate" hreflang="en" href="${esc(enUrl)}" data-hreflang="en" />
    <link rel="alternate" hreflang="x-default" href="${esc(viUrl)}" data-hreflang="x-default" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${esc(meta.title)}" />
    <meta name="twitter:description" content="${esc(meta.description)}" />
    ${ogImage ? `<meta name="twitter:image" content="${esc(ogImage)}" />` : ''}
    ${ld}
`
}

/**
 * Trang danh mục không được trùng title/description với trang tool — Google coi 2 URL cùng
 * bộ metadata là một trang. Đây cũng là chỗ duy nhất phát hiện nhóm rỗng hoặc slug rơi khỏi
 * danh mục (thêm category mới vào registry mà quên GROUP_BY_CATEGORY thì build chết ở groupTools()).
 */
function checkDirectory(dict, tools, label) {
  const errors = []
  const titles = new Map(Object.values(tools).map((t) => [t.title, `tool ${t.slug}`]))
  const descriptions = new Map(
    Object.values(tools)
      .filter((t) => t.metaDescription)
      .map((t) => [t.metaDescription, `tool ${t.slug}`]),
  )
  for (const entry of DIRECTORY) {
    const meta = directoryMeta(entry, dict)
    for (const [field, seen, value] of [
      ['title', titles, meta.title],
      ['description', descriptions, meta.description],
    ]) {
      if (seen.has(value)) errors.push(`${label} ${entry.path}: ${field} trùng với ${seen.get(value)}`)
      seen.set(value, `${label} ${entry.path}`)
    }
    if (!meta.h1) errors.push(`${label} ${entry.path}: thiếu h1`)
    if (meta.description.length < 70 || meta.description.length > 165)
      errors.push(`${label} ${entry.path}: description ${meta.description.length} ký tự (nên 70–165)`)
    if (meta.title.length > 65) errors.push(`${label} ${entry.path}: title ${meta.title.length} ký tự (>65, dễ bị cắt)`)
  }
  return errors
}

function landingHead(tool, ogImage) {
  const url = `${SITE}${canonicalToolPath(tool.slug)}`
  const enUrl = `${SITE}/en${canonicalToolPath(tool.slug)}`
  const schemas = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: tool.badge,
      url,
      description: tool.metaDescription,
      applicationCategory: 'MultimediaApplication',
      operatingSystem: 'Any',
      inLanguage: 'vi',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'VND' },
    },
    toolCrumbSchema(tool, 'vi', url),
  ]
  if (tool.faqList.length)
    schemas.unshift({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: tool.faqList.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    })
  const ids = { FAQPage: 'faq-jsonld', BreadcrumbList: 'breadcrumb-jsonld', WebApplication: 'webapp-jsonld' }
  const ld = schemas
    .map((s) => `<script id="${ids[s['@type']]}" type="application/ld+json">${jsonLd(s)}</script>`)
    .join('\n    ')

  return `
    <title>${esc(tool.title)}</title>
    <meta name="description" content="${esc(tool.metaDescription)}" />
    <link rel="canonical" href="${esc(url)}" />
    <meta name="robots" content="index, follow" />
    <meta property="og:title" content="${esc(tool.title)}" />
    <meta property="og:description" content="${esc(tool.metaDescription)}" />
    <meta property="og:url" content="${esc(url)}" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="One ForAll" />
    <meta property="og:locale" content="vi_VN" />
    <link rel="alternate" hreflang="vi" href="${url}" data-hreflang="vi" />
    <link rel="alternate" hreflang="en" href="${enUrl}" data-hreflang="en" />
    <link rel="alternate" hreflang="x-default" href="${url}" data-hreflang="x-default" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${esc(tool.title)}" />
    <meta name="twitter:description" content="${esc(tool.metaDescription)}" />
    ${ogImage ? `<meta name="twitter:image" content="${esc(ogImage)}" />` : ''}
    ${ld}
`
}

function landingHeadEnglish(tool, ogImage) {
  const viUrl = `${SITE}${canonicalToolPath(tool.slug)}`
  const url = `${SITE}/en${canonicalToolPath(tool.slug)}`
  const schemas = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: tool.badge,
      url,
      description: tool.metaDescription,
      applicationCategory: 'MultimediaApplication',
      operatingSystem: 'Any',
      inLanguage: 'en',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'VND' },
    },
    toolCrumbSchema(tool, 'en', url),
  ]
  if (tool.faqList.length)
    schemas.unshift({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: tool.faqList.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    })
  const ids = { FAQPage: 'faq-jsonld', BreadcrumbList: 'breadcrumb-jsonld', WebApplication: 'webapp-jsonld' }
  const ld = schemas
    .map((s) => `<script id="${ids[s['@type']]}" type="application/ld+json">${jsonLd(s)}</script>`)
    .join('\n    ')

  return `
    <title>${esc(tool.title)}</title>
    <meta name="description" content="${esc(tool.metaDescription)}" />
    <link rel="canonical" href="${esc(url)}" />
    <meta name="robots" content="index, follow" />
    <meta property="og:title" content="${esc(tool.title)}" />
    <meta property="og:description" content="${esc(tool.metaDescription)}" />
    <meta property="og:url" content="${esc(url)}" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="One ForAll" />
    <meta property="og:locale" content="en_US" />
    <link rel="alternate" hreflang="vi" href="${viUrl}" data-hreflang="vi" />
    <link rel="alternate" hreflang="en" href="${url}" data-hreflang="en" />
    <link rel="alternate" hreflang="x-default" href="${viUrl}" data-hreflang="x-default" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${esc(tool.title)}" />
    <meta name="twitter:description" content="${esc(tool.metaDescription)}" />
    ${ogImage ? `<meta name="twitter:image" content="${esc(ogImage)}" />` : ''}
    ${ld}
`
}

function englishHomeHead(ogImage) {
  const url = `${SITE}/en/`
  const website = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'One ForAll',
    url,
  }
  return `
    <title>${esc(HOME_EN.title)}</title>
    <meta name="description" content="${esc(HOME_EN.description)}" />
    <link rel="canonical" href="${url}" />
    <meta name="robots" content="index, follow" />
    <meta property="og:title" content="${esc(HOME_EN.title)}" />
    <meta property="og:description" content="${esc(HOME_EN.description)}" />
    <meta property="og:url" content="${url}" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="One ForAll" />
    <meta property="og:locale" content="en_US" />
    <link rel="alternate" hreflang="vi" href="${SITE}/" data-hreflang="vi" />
    <link rel="alternate" hreflang="en" href="${url}" data-hreflang="en" />
    <link rel="alternate" hreflang="x-default" href="${SITE}/" data-hreflang="x-default" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${esc(HOME_EN.title)}" />
    <meta name="twitter:description" content="${esc(HOME_EN.description)}" />
    ${ogImage ? `<meta name="twitter:image" content="${esc(ogImage)}" />` : ''}
    <script id="website-jsonld" type="application/ld+json">${jsonLd(website)}</script>
`
}

function setHtmlLang(html, lang) {
  return html.replace(/<html\b([^>]*)>/i, (tag, attrs) => {
    const withoutLang = attrs.replace(/\s+lang=(['"])[^'"]*\1/i, '')
    return `<html${withoutLang} lang="${lang}">`
  })
}

function buildSitemap(slugs) {
  // Mọi URL prerender đều có bản /en thật (dist/en/...), nên khai cả hai locale.
  // '/case-opening' và '/square-spin' do SPA render qua rewrite của host: vẫn khai, vì
  // người dùng truy cập được — thiếu '/case-opening' là bug có sẵn sửa luôn ở đây.
  const paths = [
    '/',
    ...slugs.map(canonicalToolPath),
    ...DIRECTORY.map((entry) => `${entry.path}/`),
    ...EXTRA_SITEMAP_PATHS.map(canonicalToolPath),
  ]
  const urls = paths.flatMap((p) => (p === '/' ? ['/', '/en/'] : [p, `/en${p}`]))
  // Không ghi changefreq/priority (Google bỏ qua) và không ghi lastmod giả.
  const body = urls.map((u) => `  <url>\n    <loc>${SITE}${u}</loc>\n  </url>`).join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`
}

// ─── Main ────────────────────────────────────────────────────────────────────
export function runPrerender() {
  const indexPath = path.resolve(distDir, 'index.html')
  if (!fs.existsSync(indexPath)) {
    console.error('dist/index.html không tồn tại. Chạy vite build trước.')
    process.exit(1)
  }

  const src = fs.readFileSync(path.resolve(rootDir, 'src/config/seoTools.ts'), 'utf8')
  const tools = parseTools(src)
  const englishOverrides = JSON.parse(fs.readFileSync(path.resolve(rootDir, 'src/i18n/tools.en.json'), 'utf8'))
  const slugs = Object.keys(tools)
  const missingEnglish = slugs.filter((slug) => !englishOverrides[slug])
  const unknownEnglish = Object.keys(englishOverrides).filter((slug) => !tools[slug])
  if (missingEnglish.length || unknownEnglish.length) {
    throw new Error(`Locale route mismatch. Missing EN: ${missingEnglish.join(', ') || 'none'}; unknown EN: ${unknownEnglish.join(', ') || 'none'}`)
  }

  // EN ghi đè nguyên khối → thiếu mảng nào thì /en lộ text VI mảng đó
  const arrayLeaks = slugs.filter((slug) => tools[slug].introParagraphs.length > 0 && !Array.isArray(englishOverrides[slug].introParagraphs))
  if (arrayLeaks.length) {
    throw new Error(`tools.en.json thiếu introParagraphs cho: ${arrayLeaks.join(', ')}`)
  }

  const { errors, warns } = validate(tools, src)
  // validate() chỉ quét seoTools.ts (bản VI); EN là lớp ghi đè nên lọt lưới.
  for (const slug of slugs) {
    const en = englishOverrides[slug].title
    if (en.length > 65) warns.push(`/en${slug}: title ${en.length} ký tự (>65, dễ bị cắt)`)
  }
  warns.forEach((w) => console.warn(`[SEO] ⚠ ${w}`))
  if (errors.length) {
    errors.forEach((e) => console.error(`[SEO] ✖ ${e}`))
    console.error('[SEO Prerender] Dừng build vì dữ liệu SEO có lỗi.')
    process.exit(1)
  }

  for (const entry of LEGAL) entry.doc = loadLegal(entry.file, entry.name)
  const legalErrors = validateLegal(LEGAL)
  if (legalErrors.length) {
    legalErrors.forEach((e) => console.error(`[SEO] ✖ ${e}`))
    console.error('[SEO Prerender] Dừng build vì trang pháp lý có lỗi.')
    process.exit(1)
  }

  const rawHtml = fs.readFileSync(indexPath, 'utf8')
  const childBase = stripInheritedSeo(rawHtml)
  const ogImage = rawHtml.match(/property=["']og:image["'][^>]*content=["']([^"']+)["']/i)?.[1]

  // 1. Trang chủ: giữ nguyên head của index.html, chỉ thêm nội dung tĩnh.
  const viHomeHead = `
    <link rel="alternate" hreflang="vi" href="${SITE}/" data-hreflang="vi" />
    <link rel="alternate" hreflang="en" href="${SITE}/en/" data-hreflang="en" />
    <link rel="alternate" hreflang="x-default" href="${SITE}/" data-hreflang="x-default" />
  `
  fs.writeFileSync(indexPath, injectRoot(injectHead(rawHtml, viHomeHead), homeBody(tools)), 'utf8')

  // English home route has its own localized content and metadata.
  const enHomeDir = path.resolve(distDir, 'en')
  fs.mkdirSync(enHomeDir, { recursive: true })
  const englishTools = Object.fromEntries(
    slugs.map((slug) => [slug, { ...tools[slug], ...englishOverrides[slug] }]),
  )
  let enHomeHtml = stripInheritedSeo(rawHtml).replace(/<title>[\s\S]*?<\/title>/i, '')
  enHomeHtml = setHtmlLang(enHomeHtml, 'en')
  enHomeHtml = injectHead(enHomeHtml, englishHomeHead(ogImage))
  enHomeHtml = injectRoot(enHomeHtml, homeBodyEnglish(englishTools))
  fs.writeFileSync(path.resolve(enHomeDir, 'index.html'), enHomeHtml, 'utf8')

  // 2. Landing pages
  for (const slug of slugs) {
    const tool = tools[slug]
    let html = childBase.replace(/<title>[\s\S]*?<\/title>/i, '')
    html = injectHead(html, landingHead(tool, ogImage))
    html = injectRoot(html, landingBody(tool, tools))
    const outDir = path.resolve(distDir, slug.replace(/^\//, ''))
    fs.mkdirSync(outDir, { recursive: true })
    fs.writeFileSync(path.resolve(outDir, 'index.html'), html, 'utf8')

    const englishTool = englishTools[slug]
    let englishHtml = childBase.replace(/<title>[\s\S]*?<\/title>/i, '')
    englishHtml = setHtmlLang(englishHtml, 'en')
    englishHtml = injectHead(englishHtml, landingHeadEnglish(englishTool, ogImage))
    englishHtml = injectRoot(englishHtml, landingBodyEnglish(englishTool, englishTools))
    const englishOutDir = path.resolve(distDir, 'en', slug.replace(/^\//, ''))
    fs.mkdirSync(englishOutDir, { recursive: true })
    fs.writeFileSync(path.resolve(englishOutDir, 'index.html'), englishHtml, 'utf8')
  }

  // 3. Trang danh mục '/tools' + 6 nhóm. Cùng bộ nhãn dict mà SPA đọc, nên HTML tĩnh và
  //    bản hydrate không thể nói khác nhau về cùng một URL.
  const dicts = { vi: loadDict('dict.vi.ts', 'vi'), en: loadDict('dict.en.ts', 'en') }
  const groups = groupTools(tools)
  const englishGroups = groupTools(englishTools)
  const directoryErrors = [
    ...checkDirectory(dicts.vi, tools, 'vi'),
    ...checkDirectory(dicts.en, englishTools, 'en'),
    ...CATEGORY_ORDER.filter((g) => groups[g].length === 0).map((g) => `nhóm "${g}" không có tool nào`),
  ]
  if (directoryErrors.length) {
    directoryErrors.forEach((e) => console.error(`[SEO] ✖ ${e}`))
    console.error('[SEO Prerender] Dừng build vì trang danh mục có lỗi.')
    process.exit(1)
  }

  for (const entry of DIRECTORY) {
    for (const lang of ['vi', 'en']) {
      const head = directoryHead(entry, dicts[lang], lang, ogImage)
      const want = `${SITE}${directoryUrl(entry.path, lang)}`
      if (!head.includes(`<link rel="canonical" href="${want}" />`)) {
        throw new Error(`${directoryUrl(entry.path, lang)}: canonical không phải ${want}`)
      }
      let html = childBase.replace(/<title>[\s\S]*?<\/title>/i, '')
      html = setHtmlLang(html, lang)
      html = injectHead(html, head)
      html = injectRoot(html, directoryBody(entry, dicts[lang], lang, lang === 'en' ? englishGroups : groups))
      const outDir = path.resolve(distDir, directoryUrl(entry.path, lang).replace(/^\/+/, '').replace(/\/+$/, ''))
      fs.mkdirSync(outDir, { recursive: true })
      fs.writeFileSync(path.resolve(outDir, 'index.html'), html, 'utf8')
    }
  }

  // 4. Trang pháp lý. Thiếu mấy file này là mọi URL /privacy, /terms bị host rewrite về
  //    index.html — curl và crawler nhận đúng trang chủ tiếng Việt.
  for (const { doc, lang, dir } of LEGAL) {
    const head = legalHead(doc, lang, ogImage)
    const want = `${SITE}${doc.route}/`
    if (!head.includes(`<link rel="canonical" href="${want}" />`)) throw new Error(`${dir}: canonical không phải ${want}`)
    let html = childBase.replace(/<title>[\s\S]*?<\/title>/i, '')
    html = setHtmlLang(html, lang)
    html = injectHead(html, head)
    html = injectRoot(html, legalBody(doc, lang))
    const outDir = path.resolve(distDir, dir)
    fs.mkdirSync(outDir, { recursive: true })
    fs.writeFileSync(path.resolve(outDir, 'index.html'), html, 'utf8')
  }

  // 5. 404.html
  const notFound = injectHead(
    childBase.replace(/<title>[\s\S]*?<\/title>/i, '<title>404 - Trang không tồn tại | One ForAll</title>'),
    '    <meta name="robots" content="noindex, nofollow" />',
  )
  fs.writeFileSync(path.resolve(distDir, '404.html'), notFound, 'utf8')

  // 6. sitemap.xml sinh từ config (nhớ xóa public/sitemap.xml cũ để khỏi nhầm nguồn)
  const sitemap = buildSitemap(slugs)
  fs.writeFileSync(path.resolve(distDir, 'sitemap.xml'), sitemap, 'utf8')
  const locCount = (sitemap.match(/<loc>/g) ?? []).length

  const htmlRoutes = slugs.length * 2 + DIRECTORY.length * 2 + LEGAL.length + 2
  console.log(
    `[SEO Prerender] Xong: 2 trang chủ + ${slugs.length} landing/locale + ${DIRECTORY.length} danh mục/locale + ${LEGAL.length} trang pháp lý + 404.html + sitemap.xml (${htmlRoutes} HTML route; sitemap ${locCount} URL)`,
  )
}

runPrerender()
