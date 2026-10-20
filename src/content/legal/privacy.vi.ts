import type { LegalDoc } from './types'

export const privacyVi: LegalDoc = {
  title: 'Chính sách quyền riêng tư',
  route: '/privacy',
  description: 'Thông tin về dữ liệu tài khoản, Google Sign-In, xử lý tệp, thời hạn lưu trữ và dịch vụ bên thứ ba của One ForAll.',
  lastUpdated: '20/10/2026',
  intro: 'One ForAll cung cấp các công cụ trực tuyến để xử lý liên kết media được hỗ trợ, chuyển đổi tệp và xử lý hình ảnh. Chính sách này mô tả dữ liệu được xử lý khi bạn sử dụng website và các công cụ đó.',
  sections: [
    {
      id: 'du-lieu-thu-thap',
      title: 'Dữ liệu tài khoản và cách sử dụng',
      blocks: [{ type: 'ul', items: [
        [{ b: 'Google Sign-In:' }, ' Google Sign-In được xử lý qua Supabase Auth. One ForAll sử dụng email được cung cấp trong quá trình đăng nhập để xác định tài khoản và hỗ trợ chức năng tài khoản.'],
        [{ b: 'Dữ liệu hồ sơ và phiên:' }, ' Supabase Auth duy trì phiên đăng nhập; hồ sơ tài khoản và quyền lợi được dùng để cung cấp chức năng tài khoản. Frontend không tự tạo cookie đăng nhập; Supabase client được cấu hình lưu bền phiên trong bộ nhớ trình duyệt. Google hoặc Supabase có thể dùng công nghệ lưu trữ riêng trong quá trình xác thực, theo chính sách của họ.'],
        [{ b: 'Dữ liệu tác vụ:' }, ' tệp đầu vào, kết quả, tên tệp, loại thao tác, tùy chọn, trạng thái và mốc thời gian có thể được xử lý để thực hiện tác vụ, hiển thị tiến trình và lịch sử. Với công cụ nhận liên kết, URL nguồn cũng được gửi đến dịch vụ One ForAll. Tác vụ đã đăng nhập có thể gắn với ID tài khoản; tác vụ ẩn danh dùng cơ chế phiên của dịch vụ.'],
        [{ b: 'Dữ liệu trình duyệt:' }, ' lựa chọn giao diện, ngôn ngữ, quyết định cookie/quảng cáo và một số trạng thái ứng dụng được lưu trong localStorage. Mã phiên tab và trạng thái khôi phục/hoàn tất thanh toán dùng sessionStorage. Tệp đang chọn và bản xem trước trong một số luồng được giữ trong bộ nhớ trình duyệt.'],
      ] }],
    },
    {
      id: 'google-api-muc-dich',
      title: 'Mục đích sử dụng Google API',
      blocks: [{ type: 'p', parts: ['Dịch vụ Google OAuth API được ứng dụng sử dụng duy nhất cho mục đích xác thực danh tính và hỗ trợ đăng nhập tài khoản an toàn. Chúng tôi tuân thủ nghiêm ngặt Chính sách dữ liệu người dùng của Google API Services (Google API Services User Data Policy). Dữ liệu truy cập qua Google API tuyệt đối không được dùng để huấn luyện các mô hình AI, không chia sẻ cho bên thứ ba và không dùng cho các mục đích vi phạm quy định an toàn.'] }],
    },
    {
      id: 'an-toan-su-dung',
      title: 'An toàn và sử dụng có trách nhiệm',
      blocks: [{ type: 'p', parts: ['One ForAll cung cấp các công cụ trực tuyến để tải liên kết media được hỗ trợ, chuyển đổi tệp và xử lý hình ảnh. Google Sign-In được dùng để xác thực người dùng và cung cấp các tính năng tài khoản được hỗ trợ.'] },
        { type: 'p', parts: ['One ForAll không sử dụng Google API để tạo, sinh hoặc phát tán hình ảnh thân mật cá nhân không có sự đồng thuận (NCII – non-consensual intimate imagery) do AI tạo ra. Nền tảng cấm việc tạo hoặc phát tán hình ảnh thân mật cá nhân không có sự đồng thuận.'] }],
    },
    {
      id: 'luu-tru-xoa-tep',
      title: 'Xử lý, lưu trữ và thời hạn tệp',
      blocks: [{ type: 'ul', items: [
        ['Tệp được gửi đến dịch vụ xử lý của One ForAll và được lưu tạm trong thời gian thực hiện tác vụ. Bản ghi tác vụ và lịch sử có thể được lưu riêng với nội dung tệp; nhà cung cấp lưu trữ cụ thể trong production chưa được xác minh.'],
        ['Theo thời hạn mặc định đang được cấu hình, kết quả hoàn tất được giữ 5 phút với gói Free và 12 giờ với gói Premium; tác vụ lỗi hoặc bị hủy dùng thời hạn mặc định 5 phút. Tiến trình dọn dẹp được lên lịch mỗi 5 phút, nên thời điểm xóa thực tế có thể trễ đến chu kỳ dọn dẹp kế tiếp. Cấu hình production có thể thay đổi các giá trị này và chưa được kiểm tra.'],
        ['URL tải kết quả được cấp cho tác vụ có thời hạn 3 phút. Đây là thời hạn của URL, khác với thời gian lưu tệp.'],
        ['Bản ghi lịch sử được giữ tối đa 7 ngày sau khi tệp kết quả hết hạn, sau đó bị xóa hẳn khỏi hệ thống. Việc dọn dẹp chạy mỗi 5 phút, nên thời điểm xóa thực tế có thể trễ đến chu kỳ kế tiếp.'],
      ] }],
    },
    {
      id: 'cookie-ben-thu-ba',
      title: 'Cookie và dịch vụ bên thứ ba',
      blocks: [{ type: 'ul', items: [
                ['Mã nguồn có tích hợp Google AdSense và script/liên kết đối tác. Các nội dung này phụ thuộc cấu hình và lựa chọn đồng ý quảng cáo; việc chúng có được bật trong cấu hình production hiện tại chưa được xác minh. Nếu được bật, nhà cung cấp tương ứng có thể xử lý dữ liệu theo chính sách riêng của họ.'],
        ['Giao diện lưu lựa chọn mục “analytics” trong thiết lập đồng ý. Không tìm thấy Google Analytics/GA4 hoặc SDK phân tích bên thứ ba trong frontend đã kiểm tra. Dịch vụ hiển thị số phiên đang hoạt động; không thể kết luận về log của hạ tầng hoặc dịch vụ ngoài repository.'],
              ] }],
    },
    {
      id: 'quyen-nguoi-dung',
      title: 'Yêu cầu truy cập, chỉnh sửa hoặc xóa dữ liệu',
      blocks: [{ type: 'p', parts: ['Bạn có thể gửi yêu cầu liên quan đến dữ liệu tài khoản qua ', { a: 'support@oneforall.io.vn', href: 'mailto:support@oneforall.io.vn' }, '. Website hiện không có chức năng tự xóa tài khoản. Chưa xác minh được quy trình hỗ trợ xóa tài khoản cùng toàn bộ dữ liệu liên quan. Vì vậy, việc gửi yêu cầu không đồng nghĩa với việc dữ liệu đã được xóa; chủ dịch vụ cần xác nhận và thực hiện quy trình này. Không gửi mật khẩu hoặc token đăng nhập qua email.'] }],
    },
    {
      id: 'bao-mat',
      title: 'Bảo mật',
      blocks: [{ type: 'p', parts: ['Website production được truy cập qua HTTPS và liên kết tải kết quả có thời hạn ngắn. Chúng tôi không đưa ra cam kết an toàn tuyệt đối. Để hỏi thêm về cách dữ liệu được bảo vệ, vui lòng liên hệ support.'] }],
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
