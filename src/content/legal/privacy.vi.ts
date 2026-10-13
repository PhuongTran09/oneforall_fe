import type { LegalDoc } from './types'

// Chỉnh sửa nội dung pháp lý: chỉ sửa file này (title/sections/lastUpdated).
// Mô tả lưu trữ/xóa tệp phải khớp cơ chế thật của backend (TTL job, cycle cleanup, presign TTL).
export const privacyVi: LegalDoc = {
  title: 'Chính sách bảo mật',
  route: '/privacy',
  description:
    'Chính sách bảo mật của OneForAll: dữ liệu thu thập, cơ chế lưu trữ và tự động xóa tệp, cookie và dịch vụ bên thứ ba.',
  // TODO(chủ dự án kiểm tra): ngày cập nhật là ngày viết lần đầu, sửa khi ban hành chính thức.
  lastUpdated: '12/10/2026',
  intro:
    'Chính sách này mô tả những dữ liệu OneForAll xử lý, cách tệp được lưu tạm và tự động xóa theo đúng cơ chế vận hành thực tế của hệ thống.',
  sections: [
    {
      id: 'du-lieu-thu-thap',
      title: 'Dữ liệu chúng tôi xử lý',
      blocks: [
        {
          type: 'ul',
          items: [
            [
              { b: 'Tệp bạn tải lên và kết quả xử lý' },
              ': chỉ dùng để thực hiện tác vụ bạn yêu cầu.',
            ],
            [
              { b: 'Siêu dữ liệu tác vụ' },
              ': mã tác vụ, định dạng nguồn/đích, kích thước, trạng thái, thời điểm tạo và kết thúc.',
            ],
            [
              { b: 'Thông tin tài khoản (nếu bạn đăng ký)' },
              ': email đăng nhập — dùng cho đăng nhập và quản lý gói dịch vụ.',
            ],
            [
              { b: 'Dữ liệu trình duyệt' },
              ': giao diện sáng/tối bạn chọn được lưu trong localStorage của máy bạn để giữ sở thích giữa các lần truy cập.',
            ],
          ],
        },
      ],
    },
    {
      id: 'luu-tru-xoa-tep',
      title: 'Lưu trữ và xóa tệp (mô tả đúng hệ thống)',
      blocks: [
        {
          type: 'ul',
          items: [
            [
              'Tệp nguồn và kết quả được chứa tạm thời trên dịch vụ lưu trữ đối tượng và thư mục làm việc tạm của máy chủ xử lý; thư mục tạm được xóa ngay sau khi tác vụ kết thúc.',
            ],
            [
              'Sau khi tác vụ hoàn tất (hoặc thất bại), bản ghi và tệp của tác vụ hết hạn sau khoảng 3–5 phút và một tiến trình dọn dẹp tự động chạy mỗi 5 phút sẽ xóa tệp khỏi nơi lưu trữ rồi xóa siêu dữ liệu tương ứng.',
            ],
            [
              'Liên kết tải kết quả là liên kết ký sẵn có hiệu lực khoảng 15 phút; hết hiệu lực bạn cần quay lại trang xử lý.',
            ],
            [
              'Trong phiên làm việc, ảnh/file bạn đã chọn và kết quả gần nhất được giữ trong bộ nhớ trình duyệt để phục hồi khi bạn chuyển tab trong site; dữ liệu này không được ghi ra đĩa và mất khi bạn đóng tab hoặc bấm Đặt lại.',
            ],
          ],
        },
        {
          type: 'p',
          parts: [
            'Vì vậy hãy tải kết quả về máy ngay khi hoàn tất — chúng tôi không lưu kho dài hạn nội dung của bạn và cũng không thể khôi phục tệp sau khi thời hạn dọn dẹp đi qua.',
          ],
        },
      ],
    },
    {
      id: 'cookie-bên-thứ-ba',
      title: 'Cookie và dịch vụ bên thứ ba',
      blocks: [
        {
          type: 'ul',
          items: [
            [
              { b: 'Đăng nhập' },
              ': phiên đăng ký/đăng nhập được vận hành qua dịch vụ xác thực Supabase; cookie/localStorage của phiên do dịch vụ này quản lý theo chính sách của họ.',
            ],
            [
              { b: 'Quảng cáo' },
              ': khi quảng cáo Google AdSense được bật, Google có thể sử dụng cookie để phân phối quảng cáo theo chính sách của Google.',
            ],
            [
              { b: 'Liên kết đối tác' },
              ': site có thể mở trang của đối tác tiếp thị trong tab mới; việc thu thập dữ liệu trên trang đó do bên thứ ba điều chỉnh.',
            ],
          ],
        },
      ],
    },
    {
      id: 'bang-chung',
      title: 'Cam kết không tự ý sử dụng nội dung',
      blocks: [
        {
          type: 'p',
          parts: [
            'Tệp của bạn chỉ được xử lý để trả về đúng kết quả bạn yêu cầu. Chúng tôi không bán nội dung tệp của người dùng.',
          ],
        },
      ],
    },
    {
      id: 'bao-mat',
      title: 'Bảo mật',
      blocks: [
        {
          type: 'p',
          parts: [
            'Toàn bộ trao đổi giữa trình duyệt và máy chủ dùng HTTPS; liên kết kết quả có chữ ký hết hạn ngắn để chặn truy cập từ ngoài. Tuy nhiên, không hệ thống nào bảo mật tuyệt đối 100% — bạn không nên tải lên nội dung mà việc rò rỉ sẽ gây thiệt hại nghiêm trọng.',
          ],
        },
      ],
    },
    {
      id: 'thay-doi-chinh-sach',
      title: 'Thay đổi chính sách',
      blocks: [
        {
          type: 'p',
          parts: [
            'Phiên bản có hiệu lực là bản hiển thị tại trang này kèm ngày cập nhật. Nếu có thay đổi đáng kể ảnh hưởng đến quyền lợi của bạn, chúng tôi sẽ thông báo trên website trước khi áp dụng.',
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
            'Yêu cầu về quyền riêng tư vui lòng gửi tới ',
            // TODO(chủ dự án kiểm tra): dùng email đã có trong Footer; xác nhận đây là email liên hệ chính thức.
            { a: 'support@oneforall.io.vn', href: 'https://mail.google.com/mail/?view=cm&fs=1&to=support@oneforall.io.vn&su=Ho%20tro%20OneForAll' },
            '.',
          ],
        },
      ],
    },
  ],
}
