import type { LegalDoc } from './types'

export const privacyVi: LegalDoc = {
  title: 'Chính sách quyền riêng tư',
  route: '/privacy',
  description: 'Thông tin về dữ liệu tài khoản, Google Sign-In, xử lý tệp, thời hạn lưu trữ và dịch vụ bên thứ ba của One ForAll.',
  lastUpdated: '21/10/2026',
  intro: 'Trang này giải thích One ForAll dùng thông tin và tệp bạn gửi như thế nào, tệp được lưu trong bao lâu và cách liên hệ nếu bạn muốn hỏi về dữ liệu của mình.',
  quickFactsTitle: 'Nắm nhanh',
  quickFacts: [
    { label: 'Tệp bạn gửi', text: 'Tệp được gửi đến hệ thống để thực hiện tác vụ bạn chọn.' },
    { label: 'Thời hạn lưu', text: 'Thời hạn mặc định khác nhau theo gói và loại tác vụ; thời hạn thực tế có thể thay đổi.' },
    { label: 'Yêu cầu xóa dữ liệu', text: 'Liên hệ hỗ trợ. Hãy chờ xác nhận vì gửi yêu cầu chưa có nghĩa là dữ liệu đã được xóa.' },
  ],
  sections: [
    {
      id: 'du-lieu-thu-thap',
      title: 'Dữ liệu tài khoản và cách sử dụng',
      blocks: [{ type: 'ul', items: [
        [{ b: 'Đăng nhập bằng Google:' }, ' Supabase Auth xử lý việc đăng nhập. One ForAll dùng email bạn cung cấp để nhận diện tài khoản và cung cấp các chức năng tài khoản.'],
        [{ b: 'Tài khoản và phiên đăng nhập:' }, ' Supabase Auth duy trì phiên đăng nhập. Hồ sơ và thông tin gói được dùng cho chức năng tài khoản. Trình duyệt lưu một số trạng thái ứng dụng; Google hoặc Supabase cũng có thể dùng công nghệ lưu trữ riêng theo chính sách của họ.'],
        [{ b: 'Tệp và tác vụ:' }, ' hệ thống có thể xử lý tệp đầu vào, kết quả, tên tệp, loại thao tác, tùy chọn, trạng thái và thời gian để chạy tác vụ, hiển thị tiến trình và lịch sử. Nếu bạn dùng công cụ qua liên kết, URL nguồn cũng được gửi đến dịch vụ One ForAll. Tác vụ khi đăng nhập có thể gắn với ID tài khoản; tác vụ không đăng nhập dùng phiên của dịch vụ.'],
        [{ b: 'Thông tin lưu trên thiết bị:' }, ' giao diện, ngôn ngữ, lựa chọn cookie/quảng cáo và một số trạng thái ứng dụng được lưu trong trình duyệt. Tệp bạn đang chọn và bản xem trước trong một số luồng chỉ được giữ trong bộ nhớ trình duyệt.'],
      ] }],
    },
    {
      id: 'google-api-muc-dich',
      title: 'Mục đích sử dụng Google API',
      blocks: [{ type: 'p', parts: ['One ForAll dùng Google OAuth để xác minh danh tính và hỗ trợ đăng nhập. Dữ liệu nhận qua Google API không được dùng để huấn luyện mô hình AI, không chia sẻ với bên thứ ba và không dùng cho mục đích vi phạm quy định an toàn. Việc xử lý dữ liệu tuân theo Chính sách dữ liệu người dùng của Google API Services.'] }],
    },
    {
      id: 'an-toan-su-dung',
      title: 'An toàn và sử dụng có trách nhiệm',
      tone: 'warning',
      blocks: [{ type: 'p', parts: ['One ForAll có các công cụ xử lý liên kết media được hỗ trợ, chuyển đổi tệp và xử lý ảnh. Google Sign-In chỉ dùng để xác minh danh tính và hỗ trợ chức năng tài khoản.'] },
        { type: 'p', parts: ['Không được dùng dịch vụ để tạo hoặc phát tán hình ảnh thân mật của người khác khi chưa có sự đồng thuận. One ForAll không dùng Google API để tạo, sinh hoặc phát tán loại hình ảnh này.'] }],
    },
    {
      id: 'luu-tru-xoa-tep',
      title: 'Xử lý, lưu trữ và thời hạn tệp',
      blocks: [{ type: 'ul', items: [
        ['Tệp được gửi đến hệ thống One ForAll để xử lý và được lưu tạm trong lúc tác vụ chạy. Thông tin tác vụ và lịch sử có thể được lưu riêng với nội dung tệp. Chính sách này không nêu tên nhà cung cấp lưu trữ.'],
        ['Thời hạn mặc định hiện được ghi nhận là 5 phút với gói Free và 12 giờ với gói Pro. Tác vụ lỗi hoặc bị hủy có thời hạn mặc định 5 phút. Hệ thống dọn dẹp theo chu kỳ 5 phút, nên tệp có thể được xóa ở chu kỳ kế tiếp. Thời hạn thực tế có thể khác theo cấu hình vận hành.'],
        ['Liên kết tải kết quả có hiệu lực 3 phút. Thời hạn của liên kết khác với thời gian lưu tệp.'],
        ['Lịch sử tác vụ được giữ tối đa 7 ngày sau khi tệp kết quả hết hạn. Sau đó, lịch sử được lên lịch xóa; việc xóa thực tế có thể trễ đến chu kỳ dọn dẹp 5 phút kế tiếp.'],
      ] }],
    },
    {
      id: 'cookie-ben-thu-ba',
      title: 'Cookie và dịch vụ bên thứ ba',
      blocks: [{ type: 'ul', items: [
        ['Website có thể hiển thị quảng cáo Google AdSense và nội dung từ đối tác, tùy cấu hình và lựa chọn đồng ý quảng cáo. Nếu các dịch vụ này được bật, nhà cung cấp tương ứng có thể xử lý dữ liệu theo chính sách riêng.'],
        ['Trong cài đặt cookie có lựa chọn “phân tích”. Hiện chưa thấy Google Analytics/GA4 hoặc công cụ phân tích bên thứ ba trong giao diện website. Website có hiển thị số phiên đang hoạt động; cách nhà cung cấp hạ tầng lưu nhật ký kỹ thuật phụ thuộc vào chính sách của họ.'],
              ] }],
    },
    {
      id: 'quyen-nguoi-dung',
      title: 'Yêu cầu truy cập, chỉnh sửa hoặc xóa dữ liệu',
      blocks: [{ type: 'p', parts: ['Để hỏi về dữ liệu hoặc yêu cầu xóa tài khoản, hãy email ', { a: 'support@oneforall.io.vn', href: 'mailto:support@oneforall.io.vn' }, '. Website hiện chưa có nút tự xóa tài khoản. Gửi email chưa tự động xóa dữ liệu; hãy chờ phản hồi xác nhận cách xử lý yêu cầu. Không gửi mật khẩu hoặc mã đăng nhập qua email.'] }],
    },
    {
      id: 'bao-mat',
      title: 'Bảo mật',
      blocks: [{ type: 'p', parts: ['Website sử dụng HTTPS và liên kết tải kết quả có thời hạn ngắn. Không có hệ thống nào có thể bảo đảm an toàn tuyệt đối. Nếu có câu hỏi về cách bảo vệ dữ liệu, hãy liên hệ bộ phận hỗ trợ.'] }],
    },
    {
      id: 'thay-doi-chinh-sach',
      title: 'Thay đổi chính sách',
      blocks: [{ type: 'p', parts: ['Phiên bản hiện hành và ngày cập nhật được hiển thị trên trang này. Nếu chính sách thay đổi, hãy xem lại nội dung được đăng tại đây.'] }],
    },
    {
      id: 'lien-he',
      title: 'Liên hệ',
      blocks: [{ type: 'p', parts: ['Gửi câu hỏi về quyền riêng tư đến ', { a: 'support@oneforall.io.vn', href: 'mailto:support@oneforall.io.vn' }, '.'] }],
    },
  ],
}
