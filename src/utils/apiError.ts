import { ApiClientError, type ErrorParams } from '../services/api/types'
import { JobPollCancelled } from '../services/api/jobsApi'
import { getLang, hasKey, t } from '../i18n/langStore'

// Mapper lỗi duy nhất dùng chung toàn FE: đổi mọi lỗi (API, mạng, timeout, backend message
// tiếng Anh/nội bộ) thành thông báo an toàn theo ngôn ngữ UI. Log đầy đủ vẫn nằm ở backend;
// FE chỉ hiển thị.

export type ErrorToastType = 'success' | 'error' | 'warning' | 'info'

// Message user-facing của backend viết tiếng Việt có dấu; nội bộ/traceback thì tiếng Anh
// hoặc chứa ký tự kỹ thuật → chỉ hiện message nào "an toàn" theo cả hai tiêu chí.
export function isSafeUserMessage(text: unknown): text is string {
  if (typeof text !== 'string') return false
  const s = text.trim()
  if (!s || s.length > 300) return false
  if (/[\n\r<>{}]|traceback|file "|secret|password|bearer|BEGIN |redis|postgres|sqlite|supabase|jwt|http|\/var\/|\.py/i.test(s)) {
    return false
  }
  // Có dấu tiếng Việt (= message backend soạn cho người dùng), không phải English debug text.
  return s !== s.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

// Detail dạng object của BE (upload_limits.too_large, core/rate_limit, anon_captcha):
// client.ts chỉ lấy được payload gốc ở `details`, còn `message` thì rơi về statusText.
interface StructuredDetail {
  code?: string
  category?: string
  max_bytes?: number
  retry_after?: number
}

function structuredDetail(err: ApiClientError): StructuredDetail | null {
  const detail = (err.details as { detail?: unknown } | undefined)?.detail
  return detail && typeof detail === 'object' && !Array.isArray(detail)
    ? (detail as StructuredDetail)
    : null
}

// Mã lỗi BE (D:\PROJECT\oneforall_be\app\core\error_codes.py) -> key từ điển errors.*.
// Mã là ĐỊNH DANH: đổi wording thì chỉ sửa dict, không đụng table này, không đụng mapper.
// Một mã có thể trỏ tới cùng một key với mã khác khi câu hiển thị trùng nhau.
export const ERROR_CODE_KEYS: Record<string, string> = {

  FILE_REQUIRED: 'noFile',
  FILE_OR_LINK_REQUIRED: 'noMediaInput',
  FILE_EMPTY: 'emptyFile',
  FILE_FORMAT_UNDETECTABLE: 'formatUnknown',
  FILE_UNREADABLE: 'fileUnreadable',
  ONE_FILE_ONLY: 'oneFileOnly',
  TARGET_FORMAT_REQUIRED: 'noTargetFormat',
  CONVERSION_UNSUPPORTED: 'conversionUnsupported',
  OUTPUT_FORMAT_UNSUPPORTED: 'videoFormatUnsupported',
  PARAM_VALUE_INVALID: 'paramInvalid',
  PHOTO_LIST_INVALID: 'photoListInvalid',
  SHEET_NOT_FOUND: 'sheetNotFound',

  ARCHIVE_TOO_MANY_ENTRIES: 'archiveTooLarge',
  ARCHIVE_UNSAFE_NAME: 'fileRejected',
  ARCHIVE_TOO_LARGE: 'archiveTooLarge',
  ARCHIVE_NO_VALID_FILE: 'archiveInvalid',
  IMAGE_PIXEL_LIMIT: 'imageTooLarge',
  LINK_VIDEO_OVER_PLAN_LIMIT: 'videoSourceTooLarge',
  PLAN_CONCURRENCY_LIMIT: 'planConcurrencyLimit',
  PLAN_HOURLY_LIMIT: 'hourlyJobLimit',
  GUEST_CAPACITY_FULL: 'activeJobLimit',
  GPU_QUEUE_FULL: 'guestCapacityFull',
  STORAGE_QUEUE_FULL: 'guestCapacityFull',
  QUEUE_UNAVAILABLE: 'queueDown',
  QUEUE_OVERLOADED: 'videoQueueFull',
  DISK_SPACE_LOW: 'diskFull',

  SIGN_IN_CHECK_UNAVAILABLE: 'sessionCheckFailed',
  GUEST_SESSION_CHECK_UNAVAILABLE: 'sessionUnavailable',
  GUEST_SESSION_DISABLED: 'guestDisabled',
  GUEST_SESSION_CREATE_FAILED: 'sessionUnavailable',
  LOGIN_REQUIRED: '401',
  RESOURCE_FORBIDDEN: '403',

  JOB_NOT_FOUND: '404',
  DOWNLOAD_TOKEN_REQUIRED: 'downloadTokenExpired',
  DOWNLOAD_TOKEN_INVALID: 'downloadTokenExpired',
  JOB_NOT_READY: 'jobNotReady',
  RESULT_EXPIRED: 'resultExpired',
  JOB_BUSY_DELETE: 'jobBusyDelete',
  CANCEL_AUTH_REQUIRED: '401',
  CANCEL_TOO_LATE: 'cancelTooLate',
  RESULT_FILE_MISSING: 'resultMissing',
  FILE_DELETE_FAILED: 'deleteFailed',
  STREAM_DISABLED: 'streamDisabled',

  LINK_PLATFORM_UNSUPPORTED: 'linkSiteUnsupported',
  LINK_PREVIEW_UNAVAILABLE: 'linkNoPreview',
  LINK_PREVIEW_BUSY: 'linkPreviewBusy',
  LINK_CONTENT_REFUSED: 'linkContentRefused',
  LINK_DOWNLOAD_FAILED: 'linkDownloadFailed',
  URL_REQUIRED: 'noMediaInput',
  TIKTOK_PHOTO_POST_ONLY: 'tiktokPhotoOnly',
  TIKTOK_NO_PHOTOS: 'tiktokLinkUnavailable',
  TIKTOK_NO_MUSIC: 'tiktokZipFallback',
  TIKTOK_MUSIC_DURATION_UNKNOWN: 'tiktokZipFallback',
  TIKTOK_BAD_PHOTO_CONTENT: 'tiktokLinkUnavailable',
  SOURCE_NO_VIDEO_FRAME: 'tiktokZipFallback',
  SLIDESHOW_FAILED: 'slideshowFailed',

  CONVERSION_FAILED: 'conversionFailed',
  PDF_FROM_DOCUMENT_FAILED: 'pdfCreateFailed',
  IMAGE_PROCESS_FAILED: 'imageProcessFailed',
  MODEL_OUTPUT_INVALID: 'imageProcessFailed',
  INPUT_FILE_MISSING: 'inputFileMissing',
  OUTPUT_FILE_MISSING: 'resultMissing',
  STORAGE_WRITE_FAILED: 'storageWriteFailed',
  JOB_TYPE_UNAVAILABLE: 'jobTypeUnavailable',
  JOB_TIMED_OUT: 'jobTimeout',

  SERVER_COMPONENT_MISSING: 'serverSetup',
  SERVER_OUT_OF_MEMORY: 'outOfMemory',

  PAYMENT_NOT_FOUND: 'paymentNotFound',
  PAYMENTS_UNAVAILABLE: 'paymentUnavailable',
  PLAN_NOT_FOUND: 'planNotPurchasable',
  PLAN_NOT_PURCHASABLE: 'planNotPurchasable',
  PLAN_ALREADY_ACTIVE: 'planAlreadyActive',

  upload_too_large: '413',
  rate_limited: '429',
  rate_limiter_unavailable: 'unavailable',
  captcha_required: 'captchaRequired',
  captcha_unavailable: 'unavailable',
}

/** Read error code and params from current and legacy response shapes. */
export function readErrorMeta(err: ApiClientError): { code?: string; params?: Record<string, unknown> } {
  const body = err.details as { code?: unknown; params?: unknown; detail?: unknown } | undefined
  if (typeof body?.code === 'string') {
    const params = body.params
    return { code: body.code, params: params && typeof params === 'object' ? (params as Record<string, unknown>) : undefined }
  }
  const detail = body?.detail
  if (detail && typeof detail === 'object' && !Array.isArray(detail)) {
    const flat = detail as Record<string, unknown>
    if (typeof flat.code === 'string') {
      const rest: Record<string, unknown> = {}
      for (const key of Object.keys(flat)) {
        if (key !== 'code' && key !== 'message') rest[key] = flat[key]
      }
      return { code: flat.code, params: rest }
    }
  }
  return {}
}

// BE đã chốt params ở chiều ghi (app/utils/paths.py::clean_error_params); vẫn chặn lại chiều
// đọc vì row cũ và payload không phải từ BE. Cùng trần với BE để hai bên không lệch nhau.
const MAX_PARAM_KEYS = 12
const MAX_PARAM_LEN = 160

function safeParams(raw: unknown): Record<string, string | number> | undefined {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return undefined
  const out: Record<string, string | number> = {}
  for (const [key, value] of Object.entries(raw).slice(0, MAX_PARAM_KEYS)) {
    if (typeof value === 'number' && Number.isFinite(value)) out[key] = value
    else if (typeof value === 'string' && value.length <= MAX_PARAM_LEN && !/[<>&{}]/.test(value)) {
      out[key] = value
    }
  }
  return Object.keys(out).length ? out : undefined
}

/** Câu theo locale cho một mã lỗi; null khi mã chưa map, từ điển chưa có entry hoặc params */
function codedMessage(code?: string, params?: Record<string, unknown>): string | null {
  if (!code) return null
  const key = ERROR_CODE_KEYS[code]
  if (!key) return null
  const full = `errors.${key}`
  if (!hasKey(full)) return null
  const text = t(full, safeParams(params))
  return /\{\w+\}/.test(text) ? null : text
}

const UPLOAD_KINDS = new Set(['image', 'document', 'audio', 'video', 'background_removal'])
/** Số do BE quy định (trần PLAN_POLICIES tính bằng byte) hiển thị gọn: 209715200 -> "200 MB". */
export function humanSize(bytes: number): string {
  const gb = bytes / 1073741824
  if (gb >= 1) return `${Math.round(gb * 10) / 10} GB`
  const mb = bytes / 1048576
  if (mb >= 10) return `${Math.round(mb)} MB`
  if (mb >= 1) return `${Math.round(mb * 10) / 10} MB`
  return `${Math.max(1, Math.round(bytes / 1024))} KB`
}

// BE soạn message tiếng Việt kèm số thật (trần dung lượng, giây chờ, giới hạn job) cho cả
// HTTP detail lẫn `job.error` mà worker/service ghi xuống. UI tiếng Anh không được phép hiện
// chữ Việt, nên khớp cụm từ ổn định của BE rồi đổi sang key từ điển; số lấy bằng nhóm bắt
// được trong message gốc để EN vẫn có con số.
// shortcut: khớp chuỗi — BE đổi wording thì message chỉ rơi về text theo status/fallback của
// caller (bớt cụ thể, không sai nghiệp vụ); nâng cấp khi BE gắn `code` cho mọi message.
const BE_TEXT_KEYS: Array<{
  re: RegExp
  key: string
  params?: (m: RegExpExecArray) => Record<string, string | number>
}> = [
  // --- Input phía user ---
  {
    re: /^Định dạng chuyển đổi từ '([^']+)' sang '([^']+)'/,
    key: 'conversionUnsupported',
    params: (m) => ({ from: m[1], to: m[2] }),
  },
  { re: /không thể xác định định dạng/i, key: 'formatUnknown' },
  { re: /chỉ định định dạng đích/i, key: 'noTargetFormat' },
  { re: /tải lên file video\/audio/i, key: 'noMediaInput' },
  { re: /chấp nhận một file/i, key: 'oneFileOnly' },
  { re: /tải lên file/i, key: 'noFile' },
  { re: /tải lên bị rỗng/i, key: 'emptyFile' },
  { re: /chỉ hỗ trợ xem trước liên kết/i, key: 'linkSiteUnsupported' },
  { re: /dịch vụ xem trước đang bận/i, key: 'linkPreviewBusy' },
  { re: /không xem trước được/i, key: 'linkNoPreview' },

  // --- Hạn mức và tải hệ thống ---
  { re: /hàng đợi video đang có nhiều chờ/i, key: 'videoQueueFull' },
  { re: /lỗi hàng đợi xử lý/i, key: 'queueDown' },
  { re: /đang có ([\d,]+) job chờ/i, key: 'activeJobLimit', params: (m) => ({ n: m[1] }) },
  {
    re: /chỉ có ([\d,]+) job đang xử lý/i,
    key: 'planConcurrencyLimit',
    params: (m) => ({ n: m[1] }),
  },
  { re: /giới hạn ([\d,]+) job mỗi giờ/i, key: 'hourlyJobLimit', params: (m) => ({ n: m[1] }) },
  { re: /(hàng đợi gpu|kho chứa tạm) cho khách/i, key: 'guestCapacityFull' },
  { re: /gpu hết bộ nhớ/i, key: 'gpuBusy' },
  { re: /không kiểm tra được hạn mức/i, key: 'unavailable' },
  { re: /phiên đăng nhập/i, key: 'sessionCheckFailed' },
  { re: /phiên ẩn danh/i, key: 'sessionUnavailable' },

  // --- Kết quả và vòng đời job ---
  { re: /hết hạn \((\d+) phút\)/i, key: 'resultExpired', params: (m) => ({ n: m[1] }) },
  { re: /job chưa hoàn thành/i, key: 'jobNotReady' },
  { re: /download token không hợp lệ/i, key: 'downloadTokenExpired' },
  { re: /job đang xử lý/i, key: 'jobBusyDelete' },
  { re: /không thể hủy/i, key: 'cancelTooLate' },
  { re: /không xóa được file/i, key: 'deleteFailed' },
  {
    re: /(không tìm thấy file kết quả|không còn trên server|kết quả đã hết hạn|không tạo được file kết quả)/i,
    key: 'resultMissing',
  },
  { re: /vượt thời gian xử lý/i, key: 'jobTimeout' },
  { re: /không lưu được kết quả/i, key: 'storageWriteFailed' },

  // --- Lỗi từ service/worker (chủ yếu xuất hiện ở job.error) ---
  { re: /thiếu thư viện/i, key: 'serverSetup' },
  { re: /máy chủ thiếu bộ nhớ/i, key: 'outOfMemory' },
  { re: /dung lượng đĩa không đủ/i, key: 'diskFull' },
  { re: /tối đa ([\d,.]+) pixel/i, key: 'imageTooLarge', params: (m) => ({ max: m[1] }) },
  { re: /(suy luận trả kết quả|không thể xử lý ảnh)/i, key: 'imageProcessFailed' },
  { re: /(chỉ hỗ trợ \.docx|word 97-2003)/i, key: 'docLegacyUnsupported' },
  { re: /pdf bị mã hóa/i, key: 'pdfEncrypted' },
  { re: /không thể tạo file pdf/i, key: 'pdfCreateFailed' },
  {
    re: /không tìm thấy sheet '([^']{1,60})'/i,
    key: 'sheetNotFound',
    params: (m) => ({ name: m[1] }),
  },
  { re: /json phải là/i, key: 'jsonShapeInvalid' },
  { re: /(entity không an toàn|archive không hợp lệ)/i, key: 'fileRejected' },
  { re: /(archive chứa quá|giải nén vượt|trong archive vượt)/i, key: 'archiveTooLarge' },
  { re: /archive không chứa file hợp lệ/i, key: 'archiveInvalid' },
  { re: /(svg không hợp lệ|xml không hợp lệ|không phải ảnh hợp lệ|không giải mã được)/i, key: 'fileUnreadable' },
  {
    re: /không hỗ trợ định dạng đầu ra '([^']{1,16})'/i,
    key: 'videoFormatUnsupported',
    params: (m) => ({ format: m[1] }),
  },
  {
    re: /^([a-z0-9]{1,16}) chỉ hỗ trợ bài ảnh tiktok/i,
    key: 'tiktokPhotoOnly',
    params: (m) => ({ format: m[1].toUpperCase() }),
  },
  { re: /(danh sách ảnh|chưa chọn ảnh nào|không có ảnh thứ)/i, key: 'photoListInvalid' },
  { re: /hãy chọn zip/i, key: 'tiktokZipFallback' },
  { re: /tiktok (không trả|trả nội dung)|không đo được thời lượng/i, key: 'tiktokLinkUnavailable' },
  { re: /không dựng được slideshow/i, key: 'slideshowFailed' },
  {
    re: /vượt giới hạn dung lượng của gói \((\d+)MB\)/i,
    key: 'videoSourceTooLarge',
    params: (m) => ({ limit: `${m[1]} MB` }),
  },

  // --- Thanh toán (SePay: cấu hình tắt là lỗi phía hệ thống, không phải lỗi người dùng) ---
  { re: /sepay/i, key: 'paymentUnavailable' },
  { re: /(không tìm thấy gói|không cần thanh toán|đã có gói)/i, key: 'planNotPurchasable' },
]

