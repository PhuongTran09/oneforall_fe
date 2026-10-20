// Self-check cho mapper lỗi FE (không đụng app, không cần test runner):
//   npx esbuild scratch/check-api-error.ts --bundle --platform=node --format=esm \
//     --outfile=scratch/check.mjs --define:import.meta.env='{"DEV":false}' && node scratch/check.mjs
// Stub DOM ở mức tối thiểu để module langStore import được.
;(globalThis as any).document = { documentElement: { lang: 'vi' } }
;(globalThis as any).localStorage = { store: {} as any, getItem(k: string) { return this.store[k] ?? null }, setItem(k: string, v: string) { this.store[k] = v } }

const { ApiClientError } = await import('../src/services/api/types.ts')
const { describeError, sanitizeUserMessage, isSafeUserMessage } = await import('../src/utils/apiError.ts')
const { syncLangFromPath } = await import('../src/i18n/langStore.ts')

let fails = 0
function check(name: string, actual: unknown, want: RegExp | string | ((v: string) => boolean)) {
  const ok =
    typeof want === 'function'
      ? want(String(actual))
      : want instanceof RegExp
        ? want.test(String(actual))
        : actual === want
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${name}\n     -> ${JSON.stringify(actual)}`)
  if (!ok) fails++
}

const err = (status: number, detail: unknown, message: string) =>
  new ApiClientError(status, 'X', message, { detail })

// 1. 413 có max_bytes + category (payload thật của app/utils/upload_limits.py)
const tooLarge = err(413, { code: 'upload_too_large', category: 'image', max_bytes: 10485760, message: 'File vượt quá giới hạn tải lên cho loại image.' }, 'X')
syncLangFromPath('/en/image')
check('EN 413 image 10MB', describeError(tooLarge).message, /over the 10 MB limit for image/)
check('EN 413 không lộ chữ Việt', describeError(tooLarge).message, (v: string) => !/[àáâ]/.test(v))
syncLangFromPath('/image')
check('VI 413 image 10MB', describeError(tooLarge).message, /trần 10 MB dành cho ảnh/)

// 2. MB lẻ + KB
syncLangFromPath('/en/x')
check('EN 413 2.5MB', describeError(err(413, { code: 'upload_too_large', category: 'document', max_bytes: 2621440 }, 'X')).message, /2.5 MB limit for document/)
check('EN 413 category lạ -> "file"', describeError(err(413, { code: 'upload_too_large', category: 'archive', max_bytes: 51200 }, 'X')).message, /50 KB limit for file/)
check('EN 413 thiếu max_bytes', describeError(err(413, { code: 'upload_too_large' }, 'X')).message, /larger than your plan/)

// 413 hình thứ hai: middleware chặn theo Content-Length (detail chuỗi, số nằm ở cấp response)
const mw = (lang: string) => {
  syncLangFromPath(lang)
  const m = describeError(
    new ApiClientError(
      413,
      'X',
      'Request body vượt quá giới hạn dung lượng cho phép.',
      { detail: 'Request body vượt quá giới hạn dung lượng cho phép.', max_request_bytes: 525307904 },
    ),
  ).message
  syncLangFromPath('/en/x')
  return m
}
check('EN 413 middleware theo trần hệ thống', mw('/en/x'), /exceeds the 501 MB ceiling for a single request/)
check('VI 413 middleware theo trần hệ thống', mw('/x'), /vượt trần 501 MB cho một yêu cầu/)

// 3. 429 rate_limited có retry_after
check('EN 429 retry 15s', describeError(err(429, { code: 'rate_limited', message: 'Too many requests, please slow down.', retry_after: 15 }, 'Too many requests, please slow down.')).message, /Wait 15 seconds/)
check('EN 503 limiter chết', describeError(err(503, { code: 'rate_limiter_unavailable', message: 'Rate limiting is temporarily unavailable, please try again.' }, 'Rate limiting is temporarily unavailable, please try again.')).message, /Cannot reach the server/)
check('EN 403 captcha_required', describeError(err(403, { code: 'captcha_required' }, 'X')).message, /not a robot/)

// 4. Bảng dịch message tiếng Việt của BE sang EN (kèm số)
const vi400 = err(400, 'Định dạng chuyển đổi từ \'png\' sang \'pdf\' hiện chưa được hỗ trợ.', 'Định dạng chuyển đổi từ \'png\' sang \'pdf\' hiện chưa được hỗ trợ.')
check('EN translate conversion', describeError(vi400).message, /Converting png to pdf is not supported/)
const viActive = err(429, 'Bạn đang có 3 job chờ hoặc đang xử lý. Hãy đợi job hiện tại hoàn tất.', 'Bạn đang có 3 job chờ hoặc đang xử lý. Hãy đợi job hiện tại hoàn tất.')
check('EN translate activeJobLimit', describeError(viActive).message, /have 3 jobs queued/)
const vi503 = err(503, 'Hệ thống đang quá tải, hàng đợi video đang có nhiều chờ xử lý. Vui lòng thử lại sau ít phút.', 'Hệ thống đang quá tải, hàng đợi video đang có nhiều chờ xử lý. Vui lòng thử lại sau ít phút.')
check('EN translate videoQueueFull', describeError(vi503).message, /video queue is full/)
check('VI 503 giữ nguyên text BE', (() => { syncLangFromPath('/video'); const m = describeError(vi503).message; syncLangFromPath('/en/video'); return m })(), /hàng đợi video đang có nhiều chờ/)

// 5. job.error từ worker đi qua cùng cửa (HistoryPage/JobProgress)
check('EN sanitize worker timeout', sanitizeUserMessage('Vượt thời gian xử lý cho phép — job bị dừng để giải phóng worker.', 'FB'), /timed out/)
check('EN sanitize traceback bị chặn', sanitizeUserMessage('Traceback (most recent call last): File "app/worker/x.py"', 'FB'), 'FB')
check('VI sanitize traceback bị chặn', (() => { syncLangFromPath('/x'); const m = sanitizeUserMessage('Traceback: file "a.py"', 'FB'); syncLangFromPath('/en/x'); return m })(), 'FB')

// 6. Lỗi không phải API: AbortError + network
check('EN AbortError', describeError(new DOMException('The user aborted a request.', 'AbortError')).message, /took too long and was stopped/)
check('EN network', describeError(new TypeError('fetch failed')).message, /check this device/)
check('EN fallback caller', describeError(new Error('xyz'), 'caller fallback').message, 'caller fallback')
check('isSafeUserMessage chặn HTML', isSafeUserMessage('File vượt trần <b>10</b> MB cho ảnh.'), false)

// 7. Các họ message BE mới map (job.error từ worker/service) + mấy chỗ từng map sai
const jobErrs: Array<[string, RegExp]> = [
  ['File SVG không hợp lệ hoặc không parse được.', /corrupted or in the wrong format/],
  ['File PDF bị mã hóa, không đọc được.', /password-protected/],
  ['Archive chứa quá 512 file.', /over the size or file-count limit/],
  ['Dung lượng đĩa không đủ để xử lý tác vụ (trống 12.5MB, yêu cầu 800.0MB).', /short on disk space/],
  ['Không tìm thấy sheet \'Doanh thu\'.', /Sheet 'Doanh thu' was not found/],
  ['Gói của bạn chỉ có 3 job đang xử lý lúc. Chờ job hiện tại hoàn thành hoặc nâng gói để chạy song song.', /runs 3 job at a time/],
  ['Video từ URL vượt giới hạn dung lượng của gói (200MB). Hãy chọn độ phân giải thấp hơn.', /over your plan's 200 MB limit/],
  ['ZIP chỉ hỗ trợ bài ảnh TikTok — liên kết này không phải bài ảnh.', /ZIP only works on TikTok photo posts/],
  ['Nguồn này không có khung hình video (bài ảnh TikTok?) — hãy chọn ZIP.', /Choose the ZIP option/],
  ['TikTok không trả nhạc cho bài ảnh này — hãy chọn ZIP.', /Choose the ZIP option/],
  ['TikTok trả nội dung không phải ảnh ở slide 3 — thử lại sau.', /returned no content/],
  ['SePay chưa được bật.', /Payments are temporarily unavailable/],
  ['Thiếu cấu hình SePay merchant/API/IPN.', /Payments are temporarily unavailable/],
  ['Không xác minh được phiên đăng nhập, thử lại sau.', /verify your sign-in/],
  ['Không xác minh được phiên ẩn danh, thử lại sau.', /guest session/],
  ['Máy chủ thiếu thư viện cần thiết để xuất PDF.', /missing a component/],
  ['Ảnh quá lớn (178,956,000 pixel, tối đa 89,478,485 pixel). Hãy giảm kích thước.', /over the 89,478,485 pixel limit/],
  ['Chỉ chấp nhận một file tải lên, ở field \'file\'.', /Only one file is accepted/],
]
for (const [text, want] of jobErrs) {
  check(`EN map: ${text.slice(0, 44)}`, sanitizeUserMessage(text, '__MISS__'), want)
}

// 8. code/params ở CẤP RESPONSE (thế hệ payload mới) — UI không còn phụ thuộc câu chữ tiếng
//    Việt của BE, và message tiếng Anh nội bộ của worker vẫn dịch được.
const apiErr = (code: number, body: Record<string, unknown>) =>
  new ApiClientError(code, 'X', String(body.detail ?? 'X'), body)
const inLang = (path: string, fn: () => string) => {
  syncLangFromPath(path)
  const m = fn()
  syncLangFromPath('/en/x')
  return m
}

const paramErr = {
  detail: "colormode phải thuộc [gray, color].",
  code: 'PARAM_VALUE_INVALID',
  params: { field: 'colormode' },
}
check('EN 400 theo code, điền {field}', describeError(apiErr(400, paramErr)).message, /value 'colormode' is invalid/)
check('VI 400 giữ nguyên văn text BE (thang ưu tiên cũ)', inLang('/x', () => describeError(apiErr(400, paramErr)).message), /colormode phải thuộc/)

const nothing = { detail: 'yt-dlp downloaded nothing', code: 'LINK_DOWNLOAD_FAILED' }
check('EN 500 message nội bộ + code -> câu theo mã', describeError(apiErr(500, nothing)).message, /could not be downloaded from this link/)
check('VI 500 message nội bộ + code -> câu tiếng Việt', inLang('/x', () => describeError(apiErr(500, nothing)).message), /Không tải được nội dung/)
check('500 không code, message tiếng Anh -> text hạ tầng chung', describeError(apiErr(503, { detail: 'upstream connect error' })).message, /Cannot reach the server|under maintenance/)

check(
  'code lạ (chưa map) -> text theo status, không in thô',
  describeError(apiErr(404, { detail: 'Job not found', code: 'SOMETHING_THE_DICT_DOES_NOT_KNOW' })).message,
  (v: string) => !/\{\w+\}/.test(v) && !v.includes('errors.') && !v.includes('SOMETHING_THE_DICT'),
)
check(
  'code hợp lệ nhưng params thiếu -> không in "{field}"',
  describeError(apiErr(400, { detail: 'X', code: 'PARAM_VALUE_INVALID' })).message,
  (v: string) => !/\{\w+\}/.test(v),
)
check(
  'params chứa HTML bị loại',
  describeError(apiErr(400, { detail: 'X', code: 'VIDEO_FORMAT_UNSUPPORTED', params: { format: '<script>alert(1)</script>' } })).message,
  (v: string) => !v.includes('script') && !/\{\w+\}/.test(v),
)

// 9. job.error (SSE delta + History) — cùng một cửa cho hai nguồn.
const { describeJobError } = await import('../src/utils/apiError.ts')
check('job EN theo code', describeJobError({ error: 'ffmpeg exited 1', error_code: 'SLIDESHOW_FAILED' }, 'FB'), /slideshow could not be built/)
check('job EN theo code + params {type}', describeJobError({ error: null, error_code: 'JOB_TYPE_UNAVAILABLE', error_params: { type: 'convert_file' } }, 'FB'), /no processor for the 'convert_file' job/)
check('job đời cũ không code -> bảng dịch text', describeJobError({ error: 'Không lưu được kết quả lên kho chứa.' }, 'FB'), /could not be saved to storage/)
check('job traceback + code lạ -> fallback, không lộ key', describeJobError({ error: 'Traceback (most recent call last): File "app/worker/x.py"', error_code: 'NOT_IN_DICT' }, 'FB'), 'FB')
check('job null -> fallback của caller', describeJobError(null, 'FB'), 'FB')
check(
  'VI job: dịch theo code chứ không nguyên văn text BE',
  inLang('/x', () => describeJobError({ error: 'GPU hết bộ nhớ, vui lòng thử lại sau.', error_code: 'IMAGE_PROCESS_FAILED' }, 'FB')),
  /Không xử lý được ảnh/,
)

// 10. Độ phủ từ điển: mọi mã trong ERROR_CODE_KEYS phải có errors.<key> ở CẢ HAI dict, và mọi
//     mã BE khai báo trong app/core/error_codes.py phải được map (BE nằm ở repo kế bên).
const { ERROR_CODE_KEYS } = await import('../src/utils/apiError.ts')
const { vi: dictVi } = await import('../src/i18n/dict.vi.ts')
const { en: dictEn } = await import('../src/i18n/dict.en.ts')
const errorsVi = (dictVi as { errors: Record<string, string> }).errors
const errorsEn = (dictEn as { errors: Record<string, string> }).errors
const noEntry = Object.entries(ERROR_CODE_KEYS).filter(
  ([, key]) => typeof errorsVi[key] !== 'string' || typeof errorsEn[key] !== 'string',
)
if (noEntry.length) {
  fails++
  console.log(`FAIL  ${noEntry.length} code không có entry ở hai dict:`, noEntry)
} else {
  console.log(`ok    ${Object.keys(ERROR_CODE_KEYS).length} code có entry ở cả hai dict`)
}

const { existsSync, readFileSync } = await import('node:fs')
const bePath = '../oneforall_be/app/core/error_codes.py'
if (!existsSync(bePath)) {
  console.log('skip  không thấy app/core/error_codes.py của BE (repo kế bên)')
} else {
  const beCodes = [...readFileSync(bePath, 'utf8').matchAll(/^([A-Z][A-Z0-9_]{2,}) = "\1"$/gm)].map((m) => m[1])
  const unmapped = beCodes.filter((c) => !(c in ERROR_CODE_KEYS))
  const orphan = Object.keys(ERROR_CODE_KEYS).filter(
    (c) => /^[A-Z]/.test(c) && !beCodes.includes(c),
  )
  if (unmapped.length) {
    fails++
    console.log(`FAIL  mã BE chưa map sang dict (${unmapped.length}):`, unmapped.join(', '))
  } else {
    console.log(`ok    ${beCodes.length} mã BE đều có đường dịch`)
  }
  if (orphan.length) console.log(`note  key FE map mà BE không (còn) khai báo: ${orphan.join(', ')}`)
}

// 11. describeAuthError: cùng bộ cửa chặn chuỗi kỹ thuật, dù nguồn Supabase viết tiếng Anh.
const { describeAuthError } = await import('../src/utils/authError.ts')
const { t } = await import('../src/i18n/langStore.ts')
const generic = t('auth.genericError')
check('EN auth: message chưa map nhưng an toàn vẫn được giữ', describeAuthError(new Error('Sign ups not allowed for this instance')), /Sign ups not allowed/)
check('EN auth: mật khẩu mới trùng mật khẩu cũ', describeAuthError(new Error('New password should be different from the old password.')), t('auth.passwordSameAsOld'))
check('EN auth: email sai định dạng -> key có sẵn', describeAuthError(new Error('Unable to validate email address: invalid format')), t('auth.emailInvalid'))
check('EN auth: "already signed up"', describeAuthError(new Error('A user with this email has already signed up')), t('auth.emailAlreadyRegistered'))
check('EN auth: câu chống spam của gotrue', describeAuthError(new Error('For security purposes, you can only request this after 12 November 2026')), t('auth.rateLimited'))
check('EN auth: Invalid OTP', describeAuthError(new Error('Invalid OTP')), t('auth.invalidCode'))
check('EN auth: chặn "Error performing API call to GoTrue server"', describeAuthError(new Error('Error performing API call to GoTrue server')), generic)
check('EN auth: chặn traceback/path', describeAuthError(new Error('Traceback: file "auth.py" line 10')), generic)
check('EN auth: chặn HTML', describeAuthError(new Error('Sign up <b>failed</b> here')), generic)
check('EN auth: chặn chuỗi quá dài', describeAuthError(new Error('x'.repeat(300))), generic)
check('EN auth: object lạ không phải Error/string', describeAuthError({ status: 500 } as unknown as Error), generic)
check('EN auth: rỗng', describeAuthError(''), generic)
check('EN auth: branch credentials không đổi', describeAuthError(new Error('Invalid login credentials')), t('auth.invalidCredentials'))
check('EN auth: branch rate limit không đổi', describeAuthError({ message: 'Too many requests', status: 429 } as unknown as Error), t('auth.rateLimited'))
syncLangFromPath('/x')
check('VI auth: ra tiếng Việt, không lộ text Anh của Supabase', describeAuthError(new Error('New password should be different from the old password.')), /Mật khẩu mới phải khác mật khẩu cũ/)
check('VI auth: chuỗi kỹ thuật vẫn bị chặn', describeAuthError(new Error('Error performing API call to GoTrue server')), t('auth.genericError'))
syncLangFromPath('/en/x')

console.log(fails ? `\n${fails} FAIL` : '\nall ok')
process.exit(fails ? 1 : 0)
