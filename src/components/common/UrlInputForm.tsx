import { useEffect, useState, type FormEvent } from 'react'
import { Link2, Clipboard, X, ArrowRight, AlertCircle, RefreshCw, Video, Play, MonitorPlay } from 'lucide-react'
import { Button } from './Button'
import { SegmentedControl } from './SegmentedControl'
import { t, getLang } from '../../i18n/langStore'
import { showToast } from '../feedback/toastStore'
import { describeError, readErrorMeta } from '../../utils/apiError'
import { ApiClientError } from '../../services/api/types'
import { mediaApi, type UrlInfo } from '../../services/api/mediaApi'
import type { UrlPlatform } from '../../config/seoTools'

export interface UrlInputFormProps {
  platform?: UrlPlatform
  formats: string[]
  defaultFormat: string
  onSubmit: (url: string, format: string, quality: string, slides?: number[]) => void
  isLoading?: boolean
  disabled?: boolean
}

// Một ô trong lưới chọn: Threads liệt kê cả ảnh lẫn video, TikTok chỉ ảnh. `thumb` null nghĩa là nền
// tảng KHÔNG công bố ảnh bìa cho mục đó (đo 02/11: bài 3 video chỉ có 1 <img> cho 3 <source>) — ô
// video vì vậy là tile số thứ tự, không phải ảnh bịa từ thumbnail của bài.
type PickerItem = { index: number; kind: 'photo' | 'video'; thumb: string | null }
// Mục phát được, đã chắc có token: giữ nguyên item của UrlInfo thì `preview_token` vẫn là
// `string | null | undefined` và src của <video> phải viết `?? ''` — một URL hỏng ký tự ẩn.
type PlayableItem = { index: number; token: string }

const AUDIO_FORMATS = new Set(['mp3', 'wav', 'm4a', 'aac'])
// ZIP là nguyên bộ ảnh gốc, GIF là ảnh động dựng từ đúng ảnh đó, JPG của Threads là ảnh gốc
// đúng kích thước nguồn — cả ba không có mức chất lượng để chọn.
const NO_QUALITY_FORMATS = new Set(['zip', 'gif', 'jpg'])
// Ba đầu ra này dựng từ từng ảnh; MP3 của bài ảnh là nhạc nền nên không có gì để chọn.
const SLIDE_FORMATS = new Set(['zip', 'mp4', 'gif'])
// Chỉ bài ảnh TikTok mới có; được nối thêm vào danh sách format của tool khi BE trả slides.
const PHOTO_ONLY_FORMATS = ['zip', 'gif']
const VIDEO_QUALITIES = ['best', '1080p', '720p', '480p']
const AUDIO_QUALITIES = ['128', '192', '320']
// Tier video chỉ hiện với nền tảng công bố chiều cao thật. Facebook đo 02/11: format trả về chỉ
// sd/hd với height=None, nên mọi selector [height<=N] của backend không khớp và backend rơi về
// best — chip "1080p" ở đây là lời hứa rỗng. Audio bitrate vẫn được dùng thật cho mọi nền tảng
// (backend normalize_audio_quality) nên chỉ tắt tier VIDEO, không tắt cả dải.
const VIDEO_QUALITY_PLATFORMS: readonly UrlPlatform[] = ['youtube', 'tiktok', 'twitter']

const qualityOptionsFor = (format: string) =>
  AUDIO_FORMATS.has(format.toLowerCase()) ? AUDIO_QUALITIES : VIDEO_QUALITIES
const defaultQualityFor = (format: string) =>
  AUDIO_FORMATS.has(format.toLowerCase()) ? '192' : 'best'

// Chặn theo hostname, khớp TỪNG NHÃN — cùng quy tắc với _platform_for của backend.
// '.includes("x.com")' nhận cả not-x.com và 'https://youtube.com.attacker.tld'; hostname
// đã bỏ scheme/userinfo/port nên 'http://t.co@127.0.0.1/' cũng không khớp 't.co'.
const PLATFORM_HOSTS: Record<UrlPlatform, readonly string[]> = {
  youtube: ['youtube.com', 'youtu.be'],
  tiktok: ['tiktok.com'],
  twitter: ['x.com', 'twitter.com', 't.co'],
  // fb.watch là shortlink của app Share — BE giải theo từng bước nhảy rồi kiểm đích.
  facebook: ['facebook.com', 'fb.watch'],
  threads: ['threads.com', 'threads.net'],
}
const PLATFORM_ERROR_KEYS: Record<UrlPlatform, string> = {
  youtube: 'urlInput.youtubeOnly',
  tiktok: 'urlInput.tiktokOnly',
  twitter: 'urlInput.twitterOnly',
  facebook: 'urlInput.facebookOnly',
  threads: 'urlInput.threadsOnly',
}

const PLATFORM_PLACEHOLDERS: Record<UrlPlatform, string> = {
  youtube: 'urlInput.placeholderYoutube',
  tiktok: 'urlInput.placeholderTiktok',
  twitter: 'urlInput.placeholderTwitter',
  facebook: 'urlInput.placeholderFacebook',
  threads: 'urlInput.placeholderThreads',
}

