// Self-check cho hint trần upload (FileUploader + ImageWorkspace) — không đụng app:
//   npx esbuild scratch/check-upload-caps.ts --bundle --platform=node --format=esm \
//     --outfile=scratch/check-caps.mjs --define:import.meta.env='{"DEV":false}' && node scratch/check-caps.mjs
// Số byte lấy từ PLAN_POLICIES (BE app/core/config.py:308-341) — FE chỉ hiển thị, không tự định nghĩa.
;(globalThis as any).document = { documentElement: { lang: 'vi' } }
;(globalThis as any).localStorage = {
  store: {} as any,
  getItem(k: string) {
    return this.store[k] ?? null
  },
  setItem(k: string, v: string) {
    this.store[k] = v
  },
}

const { humanSize } = await import('../src/utils/apiError.ts')
const { t, syncLangFromPath } = await import('../src/i18n/langStore.ts')

let fails = 0
function check(name: string, actual: string, want: RegExp) {
  const ok = want.test(actual) && !/\{\w+\}/.test(actual)
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${name}\n     -> ${JSON.stringify(actual)}`)
  if (!ok) fails++
}
function checkNot(name: string, actual: string, banned: RegExp) {
  const ok = !banned.test(actual) && !/\{\w+\}/.test(actual)
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${name}\n     -> ${JSON.stringify(actual)}`)
  if (!ok) fails++
}

const MiB = 1048576
const free = { video: 200 * MiB, document: 25 * MiB, image: 10 * MiB, audio: 30 * MiB, background_removal: 10 * MiB }
const premium = { video: 2048 * MiB, document: 100 * MiB, image: 50 * MiB, audio: 200 * MiB, background_removal: 50 * MiB }

/** Đúng dòng FileUploader dựng ra khi /users/me đã trả plan_policy. */
const capsLine = (caps: typeof free) =>
  t('uploader.dropzoneCaps', {
    video: humanSize(caps.video),
    document: humanSize(caps.document),
    image: humanSize(caps.image),
    audio: humanSize(caps.audio),
  })

syncLangFromPath('/image')
check('VI hint Free', capsLine(free), /video 200 MB · tài liệu 25 MB · ảnh 10 MB · âm thanh 30 MB/)
check('VI hint Pro (2 GiB -> GB)', capsLine(premium), /video 2 GB · tài liệu 100 MB/)
syncLangFromPath('/en/image')
check('EN hint Free', capsLine(free), /video 200 MB · document 25 MB · image 10 MB · audio 30 MB/)
check('EN hint Pro', capsLine(premium), /video 2 GB/)
check('EN hint không lộ chữ Việt', capsLine(premium), /video 2 GB/)
checkNot('EN hint không có dấu tiếng Việt', capsLine(premium), /[àáâãèé]/)

// Ảnh: ImageWorkspace nối phần trần vào sau danh sách định dạng; ẩn danh thì không có số.
syncLangFromPath('/en/x')
check('EN hint ảnh có số', `${t('ws.imageDropzoneHint')} ${t('ws.imageDropzoneCap', { max: humanSize(premium.image) })}`, /SVG \(your plan ceiling: 50 MB\)/)
checkNot('EN hint ẩn danh không số', t('uploader.dropzoneCapsUnknown'), /\d/)
syncLangFromPath('/x')
check('VI hint ẩn danh không số', t('uploader.dropzoneCapsUnknown'), /gói Pro có trần cao hơn/)

console.log(fails === 0 ? '\nall ok' : `\n${fails} FAIL`)
process.exit(fails === 0 ? 0 : 1)
