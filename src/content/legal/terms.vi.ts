import type { LegalDoc } from './types'

// Chỉnh sửa nội dung pháp lý: chỉ sửa file này (title/sections/lastUpdated).
// KHÔNG cần đụng component/trang hiển thị. Toàn bộ tiếng Việt.
export const termsVi: LegalDoc = {
  title: 'Điều khoản sử dụng',
  route: '/terms',
  description:
    'Điều khoản sử dụng nền tảng công cụ trực tuyến One ForAll: phạm vi áp dụng, trách nhiệm người dùng, giới hạn trách nhiệm.',
  // TODO(chủ dự án kiểm tra): ngày cập nhật là ngày viết lần đầu, sửa khi ban hành chính thức.
  lastUpdated: '12/10/2026',
  intro:
    'Văn bản này quy định quyền và nghĩa vụ khi bạn sử dụng các công cụ xử lý tệp và tải phương tiện trên One ForAll. Toàn bộ nội dung trình bày bằng tiếng Việt.',
  sections: [
    {
      id: 'pham-vi',
      title: 'Phạm vi áp dụng',
      blocks: [
        {
          type: 'p',
          parts: [
            'Điều khoản này áp dụng cho mọi lượt truy cập và sử dụng website One ForAll (các công cụ tải và xử lý phương tiện, chuyển đổi tệp trực tuyến). Khi bạn sử dụng dịch vụ, nghĩa là bạn đã đọc và đồng ý với các điều khoản dưới đây.',
          ],
        },
      ],
    },
    {
      id: 'dich-vu',
      title: 'Mô tả dịch vụ',
      blocks: [
        {
          type: 'p',
          parts: [
            'One ForAll cung cấp các công cụ xử lý tệp phía máy chủ: tải phương tiện từ liên kết công khai, chuyển đổi định dạng, nén, đổi kích thước và xử lý ảnh. Một số tính năng có thể yêu cầu đăng ký tài khoản hoặc thuộc gói trả phí theo bảng giá hiển thị trên website.',
          ],
        },
        {
          type: 'p',
          parts: [
            'Dịch vụ được cung cấp "nguyên trạng". Kết quả xử lý chỉ được lưu tạm thời và tự động xóa trong vài phút sau khi tác vụ kết thúc — bạn cần tải kết quả về máy trong thời gian hiển thị trên trang.',
          ],
        },
      ],
    },
    {
      id: 'trach-nhiem',
      title: 'Trách nhiệm của người dùng',
      blocks: [
        { type: 'p', parts: ['Bạn cam kết:'] },
        {
          type: 'ul',
          items: [
            ['Chỉ tải lên hoặc xử lý nội dung bạn có quyền sử dụng hợp pháp.'],
            [
              'Tuân thủ điều khoản và điều luật bản quyền của nền tảng nguồn (YouTube, TikTok...) khi sử dụng công cụ tải; trách nhiệm với nội dung tải về thuộc về bạn.',
            ],
            [
              'Không lợi dụng dịch vụ để phát tán mã độc, khai thác tài nguyên hoặc xử lý nội dung bị pháp luật cấm.',
            ],
          ],
        },
      ],
    },
    {
      id: 'quang-cao-affiliate',
      title: 'Quảng cáo và liên kết đối tác',
      blocks: [
        {
          type: 'p',
          parts: [
            'Website có thể hiển thị quảng cáo (Google AdSense) khi được bật và có thể mở liên kết của đối tác tiếp thị (affiliate) trong tab mới khi bạn bắt đầu xử lý một tác vụ hợp lệ. Việc bạn truy cập trang của bên thứ đó chịu sự điều chỉnh của chính sách riêng của họ; One ForAll không chịu trách nhiệm về nội dung, giao dịch trên các website bên thứ ba.',
          ],
        },
      ],
    },
    {
      id: 'gioi-han',
      title: 'Giới hạn trách nhiệm',
      blocks: [
        {
          type: 'p',
          parts: [
            'Trong phạm vi pháp luật cho phép, One ForAll không chịu trách nhiệm cho thiệt hại gián tiếp phát sinh từ việc sử dụng hoặc không thể sử dụng dịch vụ (mất tiện ích do quá tải, thay đổi API nền tảng nguồn...). Chúng tôi cố gắng giữ dịch vụ ổn định nhưng không cam kết thời gian hoạt động liên tục tuyệt đối.',
          ],
        },
      ],
    },
    {
      id: 'thay-doi',
      title: 'Thay đổi điều khoản',
      blocks: [
        {
          type: 'p',
          parts: [
            'Chúng tôi có thể cập nhật điều khoản này; phiên bản có hiệu lực là phiên bản hiển thị tại trang này kèm ngày cập nhật. Tiếp tục sử dụng dịch vụ sau khi điều khoản thay đổi nghĩa là bạn chấp nhận phiên bản mới.',
          ],
        },
      ],
    },
    {
      id: 'lien-he',
      title: 'Liên hệ',
      blocks: [
        {
          type: 'p',
          parts: [
            'Mọi thắc mắc về điều khoản sử dụng, vui lòng gửi email tới ',
            // TODO(chủ dự án kiểm tra): dùng email đã có trong Footer; xác nhận đây là email liên hệ chính thức.
            { a: 'support@oneforall.app', href: 'mailto:support@oneforall.app' },
            '.',
          ],
        },
      ],
    },
  ],
}