// Lý do một bài Threads hiện được preview mà không tải được, theo kind backend công bố. Bảng
// KHÔNG còn member 'carousel': bài nhiều ảnh tải được bằng ZIP (chọn từng mục). Kind lạ vẫn rơi về
// 'unknown' — không bao giờ để t() nhận một key không tồn tại, vì key thiếu sẽ hiện nguyên văn ra UI.
const THREADS_UNSUPPORTED_KEYS: Record<string, string> = {
  text: 'urlInput.threadsUnsupported.text',
}
const THREADS_UNSUPPORTED_FALLBACK = 'urlInput.threadsUnsupported.unknown'
// Format một bài Threads thực sự xuất được, theo kind nền tảng tự công bố. Mỗi video chỉ có ĐÚNG MỘT
// bản MP4 (đo 02/11: 1280x720 h264) — không có tier 1080p/720p nào, nên MP3 là lựa chọn duy nhất có
// tham số (bitrate). kind lạ/thiếu => không lọc, để backend quyết (fail-open).
const THREADS_KIND_FORMATS: Record<string, readonly string[]> = {
  photo: ['jpg'],
  video: ['mp4', 'mp3', 'zip'],
  carousel: ['zip'],
}

// Hai mã này là PHÁN QUYẾT của nền tảng về chính bài viết (đã bị xóa / giới hạn người xem), không
// phải sự cố khi đọc: bấm Thử lại chỉ tốn thêm một lượt. Những lỗi preview khác (mạng, bận, cache)
// vẫn giữ nút vì lần sau có thể đọc được.
const TERMINAL_PREVIEW_CODES = new Set(['LINK_POST_REMOVED', 'LINK_POST_RESTRICTED'])

const hostnameOf = (value: string): string => {
  try {
    return new URL(value).hostname.toLowerCase()
  } catch {
    return ''
  }
}

const matchesPlatform = (host: string, platform: UrlPlatform): boolean =>
  PLATFORM_HOSTS[platform].some((domain) => host === domain || host.endsWith(`.${domain}`))

// Bản pure của validateUrl bên dưới (không set error) — dùng cho effect preview.
const isValidForPlatform = (value: string, platform?: UrlPlatform): boolean => {
  const host = hostnameOf(value.trim())
  if (!host) return false
  return platform ? matchesPlatform(host, platform) : true
}

