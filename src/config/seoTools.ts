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
    title: 'Tải Video YouTube sang MP4 Trực Tuyến | One ForAll',
    metaDescription:
      'Tải video YouTube sang MP4 trực tuyến trên trình duyệt. Không cần cài đặt phần mềm; chất lượng khả dụng tùy thuộc vào video nguồn và gói sử dụng.',
    h1: 'Tải Video YouTube sang MP4',
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
      { step: '03', title: 'Chuẩn bị video', desc: 'One ForAll xử lý liên kết và chuẩn bị tệp theo định dạng bạn đã chọn.' },
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
    relatedSlugs: ['/youtube-to-mp3', '/youtube-downloader', '/video-converter'],
  },

  '/youtube-to-mp3': {
    slug: '/youtube-to-mp3',
    category: 'youtube',
    badge: 'YouTube sang MP3',
    title: 'Chuyển YouTube Sang MP3 Trực Tuyến | One ForAll',
    metaDescription:
      'Chuyển âm thanh từ video YouTube sang MP3 trực tuyến. Chất lượng đầu ra phụ thuộc vào âm thanh nguồn và định dạng bạn chọn.',
    h1: 'Tách Âm Thanh YouTube sang MP3',
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
      { step: '02', title: 'Dán vào One ForAll', desc: 'Dán link vào ô tìm kiếm và bấm nút Tách nhạc MP3.' },
      { step: '03', title: 'Trích xuất âm thanh', desc: 'One ForAll chuẩn bị âm thanh theo định dạng đầu ra bạn đã chọn.' },
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
      { q: 'Có thể tách âm thanh từ YouTube Shorts không?', a: 'Bạn có thể thử liên kết Shorts được công cụ hỗ trợ. Khả năng xử lý còn tùy nguồn và trạng thái hỗ trợ hiện tại.' },
    ],
    relatedSlugs: ['/youtube-to-mp4', '/youtube-downloader', '/audio-converter'],
  },

  '/youtube-downloader': {
    slug: '/youtube-downloader',
    category: 'youtube',
    badge: 'Công cụ tải YouTube',
    title: 'Trình Tải Video & Âm Thanh YouTube Toàn Diện | One ForAll',
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
      { step: '03', title: 'Chuẩn bị tệp', desc: 'One ForAll xử lý liên kết và chuẩn bị tệp theo lựa chọn của bạn.' },
      { step: '04', title: 'Tải về an toàn', desc: 'Nhấn Tải xuống để lưu tệp kết quả về thiết bị.' },
    ],
    features: [
      { title: 'Đa định dạng linh hoạt', desc: 'Tùy chọn tải video hoặc chỉ lấy âm thanh chỉ với một cú nhấp chuột.' },
      { title: 'Hạn mức rõ ràng', desc: 'Số lượt sử dụng phụ thuộc vào gói dịch vụ bạn đang dùng.' },
      { title: 'Bảo vệ thiết bị', desc: 'Không cần cài tiện ích mở rộng để sử dụng công cụ trên trình duyệt.' },
    ],
    supportedFormatsDesc: 'Tùy chọn đầu ra của trang gồm MP4, WebM, MP3 và WAV. Các mức chất lượng phụ thuộc video, thiết lập và gói sử dụng.',
    faqList: [
      { q: 'Video tải về được lưu ở đâu?', a: 'Trình duyệt thường lưu tệp vào thư mục Downloads mặc định, trừ khi bạn đã đổi cài đặt tải xuống.' },
      { q: 'Tại sao một số video tải chậm hơn?', a: 'Video dài hoặc có chất lượng cao có thể mất nhiều thời gian xử lý hơn. Bạn hãy chờ tiến trình hoàn tất trước khi tải tệp.' },
    ],
    relatedSlugs: ['/youtube-to-mp4', '/youtube-to-mp3', '/video-converter', '/audio-converter'],
  },

  '/tiktok-to-mp4': {
    slug: '/tiktok-to-mp4',
    category: 'tiktok',
    badge: 'TikTok sang MP4',
    title: 'Tải Video TikTok MP4 | One ForAll',
    metaDescription:
      'Tải video TikTok dưới dạng MP4 để lưu về điện thoại hoặc máy tính. Tùy chọn và chất lượng khả dụng phụ thuộc vào video nguồn.',
    h1: 'Tải Video TikTok sang MP4',
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
      { step: '02', title: 'Dán vào One ForAll', desc: 'Dán URL TikTok vào ô bên dưới và bấm nút Tải video.' },
      { step: '03', title: 'Chuẩn bị video', desc: 'One ForAll xử lý liên kết và chuẩn bị tệp video để tải xuống.' },
      { step: '04', title: 'Lưu về máy', desc: 'Tải tệp MP4 về thiết bị của bạn.' },
    ],
    features: [
      { title: 'Tệp MP4 từ liên kết TikTok', desc: 'Tạo tệp MP4 từ liên kết TikTok được công cụ hỗ trợ; khả năng truy cập và kết quả phụ thuộc nguồn.' },
      { title: 'Chất lượng theo nguồn', desc: 'Độ phân giải đầu ra phụ thuộc video nguồn và giới hạn chất lượng của gói đang dùng.' },
      { title: 'Hoạt động tốt trên iOS & Android', desc: 'Dễ dàng tải về thư viện máy mà không cần phần mềm thứ ba.' },
    ],
    supportedFormatsDesc: 'Hỗ trợ link TikTok dạng vm.tiktok.com, vt.tiktok.com và tiktok.com/@user/video/...',
    faqList: [
      { q: 'Làm thế nào để tải video TikTok trên iPhone?', a: 'Bạn dán link vào One ForAll trên Safari, bấm Tải về, sau đó mở tệp trong phần Tải về và chọn Lưu video vào thư viện Ảnh.' },
      { q: 'Video tải về có watermark không?', a: 'Watermark phụ thuộc vào tệp nguồn mà TikTok cung cấp. Công cụ không có bước xóa watermark riêng; hãy kiểm tra kết quả trước khi sử dụng.' },
    ],
    relatedSlugs: ['/tiktok-to-mp3', '/tiktok-downloader', '/video-converter'],
  },

  '/tiktok-to-mp3': {
    slug: '/tiktok-to-mp3',
    category: 'tiktok',
    badge: 'TikTok sang MP3',
    title: 'Chuyển Âm Thanh TikTok sang MP3 | One ForAll',
    metaDescription:
      'Chuyển âm thanh từ video TikTok sang MP3 trực tuyến. Chất lượng đầu ra phụ thuộc vào video nguồn và các tùy chọn được hỗ trợ.',
    h1: 'Trích Xuất Âm Thanh TikTok sang MP3',
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
      { title: 'Trích xuất âm thanh từ liên kết', desc: 'Tạo tệp âm thanh từ video TikTok mà công cụ có thể truy cập.' },
      { title: 'Chất lượng theo nguồn', desc: 'Chất lượng âm thanh đầu ra phụ thuộc vào âm thanh gốc và định dạng được chọn.' },
      { title: 'Dùng làm nhạc chuông', desc: 'Dễ dàng cài đặt làm nhạc chuông báo thức hoặc chuông cuộc gọi thoại.' },
    ],
    supportedFormatsDesc: 'Đầu ra hỗ trợ định dạng MP3, WAV, M4A.',
    faqList: [
      { q: 'Có thể chọn bitrate đầu ra nào?', a: 'Công cụ có các tùy chọn 128, 192 và 320 kbps. Chất lượng nghe được còn phụ thuộc âm thanh nguồn và định dạng đầu ra.' },
      { q: 'Có tải được âm thanh từ video TikTok riêng tư không?', a: 'Công cụ có thể không truy cập được video riêng tư hoặc bị giới hạn.' },
    ],
    relatedSlugs: ['/tiktok-to-mp4', '/tiktok-downloader', '/audio-converter'],
  },

  '/tiktok-downloader': {
    slug: '/tiktok-downloader',
    category: 'tiktok',
    badge: 'Công cụ TikTok đa năng',
    title: 'Trình Tải TikTok Toàn Diện: Video MP4 & Âm Thanh MP3 | One ForAll',
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
      { step: '02', title: 'Dán link', desc: 'Dán vào One ForAll và chọn tải video hoặc tải MP3.' },
      { step: '03', title: 'Chuẩn bị tệp', desc: 'One ForAll kiểm tra liên kết và chuẩn bị tệp để tải xuống.' },
      { step: '04', title: 'Nhận tệp', desc: 'Bấm nút Tải xuống để lưu tệp về máy tính hoặc điện thoại.' },
    ],
    features: [
      { title: 'Video và âm thanh', desc: 'Tùy chọn tải video hoặc chuyển âm thanh sang MP3 khi được công cụ hỗ trợ.' },
      { title: 'Quy trình đơn giản', desc: 'Thời gian xử lý phụ thuộc vào liên kết, độ dài video và tình trạng hệ thống.' },
      { title: 'Dùng trên nhiều thiết bị', desc: 'Mở công cụ bằng trình duyệt trên điện thoại, máy tính bảng hoặc máy tính.' },
    ],
    supportedFormatsDesc: 'Hỗ trợ định dạng video MP4 và định dạng âm thanh MP3.',
    faqList: [
      { q: 'Video tải về có watermark không?', a: 'Watermark phụ thuộc vào tệp nguồn mà TikTok cung cấp. Công cụ không có bước xóa watermark riêng; hãy kiểm tra kết quả trước khi sử dụng.' },
      { q: 'Lượt tải có bị giới hạn không?', a: 'Giới hạn sử dụng phụ thuộc gói và quy tắc dịch vụ hiện tại; hãy xem thông tin hiển thị trên trang trước khi xử lý.' },
    ],
    relatedSlugs: ['/tiktok-to-mp4', '/tiktok-to-mp3'],
  },

  '/convert': {
    slug: '/convert',
    category: 'convert',
    badge: 'Chuyển đổi tệp',
    title: 'Công Cụ Chuyển Đổi Định Dạng File Đa Năng Trực Tuyến | One ForAll',
    metaDescription:
      'Chuyển đổi tài liệu, hình ảnh, video và âm thanh trực tuyến. Định dạng đích khả dụng tùy thuộc vào tệp tải lên và gói sử dụng.',
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
      { step: '01', title: 'Tải tệp lên', desc: 'Chọn một tệp thuộc định dạng mà công cụ hỗ trợ.' },
      { step: '02', title: 'Chọn định dạng đích', desc: 'Chọn định dạng bạn muốn chuyển đổi sang (ví dụ: PDF, DOCX, WEBP...).' },
      { step: '03', title: 'Bắt đầu chuyển đổi', desc: 'One ForAll chuyển đổi tệp sang định dạng bạn đã chọn. Kết quả có thể khác nhau tùy loại tệp và định dạng đích.' },
      { step: '04', title: 'Tải tệp kết quả', desc: 'Nhận tệp đã chuyển đổi và lưu về máy ngay lập tức.' },
    ],
    features: [
      { title: 'Tự động nhận diện nguồn', desc: 'Tự động nhận diện định dạng tệp tin, giúp lựa chọn phương án xử lý phù hợp mà không cần thao tác thủ công.' },
      { title: 'Chọn định dạng theo tệp nguồn', desc: 'Các tùy chọn chuyển đổi phụ thuộc vào tệp và định dạng đích được backend hỗ trợ.' },
      { title: 'Dọn dẹp tệp theo chính sách', desc: 'Tệp được dọn dẹp theo chính sách lưu trữ của nền tảng.' },
    ],
    supportedFormatsDesc:
      'Các định dạng đích khả dụng được hiển thị sau khi bạn chọn tệp và công cụ nhận diện định dạng nguồn.',
    faqList: [
      { q: 'Dung lượng tệp tối đa là bao nhiêu?', a: 'Giới hạn phụ thuộc loại tệp và gói hiện tại. Hãy kiểm tra mức tối đa hiển thị trên công cụ trước khi tải lên.' },
      { q: 'Tệp được lưu trong bao lâu?', a: 'Thời gian lưu tệp phụ thuộc chính sách lưu trữ hiện hành của dịch vụ. Hãy xem Chính sách quyền riêng tư để biết chi tiết.' },
    ],
    relatedSlugs: ['/pdf-converter', '/document-converter', '/image-converter', '/video-converter', '/data-converter', '/archive-converter'],
  },

  '/image-converter': {
    slug: '/image-converter',
    category: 'convert',
    badge: 'Chuyển đổi ảnh',
    title: 'Chuyển Đổi Định Dạng Ảnh: PNG, JPG, WebP, GIF, BMP, SVG | One ForAll',
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
      { step: '01', title: 'Tải ảnh lên', desc: 'Chọn tệp PNG, JPG, WebP, GIF, BMP, TIFF hoặc ICO cần đổi định dạng.' },
      { step: '02', title: 'Chọn định dạng đích', desc: 'Lựa chọn định dạng đầu ra mong muốn như WebP, PNG, JPG hoặc SVG.' },
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
      { q: 'Khi nào nên chuyển ảnh sang WebP?', a: 'WebP có thể giảm dung lượng trong một số trường hợp. Hãy so sánh kích thước và chất lượng ảnh kết quả trước khi dùng.' },
      { q: 'Ảnh nền trắng có bị đổi màu khi xuất JPG không?', a: 'Có thể. JPG không lưu vùng trong suốt nên nền trong suốt được tô trắng khi xuất ra JPG.' },
    ],
    relatedSlugs: ['/image-compressor', '/image-resizer', '/remove-background', '/convert'],
  },

  '/video-converter': {
    slug: '/video-converter',
    category: 'convert',
    badge: 'Video Converter',
    title: 'Chuyển Đổi Định Dạng Video MP4, MOV, MKV, WebM, AVI | One ForAll',
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
      { step: '03', title: 'Chuyển đổi video', desc: 'One ForAll chuyển video sang định dạng bạn đã chọn.' },
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
    title: 'Chuyển Đổi Âm Thanh: MP3, WAV, AAC, FLAC, M4A | One ForAll',
    metaDescription:
      'Chuyển đổi âm thanh giữa MP3, WAV, AAC, M4A, OGG và FLAC trực tuyến. Chất lượng đầu ra phụ thuộc vào tệp nguồn và định dạng được chọn.',
    h1: 'Chuyển Đổi Định Dạng Âm Thanh Trực Tuyến',
    subtitle:
      'Đổi định dạng âm thanh để nghe trên thiết bị phù hợp hoặc dùng trong quy trình biên tập video.',
    inputType: 'file',
    acceptedFileTypes: 'audio/*',
    outputFormats: ['mp3', 'wav', 'aac', 'm4a', 'flac', 'ogg'],
    defaultFormat: 'mp3',
    backendType: 'convert_file',
    backendOperation: 'convert',
    howItWorksSteps: [
      { step: '01', title: 'Chọn tệp âm thanh', desc: 'Tải lên bài hát, tệp ghi âm hoặc file âm thanh cần chuyển.' },
      { step: '02', title: 'Chọn định dạng', desc: 'Chọn MP3 phổ thông, WAV lossless hoặc AAC cho hệ sinh thái Apple.' },
      { step: '03', title: 'Xử lý audio', desc: 'One ForAll chuyển đổi âm thanh theo định dạng và tùy chọn đầu ra bạn đã chọn.' },
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
    title: 'Chuyển Đổi Tài Liệu: Word, Excel, TXT, CSV, PDF | One ForAll',
    metaDescription:
      'Chuyển đổi tài liệu Word, Excel, TXT, CSV, JSON và PDF trực tuyến. Định dạng được hỗ trợ tùy thuộc vào loại tệp nguồn và định dạng đích.',
    h1: 'Chuyển Đổi Tài Liệu Văn Phòng Trực Tuyến',
    subtitle:
      'Chuyển đổi các định dạng tài liệu và bảng tính được hỗ trợ. Bố cục, phông chữ và công thức có thể khác tài liệu gốc; hãy kiểm tra tệp sau khi chuyển đổi.',
    inputType: 'file',
    acceptedFileTypes: '.docx,.txt,.xlsx,.pdf,.csv,.md,.html',
    outputFormats: ['pdf', 'docx', 'doc', 'csv', 'json', 'txt', 'md', 'html'],
    defaultFormat: 'pdf',
    backendType: 'convert_file',
    backendOperation: 'convert',
    howItWorksSteps: [
      { step: '01', title: 'Tải tài liệu lên', desc: 'Chọn tệp Word (DOCX), Excel (XLSX), PDF, văn bản TXT, Markdown hoặc HTML cần chuyển đổi.' },
      { step: '02', title: 'Chọn định dạng đích', desc: 'Chọn PDF để in ấn, DOCX để chỉnh sửa tiếp, TXT/CSV/JSON để xử lý nội dung.' },
      { step: '03', title: 'Chuyển đổi tài liệu', desc: 'One ForAll chuyển nội dung sang định dạng mới theo khả năng hỗ trợ của tệp nguồn.' },
      { step: '04', title: 'Tải tài liệu hoàn chỉnh', desc: 'Nhận tệp văn bản mới sẵn sàng cho công việc và học tập.' },
    ],
    features: [
      { title: 'Dễ đọc sau chuyển đổi', desc: 'Đoạn văn, tiêu đề và danh sách được chuyển đổi theo khả năng hỗ trợ của định dạng đích.' },
      { title: 'Chuyển đổi dữ liệu bảng tính', desc: 'Dữ liệu trong tệp XLSX có thể được chuyển sang CSV, JSON hoặc PDF tùy cấu trúc tệp.' },
      { title: 'Dọn dẹp tệp theo chính sách', desc: 'Tệp được dọn dẹp theo chính sách lưu trữ của nền tảng.' },
    ],
    supportedFormatsDesc: 'Các cặp chuyển đổi được hỗ trợ sẽ hiển thị theo loại tệp đã chọn. Định dạng Word .doc cũ không được hỗ trợ.',
    faqList: [
      { q: 'Chuyển Word sang PDF có bị lỗi font tiếng Việt không?', a: 'Kết quả phụ thuộc vào phông chữ và cách bố trí của tài liệu nguồn. Bạn nên mở và kiểm tra tài liệu sau khi chuyển đổi.' },
      { q: 'Có chuyển file Excel sang JSON được không?', a: 'Có, nếu tệp và định dạng đầu ra được công cụ hỗ trợ. Bạn cũng có thể chọn CSV để sử dụng với các ứng dụng bảng tính.' },
    ],
    relatedSlugs: ['/pdf-converter', '/convert', '/data-converter'],
  },

  '/pdf-converter': {
    slug: '/pdf-converter',
    category: 'document',
    badge: 'Tài liệu sang PDF',
    title: 'Chuyển Tài Liệu và Ảnh sang PDF | One ForAll',
    metaDescription:
      'Chuyển DOCX, XLSX và các loại tệp được hỗ trợ sang PDF trực tuyến. DOC cũ không được hỗ trợ; hãy kiểm tra kết quả sau khi chuyển đổi.',
    h1: 'Chuyển Đổi Tài Liệu Sang PDF',
    subtitle:
      'Tạo PDF từ DOCX, XLSX, TXT, hình ảnh và các định dạng được hỗ trợ để chia sẻ, in hoặc lưu trữ.',
    inputType: 'file',
    acceptedFileTypes: '.docx,.txt,.xlsx,.png,.jpg,.jpeg,.webp,.gif,.bmp,.tiff,.html',
    outputFormats: ['pdf'],
    defaultFormat: 'pdf',
    backendType: 'convert_file',
    backendOperation: 'convert',
    howItWorksSteps: [
      { step: '01', title: 'Tải tệp lên', desc: 'Chọn DOCX, XLSX, văn bản TXT, ảnh (JPG/PNG/WebP...) hoặc HTML cần xuất ra PDF.' },
      { step: '02', title: 'Định dạng đích là PDF', desc: 'Mọi định dạng nguồn được hỗ trợ ở trên đều xuất ra PDF.' },
      { step: '03', title: 'Kết xuất PDF', desc: 'One ForAll tạo tệp PDF từ tài liệu hoặc ảnh bạn tải lên.' },
      { step: '04', title: 'Tải PDF về', desc: 'Mở file PDF bằng bất kỳ trình đọc nào hoặc đính kèm vào email.' },
    ],
    features: [
      { title: 'Kiểm tra bố cục sau chuyển đổi', desc: 'Bố cục, phông chữ và bảng có thể thay đổi tùy tài liệu nguồn; hãy mở PDF kết quả để kiểm tra.' },
      { title: 'Xuất bảng tính có chọn sheet', desc: 'Chỉ định sheet cần kết xuất khi chuyển file Excel sang PDF.' },
      { title: 'Tự dọn sau khi tải', desc: 'Tệp nguồn và tệp kết quả được dọn dẹp theo chính sách lưu trữ của nền tảng.' },
    ],
    supportedFormatsDesc: 'DOCX, XLSX, TXT, HTML, PNG, JPG, WEBP, GIF, BMP và TIFF → PDF. Định dạng .doc cũ không được hỗ trợ.',
    faqList: [
      { q: 'Có chuyển được PDF sang Word không?', a: 'Chưa. Công cụ này chỉ nhận tài liệu và xuất ra PDF; chiều ngược lại cần phân tích bố cục trang nên chưa được triển khai.' },
      { q: 'File của tôi có bị lưu lại không?', a: 'Tệp được xử lý để thực hiện yêu cầu của bạn và được dọn dẹp theo chính sách lưu trữ của nền tảng. Không nên tải lên dữ liệu nhạy cảm nếu bạn chưa xem chính sách quyền riêng tư.' },
    ],
    relatedSlugs: ['/document-converter', '/convert', '/image-converter'],
  },

  '/remove-background': {
    slug: '/remove-background',
    category: 'image',
    badge: 'Xóa nền ảnh',
    title: 'Xóa Nền Ảnh Trực Tuyến | One ForAll',
    metaDescription:
      'Tiện ích tự động nhận diện chủ thể và tách phông nền ảnh nhanh chóng bằng AI, sau đó xuất ảnh PNG có nền trong suốt.',
    h1: 'Xóa Nền Ảnh',
    subtitle: 'Tiện ích tự động nhận diện chủ thể và tách phông nền ảnh nhanh chóng.',
    inputType: 'file',
    acceptedFileTypes: 'image/*',
    outputFormats: ['png'],
    defaultFormat: 'png',
    backendType: 'image_process',
    backendOperation: 'remove_background',
    howItWorksSteps: [
      { step: '01', title: 'Tải ảnh lên', desc: 'Tải lên hình ảnh chụp chân dung, ảnh sản phẩm hoặc vật thể.' },
      { step: '02', title: 'AI phân tích chủ thể', desc: 'Công nghệ AI nhận diện chủ thể trong hình ảnh và tách chủ thể khỏi nền.' },
      { step: '03', title: 'Xem trước so sánh', desc: 'Kiểm tra đường cắt giữa ảnh gốc và ảnh nền trong suốt.' },
      { step: '04', title: 'Tải ảnh PNG', desc: 'Lưu ảnh nền trong suốt để ghép vào banner thiết kế hoặc Shopee/Lazada.' },
    ],
    features: [
      { title: 'Tách nền tự động', desc: 'AI nhận diện chủ thể và tách chủ thể khỏi nền, không cần thao tác tô chọn thủ công.' },
      { title: 'Xem lại đường viền', desc: 'Kiểm tra tóc, lông, vật thể trong suốt và nền phức tạp trước khi sử dụng ảnh kết quả.' },
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
    title: 'Nén Dung Lượng Ảnh Online | One ForAll',
    metaDescription:
      'Nén ảnh JPG, PNG và WebP trực tuyến để giảm dung lượng tệp. Mức giảm và chất lượng đầu ra phụ thuộc vào ảnh gốc và thiết lập nén.',
    h1: 'Nén Ảnh Trực Tuyến',
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
      { step: '02', title: 'Chọn định dạng và mức chất lượng', desc: 'Chọn đầu ra và điều chỉnh mức chất lượng nếu tùy chọn đó khả dụng.' },
      { step: '03', title: 'Kiểm tra ảnh kết quả', desc: 'So sánh chất lượng ảnh và dung lượng tệp sau khi xử lý.' },
      { step: '04', title: 'Tải ảnh đã nén', desc: 'Lưu ảnh kết quả vào thiết bị nếu phù hợp với nhu cầu của bạn.' },
    ],
    features: [
      { title: 'Điều chỉnh mức nén', desc: 'Mức giảm dung lượng và chất lượng phụ thuộc ảnh gốc, định dạng đầu ra và thiết lập.' },
      { title: 'Dùng ảnh cho website', desc: 'Tệp ảnh nhỏ hơn có thể giúp giảm dung lượng tải trang; hiệu quả phụ thuộc cách website phân phối ảnh.' },
      { title: 'Xem trước kết quả', desc: 'So sánh dung lượng và kiểm tra chi tiết ảnh trước khi tải xuống.' },
    ],
    supportedFormatsDesc: 'Ảnh đầu vào cần được bộ xử lý ảnh chấp nhận; có thể chọn đầu ra JPG, PNG hoặc WebP.',
    faqList: [
      { q: 'Nén ảnh có làm mờ chi tiết không?', a: 'Tùy mức nén và định dạng đầu ra, chất lượng ảnh có thể thay đổi. Hãy xem trước kết quả trước khi tải xuống.' },
    ],
    relatedSlugs: ['/image-resizer', '/image-converter', '/remove-background', '/convert'],
  },

  '/image-resizer': {
    slug: '/image-resizer',
    category: 'image',
    badge: 'Đổi kích thước ảnh',
    title: 'Thay Đổi Kích Thước Ảnh (Resize) Chuẩn Pixel & Tỷ Lệ | One ForAll',
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
      { step: '01', title: 'Tải ảnh lên', desc: 'Chọn một hình ảnh mà bộ xử lý chấp nhận.' },
      { step: '02', title: 'Nhập chiều rộng hoặc chiều cao', desc: 'Nhập một hoặc cả hai kích thước bằng pixel. Khi chỉ nhập một chiều, chiều còn lại được tính theo tỷ lệ ảnh gốc.' },
      { step: '03', title: 'Điều chỉnh ảnh', desc: 'Công cụ thay đổi kích thước ảnh theo thông số bạn đã chọn.' },
      { step: '04', title: 'Tải ảnh vừa vặn', desc: 'Lưu ảnh kích thước chuẩn về máy để đăng bài ngay.' },
    ],
    features: [
      { title: 'Tính tỷ lệ khi nhập một chiều', desc: 'Nếu chỉ nhập chiều rộng hoặc chiều cao, chiều còn lại được tính theo tỷ lệ ảnh gốc.' },
      { title: 'Nhập kích thước tùy chỉnh', desc: 'Chọn chiều rộng và chiều cao phù hợp với nơi bạn sẽ dùng ảnh.' },
      { title: 'Điều chỉnh linh hoạt', desc: 'Chọn kích thước ảnh theo nhu cầu và kiểm tra kết quả trước khi lưu.' },
    ],
    supportedFormatsDesc: 'Ảnh đầu vào cần được bộ xử lý ảnh chấp nhận; có thể chọn đầu ra JPG, PNG hoặc WebP.',
    faqList: [
      { q: 'Làm sao để ảnh không bị méo khi đổi kích thước?', a: 'Chỉ nhập chiều rộng hoặc chiều cao để chiều còn lại được tính theo tỷ lệ ảnh gốc. Nếu nhập cả hai, ảnh sẽ được đổi đúng theo hai kích thước đó.' },
    ],
    relatedSlugs: ['/image-compressor', '/image-converter', '/remove-background', '/convert'],
  },

  '/data-converter': {
    slug: '/data-converter',
    category: 'data',
    badge: 'Chuyển đổi dữ liệu',
    title: 'Chuyển Đổi Định Dạng Dữ Liệu: JSON, YAML, XML, CSV | One ForAll',
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
      { step: '03', title: 'Chuyển đổi', desc: 'One ForAll đọc và viết lại dữ liệu sang định dạng bạn chọn.' },
      { step: '04', title: 'Tải kết quả', desc: 'Nhận tệp dữ liệu mới và dùng ngay cho code, bảng tính hoặc tài liệu.' },
    ],
    features: [
      { title: 'JSON ↔ YAML', desc: 'Chuyển hai chiều giữa JSON và YAML, giữ tiếng Việt và thứ tự khóa.' },
      { title: 'CSV ↔ JSON', desc: 'Biến bảng CSV thành record JSON để nạp vào ứng dụng, hoặc ngược lại.' },
      { title: 'Markdown ↔ HTML', desc: 'Kết xuất README thành HTML hoặc chuyển HTML thành Markdown dễ sửa.' },
    ],
    supportedFormatsDesc: 'JSON ↔ YAML, JSON ↔ XML, CSV → JSON/XLSX, JSON → CSV, TXT → MD, MD ↔ HTML, HTML → PDF.',
    faqList: [
      { q: 'XML sang JSON có giữ được attribute không?', a: 'Không. Bộ chuyển đổi hiện không đưa attribute XML vào JSON; kết quả phản ánh cấu trúc node và nội dung văn bản. Hãy kiểm tra kết quả trước khi dùng.' },
      { q: 'Tệp dữ liệu lớn có chuyển được không?', a: 'Tệp phải nằm trong giới hạn tải lên của gói sử dụng; dữ liệu quá lớn hoặc sai cấu trúc sẽ bị từ chối kèm thông báo lỗi.' },
    ],
    relatedSlugs: ['/convert', '/document-converter'],
  },

  '/archive-converter': {
    slug: '/archive-converter',
    category: 'archive',
    badge: 'Chuyển đổi tệp nén',
    title: 'Chuyển ZIP sang TAR hoặc 7Z và TAR sang ZIP | One ForAll',
    metaDescription:
      'Chuyển ZIP sang TAR hoặc 7Z, và TAR/TAR.GZ sang ZIP trực tuyến. 7Z và RAR không được hỗ trợ làm tệp đầu vào.',
    h1: 'Chuyển Đổi Định Dạng Tệp Nén Trực Tuyến',
    subtitle:
      'Chọn ZIP → TAR/7Z hoặc TAR/TAR.GZ → ZIP. Tệp 7Z và RAR hiện không phải định dạng đầu vào được hỗ trợ.',
    inputType: 'file',
    acceptedFileTypes: '.zip,.tar,.gz,.tgz',
    outputFormats: ['zip', 'tar', '7z'],
    defaultFormat: 'zip',
    backendType: 'convert_file',
    backendOperation: 'convert',
    howItWorksSteps: [
      { step: '01', title: 'Tải tệp nén lên', desc: 'Chọn tệp ZIP, TAR, TAR.GZ hoặc TGZ. ZIP là định dạng đầu vào duy nhất có thể xuất ra 7Z.' },
      { step: '02', title: 'Chọn định dạng đích', desc: 'Các lựa chọn khả dụng hiển thị theo loại tệp nguồn.' },
      { step: '03', title: 'Chuyển đổi an toàn', desc: 'One ForAll đọc và repack từng file bên trong, chặn đường dẫn độc hại và archive quá lớn.' },
      { step: '04', title: 'Tải tệp mới', desc: 'Nhận tệp nén ở định dạng mong muốn về máy.' },
    ],
    features: [
      { title: 'ZIP ↔ TAR', desc: 'Chuyển hai chiều giữa hai định dạng nén phổ biến trên Linux và Windows.' },
      { title: 'TAR.GZ sang ZIP', desc: 'Giải nén gzip rồi repack ZIP mà không cần thao tác tay.' },
      { title: 'ZIP sang 7Z', desc: 'Tạo bản archive 7Z từ các tệp trong archive ZIP.' },
    ],
    supportedFormatsDesc: 'ZIP → TAR hoặc 7Z; TAR và TAR.GZ (TGZ) → ZIP. 7Z và RAR không được hỗ trợ làm đầu vào.',
    faqList: [
      { q: 'Có chuyển được RAR hoặc 7Z sang ZIP không?', a: 'Không. Công cụ hiện nhận ZIP, TAR và TAR.GZ; chỉ ZIP có thể xuất ra 7Z.' },
      { q: 'Archive lớn có được hỗ trợ không?', a: 'Mỗi lần xử lý giới hạn tối đa 2.000 tệp và 512 MiB dữ liệu sau giải nén. Archive vượt giới hạn sẽ bị từ chối.' },
      { q: 'Tên và thư mục bên trong archive có được giữ không?', a: 'Tên đường dẫn của các tệp được repack khi định dạng hỗ trợ. Thư mục rỗng và metadata của archive có thể không được giữ.' },
    ],
    relatedSlugs: ['/convert'],
  },
}

export function canonicalToolPath(path: string): string {
  const suffixIndex = path.search(/[?#]/)
  const pathname = suffixIndex < 0 ? path : path.slice(0, suffixIndex)
  const suffix = suffixIndex < 0 ? '' : path.slice(suffixIndex)
  const localePrefix = pathname === '/en' || pathname.startsWith('/en/') ? '/en' : ''
  const routePath = localePrefix ? pathname.slice(3) || '/' : pathname
  const slug = routePath.replace(/\/+$/, '') || '/'

  return SEO_TOOLS[slug] ? `${localePrefix}${slug}/${suffix}` : path
}

export const ALL_TOOL_SLUGS = Object.keys(SEO_TOOLS)
