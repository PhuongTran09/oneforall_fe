import type { LegalDoc } from './types'

export const privacyVi: LegalDoc = {
  title: 'Chính sách quyền riêng tư',
  route: '/privacy',
  description: 'Dữ liệu One ForAll xử lý, nhà cung cấp nhận dữ liệu, thời hạn lưu tệp và cách thực hiện quyền của bạn.',
  lastUpdated: '03/11/2026',
  intro: 'Chính sách này giải thích One ForAll nhận những thông tin nào, dùng vào việc gì, giữ trong bao lâu và cách bạn gửi yêu cầu về dữ liệu.',
  quickFactsTitle: 'Tóm tắt trong 30 giây',
  quickFacts: [
    { label: 'Dữ liệu', text: 'Email tài khoản, thông tin tác vụ, tệp hoặc liên kết bạn gửi, dữ liệu thanh toán và thông tin kỹ thuật cần cho bảo mật.' },
    { label: 'Thời hạn tệp', text: 'Kết quả Free: 5 phút; Pro: 24 giờ. Kết quả lỗi/bị hủy: 5 phút. Dọn tệp chạy mỗi 5 phút.' },
    { label: 'Liên hệ', text: 'Gửi yêu cầu về dữ liệu đến support@oneforall.io.vn. Yêu cầu gửi đi chưa có nghĩa dữ liệu đã bị xóa.' },
  ],
  sections: [
    {
      id: 'don-vi-van-hanh',
      title: 'Về One ForAll',
      blocks: [{ type: 'p', parts: [
        'One ForAll là dịch vụ tại oneforall.io.vn. Nếu cần hỗ trợ hoặc muốn hỏi về thông tin của mình, bạn có thể liên hệ qua ',
        { a: 'support@oneforall.io.vn', href: 'mailto:support@oneforall.io.vn' },
        '.',
      ] }],
    },
    {
      id: 'du-lieu-muc-dich',
      title: 'Dữ liệu được xử lý và mục đích',
      blocks: [{ type: 'ul', items: [
        [{ b: 'Tài khoản:' }, ' email, tên/ảnh hồ sơ nếu Google cung cấp, mã tài khoản, trạng thái đăng nhập và gói dịch vụ. Dùng để xác thực, hiển thị hồ sơ và cấp quyền theo gói.'],
        [{ b: 'Tác vụ và tệp:' }, ' tệp đầu vào/đầu ra, tên và loại tệp, liên kết nguồn, tùy chọn xử lý, trạng thái và thời điểm. Dùng để chạy tác vụ, trả kết quả, hiển thị tiến trình và lịch sử. Tác vụ qua liên kết gửi URL nguồn đến máy chủ One ForAll để xử lý.'],
        [{ b: 'Thanh toán:' }, ' mã đơn hàng, gói, số tiền, trạng thái giao dịch và mã giao dịch do SePay trả về. Dùng để xác nhận thanh toán, kích hoạt gói và hỗ trợ đối soát.'],
        [{ b: 'Thông tin kết nối:' }, ' địa chỉ mạng (IP) và thông tin kết nối có thể được dùng để bảo vệ dịch vụ, ngăn lạm dụng và áp dụng giới hạn số tác vụ. Bản ghi tác vụ dùng mã nhận diện tạo từ IP để tính giới hạn.'],
        [{ b: 'Thông tin trên thiết bị:' }, ' lựa chọn ngôn ngữ/giao diện, phiên bản và lựa chọn điều khoản/cookie được lưu trong bộ nhớ trình duyệt. Một số tệp xem trước chỉ tồn tại trong bộ nhớ tạm của trình duyệt.'],
      ] }],
    },
    {
      id: 'nha-cung-cap',
      title: 'Nhà cung cấp và nơi xử lý dữ liệu',
      blocks: [{ type: 'ul', items: [
        ['Google và Supabase hỗ trợ đăng nhập; Supabase cũng lưu thông tin tài khoản cần cho dịch vụ.'],
        ['Cloudflare giúp bảo vệ kết nối. Một số tính năng có thể dùng Cloudflare để kiểm tra truy cập tự động hoặc lưu tệp kết quả.'],
        ['SePay xử lý trang thanh toán và thông tin cần để xác nhận giao dịch. Khi thanh toán, bạn cũng chịu chính sách của SePay và ngân hàng/đơn vị thanh toán liên quan. Không gửi mật khẩu ngân hàng, mã OTP hoặc thông tin đăng nhập cho One ForAll.'],
        ['Quảng cáo từ Google hoặc đối tác chỉ có thể xuất hiện khi tính năng được bật và bạn đồng ý. Các nhà cung cấp này có chính sách riêng. Hiện One ForAll chưa dùng công cụ phân tích của bên thứ ba; lựa chọn “phân tích” chỉ lưu trong trình duyệt.'],
        ['Một số nhà cung cấp có thể xử lý dữ liệu ngoài Việt Nam. Nơi xử lý cụ thể phụ thuộc nhà cung cấp và cách dịch vụ được cài đặt.'],
      ] }],
    },
    {
      id: 'luu-tru',
      title: 'Tệp được giữ trong bao lâu',
      blocks: [{ type: 'ul', items: [
        ['Tác vụ hoàn tất: kết quả được giữ mặc định 5 phút với Free và 24 giờ với Pro, tính từ lúc hoàn tất. Tác vụ lỗi hoặc bị hủy có thời hạn mặc định 5 phút.'],
        ['Tệp hết hạn được dọn theo chu kỳ 5 phút; vì vậy việc xóa có thể xảy ra ở chu kỳ kế tiếp, hoặc muộn hơn nếu thao tác xóa gặp lỗi và phải thử lại.'],
        ['Liên kết tải kết quả có hiệu lực 3 phút; đây là thời hạn riêng, ngắn hơn thời gian lưu tệp.'],
        ['Bản ghi lịch sử tác vụ được giữ tối đa 7 ngày sau khi tệp kết quả hết hạn rồi đưa vào lịch dọn. Hồ sơ tài khoản, gói và thanh toán không có thời hạn xóa tự động chung được thể hiện trong mã nguồn; chúng có thể cần được giữ để vận hành, hỗ trợ giao dịch hoặc đáp ứng nghĩa vụ pháp lý.'],
      ] }],
    },
    {
      id: 'cookie-quang-cao',
      title: 'Bộ nhớ trình duyệt, cookie và quảng cáo',
      blocks: [{ type: 'ul', items: [
        ['Trang lưu lựa chọn điều khoản và cookie trong bộ nhớ của trình duyệt trên thiết bị. Thông tin này có thể còn đó cho đến khi bạn xóa dữ liệu website trong trình duyệt.'],
        ['Bộ nhớ cần thiết hỗ trợ phiên và cài đặt. Lựa chọn quảng cáo/phân tích là tùy chọn; bạn có thể đổi tại “Cài đặt cookie” ở chân trang. Từ chối quảng cáo không làm mất chức năng xử lý tệp chính.'],
        ['Mã quảng cáo bên thứ ba chỉ được tải khi tính năng tương ứng được bật và lựa chọn quảng cáo cho phép. Tùy cấu hình, có thể gồm Google AdSense hoặc script đối tác.'],
        ['Lựa chọn phân tích hiện chưa kích hoạt công cụ phân tích bên thứ ba trong mã nguồn. Nếu thay đổi, One ForAll cần cập nhật thông báo và cách xin lựa chọn trước khi bật công cụ đó.'],
      ] }],
    },
    {
      id: 'quyen-du-lieu',
      title: 'Quyền của bạn và cách gửi yêu cầu',
      blocks: [{ type: 'ul', items: [
        ['Bạn có thể yêu cầu biết, truy cập, chỉnh sửa, cung cấp, xóa hoặc hạn chế/phản đối xử lý dữ liệu cá nhân theo pháp luật áp dụng; bạn cũng có thể rút lại sự đồng ý đã cấp. Việc rút lại không làm thay đổi tính hợp pháp của xử lý trước thời điểm rút.'],
        ['Gửi email đến support@oneforall.io.vn, nêu email tài khoản (nếu có), loại yêu cầu và thông tin đủ để xác minh bạn. Không gửi mật khẩu, OTP hoặc dữ liệu ngân hàng. Website hiện chưa có nút tự xóa tài khoản; gửi email không tự động xóa dữ liệu.'],
        ['Theo Điều 5 Nghị định 356/2025/NĐ-CP, hướng dẫn thủ tục được phản hồi trong 2 ngày làm việc. Thời hạn thực hiện tùy quyền: truy cập/chỉnh sửa/cung cấp 10 ngày (15 ngày nếu cần bên xử lý/bên thứ ba); rút đồng ý/hạn chế/phản đối 15 ngày (20 ngày nếu cần bên khác); xóa dữ liệu 20 ngày (30 ngày nếu cần bên khác). Gia hạn chỉ thực hiện khi pháp luật cho phép và có thông báo lý do.'],
        ['Một số thông tin có thể phải tiếp tục được giữ nếu pháp luật yêu cầu hoặc cần giải quyết giao dịch/tranh chấp. Nếu không thể đáp ứng toàn bộ yêu cầu, chúng tôi sẽ giải thích lý do và phạm vi có thể thực hiện.'],
      ] }],
    },
    {
      id: 'bao-mat-cap-nhat',
      title: 'Bảo mật và cập nhật',
      blocks: [{ type: 'p', parts: ['One ForAll sử dụng HTTPS và biện pháp kiểm soát truy cập phù hợp với chức năng dịch vụ. Không có hệ thống trực tuyến nào loại bỏ hoàn toàn rủi ro. Khi thay đổi cách xử lý dữ liệu, nhà cung cấp hoặc thời hạn lưu, chính sách này sẽ được cập nhật; ngày sửa đổi hiển thị ở đầu trang.'] }],
    },
    {
      id: 'lien-he',
      title: 'Liên hệ',
      blocks: [{ type: 'p', parts: ['Gửi câu hỏi, khiếu nại hoặc yêu cầu về dữ liệu đến ', { a: 'support@oneforall.io.vn', href: 'mailto:support@oneforall.io.vn' }, '.'] }],
    },
  ],
}