const formatDuration = (seconds: number): string => {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  const mmss = h > 0 ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}` : `${m}:${String(s).padStart(2, '0')}`
  return mmss
}

// Số liệu lớn thì card hẹp không chứa nổi "1.826.937.533 lượt xem" — dùng dạng gọn
// theo locale (vi: 1,8T / en: 1.8B).
const formatCount = (value: number, locale: string): string =>
  new Intl.NumberFormat(locale, { notation: 'compact', compactDisplay: 'short' }).format(value)

// Ngày đăng đến từ backend là "YYYY-MM-DD" (không giờ). Parse tay để new Date(iso)
// không bị coi là UTC rồi lệch sang hôm trước ở múi giờ âm.
const formatDay = (iso: string, locale: string): string => {
  const [y, mo, d] = iso.split('-').map(Number)
  if (!y || !mo || !d) return iso
  return new Date(y, mo - 1, d).toLocaleDateString(locale)
}

// Hàng metadata của card preview: chỉ những thứ backend thực sự lấy được. Thiếu thì
// ẩn hẳn, không hiện 0 hay "không rõ" — số liệu bịa còn hại hơn số liệu thiếu.
const previewMetaLine = (data: UrlInfo): string => {
  const locale = getLang() === 'vi' ? 'vi-VN' : 'en-US'
  return [
    data.duration ? formatDuration(data.duration) : null,
    data.uploader,
    data.view_count ? `${formatCount(data.view_count, locale)} ${t('urlInput.viewsLabel')}` : null,
    data.like_count ? `${formatCount(data.like_count, locale)} ${t('urlInput.likesLabel')}` : null,
    data.upload_date ? formatDay(data.upload_date, locale) : null,
  ]
    .filter(Boolean)
    .join(' · ')
}

export function UrlInputForm({
  platform,
  formats,
  defaultFormat,
  onSubmit,
  isLoading = false,
  disabled = false,
}: UrlInputFormProps) {
  const [url, setUrl] = useState('')
  const [selectedFormat, setSelectedFormat] = useState(defaultFormat)
  const [selectedQuality, setSelectedQuality] = useState(() => defaultQualityFor(defaultFormat))
  const [validationError, setValidationError] = useState<string | null>(null)
  // Chỉ KẾT QUẢ fetch (bất đồng bộ) mới là state; idle/loading/error của URL hiện tại
  // được derive bên dưới — effect không setState đồng bộ (rule react-hooks/set-state-in-effect).
  const [previewFetched, setPreviewFetched] = useState<{
    key: string
    status: 'ready' | 'error'
    data: UrlInfo | null
    /** Lý do fail đã localize (playlist, quá trần gói, riêng tư…) — hiện ngay ở card lỗi. */
    message?: string
    /** MÃ lỗi BE: thứ quyết định nút Thử lại có nghĩa gì không, không phải wording của câu. */
    code?: string
    /** Code bài Threads đọc được từ chuỗi redirect — người dùng cầm nó đi đối chiếu được. */
    postCode?: string | null
  } | null>(null)
  // Bump khi bấm Thử lại — đưa vào deps để effect preview chạy lại cùng một URL.
  const [previewAttempt, setPreviewAttempt] = useState(0)
  // Ảnh được chọn của bài ảnh TikTok; null = cả bộ (mặc định, và là những gì job cũ gửi).
  const [pickedSlides, setPickedSlides] = useState<number[] | null>(null)
  // Mục đang phát. `key` là URL đã fetch nên sửa/dán lại link là player tự biến mất — không cần
  // effect dọn state (rule react-hooks/set-state-in-effect).
  const [playing, setPlaying] = useState<{ key: string; index: number } | null>(null)
  // <video> chỉ báo "có lỗi" chứ không báo 410 hay 502: nói thật một câu rồi đưa về lượt fetch
  // preview để lấy token mới, không đoán nguyên nhân.
  const [playFailed, setPlayFailed] = useState(false)
  // Chuỗi token ĐÃ chết một lần. Giữ nó để không bao giờ dựng lại thẻ `<video>` bằng đúng khả năng
  // truy cập vừa hỏng — kể cả khi một response `url-info` nào đó còn trả lại nó (FE không được dùng
  // lại token cũ sau một response mới, đó là nửa FE của lỗi "Retry vô vọng").
  const [deadToken, setDeadToken] = useState<string | null>(null)
  // Khung nhúng chính chủ (X/Facebook) TỰ nạp khi card sẵn sàng — người dùng không phải bấm bước nào.
  // Đổi lại, mỗi lượt dán link là trình duyệt của họ kéo nội dung từ CDN của nền tảng và nhận cookie
  // của họ; `embedNote` nói rõ điều đó. Cờ này chỉ để báo "đang tải", gắn theo KEY URL nên dán link
  // khác là trạng thái tự về đầu (không có effect dọn state — rule react-hooks/set-state-in-effect).
  const [embedLoadedFor, setEmbedLoadedFor] = useState<string | null>(null)
  // Tỷ lệ khung hình của VIDEO, đọc từ ảnh bìa mà nền tảng trả về (gắn theo KEY URL để dán link khác
  // là tính lại). `url-info` không có field kích thước video nào, còn plugin FB thì co giãn nội dung
  // theo BỀ RỘNG khung — nên muốn khung nhúng đúng tỷ lệ (không cắt video, không thừa dải đen) chỉ
  // còn cách lấy tỉ lệ từ ảnh bìa: FB trả đúng khung hình video, đo `cstp=mx320x568` cho video 9:16.
  const [embedRatio, setEmbedRatio] = useState<{ url: string; value: number } | null>(null)

  const urlValid = isValidForPlatform(url, platform)
  const trimmedUrl = url.trim()
  const fetched = previewFetched && previewFetched.key === trimmedUrl ? previewFetched : null
  const preview: { status: 'idle' | 'loading' | 'ready' | 'error'; data: UrlInfo | null } = !urlValid
    ? { status: 'idle', data: null }
    : fetched
      ? { status: fetched.status, data: fetched.data }
      : { status: 'loading', data: null }

  // Preview nói thật bài này là gì; nếu kind cho thấy nó không tải được thì tắt nút NGAY trên
  // card, thay để người dùng bấm rồi mới nhận 400. FAIL-OPEN có chủ đích: kind/thông tin mục thiếu
  // (BE chưa deploy, cache preview cũ) => coi như chưa biết gì, để backend quyết.
  const mediaKind = platform === 'threads' ? preview.data?.media_kind : undefined
  // Danh mục mục của bài Threads: null = BE chưa liệt kê được (khác với mảng có 1 mục). Số MỤC quyết
  // định format nào còn nghĩa (ZIP cần >=2, MP4 cần đúng một mục video); `media_count` vẫn giữ vai trò
  // riêng của nó — nói cho biết bài còn video nào hay không.
  const threadItems = platform === 'threads' ? (preview.data?.media_items ?? null) : null
  // Mục phát được = nền tảng liệt kê là video VÀ BE cấp cho khả năng phát (PREVIEW_ENABLED trên BE).
  // Không có token thì không vẽ chỗ bấm play: FE không tự bịa đường CDN, không hứa một file sẽ chết
  // sau vài ngày vì chữ ký `oe`.
  const playableItems: PlayableItem[] = threadItems
    ? threadItems.flatMap((item) =>
        item.kind === 'video' && item.preview_token ? [{ index: item.index, token: item.preview_token }] : [],
      )
    : []
  const playingItem =
    playing && playing.key === trimmedUrl
      ? (playableItems.find((item) => item.index === playing.index) ?? null)
      : null
  const readyData = preview.status === 'ready' ? preview.data : null
  // Nhúng chỉ có khi BE trả `embed_url` (X/Facebook). FE không tự ghép URL từ link người dùng dán:
  // nền tảng do server quyết, và pattern permalink đã kiểm là thứ nằm phía sau field này.
  const embedUrl = readyData?.embed_url ?? null
  // Host thật của khung, hiện ở dải nhãn để người dùng biết mình đang xem trang của ai.
  const embedHost = embedUrl ? embedUrl.slice(embedUrl.indexOf('//') + 2).split('/')[0] : ''
  // Chưa đọc được ảnh bìa (link không có thumbnail) thì dùng 9:16 — tỉ lệ đo được của cả reel FB lẫn
  // video X ở đây; thà dự đoán đúng đa số còn hơn để khung vuông cắt đôi video dọc.
  const embedAspect = embedRatio && embedRatio.url === trimmedUrl ? String(embedRatio.value) : '0.5625'
  const mediaCount = platform === 'threads' ? preview.data?.media_count : undefined
  const multiItems = threadItems != null && threadItems.length > 1
  const unsupportedMessage = (() => {
    if (!mediaKind) return null
    if (mediaKind === 'video') {
      // Số video nền tảng TỰ công bố: 0 = bài thật sự không còn video nào (đã sửa/xóa) => còn null =
      // CHƯA biết, không được chặn. Nhiều video thì tải được (chọn một, hoặc ZIP) nên count>1 không còn
      // là lời từ chối.
      return mediaCount === 0 ? t('urlInput.threadsUnsupported.videoGone') : null
    }
    if (mediaKind === 'photo') return null
    if (mediaKind === 'carousel') {
      // Bài carousel mà không liệt kê được mục nào thì không có gì để chọn — nói "không liệt kê được"
      // chứ không nói "bài không có ảnh" (một trong hai nguyên nhân có thể là hỏng mạng).
      return multiItems ? null : t('urlInput.threadsUnsupported.itemsUnreadable')
    }
    return t(THREADS_UNSUPPORTED_KEYS[mediaKind] ?? THREADS_UNSUPPORTED_FALLBACK)
  })()

  // Link sai host thì FE loại từ trước khi gọi BE, nên tooltip không được nói "đang kiểm tra
  // liên kết" nữa — không có gì đang được kiểm tra. Cùng hai dòng copy mà validateUrl hiện khi
  // bấm Enter, chỉ là sớm hơn một nhịp.
  const hostNote = !urlValid && trimmedUrl
    ? (hostnameOf(trimmedUrl) && platform ? t(PLATFORM_ERROR_KEYS[platform]) : t('urlInput.invalid'))
    : null

  // Bài ảnh = khi BE đọc được ảnh thật, không phải khi URL có /photo/: Share của app ra
  // link vt./vm. (BE mở redirect rồi vẫn đủ ảnh) còn link /share/photo/ thì BE lại không có ảnh
  // — suy từ URL vừa giấu picker với link mobile, vừa hứa chip ZIP ở nơi job sẽ chết 502.
  const slideUrls = preview.data?.slides ?? []
  const isPhotoPost = slideUrls.length > 0
  // Bài ảnh có thêm ZIP/GIF mà link video không có.
  const slideFormats = isPhotoPost
    ? [...formats, ...PHOTO_ONLY_FORMATS.filter((format) => !formats.includes(format))]
    : formats
  // Threads: kind nền tảng công bố quyết định format nào thật sự tồn tại cho bài này. Lọc rather
  // than thêm vào — không hiện JPG cho bài video (job sẽ 400) và không hiện MP4 cho bài ảnh.
  // ZIP chỉ hiện khi bài thực sự có >=2 mục để gói: một mục thì đầu ra là JPG/MP4 của chính nó.
  const kindFormats = (() => {
    if (platform !== 'threads' || !mediaKind) return undefined
    const listed = THREADS_KIND_FORMATS[mediaKind]
    return listed && listed.filter((format) => format !== 'zip' || multiItems)
  })()
  const visibleFormats = kindFormats
    ? slideFormats.filter((format) => kindFormats.includes(format))
    : slideFormats
  // Derive thay vì setState trong effect: người dùng sửa link ảnh thành link video thì
  // selectedFormat vẫn mang 'zip', radios không còn cái nào được chọn và handleSubmit sẽ gửi zip
  // cho video thường (BE trả 400). Phải lấy định dạng ĐẦU TIÊN còn hiển thị được, không phải
  // defaultFormat của trang: bài video Threads không còn 'jpg' trong danh sách nên defaultFormat
  // sẽ là một giá trị không tồn tại trên UI — và vẫn được gửi đi.
  const activeFormat = visibleFormats.includes(selectedFormat)
    ? selectedFormat
    : (visibleFormats[0] ?? defaultFormat)

  // 1 ảnh thì chẳng có gì để chọn; ZIP/MP4 của bài ảnh mới dựng output từ từng ảnh.
  const showSlidePicker = SLIDE_FORMATS.has(activeFormat.toLowerCase()) && slideUrls.length > 1
  // Nguồn của lưới chọn: Threads = danh mục nền tảng liệt kê (ảnh + video xen kẽ, đúng thứ tự bài),
  // TikTok = ảnh slideshow. Chung một nguồn vì field wire của cả hai là `slides` (1-based) — không
  // thêm state, không thêm field.
  const pickerItems: PickerItem[] = threadItems
    ? threadItems.map((item) => ({ index: item.index, kind: item.kind, thumb: item.thumb }))
    : slideUrls.map((src, index) => ({ index: index + 1, kind: 'photo' as const, thumb: src }))
  // Threads: bài nhiều mục thì LUÔN cần chọn (ZIP chọn bộ, MP4 chọn một video). TikTok: chỉ khi đầu
  // ra thực sự dựng từ từng ảnh.
  const showItemPicker = threadItems != null ? multiItems : showSlidePicker
  const selectedSlides = pickedSlides ?? pickerItems.map((item) => item.index)
  const allSlidesSelected = selectedSlides.length === pickerItems.length
  // Nhãn lưới: Threads gói cả ảnh lẫn video nên nói "ảnh" là sai với nửa danh sách.
  const pickerLabel = threadItems != null ? t('urlInput.threadsItemPicker') : t('urlInput.slides')
  const pickedKind = (index: number): string | undefined =>
    pickerItems.find((item) => item.index === index)?.kind

  const toggleSlide = (slide: number) => {
    const next = selectedSlides.includes(slide)
      ? selectedSlides.filter((value) => value !== slide)
      : [...selectedSlides, slide].sort((a, b) => a - b)
    // Bỏ chọn ảnh cuối cùng = job không có gì để tải, BE sẽ 400 — chặn ngay ở đây.
    if (next.length === 0) return
    setPickedSlides(next)
  }

  // Chọn bao nhiêu mục quyết định format còn nghĩa hay không: một file MP4/MP3 chỉ dựng từ ĐÚNG MỘT
  // video, nên chọn 2 ô (hoặc chọn một ô ẢNH) thì nút phải tắt kèm lý do — BE sẽ 400 y như vậy, chỉ
  // là muộn hơn một job.
  const selectionHint =
    threadItems == null || unsupportedMessage || !['mp4', 'mp3'].includes(activeFormat.toLowerCase())
      ? null
      : selectedSlides.length === 1 && pickedKind(selectedSlides[0]) === 'video'
        ? null
        : t('urlInput.threadsPickOneVideo')

  // Nút "Bắt đầu tải" chỉ bật khi BE đọc được link VÀ phần chọn đang hợp lệ với format đang chọn:
  // API vừa chặn playlist và video vượt trần gói TRƯỚC khi ghi job, nên một link chưa kiểm tra (hoặc
  // fail) mà vẫn gửi thì chỉ nhận thêm một lỗi.
  const canStart = urlValid && fetched?.status === 'ready' && !unsupportedMessage && !selectionHint

  // Dán link xong debounce 700ms rồi mới fetch preview — tránh gọi oEmbed mỗi lần gõ.
  // /media/url-info là endpoint public nên khách chưa đăng nhập vẫn thấy preview;
  // BE đã có negative cache, FE vẫn hủy request của URL cũ để không dồn lượt gọi.
  useEffect(() => {
    if (!isValidForPlatform(url, platform)) return
    const controller = new AbortController()
    const key = url.trim()
    const timer = setTimeout(async () => {
      try {
        const data = await mediaApi.getUrlInfo(key, controller.signal)
        setPreviewFetched({ key, status: 'ready', data })
      } catch (err) {
        // Chính ta abort vì URL đã đổi: đây không phải lỗi, đừng báo "không xem trước được".
        if (controller.signal.aborted) return
        const meta = err instanceof ApiClientError ? readErrorMeta(err) : {}
        const postCode = typeof meta.params?.post_code === 'string' ? meta.params.post_code : null
        setPreviewFetched({
          key,
          status: 'error',
          data: null,
          message: describeError(err, undefined, {
            keySuffix: platform === 'threads' ? 'Threads' : undefined,
          }).message,
          // Giữ MÃ chứ không chỉ giữ câu: hai trạng thái "đã bị xóa / bị giới hạn" nhìn y hệt lỗi
          // đọc-trang-thường nếu chỉ còn lại chuỗi đã localize.
          code: meta.code,
          postCode,
        })
      }
    }, 700)
    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [url, platform, previewAttempt])

  // chất lượng ẩn khi: format chưa tier nào (zip/gif/jpg), hoặc backend không dùng tier video
  // cho nền tảng này. Tool không khai nền tảng (platform undefined) giữ nguyên như cũ.
  const isAudioFormat = AUDIO_FORMATS.has(activeFormat.toLowerCase())
  const offersVideoTiers = !platform || VIDEO_QUALITY_PLATFORMS.includes(platform)
  const qualityOptions =
    NO_QUALITY_FORMATS.has(activeFormat.toLowerCase()) || (!isAudioFormat && !offersVideoTiers)
      ? []
      : qualityOptionsFor(activeFormat)

  const handleFormatChange = (format: string) => {
    setSelectedFormat(format)
    setSelectedQuality(defaultQualityFor(format))
  }

  const qualityLabel = (option: string) =>
    option === 'best' ? t('urlInput.qualityBest') : AUDIO_QUALITIES.includes(option) ? `${option} kbps` : option

  // Nút X trong ô nhập: quên link hiện tại luôn. Card preview biến mất theo vì derive từ `url`.
  const clearLink = () => {
    setUrl('')
    setValidationError(null)
    setPickedSlides(null)
    setPlaying(null)
    setPlayFailed(false)
    setDeadToken(null)
    setEmbedLoadedFor(null)
    setEmbedRatio(null)
    // Xóa luôn kết quả fetch: dán lại đúng link đó phải chờ kiểm tra lại từ đầu.
    setPreviewFetched(null)
  }

  // Nút Thử lại (card lỗi và card video hỏng) đi chung một cửa: token preview chỉ lấy lại được bằng
  // một lượt url-info mới. Giữ nguyên `playing` (chỉ bỏ kết quả fetch) để data mới về là player mount
  // lại bằng token mới — một cú bấm, không autoplay, và không tự lặp vì `deadToken` vẫn chặn chuỗi cũ.
  const refetchPreview = () => {
    // Về null để khung skeleton hiện lại thay vì giữ nguyên dòng lỗi.
    setPreviewFetched(null)
    setPlayFailed(false)
    setPreviewAttempt((attempt) => attempt + 1)
  }

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText()
      if (text) {
        setUrl(text)
        setPickedSlides(null)
        validateUrl(text)
      }
    } catch {
      // In-app browser (Facebook/Threads) từ chối đọc bộ nhớ tạm, iOS WKWebView thì không có
      // API này — nếu im lặng người dùng tưởng nút hỏng.
      showToast({ type: 'info', message: t('urlInput.pasteBlocked') })
    }
  }

  const validateUrl = (value: string): boolean => {
    const trimmed = value.trim()
    if (!trimmed) {
      setValidationError(t('urlInput.empty'))
      return false
    }

    const host = hostnameOf(trimmed)
    if (!host) {
      setValidationError(t('urlInput.invalid'))
      return false
    }

    if (platform && !matchesPlatform(host, platform)) {
      setValidationError(t(PLATFORM_ERROR_KEYS[platform]))
      return false
    }

    setValidationError(null)
    return true
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!validateUrl(url)) return
    if (!canStart) {
      // Enter bỏ qua được nút disabled — nói rõ link đang chờ kiểm tra, đã bị từ chối, đang là bài
      // chưa tải được, hay là phần chọn mục chưa khớp với format đang chọn.
      setValidationError(unsupportedMessage ?? selectionHint ?? fetched?.message ?? t('urlInput.waitingPreview'))
      return
    }
    // Chọn cả bộ thì không gửi `slides`: thiếu key đã là "tất cả" với job cũ và với BE.
    const slides = showItemPicker && !allSlidesSelected ? selectedSlides : undefined
    onSubmit(url.trim(), activeFormat, selectedQuality, slides)
  }

  const placeholderText = platform
    ? t(PLATFORM_PLACEHOLDERS[platform])
    : t('urlInput.placeholderGeneric')

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-3xl mx-auto space-y-4">
      <div className="relative flex flex-col sm:flex-row items-stretch sm:items-center bg-surface/90 border-2 border-[rgba(255,59,48,0.30)] hover:border-[rgba(255,59,48,0.65)] focus-within:border-brand p-1.5 sm:p-2 transition-all clip-corner-lg input-3d card-hover-glow">
        <div className="flex items-center flex-1 px-3 py-2 sm:py-1">
          <Link2 className="w-5 h-5 text-slate-400 shrink-0 mr-2.5" />
          <input
            type="url"
            value={url}
            onChange={(e) => {
              const value = e.target.value
              setUrl(value)
              // Ảnh đã chọn thuộc về bài cũ: dán bài khác phải quay lại "cả bộ".
              setPickedSlides(null)
              // Dán link (nhảy >=4 ký tự cùng lúc) -> báo lỗi sai platform ngay, không đợi bấm nút.
              if (value.length - url.length >= 4) {
                validateUrl(value)
              } else if (validationError) {
                setValidationError(null)
              }
            }}
            placeholder={placeholderText}
            disabled={disabled || isLoading}
            className="w-full bg-transparent text-sm sm:text-base text-slate-100 placeholder-slate-400 focus:outline-none"
            aria-label={t('urlInput.aria')}
          />
          {url ? (
            <button
              type="button"
              onClick={clearLink}
              className="p-1 text-slate-400 hover:text-slate-200 clip-corner-btn"
              title={t('common.clear')}
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handlePaste}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-300 hover:text-brand bg-elev hover:bg-brand/10 border border-edge transition-colors cursor-pointer clip-corner-btn"
              title={t('urlInput.pasteFromClipboard')}
            >
              <Clipboard className="w-3.5 h-3.5" />
              <span>{t('urlInput.paste')}</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 pt-2 sm:pt-0 sm:pl-2 border-t sm:border-t-0 sm:border-l border-edge/60">
          {/* Cùng quy tắc với nút gửi của FileUploader: không spinner, JobProgress đã lo tiến
              trình, nút chỉ cần disabled. */}
          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={disabled || !canStart}
            title={
              canStart
                ? undefined
                : (hostNote ??
                  unsupportedMessage ??
                  selectionHint ??
                  fetched?.message ??
                  t('urlInput.waitingPreview'))
            }
            rightIcon={<ArrowRight className="w-4 h-4" />}
            className="w-full sm:w-auto px-6 py-2.5 btn-shimmer shadow-[0_0_18px_rgba(255,59,48,0.25)]"
          >
            {t('urlInput.startDownload')}
          </Button>
        </div>
      </div>

      {/* Link preview (review) */}
      {preview.status === 'loading' && (
        <div className="flex items-center gap-3 p-2 bg-surface border border-edge clip-corner-card animate-pulse" aria-hidden="true">
          <div className="w-16 h-16 bg-elev border border-edge shrink-0 clip-corner-btn" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-2/3 bg-elev rounded" />
            <div className="h-2.5 w-1/3 bg-elev rounded" />
          </div>
        </div>
      )}
      {preview.status === 'ready' && preview.data && (
        <div className="in-fade flex items-center gap-3 p-2 bg-surface border border-[rgba(255,59,48,0.30)] clip-corner-card">
          {preview.data.thumbnail ? (
            <img
              src={preview.data.thumbnail}
              alt=""
              referrerPolicy="no-referrer"
              onLoad={(e) => {
                const { naturalWidth: w, naturalHeight: h } = e.currentTarget
                if (w > 0 && h > 0) setEmbedRatio({ url: trimmedUrl, value: w / h })
              }}
              className="w-16 h-16 object-cover border border-edge shrink-0 clip-corner-btn"
            />
          ) : (
            <div className="w-16 h-16 bg-brand/10 border border-brand/30 flex items-center justify-center shrink-0 clip-corner-btn">
              <Link2 className="w-5 h-5 text-brand" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-slate-100 text-sm truncate">{preview.data.title || url}</p>
            <p className="text-xs text-slate-400 font-mono truncate">
              {previewMetaLine(preview.data)}
            </p>
            {/* Vẫn hiện đủ ảnh bìa + title + tác giả (số liệu thật), chỉ nói thêm vì sao nút tắt. */}
            {unsupportedMessage && (
              <p className="mt-1 text-xs text-amber-300">{unsupportedMessage}</p>
            )}
          </div>
        </div>
      )}
      {preview.status === 'error' && (
        <div className="in-fade flex items-center gap-3 p-2 bg-surface border border-edge clip-corner-card">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-slate-400">
              {fetched?.message ?? t('urlInput.previewFailed')}
            </p>
            {/* Mã bài viết do BE trích từ chuỗi redirect. Hiện ra để người dùng đối chiếu được
                "bài nào bị", thay vì chỉ nghe một câu từ chối — nhưng ĐÚNG MỘT mã, không phải
                handle, không phải URL nền tảng trả kèm token chia sẻ. */}
            {fetched?.postCode && (
              <p className="mt-1 text-xs text-slate-500 font-mono break-all">
                {t('urlInput.postCode', { n: fetched.postCode })}
              </p>
            )}
          </div>
          {/* Phán quyết của nền tảng thì Retry chỉ tốn thêm một lượt — ẩn nút, không hứa hão với
              một bài đã xóa. Lỗi đọc-trang (mạng/bận) vẫn còn nút. */}
          {!TERMINAL_PREVIEW_CODES.has(fetched?.code ?? '') && (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={refetchPreview}
              leftIcon={<RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />}
            >
              {t('urlInput.retry')}
            </Button>
          )}
        </div>
      )}

      {/* Player Threads. Chỉ những mục BE cấp preview_token mới có chỗ bấm play; MP4 nguồn đi qua
          endpoint /media/preview bằng token, FE không bao giờ nhận URL CDN có chữ ký. */}
      {readyData && playableItems.length > 0 && (
        <div className="in-fade flex flex-wrap items-center gap-1.5">
          {playableItems.map((item) => {
            const active = playingItem?.index === item.index
            return (
              <button
                key={item.index}
                type="button"
                aria-pressed={active}
                onClick={() => {
                  setPlayFailed(false)
                  setPlaying(active ? null : { key: trimmedUrl, index: item.index })
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium border transition-colors cursor-pointer clip-corner-btn ${
                  active
                    ? 'border-brand text-brand bg-brand/10'
                    : 'border-edge text-slate-300 hover:text-brand hover:bg-elev bg-elev'
                }`}
              >
                <Play className="w-3.5 h-3.5" aria-hidden="true" />
                {t('urlInput.playVideo', { n: item.index })}
              </button>
            )
          })}
        </div>
      )}
      {playingItem && (
        <div className="in-fade space-y-1.5">
          {/* KHÔNG dựng lại thẻ bằng đúng token vừa chết. Nếu một lượt fetch nào đó còn trả về chuỗi cũ
              thì người dùng ở lại lời lỗi thật, thay vì nhận một player hỏng lần hai. */}
          {playingItem.token !== deadToken && (
            <video
              controls
              // preload="none": mở trang không tự kéo vài chục MB; chỉ tải khi người dùng bấm play.
              // referrerPolicy không tồn tại trên <video> (DOM chỉ hỗ trợ ảnh/khung Script/Link) —
              // yêu cầu này đi sang server của chính mình nên Referer ở đây chẳng liên quan gì tới
              // CDN; header gửi lên nguồn là do backend quyết.
              preload="none"
              playsInline
              poster={readyData?.thumbnail ?? undefined}
              src={mediaApi.getPreviewUrl(playingItem.token)}
              onError={() => {
                setDeadToken(playingItem.token)
                setPlayFailed(true)
              }}
              className="w-full aspect-video max-h-[60vh] bg-black rounded-lg border border-edge"
            />
          )}
          {/* <video> chỉ báo "có lỗi", không báo 410/502: nói thật một câu rồi xin lại token,
              không đoán nguyên nhân. Điều kiện thứ hai là trường hợp người dùng bấm lại chính mục vừa
              chết — thẻ bị chặn dựng, nên lời lỗi phải hiện mà không cần chờ `playFailed`. */}
          {(playFailed || playingItem.token === deadToken) && (
            <div className="flex items-center gap-3">
              <p className="flex-1 min-w-0 text-xs text-slate-400">{t('urlInput.previewPlayFailed')}</p>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={refetchPreview}
                leftIcon={<RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />}
              >
                {t('urlInput.retry')}
              </Button>
            </div>
          )}
          <button
            type="button"
            onClick={() => {
              setPlaying(null)
              setPlayFailed(false)
              setDeadToken(null)
            }}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" aria-hidden="true" />
            {t('urlInput.hideVideo')}
          </button>
        </div>
      )}

      {/* Bản nhúng chính chủ cho X/Facebook — hai nền tảng mà relay byte bó tay (X không cho khách một
          tệp muxed nào). Byte video đi từ CDN của nền tảng, không qua OneForAll, nên đây là một cái
          khung nhìn chứ không phải một bản tải: khung dựng NGAY khi card sẵn sàng, không autoplay, và
          "Thử lại" không làm nó reload (embed_url là metadata, không phải token).
          Khung RỘNG 320px (trần 338 = 320 + 16 padding + 2 viền) và CAO theo tỷ lệ video thật, nên
          video nằm gọn trong khung: plugin FB co giãn nội dung theo BỀ RỘNG (đo: 557px rộng ⇒ 990px
          cao = đúng 16/9 ⇒ khung 560×760 cắt mất 230px cuối video), còn 320×568 thì vừa khít. */}
      {embedUrl && (
        <div className="in-fade mx-auto w-full max-w-[338px] space-y-1.5">
          <div className="clip-corner-card border border-[rgba(255,59,48,0.30)] bg-surface p-2">
            <div className="flex items-center gap-1.5 px-1 pb-2 text-xs">
              <MonitorPlay className="w-3.5 h-3.5 text-brand shrink-0" aria-hidden="true" />
              <span className="font-medium text-slate-300 truncate">{t('urlInput.embedTitle')}</span>
              <span className="ml-auto shrink-0 font-mono text-[11px] text-slate-500">
                {embedLoadedFor === trimmedUrl ? embedHost : t('urlInput.embedLoading')}
              </span>
            </div>
            <iframe
              title={t('urlInput.embedTitle')}
              src={embedUrl}
              // sandbox cần cả `allow-scripts` lẫn `allow-same-origin`: player của X/FB chạy script
              // và tự đặt cookie trên origin của chính nó, thiếu một trong hai là khung trắng.
              // Bỏ là mất luôn lớp tách khung này khỏi DOM của trang ta. Không cấp forms/top-navigation.
              sandbox="allow-scripts allow-same-origin allow-popups allow-presentation"
              allow="fullscreen; encrypted-media; picture-in-picture"
              loading="lazy"
              onLoad={() => setEmbedLoadedFor(trimmedUrl)}
              // Rộng do bao ngoài quyết, cao = rộng × (1/tỷ lệ video) — đúng tỷ lệ nên không cắt
              // video và không thừa dải đen. 0.5625 = 9:16 khi chưa đọc được ảnh bìa.
              style={{ aspectRatio: embedAspect }}
              className="block w-full rounded-lg bg-black"
            />
          </div>
          <p className="px-1 text-xs leading-relaxed text-slate-400">{t('urlInput.embedNote')}</p>
        </div>
      )}

      {/* Format + Quality Segmented Controls — hiện sau khi link hợp lệ */}
      {urlValid && (visibleFormats.length > 1 || qualityOptions.length > 1) && (
        <div className="in-fade flex items-center justify-center sm:justify-start gap-4 flex-wrap text-xs">
          {visibleFormats.length > 1 && (
            <>
              <span className="text-slate-400 font-medium whitespace-nowrap">{t('urlInput.outputFormat')}</span>
              <SegmentedControl
                options={visibleFormats}
                value={activeFormat}
                onChange={handleFormatChange}
                ariaLabel={t('urlInput.outputFormat')}
              />
            </>
          )}
          {qualityOptions.length > 1 && (
            <>
              <span className="text-slate-400 font-medium whitespace-nowrap">{t('urlInput.quality')}</span>
              <SegmentedControl
                options={qualityOptions}
                value={selectedQuality}
                onChange={setSelectedQuality}
                ariaLabel={t('urlInput.quality')}
                labelFor={qualityLabel}
              />
            </>
          )}
        </div>
      )}

      {/* Lưới chọn mục: Threads chọn từng ảnh/từng video của một bài (ZIP gói đúng những ô đã chọn,
          MP4/MP3 lấy đúng một video), TikTok chọn từng slide của bài ảnh. */}
      {showItemPicker && (
        <div className="in-fade">
          <div className="flex items-center justify-between gap-2 mb-1.5 text-xs">
            <span className="text-slate-400 font-medium whitespace-nowrap">{pickerLabel}</span>
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-mono">
                {selectedSlides.length}/{pickerItems.length}
              </span>
              {!allSlidesSelected && (
                <button
                  type="button"
                  onClick={() => setPickedSlides(null)}
                  className="px-2 py-0.5 font-medium text-slate-300 hover:text-brand bg-elev hover:bg-brand/10 border border-edge transition-colors cursor-pointer clip-corner-btn"
                >
                  {t('urlInput.slidesAll')}
                </button>
              )}
            </div>
          </div>
          <div
            role="group"
            aria-label={pickerLabel}
            className="grid grid-cols-4 sm:grid-cols-6 gap-1.5"
          >
            {pickerItems.map((item) => {
              const picked = selectedSlides.includes(item.index)
              return (
                <button
                  key={`${item.kind}-${item.index}`}
                  type="button"
                  aria-pressed={picked}
                  aria-label={`${pickerLabel} ${item.index}`}
                  onClick={() => toggleSlide(item.index)}
                  className={`relative aspect-[3/4] overflow-hidden border transition-all cursor-pointer clip-corner-btn ${
                    picked
                      ? 'border-brand ring-2 ring-brand/40'
                      : 'border-edge opacity-40 hover:opacity-80'
                  }`}
                >
                  {item.thumb ? (
                    <img
                      src={item.thumb}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover pointer-events-none"
                    />
                  ) : (
                    // Nền tảng không công bố ảnh bìa cho mục video nào (đo 02/11) — ô số là bằng chứng
                    // duy nhất, lấy thumbnail của bài gắn cho cả 3 ô là nói dối.
                    <span className="flex w-full h-full flex-col items-center justify-center gap-1 bg-elev text-slate-300">
                      <Video className="w-5 h-5" aria-hidden="true" />
                      <span className="text-[10px] font-mono">
                        {t('urlInput.threadsVideoTile', { n: item.index })}
                      </span>
                    </span>
                  )}
                  <span className="absolute bottom-0.5 left-1 text-[10px] font-mono text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                    {item.index}
                  </span>
                </button>
              )
            })}
          </div>
          {selectionHint && <p className="mt-1.5 text-xs text-amber-300">{selectionHint}</p>}
        </div>
      )}

      {/* Validation Error Message */}
      {validationError && (
        <div className="flex items-center gap-2 p-3 bg-brand/10 border border-brand/30 text-red-400 text-xs sm:text-sm clip-corner-btn">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{validationError}</span>
        </div>
      )}
    </form>
  )
}
