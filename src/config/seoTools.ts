export interface ToolFaq {
  q: string
  a: string
}

export interface ToolStep {
  step: string
  title: string
  desc: string
}

export interface ToolFeature {
  title: string
  desc: string
}

export interface ToolConfig {
  slug: string
    category: 'youtube' | 'tiktok' | 'convert' | 'image' | 'media' | 'document' | 'data' | 'archive'
  badge: string
  title: string
  metaDescription: string
  h1: string
  subtitle: string
  inputType: 'url' | 'file'
  urlPlatform?: 'youtube' | 'tiktok'
  acceptedFileTypes?: string
  outputFormats: string[]
  defaultFormat: string
  backendType: 'media_url' | 'convert_file' | 'image_process'
  backendOperation?: string
  howItWorksSteps: ToolStep[]
  features: ToolFeature[]
  supportedFormatsDesc: string
  faqList: ToolFaq[]
  relatedSlugs: string[]
}

export const SEO_TOOLS: Record<string, ToolConfig> = {
  '/youtube-to-mp4': {
    slug: '/youtube-to-mp4',
    category: 'youtube',
    badge: 'YouTube sang MP4',
    title: 'Tải Video YouTube sang MP4 Trực Tuyến | OneForAll',
    metaDescription:
      'Tải video YouTube sang MP4 trực tuyến trên trình duyệt. Không cần cài đặt phần mềm; chất lượng khả dụng tùy thuộc vào video nguồn và gói sử dụng.',
    h1: 'Tải Video YouTube sang MP4 Nhanh Chóng',
    subtitle:
      'Lưu video YouTube dưới dạng MP4 về máy tính hoặc điện thoại. Chất lượng đầu ra phụ thuộc vào video gốc và các tùy chọn khả dụng.',
    inputType: 'url',
    urlPlatform: 'youtube',
    outputFormats: ['mp4', 'webm'],
    defaultFormat: 'mp4',
    backendType: 'media_url',
    backendOperation: 'url_download',
    howItWorksSteps: [
      { step: '01', title: 'Dán liên kết YouTube', desc: 'Sao chép đường dẫn video YouTube bạn muốn lưu và dán vào ô nhập liệu bên dưới.' },
      { step: '02', title: 'Chọn chất lượng MP4', desc: 'Hệ thống tự động phân tích và cho phép bạn lựa chọn định dạng MP4 độ nét cao.' },
      { step: '03', title: 'Chuẩn bị video', desc: 'OneForAll xử lý liên kết và chuẩn bị tệp theo định dạng bạn đã chọn.' },
      { step: '04', title: 'Tải về thiết bị', desc: 'Tải tệp MP4 về thiết bị để xem ngoại tuyến khi cần.' },
    ],
    features: [
      { title: 'Tối ưu độ phân giải', desc: 'Chất lượng video khả dụng tùy thuộc vào nguồn và các tùy chọn được cung cấp.' },
      { title: 'Không cần cài đặt', desc: 'Chạy trực tiếp trên trình duyệt Chrome, Safari, Edge mà không cần phần mềm phụ trợ.' },
      { title: 'Quyền riêng tư', desc: 'Tệp được dọn dẹp theo chính sách lưu trữ của nền tảng.' },
    ],
    supportedFormatsDesc: 'Hỗ trợ các dạng liên kết YouTube phổ biến như video thông thường, Shorts và liên kết rút gọn; một số nội dung có thể không khả dụng.',
    faqList: [
      { q: 'Tôi có thể tải video YouTube ở chất lượng 1080p không?', a: 'Chất lượng 1080p có thể khả dụng nếu video gốc hỗ trợ và tùy chọn này được cung cấp. Chất lượng tải về thực tế có thể khác nhau tùy từng video.' },
      { q: 'Tôi có cần tạo tài khoản để tải YouTube MP4 không?', a: 'Tùy công cụ và hạn mức gói sử dụng, bạn có thể dùng dịch vụ mà không cần đăng nhập. Một số tính năng hoặc hạn mức có thể yêu cầu tài khoản.' },
      { q: 'Chính sách bản quyền khi sử dụng công cụ như thế nào?', a: 'Vui lòng chỉ tải xuống nội dung bạn sở hữu, được chủ sở hữu cho phép hoặc được phép sử dụng theo quy định áp dụng. Bạn chịu trách nhiệm đảm bảo quyền sử dụng nội dung.' },
    ],
    relatedSlugs: ['/youtube-to-mp3', '/youtube-downloader', '/tiktok-to-mp4', '/video-converter'],
  },

  '/youtube-to-mp3': {
    slug: '/youtube-to-mp3',
    category: 'youtube',
    badge: 'YouTube sang MP3',
    title: 'Chuyển YouTube Sang MP3 Trực Tuyến | OneForAll',
    metaDescription:
      'Chuyển âm thanh từ video YouTube sang MP3 trực tuyến. Chất lượng đầu ra phụ thuộc vào âm thanh nguồn và định dạng bạn chọn.',
    h1: 'Tách Nhạc YouTube sang MP3 Chất Lượng Cao',
    subtitle:
      'Chuyển âm thanh từ video YouTube sang MP3 để nghe ngoại tuyến khi cần.',
    inputType: 'url',
    urlPlatform: 'youtube',
    outputFormats: ['mp3', 'wav', 'm4a'],
    defaultFormat: 'mp3',
    backendType: 'media_url',
    backendOperation: 'extract-audio',
    howItWorksSteps: [
      { step: '01', title: 'Sao chép link YouTube', desc: 'Sao chép liên kết video có âm thanh bạn muốn chuyển đổi.' },
      { step: '02', title: 'Dán vào OneForAll', desc: 'Dán link vào ô tìm kiếm và bấm nút Tách nhạc MP3.' },
      { step: '03', title: 'Trích xuất âm thanh', desc: 'OneForAll chuẩn bị âm thanh theo định dạng đầu ra bạn đã chọn.' },
      { step: '04', title: 'Tải tệp âm thanh', desc: 'Lưu tệp MP3 về điện thoại hoặc máy tính để thưởng thức ngay.' },
    ],
    features: [
      { title: 'Chất lượng âm thanh trung thực', desc: 'Chất lượng âm thanh đầu ra phụ thuộc vào nguồn và tùy chọn chuyển đổi khả dụng.' },
      { title: 'Xử lý thuận tiện', desc: 'Thời gian xử lý phụ thuộc vào độ dài video, chất lượng nguồn và tình trạng hệ thống.' },
      { title: 'Tương thích mọi thiết bị', desc: 'Tệp MP3 có thể phát trên hầu hết điện thoại, máy tính và thiết bị hỗ trợ định dạng này.' },
    ],
    supportedFormatsDesc: 'Định dạng đầu ra khả dụng gồm MP3, WAV và M4A. Khả năng xử lý tùy thuộc vào liên kết video.',
    faqList: [
      { q: 'Âm thanh MP3 có bị nén giảm chất lượng không?', a: 'Chất lượng MP3 phụ thuộc vào âm thanh nguồn và thiết lập đầu ra. Chuyển sang MP3 có thể làm thay đổi chất lượng do đặc tính nén của định dạng.' },
      { q: 'Có thể tách nhạc từ video YouTube Shorts không?', a: 'Có. Bạn chỉ cần sao chép link Shorts và dán vào công cụ như bình thường.' },
    ],
    relatedSlugs: ['/youtube-to-mp4', '/youtube-downloader', '/audio-converter', '/tiktok-to-mp3'],
  },

  '/youtube-downloader': {
    slug: '/youtube-downloader',
    category: 'youtube',
    badge: 'Công cụ tải YouTube',
    title: 'Trình Tải Video & Âm Thanh YouTube Toàn Diện | OneForAll',
    metaDescription:
      'Tải video YouTube ở định dạng video hoặc chuyển âm thanh sang định dạng phổ biến. Không cần cài đặt phần mềm.',
    h1: 'Trình Tải YouTube Đa Năng Trực Tuyến',
    subtitle:
      'Chọn định dạng video hoặc âm thanh phù hợp với nhu cầu và các tùy chọn được công cụ hỗ trợ.',
    inputType: 'url',
    urlPlatform: 'youtube',
    outputFormats: ['mp4', 'mp3', 'webm', 'wav'],
    defaultFormat: 'mp4',
    backendType: 'media_url',
    backendOperation: 'url_download',
    howItWorksSteps: [
      { step: '01', title: 'Nhập link video', desc: 'Dán liên kết YouTube bạn muốn xử lý vào ô nhập.' },
      { step: '02', title: 'Chọn định dạng', desc: 'Chọn MP4 nếu muốn xem video, hoặc MP3 nếu chỉ cần nghe nhạc.' },
      { step: '03', title: 'Chuẩn bị tệp', desc: 'OneForAll xử lý liên kết và chuẩn bị tệp theo lựa chọn của bạn.' },
      { step: '04', title: 'Tải về an toàn', desc: 'Nhấn Tải xuống để lưu tệp kết quả về thiết bị.' },
    ],
    features: [
      { title: 'Đa định dạng linh hoạt', desc: 'Tùy chọn tải video hoặc chỉ lấy âm thanh chỉ với một cú nhấp chuột.' },
      { title: 'Hạn mức rõ ràng', desc: 'Số lượt sử dụng phụ thuộc vào gói dịch vụ bạn đang dùng.' },
      { title: 'Bảo vệ thiết bị', desc: 'Không cần cài tiện ích mở rộng để sử dụng công cụ trên trình duyệt.' },
    ],
    supportedFormatsDesc: 'Hỗ trợ MP4 (720p, 1080p), WebM, MP3 (128kbps, 320kbps), WAV.',
    faqList: [
      { q: 'Video tải về được lưu ở đâu?', a: 'Tệp sẽ tự động được lưu vào thư mục Downloads mặc định trên thiết bị của bạn.' },
      { q: 'Tại sao một số video tải chậm hơn?', a: 'Video dài hoặc có chất lượng cao có thể mất nhiều thời gian xử lý hơn. Bạn hãy chờ tiến trình hoàn tất trước khi tải tệp.' },
    ],
    relatedSlugs: ['/youtube-to-mp4', '/youtube-to-mp3', '/tiktok-downloader', '/video-converter'],
  },

  '/tiktok-to-mp4': {
    slug: '/tiktok-to-mp4',
    category: 'tiktok',
    badge: 'TikTok sang MP4',
    title: 'Tải Video TikTok MP4 | OneForAll',
    metaDescription:
      'Tải video TikTok dưới dạng MP4 để lưu về điện thoại hoặc máy tính. Tùy chọn và chất lượng khả dụng phụ thuộc vào video nguồn.',
    h1: 'Tải Video TikTok Không Dính Logo (No Watermark)',
    subtitle:
      'Lưu video TikTok dưới dạng MP4 với các tùy chọn khả dụng, thuận tiện xem lại trên thiết bị của bạn.',
    inputType: 'url',
    urlPlatform: 'tiktok',
    outputFormats: ['mp4'],
    defaultFormat: 'mp4',
    backendType: 'media_url',
    backendOperation: 'url_download',
    howItWorksSteps: [
      { step: '01', title: 'Sao chép link TikTok', desc: 'Mở ứng dụng hoặc web TikTok, bấm nút Chia sẻ và chọn Sao chép liên kết.' },
      { step: '02', title: 'Dán vào OneForAll', desc: 'Dán URL TikTok vào ô bên dưới và bấm nút Tải video.' },
      { step: '03', title: 'Chuẩn bị video', desc: 'OneForAll xử lý liên kết và chuẩn bị tệp video để tải xuống.' },
      { step: '04', title: 'Lưu về máy', desc: 'Tải video độ nét cao về thư viện ảnh hoặc máy tính của bạn.' },
    ],
    features: [
      { title: 'Tùy chọn không watermark', desc: 'Có thể tải video không watermark khi liên kết và nguồn video hỗ trợ tính năng này.' },
      { title: 'Độ nét chuẩn Full HD', desc: 'Chất lượng và tỷ lệ khung hình phụ thuộc vào video nguồn và định dạng đầu ra.' },
      { title: 'Hoạt động tốt trên iOS & Android', desc: 'Dễ dàng tải về thư viện máy mà không cần phần mềm thứ ba.' },
    ],
    supportedFormatsDesc: 'Hỗ trợ link TikTok dạng vm.tiktok.com, vt.tiktok.com và tiktok.com/@user/video/...',
    faqList: [
      { q: 'Làm thế nào để tải video TikTok trên iPhone?', a: 'Bạn dán link vào OneForAll trên Safari, bấm Tải về, sau đó mở tệp trong phần Tải về và chọn Lưu video vào thư viện Ảnh.' },
      { q: 'Tải video TikTok không logo có bị thu phí không?', a: 'Việc sử dụng và số lượt tải phụ thuộc vào hạn mức của gói dịch vụ hiện tại.' },
    ],
    relatedSlugs: ['/tiktok-to-mp3', '/tiktok-downloader', '/youtube-to-mp4', '/video-converter'],
  },

  '/tiktok-to-mp3': {
    slug: '/tiktok-to-mp3',
    category: 'tiktok',
    badge: 'TikTok sang MP3',
    title: 'Chuyển Âm Thanh TikTok sang MP3 | OneForAll',
    metaDescription:
      'Chuyển âm thanh từ video TikTok sang MP3 trực tuyến. Chất lượng đầu ra phụ thuộc vào video nguồn và các tùy chọn được hỗ trợ.',
    h1: 'Tách Nhạc Nền TikTok sang MP3 Chất Lượng Cao',
    subtitle:
      'Chuyển âm thanh từ video TikTok sang MP3 để nghe hoặc sử dụng cho mục đích phù hợp với quyền của bạn.',
    inputType: 'url',
    urlPlatform: 'tiktok',
    outputFormats: ['mp3', 'wav', 'm4a'],
    defaultFormat: 'mp3',
    backendType: 'media_url',
    backendOperation: 'extract-audio',
    howItWorksSteps: [
      { step: '01', title: 'Lấy link video TikTok', desc: 'Sao chép liên kết video có đoạn âm thanh bạn yêu thích.' },
      { step: '02', title: 'Dán link vào hệ thống', desc: 'Dán đường dẫn và chọn định dạng đầu ra MP3.' },
      { step: '03', title: 'Chuyển đổi âm thanh', desc: 'Công cụ chuẩn bị âm thanh theo định dạng đầu ra bạn đã chọn.' },
      { step: '04', title: 'Tải về nghe thử', desc: 'Lưu tệp âm thanh về máy để làm nhạc chuông hoặc nghe offline.' },
    ],
    features: [
      { title: 'Bắt trọn âm thanh trending', desc: 'Lưu các bản phối remix, acoustic hoặc giọng đọc thịnh hành nhất TikTok.' },
      { title: 'Âm thanh trong trẻo', desc: 'Chất lượng âm thanh đầu ra phụ thuộc vào âm thanh gốc của video.' },
      { title: 'Dùng làm nhạc chuông', desc: 'Dễ dàng cài đặt làm nhạc chuông báo thức hoặc chuông cuộc gọi thoại.' },
    ],
    supportedFormatsDesc: 'Đầu ra hỗ trợ định dạng MP3, WAV, M4A.',
    faqList: [
      { q: 'Chất lượng tệp âm thanh tách ra có tốt không?', a: 'Chất lượng phụ thuộc vào âm thanh gốc của tác giả video TikTok, thường đạt mức 128kbps đến 192kbps chuẩn web.' },
      { q: 'Có tải được âm thanh từ video TikTok bị ẩn không?', a: 'Chỉ các video ở chế độ Công khai (Public) mới có thể trích xuất âm thanh.' },
    ],
    relatedSlugs: ['/tiktok-to-mp4', '/tiktok-downloader', '/youtube-to-mp3', '/audio-converter'],
  },

  '/tiktok-downloader': {
    slug: '/tiktok-downloader',
    category: 'tiktok',
    badge: 'Công cụ TikTok đa năng',
    title: 'Trình Tải TikTok Toàn Diện: Video MP4 & Âm Thanh MP3 | OneForAll',
    metaDescription:
      'Tải video TikTok hoặc chuyển âm thanh sang MP3 với giao diện đơn giản, dễ sử dụng.',
    h1: 'Trình Tải Video & Âm Thanh TikTok Trực Tuyến',
    subtitle:
      'Tải video hoặc chuyển âm thanh từ các liên kết TikTok được hỗ trợ ngay trên trình duyệt, không cần cài ứng dụng.',
    inputType: 'url',
    urlPlatform: 'tiktok',
    outputFormats: ['mp4', 'mp3'],
    defaultFormat: 'mp4',
    backendType: 'media_url',
    backendOperation: 'url_download',
    howItWorksSteps: [
      { step: '01', title: 'Sao chép URL', desc: 'Lấy link video từ ứng dụng TikTok hoặc trình duyệt web.' },
      { step: '02', title: 'Dán link', desc: 'Dán vào OneForAll và chọn tải video hoặc tải MP3.' },
      { step: '03', title: 'Chuẩn bị tệp', desc: 'OneForAll kiểm tra liên kết và chuẩn bị tệp để tải xuống.' },
      { step: '04', title: 'Nhận tệp', desc: 'Bấm nút Tải xuống để lưu tệp về máy tính hoặc điện thoại.' },
    ],
    features: [
      { title: 'Video và âm thanh', desc: 'Tùy chọn tải video hoặc chuyển âm thanh sang MP3 khi được công cụ hỗ trợ.' },
      { title: 'Quy trình đơn giản', desc: 'Thời gian xử lý phụ thuộc vào liên kết, độ dài video và tình trạng hệ thống.' },
      { title: 'Tương thích đa nền tảng', desc: 'Sử dụng mượt mà trên iPhone, iPad, điện thoại Android, macOS và Windows.' },
    ],
    supportedFormatsDesc: 'Hỗ trợ định dạng video MP4 và định dạng âm thanh MP3.',
    faqList: [
      { q: 'Video tải về có dính ID người dùng trên video không?', a: 'Watermark có thể được loại bỏ nếu liên kết và nguồn video được công cụ hỗ trợ. Kết quả tùy thuộc vào video cụ thể.' },
      { q: 'Có giới hạn số lần tải TikTok mỗi ngày không?', a: 'Không có giới hạn số lần tải đối với các tác vụ hợp lệ.' },
    ],
    relatedSlugs: ['/tiktok-to-mp4', '/tiktok-to-mp3', '/youtube-downloader', '/video-converter'],
  },

  '/convert': {
    slug: '/convert',
    category: 'convert',
    badge: 'Chuyển đổi tệp',
    title: 'Công Cụ Chuyển Đổi Định Dạng File Đa Năng Trực Tuyến | OneForAll',
    metaDescription:
      'Chuyển đổi tài liệu, hình ảnh, video, âm thanh, dữ liệu và tệp nén trực tuyến. Định dạng đích khả dụng tùy thuộc vào tệp tải lên và gói sử dụng.',
    h1: 'Chuyển Đổi Định Dạng Tệp Đa Năng Trực Tuyến',
    subtitle:
      'Chuyển đổi hình ảnh, video, âm thanh và tài liệu văn phòng qua vài bước đơn giản. Định dạng đầu ra tùy thuộc vào loại tệp và các tùy chọn được hỗ trợ.',
    inputType: 'file',
    acceptedFileTypes:
      '.txt,.doc,.docx,.xlsx,.pdf,.csv,.json,.xml,.yaml,.yml,.md,.html,.png,.jpg,.jpeg,.webp,.gif,.bmp,.tif,.tiff,.ico,.heic,.heif,.svg,.zip,.tar,.gz,.tgz,.7z,.mp4,.webm,.mkv,.avi,.mov,.flv,.wmv,.mp3,.wav,.ogg,.flac,.aac,.m4a',
    outputFormats: [
      'pdf',
      'docx',
      'doc',
      'txt',
      'csv',
      'json',
      'xlsx',
      'yaml',
      'xml',
      'md',
      'html',
      'png',
      'jpg',
      'webp',
      'svg',
      'ico',
      'mp4',
      'mov',
      'mkv',
      'webm',
      'avi',
      'gif',
      'mp3',
      'wav',
      'aac',
      'm4a',
      'flac',
      'ogg',
      'zip',
      'tar',
      '7z',
    ],
    defaultFormat: 'pdf',
    backendType: 'convert_file',
    backendOperation: 'convert',
    howItWorksSteps: [
      { step: '01', title: 'Tải tệp lên', desc: 'Kéo thả hoặc chọn tệp tin bất kỳ từ máy tính hoặc điện thoại của bạn.' },
      { step: '02', title: 'Chọn định dạng đích', desc: 'Chọn định dạng bạn muốn chuyển đổi sang (ví dụ: PDF, DOCX, WEBP...).' },
      { step: '03', title: 'Bắt đầu chuyển đổi', desc: 'OneForAll chuyển đổi tệp sang định dạng bạn đã chọn. Kết quả có thể khác nhau tùy loại tệp và định dạng đích.' },
      { step: '04', title: 'Tải tệp kết quả', desc: 'Nhận tệp đã chuyển đổi và lưu về máy ngay lập tức.' },
    ],
    features: [
      { title: 'Tự động nhận diện nguồn', desc: 'Tự động nhận diện định dạng tệp tin, giúp lựa chọn phương án xử lý phù hợp mà không cần thao tác thủ công.' },
      { title: 'Hỗ trợ giữ bố cục tài liệu', desc: 'Bảo toàn cấu trúc văn bản, bảng biểu, hình ảnh và định dạng chữ, giúp tài liệu sau chuyển đổi dễ đọc và thuận tiện chỉnh sửa.' },
      { title: 'Dọn dẹp tệp tự động', desc: 'Tệp được dọn dẹp theo chính sách lưu trữ của nền tảng.' },
    ],
    supportedFormatsDesc:
      'Định dạng đầu ra khả dụng gồm PDF, DOCX, DOC, TXT, CSV, JSON, XLSX, YAML, XML, MD, HTML, PNG, JPG, WEBP, SVG, ICO, MP4, MOV, MKV, WEBM, AVI, GIF, MP3, WAV, AAC, M4A, FLAC, OGG, ZIP, TAR và 7Z. Các lựa chọn phụ thuộc vào tệp nguồn.',
    faqList: [
      { q: 'Dung lượng tệp tối đa được phép chuyển đổi là bao nhiêu?', a: 'Gói Free hỗ trợ tệp tối đa 50 MB, gói Professional lên đến 2 GB.' },
      { q: 'Tệp của tôi có bị xem trộm không?', a: 'OneForAll ưu tiên quyền riêng tư của người dùng. Tệp được xử lý để thực hiện yêu cầu bạn gửi và không được công khai trên nền tảng. Tệp được dọn dẹp theo chính sách lưu trữ hiện hành. Vui lòng không tải lên thông tin nhạy cảm nếu chưa xem chính sách quyền riêng tư.' },
    ],
    relatedSlugs: ['/pdf-converter', '/document-converter', '/image-converter', '/video-converter'],
  },

  '/image-converter': {
    slug: '/image-converter',
    category: 'convert',
    badge: 'Chuyển đổi ảnh',
    title: 'Chuyển Đổi Định Dạng Ảnh: PNG, JPG, WebP, GIF, BMP, SVG | OneForAll',
    metaDescription:
      'Chuyển đổi hình ảnh giữa PNG, JPG, WebP và các định dạng được hỗ trợ. Kết quả về kích thước và độ trong suốt tùy thuộc vào định dạng đầu ra.',
    h1: 'Chuyển Đổi Định Dạng Hình Ảnh Trực Tuyến',
    subtitle:
      'Chuyển ảnh sang WebP, PNG hoặc JPG tùy theo nhu cầu sử dụng và khả năng tương thích của thiết bị.',
    inputType: 'file',
    acceptedFileTypes: '.png,.jpg,.jpeg,.webp,.gif,.bmp,.tif,.tiff,.ico,.heic,.heif,.svg',
    outputFormats: ['webp', 'png', 'jpg', 'ico', 'pdf', 'svg'],
    defaultFormat: 'webp',
    backendType: 'convert_file',
    backendOperation: 'convert',
    howItWorksSteps: [
      { step: '01', title: 'Tải ảnh lên', desc: 'Chọn tệp PNG, JPG, WebP, GIF, BMP, TIFF, ICO, HEIC hoặc SVG cần đổi định dạng.' },
      { step: '02', title: 'Chọn định dạng đích', desc: 'Lựa chọn định dạng đầu ra mong muốn như WebP, PNG, JPG, ICO hoặc PDF.' },
      { step: '03', title: 'Chuyển đổi hình ảnh', desc: 'Công cụ chuyển hình ảnh sang định dạng đích bạn đã chọn.' },
      { step: '04', title: 'Tải ảnh mới', desc: 'Lưu ảnh thành phẩm đã tối ưu về máy tính.' },
    ],
    features: [
      { title: 'Tối ưu cho SEO web', desc: 'Chuyển ảnh sang chuẩn WebP giúp giảm đáng kể dung lượng tải trang web.' },
      { title: 'Đọc được ảnh đời cũ và ảnh điện thoại', desc: 'Ảnh GIF, BMP, TIFF, ICO và HEIC (iPhone) đều chuyển được sang PNG, JPG hoặc WebP.' },
      { title: 'Hỗ trợ ảnh trong suốt', desc: 'Bảo toàn kênh alpha trong suốt (transparency) khi chuyển sang PNG hoặc WebP.' },
    ],
    supportedFormatsDesc: 'PNG, JPG, WEBP, GIF, BMP, TIFF, ICO, HEIC → PNG, JPG, WEBP, PDF; PNG thêm ICO và SVG; SVG thêm PNG.',
    faqList: [
      { q: 'Tại sao nên chuyển ảnh sang WebP?', a: 'WebP là định dạng ảnh hiện đại do Google phát triển, cho chất lượng tương đương JPG/PNG nhưng dung lượng nhẹ hơn đáng kể, giúp website tải nhanh hơn.' },
      { q: 'Ảnh nền trắng có bị đổi màu khi xuất JPG không?', a: 'Có thể. JPG không lưu vùng trong suốt nên nền trong suốt được tô trắng khi xuất ra JPG.' },
    ],
    relatedSlugs: ['/image-compressor', '/image-resizer', '/remove-background', '/convert'],
  },

  '/video-converter': {
    slug: '/video-converter',
    category: 'convert',
    badge: 'Video Converter',
    title: 'Chuyển Đổi Định Dạng Video MP4, MOV, MKV, WebM, AVI | OneForAll',
    metaDescription:
      'Chuyển đổi video trực tuyến sang MP4, WebM, MKV hoặc AVI. Tùy chọn định dạng giúp video phù hợp hơn với thiết bị và nhu cầu sử dụng.',
    h1: 'Chuyển Đổi Định Dạng Video Trực Tuyến',
    subtitle:
      'Chuyển video sang định dạng phù hợp để xem trên điện thoại, máy tính, TV hoặc chia sẻ lên nền tảng khác.',
    inputType: 'file',
    acceptedFileTypes: 'video/*,.gif',
    outputFormats: ['mp4', 'webm', 'mkv', 'avi', 'mov', 'gif', 'mp3', 'jpg'],
    defaultFormat: 'mp4',
    backendType: 'convert_file',
    backendOperation: 'convert',
    howItWorksSteps: [
      { step: '01', title: 'Tải video lên', desc: 'Chọn tệp video từ máy tính (MP4, MOV, AVI, MKV, WMV...).' },
      { step: '02', title: 'Chọn định dạng', desc: 'Chọn MP4 chuẩn H.264 hoặc WebM tối ưu cho trình duyệt.' },
      { step: '03', title: 'Chuyển đổi video', desc: 'OneForAll chuyển video sang định dạng bạn đã chọn.' },
      { step: '04', title: 'Tải video kết quả', desc: 'Nhận video thành phẩm tương thích mọi trình phát đa phương tiện.' },
    ],
    features: [
      { title: 'Tương thích đa thiết bị', desc: 'Chọn định dạng phổ biến để phát video trên nhiều điện thoại, máy tính và thiết bị hỗ trợ.' },
      { title: 'Tối ưu dung lượng', desc: 'Tùy chọn định dạng và thiết lập đầu ra có thể giúp bạn tạo tệp phù hợp hơn để chia sẻ.' },
      { title: 'Nhiều tùy chọn đầu ra', desc: 'Tùy theo lựa chọn, bạn có thể xuất âm thanh hoặc trích một khung hình thành ảnh.' },
    ],
    supportedFormatsDesc: 'MP4, MOV, MKV, AVI, WEBM, FLV, WMV, M4V → MP4, MOV, MKV, WEBM, AVI, GIF, MP3, JPG.',
    faqList: [
      { q: 'Mất bao lâu để chuyển đổi video?', a: 'Thời gian xử lý phụ thuộc vào dung lượng, độ dài video, định dạng đầu ra và tình trạng hệ thống.' },
      { q: 'Tính năng xuất JPG từ video dùng để làm gì?', a: 'Tính năng này trích một khung hình từ video và lưu thành ảnh JPG để dùng làm ảnh xem trước.' },
    ],
    relatedSlugs: ['/audio-converter', '/youtube-to-mp4', '/tiktok-to-mp4', '/convert'],
  },

  '/audio-converter': {
    slug: '/audio-converter',
    category: 'convert',
    badge: 'Audio Format Converter',
    title: 'Chuyển Đổi Âm Thanh: MP3, WAV, AAC, FLAC, M4A | OneForAll',
    metaDescription:
      'Chuyển đổi âm thanh giữa MP3, WAV, AAC, M4A, OGG và FLAC trực tuyến. Chất lượng đầu ra phụ thuộc vào tệp nguồn và định dạng được chọn.',
    h1: 'Chuyển Đổi Định Dạng Âm Thanh Trực Tuyến',
    subtitle:
      'Đổi định dạng âm thanh nhanh chóng để nghe nhạc trên mọi thiết bị hoặc phục vụ biên tập video.',
    inputType: 'file',
    acceptedFileTypes: 'audio/*',
    outputFormats: ['mp3', 'wav', 'aac', 'm4a', 'flac', 'ogg'],
    defaultFormat: 'mp3',
    backendType: 'convert_file',
    backendOperation: 'convert',
    howItWorksSteps: [
      { step: '01', title: 'Chọn tệp âm thanh', desc: 'Tải lên bài hát, tệp ghi âm hoặc file âm thanh cần chuyển.' },
      { step: '02', title: 'Chọn định dạng', desc: 'Chọn MP3 phổ thông, WAV lossless hoặc AAC cho hệ sinh thái Apple.' },
      { step: '03', title: 'Xử lý audio', desc: 'OneForAll chuyển đổi âm thanh theo định dạng và tùy chọn đầu ra bạn đã chọn.' },
      { step: '04', title: 'Tải về tệp mới', desc: 'Lưu tệp âm thanh đã tối ưu về máy tính.' },
    ],
    features: [
      { title: 'Tùy chọn định dạng âm thanh', desc: 'Chọn định dạng đầu ra phù hợp với thiết bị và nhu cầu sử dụng.' },
      { title: 'Hỗ trợ tệp ghi âm giọng nói', desc: 'Chuyển đổi định dạng m4a trên iPhone sang MP3 để nghe trên máy tính.' },
      { title: 'Dễ sử dụng', desc: 'Thực hiện chuyển đổi trực tuyến qua vài bước đơn giản.' },
    ],
    supportedFormatsDesc: 'MP3, WAV, AAC, M4A, FLAC, OGG.',
    faqList: [
      { q: 'Sự khác biệt giữa MP3 và WAV là gì?', a: 'WAV thường lưu âm thanh không nén nên tệp lớn hơn. MP3 dùng nén mất dữ liệu để giảm dung lượng, phù hợp nghe và chia sẻ hằng ngày.' },
    ],
    relatedSlugs: ['/video-converter', '/youtube-to-mp3', '/tiktok-to-mp3', '/convert'],
  },

  '/document-converter': {
    slug: '/document-converter',
    category: 'document',
    badge: 'Chuyển đổi tài liệu',
    title: 'Chuyển Đổi Tài Liệu: Word, Excel, TXT, CSV, PDF | OneForAll',
    metaDescription:
      'Chuyển đổi tài liệu Word, Excel, TXT, CSV, JSON và PDF trực tuyến. Định dạng được hỗ trợ tùy thuộc vào loại tệp nguồn và định dạng đích.',
    h1: 'Chuyển Đổi Tài Liệu Văn Phòng Trực Tuyến',
    subtitle:
      'Chuyển đổi linh hoạt giữa các định dạng tài liệu văn phòng phổ biến mà không làm sai lệch bảng biểu hay công thức.',
    inputType: 'file',
    acceptedFileTypes: '.doc,.docx,.txt,.xlsx,.pdf,.csv,.md,.html',
    outputFormats: ['pdf', 'docx', 'doc', 'csv', 'json', 'txt', 'md', 'html'],
    defaultFormat: 'pdf',
    backendType: 'convert_file',
    backendOperation: 'convert',
    howItWorksSteps: [
      { step: '01', title: 'Tải tài liệu lên', desc: 'Chọn tệp Word (DOCX), Excel (XLSX), PDF, văn bản TXT, Markdown hoặc HTML cần chuyển đổi.' },
      { step: '02', title: 'Chọn định dạng đích', desc: 'Chọn PDF để in ấn, DOCX để chỉnh sửa tiếp, TXT/CSV/JSON để xử lý nội dung.' },
      { step: '03', title: 'Chuyển đổi tài liệu', desc: 'OneForAll chuyển nội dung sang định dạng mới theo khả năng hỗ trợ của tệp nguồn.' },
      { step: '04', title: 'Tải tài liệu hoàn chỉnh', desc: 'Nhận tệp văn bản mới sẵn sàng cho công việc và học tập.' },
    ],
    features: [
      { title: 'Dễ đọc sau chuyển đổi', desc: 'Đoạn văn, tiêu đề và danh sách được chuyển đổi theo khả năng hỗ trợ của định dạng đích.' },
      { title: 'Chuyển đổi dữ liệu bảng tính', desc: 'Dữ liệu trong tệp XLSX có thể được chuyển sang CSV, JSON hoặc PDF tùy cấu trúc tệp.' },
      { title: 'Hai chiều PDF ↔ Word', desc: 'Chuyển DOCX sang PDF và ngược lại; PDF nhiều trang có thể xuất thành bộ ảnh hoặc văn bản.' },
      { title: 'Bảo mật tài liệu doanh nghiệp', desc: 'Tệp được dọn dẹp theo chính sách lưu trữ của nền tảng.' },
    ],
    supportedFormatsDesc: 'DOCX, XLSX, TXT, PDF, CSV, MD, HTML → PDF, DOCX, TXT, CSV, JSON, MD, HTML. Định dạng .doc cũ chưa hỗ trợ chiều sang PDF.',
    faqList: [
      { q: 'Chuyển Word sang PDF có bị lỗi font tiếng Việt không?', a: 'Kết quả phụ thuộc vào phông chữ và cách bố trí của tài liệu nguồn. Bạn nên mở và kiểm tra tài liệu sau khi chuyển đổi.' },
      { q: 'Có chuyển file Excel sang JSON được không?', a: 'Có, nếu tệp và định dạng đầu ra được công cụ hỗ trợ. Bạn cũng có thể chọn CSV để sử dụng với các ứng dụng bảng tính.' },
      { q: 'Có chuyển PDF sang Word được không?', a: 'Có. Công cụ hỗ trợ PDF sang DOCX, TXT và ảnh (JPG/PNG). Kết quả phụ thuộc bố cục tài liệu nguồn — PDF scan (ảnh) sẽ không trích được chữ.' },
    ],
    relatedSlugs: ['/pdf-converter', '/convert', '/image-converter'],
  },

  '/pdf-converter': {
    slug: '/pdf-converter',
    category: 'document',
    badge: 'Tài liệu sang PDF',
    title: 'Chuyển Word, Excel, TXT sang PDF Trực Tuyến | OneForAll',
    metaDescription:
      'Chuyển DOCX, DOC, XLSX và TXT sang PDF trực tuyến. Không cần cài đặt phần mềm; kết quả có thể thay đổi tùy cấu trúc tài liệu nguồn.',
    h1: 'Chuyển Đổi Tài Liệu Sang PDF',
    subtitle:
      'Biến file Word (.docx, .doc), Excel (.xlsx) và văn bản (.txt) thành PDF để gửi đi, lưu trữ hoặc ký số — nhanh, không cần cài đặt.',
    inputType: 'file',
    acceptedFileTypes: '.doc,.docx,.txt,.xlsx,.png,.jpg,.jpeg,.webp,.gif,.bmp,.tiff,.html',
    outputFormats: ['pdf'],
    defaultFormat: 'pdf',
    backendType: 'convert_file',
    backendOperation: 'convert',
    howItWorksSteps: [
      { step: '01', title: 'Tải tệp lên', desc: 'Chọn file Word, Excel, văn bản TXT, ảnh (JPG/PNG/WebP...) hoặc HTML cần xuất ra PDF.' },
      { step: '02', title: 'Định dạng đích là PDF', desc: 'Mọi định dạng nguồn được hỗ trợ ở trên đều xuất ra PDF.' },
      { step: '03', title: 'Kết xuất PDF', desc: 'OneForAll tạo tệp PDF từ tài liệu hoặc ảnh bạn tải lên.' },
      { step: '04', title: 'Tải PDF về', desc: 'Mở file PDF bằng bất kỳ trình đọc nào hoặc đính kèm vào email.' },
    ],
    features: [
      { title: 'Giữ bố cục dễ đọc', desc: 'Đoạn văn, tiêu đề và danh sách được chuyển sang PDF theo khả năng hỗ trợ của tài liệu nguồn.' },
      { title: 'Xuất bảng tính có chọn sheet', desc: 'Chỉ định sheet cần kết xuất khi chuyển file Excel sang PDF.' },
      { title: 'Ảnh thành PDF', desc: 'Chuyển JPG, PNG, WebP, GIF, BMP hoặc TIFF sang trang PDF gọn gàng.' },
      { title: 'Tự dọn sau khi tải', desc: 'Tệp nguồn và tệp kết quả được dọn dẹp theo chính sách lưu trữ của nền tảng.' },
    ],
    supportedFormatsDesc: 'DOCX, XLSX, TXT, HTML, PNG, JPG, WEBP, GIF, BMP, TIFF → PDF.',
    faqList: [
      { q: 'Có chuyển được PDF sang Word không?', a: 'Có, nhưng ở chiều ngược lại: dùng trang Chuyển đổi tài liệu (/document-converter). Trang này chỉ nhận tệp và xuất ra PDF.' },
      { q: 'File của tôi có bị lưu lại không?', a: 'Tệp được xử lý để thực hiện yêu cầu của bạn và được dọn dẹp theo chính sách lưu trữ của nền tảng. Không nên tải lên dữ liệu nhạy cảm nếu bạn chưa xem chính sách quyền riêng tư.' },
    ],
    relatedSlugs: ['/document-converter', '/convert', '/image-converter'],
  },

  '/remove-background': {
    slug: '/remove-background',
    category: 'image',
    badge: 'Xóa nền bằng AI',
    title: 'Xóa Nền Ảnh Bằng AI | OneForAll',
    metaDescription:
      'Xóa nền ảnh trực tuyến bằng AI và xuất ảnh PNG có nền trong suốt. Kết quả phụ thuộc vào chất lượng ảnh và độ phức tạp của chủ thể.',
    h1: 'Xóa Nền Ảnh Tự Động Trong Suốt Bằng AI',
    subtitle:
      'Tách chủ thể người, sản phẩm thương mại điện tử, chữ ký hoặc đồ vật ra khỏi nền ảnh với độ chính xác đến từng sợi tóc.',
    inputType: 'file',
    acceptedFileTypes: 'image/*',
    outputFormats: ['png'],
    defaultFormat: 'png',
    backendType: 'image_process',
    backendOperation: 'remove_background',
    howItWorksSteps: [
      { step: '01', title: 'Tải ảnh lên', desc: 'Tải lên hình ảnh chụp chân dung, ảnh sản phẩm hoặc vật thể.' },
      { step: '02', title: 'AI phân tích chủ thể', desc: 'AI phân tích hình ảnh và tách chủ thể khỏi nền.' },
      { step: '03', title: 'Xem trước so sánh', desc: 'Kiểm tra đường cắt giữa ảnh gốc và ảnh nền trong suốt.' },
      { step: '04', title: 'Tải ảnh PNG', desc: 'Lưu ảnh nền trong suốt để ghép vào banner thiết kế hoặc Shopee/Lazada.' },
    ],
    features: [
      { title: 'Tách nền tự động', desc: 'AI hỗ trợ tách chủ thể khỏi nền, không cần thao tác tô chọn thủ công.' },
      { title: 'Tách chi tiết phức tạp', desc: 'Xử lý mượt mà các chi tiết khó như tóc tơ, lông thú cưng và viền trong suốt.' },
      { title: 'Xuất ảnh PNG', desc: 'Tải ảnh PNG có nền trong suốt; kích thước đầu ra tùy thuộc vào ảnh nguồn và kết quả xử lý.' },
    ],
    supportedFormatsDesc: 'PNG, JPG, JPEG, WEBP. Ảnh kết quả xuất ra định dạng PNG trong suốt.',
    faqList: [
      { q: 'Ảnh sau khi xóa nền có giữ nguyên kích thước không?', a: 'Ảnh đầu ra được tạo theo kích thước mà công cụ hỗ trợ; hãy kiểm tra thông số trước khi tải xuống.' },
      { q: 'Công cụ có xử lý được ảnh sản phẩm bán hàng không?', a: 'Có thể dùng để tách nền ảnh sản phẩm. Kết quả phụ thuộc vào ánh sáng, độ tương phản và độ phức tạp của hình ảnh.' },
    ],
    relatedSlugs: ['/image-compressor', '/image-resizer', '/image-converter', '/convert'],
  },

  '/image-compressor': {
    slug: '/image-compressor',
    category: 'image',
    badge: 'Nén ảnh',
    title: 'Nén Dung Lượng Ảnh Online | OneForAll',
    metaDescription:
      'Nén ảnh JPG, PNG và WebP trực tuyến để giảm dung lượng tệp. Mức giảm và chất lượng đầu ra phụ thuộc vào ảnh gốc và thiết lập nén.',
    h1: 'Nén Dung Lượng Hình Ảnh Thông Minh Trực Tuyến',
    subtitle:
      'Giảm dung lượng hình ảnh để tiết kiệm bộ nhớ và thuận tiện chia sẻ. Mức giảm thực tế phụ thuộc vào ảnh nguồn và thiết lập nén.',
    inputType: 'file',
    acceptedFileTypes: 'image/*',
    outputFormats: ['webp', 'jpg', 'png'],
    defaultFormat: 'webp',
    backendType: 'image_process',
    backendOperation: 'compress',
    howItWorksSteps: [
      { step: '01', title: 'Tải ảnh cần nén', desc: 'Chọn tệp ảnh nặng (JPG, PNG, WebP) từ thư viện của bạn.' },
      { step: '02', title: 'Thuật toán nén thông minh', desc: 'Công cụ tối ưu cách lưu ảnh để giảm dung lượng tệp.' },
      { step: '03', title: 'Đánh giá tỷ lệ nén', desc: 'Xem số KB đã được tiết kiệm so với kích thước ban đầu.' },
      { step: '04', title: 'Lưu ảnh dung lượng nhẹ', desc: 'Tải ảnh siêu nhẹ về máy sẵn sàng sử dụng.' },
    ],
    features: [
      { title: 'Tỷ lệ nén cao vượt trội', desc: 'Mức giảm dung lượng tùy thuộc vào ảnh gốc và thiết lập nén; chất lượng có thể thay đổi sau khi nén.' },
      { title: 'Tối ưu Google PageSpeed', desc: 'Giải pháp lý tưởng cho lập trình viên và chủ website cần tăng tốc độ web.' },
      { title: 'Xử lý cực nhanh', desc: 'Thời gian xử lý phụ thuộc vào dung lượng ảnh và tình trạng hệ thống.' },
    ],
    supportedFormatsDesc: 'JPG, JPEG, PNG, WEBP, AVIF, GIF.',
    faqList: [
      { q: 'Nén ảnh có làm mờ chi tiết không?', a: 'Tùy mức nén và định dạng đầu ra, chất lượng ảnh có thể thay đổi. Hãy xem trước kết quả trước khi tải xuống.' },
    ],
    relatedSlugs: ['/image-resizer', '/image-converter', '/remove-background', '/convert'],
  },

  '/image-resizer': {
    slug: '/image-resizer',
    category: 'image',
    badge: 'Đổi kích thước ảnh',
    title: 'Thay Đổi Kích Thước Ảnh (Resize) Chuẩn Pixel & Tỷ Lệ | OneForAll',
    metaDescription:
      'Thay đổi chiều rộng, chiều cao hoặc tỷ lệ ảnh theo nhu cầu. Giữ tỷ lệ khung hình để hạn chế méo ảnh.',
    h1: 'Thay Đổi Kích Thước Hình Ảnh Chuẩn Xác',
    subtitle:
      'Điều chỉnh chiều rộng và chiều cao ảnh cho ảnh đại diện, banner, ảnh bìa hoặc hồ sơ cá nhân.',
    inputType: 'file',
    acceptedFileTypes: 'image/*',
    outputFormats: ['jpg', 'png', 'webp'],
    defaultFormat: 'jpg',
    backendType: 'image_process',
    backendOperation: 'resize',
    howItWorksSteps: [
      { step: '01', title: 'Chọn ảnh cần đổi kích thước', desc: 'Tải lên hình ảnh bất kỳ từ thiết bị.' },
      { step: '02', title: 'Chọn kích thước mong muốn', desc: 'Chọn kích thước tiêu chuẩn (ví dụ 1200x630, 800x800, 1920x1080).' },
      { step: '03', title: 'Điều chỉnh ảnh', desc: 'Công cụ thay đổi kích thước ảnh theo thông số bạn đã chọn.' },
      { step: '04', title: 'Tải ảnh vừa vặn', desc: 'Lưu ảnh kích thước chuẩn về máy để đăng bài ngay.' },
    ],
    features: [
      { title: 'Khóa tỷ lệ khung hình', desc: 'Tự động tính toán chiều cao tương ứng với chiều rộng để tránh méo ảnh.' },
      { title: 'Sẵn các kích thước mạng xã hội', desc: 'Gợi ý kích thước chuẩn cho Facebook, Instagram, YouTube, TikTok.' },
      { title: 'Điều chỉnh linh hoạt', desc: 'Chọn kích thước ảnh theo nhu cầu và kiểm tra kết quả trước khi lưu.' },
    ],
    supportedFormatsDesc: 'JPG, PNG, WEBP, AVIF, BMP.',
    faqList: [
      { q: 'Làm sao để ảnh không bị méo khi đổi kích thước?', a: 'Bật tùy chọn giữ tỷ lệ khung hình để chiều rộng và chiều cao thay đổi đồng bộ, hạn chế làm méo ảnh.' },
    ],
    relatedSlugs: ['/image-compressor', '/image-converter', '/remove-background', '/convert'],
  },

  '/data-converter': {
    slug: '/data-converter',
    category: 'data',
    badge: 'Chuyển đổi dữ liệu',
    title: 'Chuyển Đổi Định Dạng Dữ Liệu: JSON, YAML, XML, CSV | OneForAll',
    metaDescription:
      'Chuyển đổi dữ liệu giữa JSON, YAML, XML, CSV, Markdown và HTML trực tuyến. Không cần cài đặt; kết quả phụ thuộc cấu trúc tệp nguồn.',
    h1: 'Chuyển Đổi Định Dạng Dữ Liệu Trực Tuyến',
    subtitle:
      'Đổi JSON sang YAML, CSV sang JSON và nhiều cặp định dạng dữ liệu phổ biến khác ngay trên trình duyệt.',
    inputType: 'file',
    acceptedFileTypes: '.json,.yaml,.yml,.xml,.csv,.txt,.md,.html',
    outputFormats: ['json', 'yaml', 'xml', 'csv', 'xlsx', 'md', 'html', 'pdf'],
    defaultFormat: 'json',
    backendType: 'convert_file',
    backendOperation: 'convert',
    howItWorksSteps: [
      { step: '01', title: 'Tải tệp dữ liệu lên', desc: 'Chọn tệp JSON, YAML, XML, CSV, TXT, Markdown hoặc HTML.' },
      { step: '02', title: 'Chọn định dạng đích', desc: 'Các định dạng khả dụng hiển thị theo loại tệp bạn tải lên.' },
      { step: '03', title: 'Chuyển đổi', desc: 'OneForAll đọc và viết lại dữ liệu sang định dạng bạn chọn.' },
      { step: '04', title: 'Tải kết quả', desc: 'Nhận tệp dữ liệu mới và dùng ngay cho code, bảng tính hoặc tài liệu.' },
    ],
    features: [
      { title: 'JSON ↔ YAML', desc: 'Chuyển hai chiều giữa JSON và YAML, giữ tiếng Việt và thứ tự khóa.' },
      { title: 'CSV ↔ JSON', desc: 'Biến bảng CSV thành record JSON để nạp vào ứng dụng, hoặc ngược lại.' },
      { title: 'Markdown ↔ HTML', desc: 'Kết xuất README thành HTML hoặc chuyển HTML thành Markdown dễ sửa.' },
    ],
    supportedFormatsDesc: 'JSON ↔ YAML, JSON ↔ XML, CSV → JSON/XLSX, JSON → CSV, TXT → MD, MD ↔ HTML, HTML → PDF.',
    faqList: [
      { q: 'XML sang JSON có giữ được attribute không?', a: 'Bản hiện tại tập trung vào cấu trúc node và văn bản; attribute có thể không được giữ đầy đủ. Bạn nên kiểm tra kết quả trước khi dùng cho hệ thống quan trọng.' },
      { q: 'Tệp dữ liệu lớn có chuyển được không?', a: 'Tệp phải nằm trong giới hạn tải lên của gói sử dụng; dữ liệu quá lớn hoặc sai cấu trúc sẽ bị từ chối kèm thông báo lỗi.' },
    ],
    relatedSlugs: ['/convert', '/document-converter'],
  },

  '/archive-converter': {
    slug: '/archive-converter',
    category: 'archive',
    badge: 'Chuyển đổi tệp nén',
    title: 'Chuyển Đổi ZIP, TAR, TAR.GZ, 7Z Trực Tuyến | OneForAll',
    metaDescription:
      'Chuyển đổi tệp nén giữa ZIP, TAR và 7Z trực tuyến. TAR.GZ sang ZIP chỉ trong vài bước; không cần cài WinRAR hay 7-Zip.',
    h1: 'Chuyển Đổi Định Dạng Tệp Nén Trực Tuyến',
    subtitle:
      'Đổi ZIP sang TAR, TAR hoặc TAR.GZ sang ZIP, ZIP sang 7Z — nhanh, không cần cài phần mềm nén.',
    inputType: 'file',
    acceptedFileTypes: '.zip,.tar,.gz,.tgz',
    outputFormats: ['zip', 'tar', '7z'],
    defaultFormat: 'zip',
    backendType: 'convert_file',
    backendOperation: 'convert',
    howItWorksSteps: [
      { step: '01', title: 'Tải tệp nén lên', desc: 'Chọn tệp ZIP, TAR, TAR.GZ hoặc TGZ cần đổi định dạng.' },
      { step: '02', title: 'Chọn định dạng đích', desc: 'Các lựa chọn khả dụng hiển thị theo loại tệp nguồn.' },
      { step: '03', title: 'Chuyển đổi an toàn', desc: 'OneForAll đọc và repack từng file bên trong, chặn đường dẫn độc hại và archive quá lớn.' },
      { step: '04', title: 'Tải tệp mới', desc: 'Nhận tệp nén ở định dạng mong muốn về máy.' },
    ],
    features: [
      { title: 'ZIP ↔ TAR', desc: 'Chuyển hai chiều giữa hai định dạng nén phổ biến trên Linux và Windows.' },
      { title: 'TAR.GZ sang ZIP', desc: 'Giải nén gzip rồi repack ZIP mà không cần thao tác tay.' },
      { title: 'ZIP sang 7Z', desc: 'Đóng gói lại bằng 7Z để giảm dung lượng lưu trữ.' },
    ],
    supportedFormatsDesc: 'ZIP → TAR, 7Z; TAR và TAR.GZ (TGZ) → ZIP. RAR chưa hỗ trợ vì cần công cụ giải nén độc quyền.',
    faqList: [
      { q: 'Có chuyển được RAR sang ZIP không?', a: 'Chưa. Định dạng RAR cần thư viện giải nén độc quyền của WinRAR nên nền tảng chưa hỗ trợ tự động.' },
      { q: 'Tệp nén bên trong có bị đổi tên không?', a: 'Không. Cấu trúc thư mục và tên file bên trong được giữ nguyên khi repack.' },
    ],
    relatedSlugs: ['/convert', '/data-converter'],
  },
}

export const ALL_TOOL_SLUGS = Object.keys(SEO_TOOLS)
