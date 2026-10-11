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
  category: 'youtube' | 'tiktok' | 'convert' | 'image' | 'media' | 'document'
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
    badge: 'YouTube to MP4 HD',
    title: 'Tải Video YouTube sang MP4 Chất Lượng Cao Miễn Phí | OneForAll',
    metaDescription:
      'Công cụ chuyển đổi và tải video YouTube sang định dạng MP4 1080p, 720p trực tuyến miễn phí. Tốc độ cao, không cần cài đặt phần mềm, an toàn và bảo mật.',
    h1: 'Tải Video YouTube sang MP4 Nhanh Chóng',
    subtitle:
      'Chuyển đổi liên kết video YouTube thành tệp video MP4 chất lượng cao lưu về máy tính hoặc điện thoại trong vài giây.',
    inputType: 'url',
    urlPlatform: 'youtube',
    outputFormats: ['mp4', 'webm'],
    defaultFormat: 'mp4',
    backendType: 'media_url',
    backendOperation: 'url_download',
    howItWorksSteps: [
      { step: '01', title: 'Dán liên kết YouTube', desc: 'Sao chép đường dẫn video YouTube bạn muốn lưu và dán vào ô nhập liệu bên dưới.' },
      { step: '02', title: 'Chọn chất lượng MP4', desc: 'Hệ thống tự động phân tích và cho phép bạn lựa chọn định dạng MP4 độ nét cao.' },
      { step: '03', title: 'Xử lý qua FastAPI', desc: 'Backend Celery worker tiếp nhận và trích xuất luồng video với tốc độ cao.' },
      { step: '04', title: 'Tải về thiết bị', desc: 'Nhận tệp MP4 nguyên bản không dính watermark và lưu trữ tiện lợi.' },
    ],
    features: [
      { title: 'Tối ưu độ phân giải', desc: 'Hỗ trợ video MP4 chất lượng từ 720p đến 1080p tùy thuộc vào video gốc.' },
      { title: 'Không cần cài đặt', desc: 'Chạy trực tiếp trên trình duyệt Chrome, Safari, Edge mà không cần phần mềm phụ trợ.' },
      { title: 'Bảo mật quyền riêng tư', desc: 'Không lưu trữ lịch sử tải xuống cá nhân, liên kết tự hủy sau khi hoàn thành.' },
    ],
    supportedFormatsDesc: 'Hỗ trợ tất cả liên kết video YouTube chuẩn (watch?v=...), Shorts, và liên kết rút gọn youtu.be.',
    faqList: [
      { q: 'Công cụ có tải được video YouTube chất lượng 1080p không?', a: 'Có. Khi video gốc hỗ trợ 1080p, hệ thống sẽ tự động ghép kênh video và audio chất lượng cao nhất để xuất ra định dạng MP4 hoàn chỉnh.' },
      { q: 'Tôi có cần tạo tài khoản để tải YouTube MP4 không?', a: 'Không cần. OneForAll hỗ trợ chuyển đổi trực tiếp cho người dùng miễn phí mà không yêu cầu đăng nhập.' },
      { q: 'Chính sách bản quyền khi sử dụng công cụ như thế nào?', a: 'Công cụ chỉ hỗ trợ tải nội dung thuộc quyền sở hữu của bạn, video Creative Commons hoặc các nội dung được tác giả cho phép sử dụng hợp pháp.' },
    ],
    relatedSlugs: ['/youtube-to-mp3', '/youtube-downloader', '/tiktok-to-mp4', '/video-converter'],
  },

  '/youtube-to-mp3': {
    slug: '/youtube-to-mp3',
    category: 'youtube',
    badge: 'YouTube to MP3 Audio',
    title: 'Chuyển YouTube sang MP3 320kbps Trực Tuyến Miễn Phí | OneForAll',
    metaDescription:
      'Tách nhạc MP3 từ video YouTube nhanh nhất với chất lượng âm thanh 320kbps/192kbps. Miễn phí 100%, chuyển đổi tức thì không quảng cáo rác.',
    h1: 'Tách Nhạc YouTube sang MP3 Chất Lượng Cao',
    subtitle:
      'Chuyển đổi video âm nhạc, podcast hoặc bài giảng từ YouTube sang tệp âm thanh MP3 để nghe ngoại tuyến mọi lúc mọi nơi.',
    inputType: 'url',
    urlPlatform: 'youtube',
    outputFormats: ['mp3', 'wav', 'm4a'],
    defaultFormat: 'mp3',
    backendType: 'media_url',
    backendOperation: 'extract-audio',
    howItWorksSteps: [
      { step: '01', title: 'Sao chép link YouTube', desc: 'Copy link bài hát, podcast hoặc video cần tách âm thanh.' },
      { step: '02', title: 'Dán vào OneForAll', desc: 'Dán link vào ô tìm kiếm và bấm nút Tách nhạc MP3.' },
      { step: '03', title: 'Trích xuất âm thanh', desc: 'Hệ thống trích xuất audio stream và mã hóa sang bitrate tiêu chuẩn.' },
      { step: '04', title: 'Tải tệp âm thanh', desc: 'Lưu tệp MP3 về điện thoại hoặc máy tính để thưởng thức ngay.' },
    ],
    features: [
      { title: 'Chất lượng âm thanh trung thực', desc: 'Giữ nguyên tần số âm thanh gốc với bitrate lên tới 320kbps.' },
      { title: 'Tốc độ tách nhạc siêu tốc', desc: 'Nhờ kiến trúc backend bất đồng bộ, chỉ mất vài giây cho mỗi bài hát.' },
      { title: 'Tương thích mọi thiết bị', desc: 'Tệp MP3 tương thích hoàn hảo trên iPhone, Android, ô tô và máy nghe nhạc.' },
    ],
    supportedFormatsDesc: 'Định dạng âm thanh đầu ra: MP3, WAV, M4A, AAC. Tương thích toàn bộ video YouTube thông thường.',
    faqList: [
      { q: 'Âm thanh MP3 có bị nén giảm chất lượng không?', a: 'Hệ thống trích xuất luồng âm thanh tốt nhất có sẵn từ YouTube và đóng gói thành MP3 tiêu chuẩn phòng thu.' },
      { q: 'Có thể tách nhạc từ video YouTube Shorts không?', a: 'Có. Bạn chỉ cần sao chép link Shorts và dán vào công cụ như bình thường.' },
    ],
    relatedSlugs: ['/youtube-to-mp4', '/youtube-downloader', '/audio-converter', '/tiktok-to-mp3'],
  },

  '/youtube-downloader': {
    slug: '/youtube-downloader',
    category: 'youtube',
    badge: 'Universal YouTube Downloader',
    title: 'Trình Tải Video & Âm Thanh YouTube Toàn Diện | OneForAll',
    metaDescription:
      'Trình tải YouTube đa năng hỗ trợ tải video MP4, âm thanh MP3 chất lượng cao. Đơn giản, an toàn, không chứa phần mềm độc hại.',
    h1: 'Trình Tải YouTube Đa Năng Trực Tuyến',
    subtitle:
      'Nền tảng tải video và âm thanh YouTube tất-cả-trong-một. Hỗ trợ tùy chọn cả định dạng hình ảnh và âm thanh theo ý muốn.',
    inputType: 'url',
    urlPlatform: 'youtube',
    outputFormats: ['mp4', 'mp3', 'webm', 'wav'],
    defaultFormat: 'mp4',
    backendType: 'media_url',
    backendOperation: 'url_download',
    howItWorksSteps: [
      { step: '01', title: 'Nhập link video', desc: 'Dán link YouTube bất kỳ vào khung chuyển đổi.' },
      { step: '02', title: 'Chọn định dạng', desc: 'Chọn MP4 nếu muốn xem video, hoặc MP3 nếu chỉ cần nghe nhạc.' },
      { step: '03', title: 'Hệ thống xử lý', desc: 'Celery worker chuẩn bị tệp và tối ưu hóa dung lượng.' },
      { step: '04', title: 'Tải về an toàn', desc: 'Bấm nút tải về tệp tin trực tiếp từ Cloudflare R2 storage.' },
    ],
    features: [
      { title: 'Đa định dạng linh hoạt', desc: 'Tùy chọn tải video hoặc chỉ lấy âm thanh chỉ với một cú nhấp chuột.' },
      { title: 'Không giới hạn lượt tải', desc: 'Sử dụng miễn phí hàng ngày cho các nhu cầu học tập và công việc cá nhân.' },
      { title: 'Bảo vệ thiết bị', desc: 'Không pop-up quảng cáo độc hại, không yêu cầu cài extension.' },
    ],
    supportedFormatsDesc: 'Hỗ trợ MP4 (720p, 1080p), WebM, MP3 (128kbps, 320kbps), WAV.',
    faqList: [
      { q: 'Video tải về được lưu ở đâu?', a: 'Tệp sẽ tự động được lưu vào thư mục Downloads mặc định trên thiết bị của bạn.' },
      { q: 'Tại sao một số video tải chậm hơn?', a: 'Các video có thời lượng dài (trên 1 giờ) cần nhiều thời gian để ghép audio và video trên server trước khi tạo link tải.' },
    ],
    relatedSlugs: ['/youtube-to-mp4', '/youtube-to-mp3', '/tiktok-downloader', '/video-converter'],
  },

  '/tiktok-to-mp4': {
    slug: '/tiktok-to-mp4',
    category: 'tiktok',
    badge: 'TikTok No Watermark',
    title: 'Tải Video TikTok Không Logo (No Watermark) HD Miễn Phí | OneForAll',
    metaDescription:
      'Công cụ tải video TikTok không dính logo, không watermark chất lượng cao HD. Hỗ trợ lưu video TikTok MP4 trên iPhone, Android, PC nhanh chóng.',
    h1: 'Tải Video TikTok Không Dính Logo (No Watermark)',
    subtitle:
      'Lưu video TikTok yêu thích với chất lượng hình ảnh nguyên bản, loại bỏ logo che khuất nội dung hoàn toàn miễn phí.',
    inputType: 'url',
    urlPlatform: 'tiktok',
    outputFormats: ['mp4'],
    defaultFormat: 'mp4',
    backendType: 'media_url',
    backendOperation: 'url_download',
    howItWorksSteps: [
      { step: '01', title: 'Sao chép link TikTok', desc: 'Mở ứng dụng hoặc web TikTok, bấm nút Chia sẻ và chọn Sao chép liên kết.' },
      { step: '02', title: 'Dán vào OneForAll', desc: 'Dán URL TikTok vào ô bên dưới và bấm nút Tải video.' },
      { step: '03', title: 'Xử lý video sạch', desc: 'Hệ thống tự động loại bỏ watermark và nén tối ưu MP4.' },
      { step: '04', title: 'Lưu về máy', desc: 'Tải video độ nét cao về thư viện ảnh hoặc máy tính của bạn.' },
    ],
    features: [
      { title: 'Không dính logo TikTok', desc: 'Tệp video tải về sạch đẹp, không bị watermark chữ TikTok bay nhảy che màn hình.' },
      { title: 'Độ nét chuẩn Full HD', desc: 'Giữ nguyên độ sắc nét và tỷ lệ khung hình dọc 9:16 ban đầu của tác giả.' },
      { title: 'Hoạt động tốt trên iOS & Android', desc: 'Dễ dàng tải về thư viện máy mà không cần phần mềm thứ ba.' },
    ],
    supportedFormatsDesc: 'Hỗ trợ link TikTok dạng vm.tiktok.com, vt.tiktok.com và tiktok.com/@user/video/...',
    faqList: [
      { q: 'Làm thế nào để tải video TikTok trên iPhone?', a: 'Bạn dán link vào OneForAll trên Safari, bấm Tải về, sau đó mở tệp trong phần Tải về và chọn Lưu video vào thư viện Ảnh.' },
      { q: 'Tải video TikTok không logo có bị thu phí không?', a: 'Hoàn toàn miễn phí 100%, không giới hạn số lượng video tải.' },
    ],
    relatedSlugs: ['/tiktok-to-mp3', '/tiktok-downloader', '/youtube-to-mp4', '/video-converter'],
  },

  '/tiktok-to-mp3': {
    slug: '/tiktok-to-mp3',
    category: 'tiktok',
    badge: 'TikTok Audio Extractor',
    title: 'Tải Nhạc Chuông TikTok sang MP3 Nhanh Nhất | OneForAll',
    metaDescription:
      'Tách âm thanh và tải nhạc nền TikTok MP3 thịnh hành chất lượng cao. Lưu bài hát trending TikTok làm nhạc chuông điện thoại dễ dàng.',
    h1: 'Tách Nhạc Nền TikTok sang MP3 Chất Lượng Cao',
    subtitle:
      'Tách riêng đoạn nhạc thịnh hành, âm thanh lồng tiếng hoặc hiệu ứng độc đáo từ video TikTok thành tệp MP3 tiện dụng.',
    inputType: 'url',
    urlPlatform: 'tiktok',
    outputFormats: ['mp3', 'wav', 'm4a'],
    defaultFormat: 'mp3',
    backendType: 'media_url',
    backendOperation: 'extract-audio',
    howItWorksSteps: [
      { step: '01', title: 'Lấy link video TikTok', desc: 'Sao chép liên kết video có đoạn âm thanh bạn yêu thích.' },
      { step: '02', title: 'Dán link vào hệ thống', desc: 'Dán đường dẫn và chọn định dạng đầu ra MP3.' },
      { step: '03', title: 'Tách nhạc', desc: 'Thuật toán tách lấy luồng âm thanh gốc và chuẩn hóa bitrate.' },
      { step: '04', title: 'Tải về nghe thử', desc: 'Lưu tệp âm thanh về máy để làm nhạc chuông hoặc nghe offline.' },
    ],
    features: [
      { title: 'Bắt trọn âm thanh trending', desc: 'Lưu các bản phối remix, acoustic hoặc giọng đọc thịnh hành nhất TikTok.' },
      { title: 'Âm thanh trong trẻo', desc: 'Bộ lọc âm chuẩn hóa dải tần, loại bỏ tạp âm thừa.' },
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
    badge: 'All-in-One TikTok Tool',
    title: 'Trình Tải TikTok Toàn Diện: Video MP4 & Âm Thanh MP3 | OneForAll',
    metaDescription:
      'Trình tải TikTok đa năng tất-cả-trong-một. Tải video không logo hoặc tách âm thanh MP3 nhanh chóng, giao diện đơn giản thân thiện.',
    h1: 'Trình Tải Video & Âm Thanh TikTok Trực Tuyến',
    subtitle:
      'Giải pháp tải video và âm thanh từ mạng xã hội TikTok tiện lợi nhất trên trình duyệt. Không cần cài ứng dụng, an toàn tuyệt đối.',
    inputType: 'url',
    urlPlatform: 'tiktok',
    outputFormats: ['mp4', 'mp3'],
    defaultFormat: 'mp4',
    backendType: 'media_url',
    backendOperation: 'url_download',
    howItWorksSteps: [
      { step: '01', title: 'Sao chép URL', desc: 'Lấy link video từ ứng dụng TikTok hoặc trình duyệt web.' },
      { step: '02', title: 'Dán link', desc: 'Dán vào OneForAll và chọn tải video hoặc tải MP3.' },
      { step: '03', title: 'Xử lý dữ liệu', desc: 'Server phân tích và chuẩn bị tệp tải xuống an toàn.' },
      { step: '04', title: 'Nhận tệp', desc: 'Bấm nút Tải xuống để lưu tệp về máy tính hoặc điện thoại.' },
    ],
    features: [
      { title: 'Hai trong một tiện ích', desc: 'Vừa tải được video chất lượng cao không logo, vừa tách được nhạc nền.' },
      { title: 'Tốc độ cực nhanh', desc: 'Thời gian phân tích đường dẫn và hoàn tất chỉ trong 1-3 giây.' },
      { title: 'Tương thích đa nền tảng', desc: 'Sử dụng mượt mà trên iPhone, iPad, điện thoại Android, macOS và Windows.' },
    ],
    supportedFormatsDesc: 'Hỗ trợ định dạng video MP4 và định dạng âm thanh MP3.',
    faqList: [
      { q: 'Video tải về có dính ID người dùng trên video không?', a: 'Không, tính năng tự động loại bỏ watermark và ID chuyển động trên video.' },
      { q: 'Có giới hạn số lần tải TikTok mỗi ngày không?', a: 'Không có giới hạn số lần tải đối với các tác vụ hợp lệ.' },
    ],
    relatedSlugs: ['/tiktok-to-mp4', '/tiktok-to-mp3', '/youtube-downloader', '/video-converter'],
  },

  '/convert': {
    slug: '/convert',
    category: 'convert',
    badge: 'Universal Converter',
    title: 'Công Cụ Chuyển Đổi Định Dạng File Đa Năng Trực Tuyến | OneForAll',
    metaDescription:
      'Chuyển đổi file trực tuyến miễn phí: tài liệu Word, Excel, PDF, hình ảnh, video và âm thanh. Chỉ hiển thị định dạng đích mà hệ thống hỗ trợ cho tệp của bạn.',
    h1: 'Chuyển Đổi Định Dạng Tệp Đa Năng Trực Tuyến',
    subtitle:
      'Chuyển đổi qua lại giữa hình ảnh, video, âm thanh và tài liệu văn phòng chỉ trong vài bước đơn giản với tốc độ cực nhanh.',
    inputType: 'file',
    acceptedFileTypes:
      '.txt,.doc,.docx,.xlsx,.png,.jpg,.jpeg,.webp,.gif,.bmp,.tif,.tiff,.ico,.mp4,.webm,.mkv,.avi,.mov,.flv,.wmv,.mp3,.wav,.ogg,.flac,.aac,.m4a',
    outputFormats: [
      'pdf',
      'docx',
      'doc',
      'csv',
      'json',
      'png',
      'jpg',
      'webp',
      'svg',
      'mp4',
      'mov',
      'mkv',
      'webm',
      'avi',
      'mp3',
      'wav',
      'aac',
      'm4a',
      'flac',
      'ogg',
    ],
    defaultFormat: 'pdf',
    backendType: 'convert_file',
    backendOperation: 'convert',
    howItWorksSteps: [
      { step: '01', title: 'Tải tệp lên', desc: 'Kéo thả hoặc chọn tệp tin bất kỳ từ máy tính hoặc điện thoại của bạn.' },
      { step: '02', title: 'Chọn định dạng đích', desc: 'Chọn định dạng bạn muốn chuyển đổi sang (ví dụ: PDF, DOCX, WEBP...).' },
      { step: '03', title: 'Bắt đầu chuyển đổi', desc: 'Backend FastAPI xử lý chuyển đổi cấu trúc tệp an toàn và chính xác.' },
      { step: '04', title: 'Tải tệp kết quả', desc: 'Nhận tệp đã chuyển đổi và lưu về máy ngay lập tức.' },
    ],
    features: [
      { title: 'Tự động nhận diện nguồn', desc: 'Hệ thống tự động phát hiện định dạng tệp tải lên qua header signature.' },
      { title: 'Giữ trọn cấu trúc văn bản', desc: 'Đảm bảo bố cục bảng biểu, font chữ và hình ảnh không bị xô lệch.' },
      { title: 'Tự hủy sau khi tải', desc: 'Tệp tải lên và tệp kết quả được tự động dọn dẹp để đảm bảo bảo mật dữ liệu.' },
    ],
    supportedFormatsDesc:
      'Đích xuất được hỗ trợ: PDF, DOCX, DOC, CSV, JSON, PNG, JPG, WEBP, SVG, MP4, MOV, MKV, WEBM, AVI, MP3, WAV, AAC, M4A, FLAC, OGG.',
    faqList: [
      { q: 'Dung lượng tệp tối đa được phép chuyển đổi là bao nhiêu?', a: 'Hệ thống hỗ trợ tệp lên đến 50MB cho người dùng miễn phí và lên đến 2GB cho gói Professional.' },
      { q: 'Tệp của tôi có bị xem trộm không?', a: 'Tất cả quá trình chuyển đổi đều tự động hóa hoàn toàn trên worker cô lập, không ai có quyền truy cập vào nội dung tệp của bạn.' },
    ],
    relatedSlugs: ['/pdf-converter', '/document-converter', '/image-converter', '/video-converter'],
  },

  '/image-converter': {
    slug: '/image-converter',
    category: 'convert',
    badge: 'Image Format Converter',
    title: 'Chuyển Đổi Định Dạng Ảnh: PNG, JPG, WebP, GIF, BMP, SVG | OneForAll',
    metaDescription:
      'Chuyển đổi hình ảnh trực tuyến miễn phí giữa PNG, JPG, WebP, GIF, BMP, TIFF, ICO và xuất SVG từ PNG. Giữ nguyên độ phân giải và hỗ trợ ảnh trong suốt.',
    h1: 'Chuyển Đổi Định Dạng Hình Ảnh Trực Tuyến',
    subtitle:
      'Đổi định dạng ảnh sang WebP để tăng tốc website, hoặc chuyển sang PNG/JPG tương thích mọi phần mềm thiết kế.',
    inputType: 'file',
    acceptedFileTypes: '.png,.jpg,.jpeg,.webp,.gif,.bmp,.tif,.tiff,.ico',
    outputFormats: ['webp', 'png', 'jpg', 'svg'],
    defaultFormat: 'webp',
    backendType: 'convert_file',
    backendOperation: 'convert',
    howItWorksSteps: [
      { step: '01', title: 'Tải ảnh lên', desc: 'Chọn tệp PNG, JPG, WebP, GIF, BMP, TIFF hoặc ICO cần đổi định dạng.' },
      { step: '02', title: 'Chọn định dạng đích', desc: 'Lựa chọn định dạng đầu ra mong muốn như WebP, PNG, JPG hoặc SVG.' },
      { step: '03', title: 'Chuyển đổi pixel', desc: 'Công cụ render lại ma trận điểm ảnh với màu sắc chuẩn xác nhất.' },
      { step: '04', title: 'Tải ảnh mới', desc: 'Lưu ảnh thành phẩm đã tối ưu về máy tính.' },
    ],
    features: [
      { title: 'Tối ưu cho SEO web', desc: 'Chuyển ảnh sang chuẩn WebP giúp giảm đáng kể dung lượng tải trang web.' },
      { title: 'Đọc được ảnh đời cũ', desc: 'Ảnh GIF, BMP, TIFF và ICO đều chuyển được sang PNG, JPG hoặc WebP.' },
      { title: 'Hỗ trợ ảnh trong suốt', desc: 'Bảo toàn kênh alpha trong suốt (transparency) khi chuyển sang PNG hoặc WebP.' },
    ],
    supportedFormatsDesc: 'PNG, JPG, WEBP, GIF, BMP, TIFF, ICO → PNG, JPG, WEBP. Riêng PNG xuất thêm SVG.',
    faqList: [
      { q: 'Tại sao nên chuyển ảnh sang WebP?', a: 'WebP là định dạng ảnh hiện đại do Google phát triển, cho chất lượng tương đương JPG/PNG nhưng dung lượng nhẹ hơn đáng kể, giúp website tải nhanh hơn.' },
      { q: 'Ảnh nền trắng có bị đổi màu khi xuất JPG không?', a: 'Có thể. JPG không lưu vùng trong suốt nên nền trong suốt được tô trắng khi xuất ra JPG.' },
    ],
    relatedSlugs: ['/image-compressor', '/image-resizer', '/remove-background', '/convert'],
  },

  '/video-converter': {
    slug: '/video-converter',
    category: 'convert',
    badge: 'Video Transcoder',
    title: 'Chuyển Đổi Định Dạng Video: MP4, MOV, MKV, WebM, AVI | OneForAll',
    metaDescription:
      'Chuyển đổi video trực tuyến sang MP4, WebM, MKV, AVI nhanh chóng. Tối ưu bitrate, giảm kích thước tệp mà không giảm chất lượng.',
    h1: 'Chuyển Đổi Định Dạng Video Trực Tuyến',
    subtitle:
      'Chuyển đổi video linh hoạt sang MP4 tương thích mọi thiết bị di động, TV và mạng xã hội.',
    inputType: 'file',
    acceptedFileTypes: 'video/*',
    outputFormats: ['mp4', 'webm', 'mkv', 'avi', 'mov', 'mp3', 'jpg'],
    defaultFormat: 'mp4',
    backendType: 'convert_file',
    backendOperation: 'convert',
    howItWorksSteps: [
      { step: '01', title: 'Tải video lên', desc: 'Chọn tệp video từ máy tính (MP4, MOV, AVI, MKV, WMV...).' },
      { step: '02', title: 'Chọn định dạng', desc: 'Chọn MP4 chuẩn H.264 hoặc WebM tối ưu cho trình duyệt.' },
      { step: '03', title: 'Transcode video', desc: 'Hệ thống sử dụng FFmpeg xử lý luồng khung hình với tốc độ cao.' },
      { step: '04', title: 'Tải video kết quả', desc: 'Nhận video thành phẩm tương thích mọi trình phát đa phương tiện.' },
    ],
    features: [
      { title: 'Codec chuẩn H.264 / AAC', desc: 'Video đầu ra phát được mượt mà trên iPhone, Android, Smart TV và YouTube.' },
      { title: 'Nén kích thước tối ưu', desc: 'Giảm bớt dung lượng nặng nề của video gốc để dễ dàng gửi email hay upload.' },
      { title: 'Hỗ trợ tách tiếng và ảnh bìa', desc: 'Xuất trực tiếp sang MP3 để lấy âm thanh, hoặc sang JPG để lấy một khung hình làm ảnh bìa.' },
    ],
    supportedFormatsDesc: 'MP4, MOV, MKV, AVI, WEBM, FLV, WMV, M4V → MP4, MOV, MKV, WEBM, AVI, MP3, JPG.',
    faqList: [
      { q: 'Thời gian chuyển đổi video mất bao lâu?', a: 'Tùy thuộc vào thời lượng và độ phân giải của video, các video ngắn dưới 5 phút thường chỉ mất từ 10 đến 30 giây.' },
      { q: 'Xuất JPG từ video được gì?', a: 'Hệ thống tách một khung hình (mặc định ở giây thứ nhất) và lưu thành ảnh JPG, dùng làm thumbnail.' },
    ],
    relatedSlugs: ['/audio-converter', '/youtube-to-mp4', '/tiktok-to-mp4', '/convert'],
  },

  '/audio-converter': {
    slug: '/audio-converter',
    category: 'convert',
    badge: 'Audio Format Converter',
    title: 'Chuyển Đổi Âm Thanh: MP3, WAV, AAC, FLAC, M4A | OneForAll',
    metaDescription:
      'Chuyển đổi file âm thanh trực tuyến miễn phí giữa MP3, WAV, AAC, M4A, OGG, FLAC. Giữ nguyên chất lượng âm thanh gốc trung thực.',
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
      { step: '03', title: 'Xử lý audio', desc: 'Backend chuyển đổi tần số lấy mẫu và bitrate chuẩn xác.' },
      { step: '04', title: 'Tải về tệp mới', desc: 'Lưu tệp âm thanh đã tối ưu về máy tính.' },
    ],
    features: [
      { title: 'Bitrate cao lên tới 320kbps', desc: 'Đảm bảo dải âm trầm và âm cao không bị méo tiếng sau khi xuất file.' },
      { title: 'Hỗ trợ tệp ghi âm giọng nói', desc: 'Chuyển đổi định dạng m4a trên iPhone sang MP3 để nghe trên máy tính.' },
      { title: 'Nhanh chóng & bảo mật', desc: 'Quá trình chuyển đổi diễn ra tức thì trong vài giây.' },
    ],
    supportedFormatsDesc: 'MP3, WAV, AAC, M4A, FLAC, OGG.',
    faqList: [
      { q: 'Sự khác biệt giữa MP3 và WAV là gì?', a: 'WAV là định dạng không nén (lossless) giữ nguyên 100% chi tiết âm thanh nhưng dung lượng lớn. MP3 là định dạng nén tối ưu, dung lượng nhỏ gọn phù hợp nghe hàng ngày.' },
    ],
    relatedSlugs: ['/video-converter', '/youtube-to-mp3', '/tiktok-to-mp3', '/convert'],
  },

  '/document-converter': {
    slug: '/document-converter',
    category: 'document',
    badge: 'Document Office Suite',
    title: 'Chuyển Đổi Tài Liệu: Word, Excel, TXT, CSV, PDF | OneForAll',
    metaDescription:
      'Chuyển đổi tài liệu văn phòng trực tuyến miễn phí giữa Word (DOCX, DOC), Excel (XLSX), TXT, CSV, JSON và PDF. Giữ nguyên nội dung và bảng dữ liệu.',
    h1: 'Chuyển Đổi Tài Liệu Văn Phòng Trực Tuyến',
    subtitle:
      'Chuyển đổi linh hoạt giữa các định dạng tài liệu văn phòng phổ biến mà không làm sai lệch bảng biểu hay công thức.',
    inputType: 'file',
    acceptedFileTypes: '.doc,.docx,.txt,.xlsx',
    outputFormats: ['pdf', 'docx', 'doc', 'csv', 'json'],
    defaultFormat: 'pdf',
    backendType: 'convert_file',
    backendOperation: 'convert',
    howItWorksSteps: [
      { step: '01', title: 'Tải tài liệu lên', desc: 'Chọn tệp Word (DOCX, DOC), Excel (XLSX) hoặc văn bản TXT cần chuyển đổi.' },
      { step: '02', title: 'Chọn định dạng đích', desc: 'Chọn PDF để in ấn, DOCX để chỉnh sửa tiếp, hoặc CSV/JSON để xử lý dữ liệu.' },
      { step: '03', title: 'Chuyển đổi cấu trúc', desc: 'Hệ thống tự động biên dịch văn bản và bảng dữ liệu sang định dạng mới.' },
      { step: '04', title: 'Tải tài liệu hoàn chỉnh', desc: 'Nhận tệp văn bản mới sẵn sàng cho công việc và học tập.' },
    ],
    features: [
      { title: 'Giữ nguyên nội dung văn bản', desc: 'Đoạn văn, tiêu đề và danh sách được bảo toàn khi chuyển giữa TXT, DOCX và PDF.' },
      { title: 'Bảo toàn bảng biểu Excel', desc: 'Các ô dữ liệu trong file XLSX được chuyển chính xác sang CSV, JSON hoặc PDF.' },
      { title: 'Bảo mật tài liệu doanh nghiệp', desc: 'Tệp được xóa khỏi server sau khi phiên làm việc kết thúc.' },
    ],
    supportedFormatsDesc: 'DOCX, DOC, XLSX, TXT → PDF, DOCX, DOC, CSV, JSON.',
    faqList: [
      { q: 'Chuyển Word sang PDF có bị lỗi font tiếng Việt không?', a: 'Không. Hệ thống tích hợp bộ font Unicode tiêu chuẩn đầy đủ, đảm bảo tiếng Việt có dấu luôn hiển thị hoàn hảo.' },
      { q: 'Có chuyển file Excel sang JSON được không?', a: 'Có. Tệp XLSX có thể xuất sang JSON để đưa vào pipeline dữ liệu, hoặc sang CSV cho các công cụ bảng tính khác.' },
    ],
    relatedSlugs: ['/pdf-converter', '/convert', '/image-converter'],
  },

  '/pdf-converter': {
    slug: '/pdf-converter',
    category: 'document',
    badge: 'Docs To PDF',
    title: 'Chuyển Đổi Word, Excel, TXT Sang PDF Trực Tuyến Miễn Phí | OneForAll',
    metaDescription:
      'Chuyển đổi DOCX, DOC, XLSX và TXT sang PDF trực tuyến miễn phí. Giữ cấu trúc tài liệu, không cần cài phần mềm, tệp tự dọn sau khi tải.',
    h1: 'Chuyển Đổi Tài Liệu Sang PDF',
    subtitle:
      'Biến file Word (.docx, .doc), Excel (.xlsx) và văn bản (.txt) thành PDF để gửi đi, lưu trữ hoặc ký số — nhanh, không cần cài đặt.',
    inputType: 'file',
    acceptedFileTypes: '.doc,.docx,.txt,.xlsx',
    outputFormats: ['pdf'],
    defaultFormat: 'pdf',
    backendType: 'convert_file',
    backendOperation: 'convert',
    howItWorksSteps: [
      { step: '01', title: 'Tải tệp lên', desc: 'Chọn file Word, Excel hoặc văn bản TXT cần xuất ra PDF.' },
      { step: '02', title: 'Định dạng đích là PDF', desc: 'Mọi định dạng nguồn được hỗ trợ ở trên đều xuất ra PDF.' },
      { step: '03', title: 'Kết xuất PDF', desc: 'Backend đọc nội dung và dựng lại trang PDF kèm tiêu đề tài liệu.' },
      { step: '04', title: 'Tải PDF về', desc: 'Mở file PDF bằng bất kỳ trình đọc nào hoặc đính kèm vào email.' },
    ],
    features: [
      { title: 'Giữ cấu trúc văn bản', desc: 'Đoạn văn, tiêu đề và danh sách được dựng lại trong tài liệu PDF.' },
      { title: 'Xuất bảng tính có chọn sheet', desc: 'Chỉ định sheet cần kết xuất khi chuyển file Excel sang PDF.' },
      { title: 'Tự dọn sau khi tải', desc: 'Tệp nguồn và tệp kết quả bị xóa khỏi bộ lưu trữ tạm theo chính sách TTL của backend.' },
    ],
    supportedFormatsDesc: 'DOCX, DOC, XLSX, TXT → PDF.',
    faqList: [
      { q: 'Có chuyển được PDF sang Word không?', a: 'Chưa. Công cụ này chỉ nhận tài liệu và xuất ra PDF; chiều ngược lại cần phân tích bố cục trang nên chưa được triển khai.' },
      { q: 'File của tôi có bị lưu lại không?', a: 'Không. Tệp được xử lý trên worker cô lập và tự dọn khỏi bộ lưu trữ sau khi tải xong hoặc khi hết hạn.' },
    ],
    relatedSlugs: ['/document-converter', '/convert', '/image-converter'],
  },

  '/remove-background': {
    slug: '/remove-background',
    category: 'image',
    badge: 'AI Background Remover',
    title: 'Xóa Nền Ảnh Tự Động Trong Suốt (Remove BG) Miễn Phí | OneForAll',
    metaDescription:
      'Xóa nền ảnh trực tuyến bằng AI chỉ trong 3 giây. Tự động tách người, sản phẩm, xe cộ, xuất ảnh nền trong suốt PNG chất lượng cao.',
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
      { step: '02', title: 'AI phân tích chủ thể', desc: 'Thuật toán học sâu nhận diện đường viền chủ thể và tách nền ảnh.' },
      { step: '03', title: 'Xem trước so sánh', desc: 'Kiểm tra đường cắt giữa ảnh gốc và ảnh nền trong suốt.' },
      { step: '04', title: 'Tải ảnh PNG', desc: 'Lưu ảnh nền trong suốt để ghép vào banner thiết kế hoặc Shopee/Lazada.' },
    ],
    features: [
      { title: 'Tự động 100%', desc: 'Không cần dùng cọ vẽ thủ công, AI tự động tách nền ngay khi bạn tải ảnh lên.' },
      { title: 'Tách chi tiết phức tạp', desc: 'Xử lý mượt mà các chi tiết khó như tóc tơ, lông thú cưng và viền trong suốt.' },
      { title: 'Xuất ảnh PNG độ nét cao', desc: 'Giữ nguyên kích thước và độ sắc nét gốc của bức ảnh chụp.' },
    ],
    supportedFormatsDesc: 'PNG, JPG, JPEG, WEBP. Ảnh kết quả xuất ra định dạng PNG trong suốt.',
    faqList: [
      { q: 'Ảnh sau khi xóa nền có bị giảm độ phân giải không?', a: 'Hệ thống bảo toàn nguyên vẹn độ phân giải của hình ảnh ban đầu mà không thu nhỏ kích thước.' },
      { q: 'Công cụ có xử lý được ảnh chụp sản phẩm bán hàng không?', a: 'Rất thích hợp! Hầu hết người bán hàng dùng OneForAll để tách nền trắng sản phẩm đăng lên sàn TMĐT.' },
    ],
    relatedSlugs: ['/image-compressor', '/image-resizer', '/image-converter', '/convert'],
  },

  '/image-compressor': {
    slug: '/image-compressor',
    category: 'image',
    badge: 'Smart Image Compressor',
    title: 'Nén Dung Lượng Ảnh Online Giảm 80% Giữ Nguyên Độ Nét | OneForAll',
    metaDescription:
      'Nén ảnh JPG, PNG, WebP trực tuyến giảm dung lượng tối đa mà mắt thường không phân biệt được. Tăng tốc độ tải trang web hiệu quả.',
    h1: 'Nén Dung Lượng Hình Ảnh Thông Minh Trực Tuyến',
    subtitle:
      'Giảm dung lượng tệp hình ảnh lên đến 80% giúp tiết kiệm bộ nhớ, gửi email nhanh hơn và tối ưu điểm số Google PageSpeed.',
    inputType: 'file',
    acceptedFileTypes: 'image/*',
    outputFormats: ['webp', 'jpg', 'png'],
    defaultFormat: 'webp',
    backendType: 'image_process',
    backendOperation: 'compress',
    howItWorksSteps: [
      { step: '01', title: 'Tải ảnh cần nén', desc: 'Chọn tệp ảnh nặng (JPG, PNG, WebP) từ thư viện của bạn.' },
      { step: '02', title: 'Thuật toán nén thông minh', desc: 'Hệ thống loại bỏ dữ liệu metadata thừa và tối ưu hóa ma trận nén.' },
      { step: '03', title: 'Đánh giá tỷ lệ nén', desc: 'Xem số KB đã được tiết kiệm so với kích thước ban đầu.' },
      { step: '04', title: 'Lưu ảnh dung lượng nhẹ', desc: 'Tải ảnh siêu nhẹ về máy sẵn sàng sử dụng.' },
    ],
    features: [
      { title: 'Tỷ lệ nén cao vượt trội', desc: 'Giảm từ 60% đến 85% kích thước tệp mà mắt thường không nhận thấy sự khác biệt.' },
      { title: 'Tối ưu Google PageSpeed', desc: 'Giải pháp lý tưởng cho lập trình viên và chủ website cần tăng tốc độ web.' },
      { title: 'Xử lý cực nhanh', desc: 'Chỉ mất chưa tới 1 giây cho mỗi bức ảnh trên server FastAPI.' },
    ],
    supportedFormatsDesc: 'JPG, JPEG, PNG, WEBP, AVIF, GIF.',
    faqList: [
      { q: 'Nén ảnh có làm mờ chi tiết không?', a: 'Chúng tôi sử dụng thuật toán nén thông minh (lossy có chọn lọc) giữ lại trọn vẹn các dải màu và độ tương phản cần thiết.' },
    ],
    relatedSlugs: ['/image-resizer', '/image-converter', '/remove-background', '/convert'],
  },

  '/image-resizer': {
    slug: '/image-resizer',
    category: 'image',
    badge: 'Precision Image Resizer',
    title: 'Thay Đổi Kích Thước Ảnh (Resize) Chuẩn Pixel & Tỷ Lệ | OneForAll',
    metaDescription:
      'Đổi kích thước ảnh trực tuyến theo chiều rộng, chiều cao hoặc tỷ lệ phần trăm chuẩn xác. Đảm bảo ảnh không bị méo hình hay giảm nét.',
    h1: 'Thay Đổi Kích Thước Hình Ảnh Chuẩn Xác',
    subtitle:
      'Điều chỉnh kích thước ảnh pixel cho ảnh đại diện, banner Facebook, ảnh bìa YouTube hoặc hồ sơ cá nhân chỉ trong tích tắc.',
    inputType: 'file',
    acceptedFileTypes: 'image/*',
    outputFormats: ['jpg', 'png', 'webp'],
    defaultFormat: 'jpg',
    backendType: 'image_process',
    backendOperation: 'resize',
    howItWorksSteps: [
      { step: '01', title: 'Chọn ảnh cần đổi kích thước', desc: 'Tải lên hình ảnh bất kỳ từ thiết bị.' },
      { step: '02', title: 'Chọn kích thước mong muốn', desc: 'Chọn kích thước tiêu chuẩn (ví dụ 1200x630, 800x800, 1920x1080).' },
      { step: '03', title: 'Nội suy điểm ảnh', desc: 'Thuật toán Lanczos tái tạo các đường viền sắc sảo.' },
      { step: '04', title: 'Tải ảnh vừa vặn', desc: 'Lưu ảnh kích thước chuẩn về máy để đăng bài ngay.' },
    ],
    features: [
      { title: 'Khóa tỷ lệ khung hình', desc: 'Tự động tính toán chiều cao tương ứng với chiều rộng để tránh méo ảnh.' },
      { title: 'Sẵn các kích thước mạng xã hội', desc: 'Gợi ý kích thước chuẩn cho Facebook, Instagram, YouTube, TikTok.' },
      { title: 'Chất lượng điểm ảnh cao', desc: 'Sử dụng thuật toán nội suy nâng cao giúp ảnh sắc nét sau khi co giãn.' },
    ],
    supportedFormatsDesc: 'JPG, PNG, WEBP, AVIF, BMP.',
    faqList: [
      { q: 'Làm sao để ảnh không bị méo khi đổi kích thước?', a: 'Hệ thống mặc định giữ tỷ lệ khung hình (Aspect Ratio Lock). Khi bạn nhập chiều rộng, chiều cao sẽ tự động tính toán đồng bộ.' },
    ],
    relatedSlugs: ['/image-compressor', '/image-converter', '/remove-background', '/convert'],
  },
}

export const ALL_TOOL_SLUGS = Object.keys(SEO_TOOLS)