function translateBeText(text: unknown): string | null {
  if (!isSafeUserMessage(text)) return null
  for (const { re, key, params } of BE_TEXT_KEYS) {
    const m = re.exec(text)
    if (!m) continue
    // Key thiếu trong dict của ngôn ngữ đang dùng: trả null để caller dùng text theo status,
    // tuyệt đối không in thô "errors.xyz" cho người dùng thấy.
    if (!hasKey(`errors.${key}`)) return null
    return t(`errors.${key}`, params?.(m))
  }
  return null
}

// Thang ưu tiên khi dịch một lỗi: text BE đã là tiếng Việt (chứa số thật) -> dùng nguyên văn;
// ngược lại lấy theo MÃ lỗi (ổn định), rồi tới bảng khớp chuỗi (di sản), cuối là text theo status.
function beOrStatus(message: string, statusKey: string, coded?: string | null): string {
  if (getLang() === 'vi' && isSafeUserMessage(message)) return message
  return coded ?? translateBeText(message) ?? t(`errors.${statusKey}`)
}

export function describeError(
  err: unknown,
  fallback?: string,
): { type: ErrorToastType; message: string } {
  // Người dùng chủ động hủy luồng theo dõi — không phải lỗi, caller thường đã lọc;
  // giữ ở đây để không bao giờ biến thành toast lỗi.
  if (err instanceof JobPollCancelled) {
    return { type: 'info', message: t('errors.cancelled') }
  }

  if (err instanceof ApiClientError) {
    const detail = structuredDetail(err)
    const meta = readErrorMeta(err)
    const coded = codedMessage(meta.code, meta.params)

    // 413 có hai hình trên cùng một status: ``too_large()`` của endpoint (detail object, trần
    // theo GÓI và theo loại tệp vừa sniff) và middleware chặn theo Content-Length (detail là
    // chuỗi, số nằm ở ``max_request_bytes`` = trần tuyệt đối của hệ thống). Cả hai đều phải
    // cho user thấy CON SỐ, nếu không câu "vượt giới hạn dung lượng" vô dụng như cũ.
    if (err.status === 413) {
      const planCap = detail?.max_bytes
      const systemCeiling = (err.details as { max_request_bytes?: number } | undefined)
        ?.max_request_bytes
      const bytes = planCap ?? systemCeiling
      if (typeof bytes !== 'number') return { type: 'warning', message: t('errors.413') }
      const kind = detail?.category && UPLOAD_KINDS.has(detail.category) ? detail.category : 'other'
      return {
        type: 'warning',
        message: t(
          planCap ? 'errors.uploadTooLarge' : 'errors.bodyTooLarge',
          { max: humanSize(bytes), kind: t(`fileKind.${kind}`) },
        ),
      }
    }

    // Vài mã BE chỉ có tiếng Anh ("Too many requests, please slow down.") nên không thể hiện
    // nguyên văn cho UI tiếng Việt: dựng câu localize từ payload, dùng cho cả hai ngôn ngữ.
    if (detail) {
      switch (detail.code) {
        case 'rate_limited':
          return {
            type: 'warning',
            message:
              typeof detail.retry_after === 'number'
                ? t('errors.rateLimitedRetry', { seconds: detail.retry_after })
                : t('errors.429'),
          }
        case 'captcha_required':
          return { type: 'warning', message: t('errors.captchaRequired') }
        case 'captcha_unavailable':
        case 'rate_limiter_unavailable':
          return { type: 'error', message: t('errors.unavailable') }
        default:
          break
      }
    }

    // 401/403: KHÔNG dùng detail từ backend (chứa cơ chế token/JWT). Status là đủ.
    switch (true) {
      case err.status === 401:
        return { type: 'error', message: t('errors.401') }
      case err.status === 403:
        return { type: 'error', message: t('errors.403') }
      case err.status === 404:
        return { type: 'error', message: beOrStatus(err.message, '404', coded) }
      case err.status === 410:
        return { type: 'warning', message: beOrStatus(err.message, '410', coded) }
      case err.status === 422:
        // Pydantic "field: msg" tiếng Anh không lọt qua isSafeUserMessage -> về hướng dẫn chung.
        return { type: 'warning', message: beOrStatus(err.message, '422', coded) }
      case err.status === 429:
        return { type: 'warning', message: beOrStatus(err.message, '429', coded) }
      case err.status >= 500:
        // BE còn sống và vừa tự báo lỗi của chính nó (vd 503 quá tải hàng đợi video) thì phải
        // hiện cái đó; "hạ tầng đang bảo trì" là sai nguyên nhân. Proxy chết trả HTML nên
        // err.message không có dấu và rơi xuống nhánh dưới.
        if (isSafeUserMessage(err.message)) {
          return { type: 'error', message: beOrStatus(err.message, 'generic', coded) }
        }
        // Message nội bộ tiếng Anh ("yt-dlp downloaded nothing") nhưng BE đã gắn mã:
        // câu theo mã vẫn tốt hơn "hạ tầng đang bảo trì" chung chung.
        if (coded) return { type: 'error', message: coded }
        if (err.status === 502 || err.status === 503 || err.status === 504) {
          return { type: 'error', message: t('errors.unavailable') }
        }
        return { type: 'error', message: t('errors.generic') }
      default:
        // 400 và các status còn lại: backend tự soạn detail tiếng Việt cho người dùng.
        return { type: 'error', message: beOrStatus(err.message, '400', coded) }
    }
  }

  if (err instanceof DOMException && err.name === 'AbortError') {
    return { type: 'error', message: t('errors.timeout') }
  }

  if (err instanceof TypeError || /fetch|network|ECONN|load failed/i.test(String((err as Error)?.message ?? ''))) {
    return { type: 'error', message: t('errors.network') }
  }

  const text = err instanceof Error ? err.message : String(err ?? '')
  if (getLang() === 'vi' && isSafeUserMessage(text)) {
    return { type: 'error', message: text }
  }
  const translated = translateBeText(text)
  if (translated) return { type: 'error', message: translated }

  return { type: 'error', message: fallback ?? t('errors.generic') }
}

// Cho chuỗi lỗi không phải Exception (job.error từ worker, message khôi phục snapshot).
export function sanitizeUserMessage(text: string | null | undefined, fallback: string): string {
  if (typeof text !== 'string') return fallback
  if (getLang() === 'vi') return isSafeUserMessage(text) ? text : fallback
  return translateBeText(text) ?? fallback
}

/** Message thất bại của một job (JobPublicResponse/JobHistoryItem): theo MÃ lỗi trước, rồi tới
 *  text an toàn, cuối là fallback của caller. SSE delta và History đi qua cùng một cửa. */
export function describeJobError(
  job: { error?: string | null; error_code?: string | null; error_params?: ErrorParams | null } | null | undefined,
  fallback: string,
): string {
  const coded = codedMessage(job?.error_code ?? undefined, job?.error_params ?? undefined)
  if (coded) return coded
  return sanitizeUserMessage(job?.error, fallback)
}
