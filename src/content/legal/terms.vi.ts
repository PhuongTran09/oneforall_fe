import type { LegalDoc } from './types'

export const termsVi: LegalDoc = {
  title: 'Điều khoản sử dụng',
  route: '/terms',
  description: 'Quy định rõ cách dùng One ForAll, giới hạn tác vụ, thanh toán, thời hạn lưu tệp và cách gửi khiếu nại.',
  lastUpdated: '03/11/2026',
  intro: 'Điều khoản này giải thích cách sử dụng các công cụ và tính năng tài khoản của One ForAll. Khi bạn chọn đồng ý để tiếp tục, các điều khoản này sẽ được áp dụng.',
  quickFactsTitle: 'Điều cần biết trước khi dùng',
  quickFacts: [
    { label: 'Giới hạn tác vụ', text: 'Free: 1 tác vụ đang chờ hoặc xử lý trên mỗi địa chỉ mạng (IP). Pro: 3. Các tài khoản dùng chung IP cũng dùng chung giới hạn.' },
    { label: 'Thời hạn kết quả', text: 'Free: 5 phút; Pro: 24 giờ sau khi hoàn tất. Link tải có hiệu lực 3 phút.' },
    { label: 'Thanh toán Pro', text: 'Giá và thời hạn được hiển thị trước khi thanh toán. Gói không tự động gia hạn.' },
  ],
  sections: [
    {
      id: 'dich-vu',
      title: 'One ForAll cung cấp gì',
      blocks: [{ type: 'p', parts: ['One ForAll cung cấp công cụ xử lý một số liên kết media, chuyển đổi tệp và xử lý ảnh. Tính năng, định dạng, giới hạn dung lượng và gói có thể khác nhau; thông tin hiển thị tại công cụ và bước thanh toán là thông tin áp dụng cho yêu cầu đó. Google Sign-In dùng cho đăng nhập và tính năng tài khoản.'] }],
    },
    {
      id: 'tai-khoan-thanh-toan',
      title: 'Tài khoản và thanh toán',
      blocks: [{ type: 'ul', items: [
        ['Bạn cần cung cấp thông tin đăng nhập đúng và giữ an toàn cho tài khoản. Báo ngay cho support@oneforall.io.vn nếu nghi ngờ tài khoản bị truy cập trái phép.'],
        ['Gói Pro hiện được bán theo từng kỳ 30 ngày với mức giá hiển thị trước khi thanh toán (hiện tại: 45.000 VND). Thanh toán được xử lý qua SePay; gói chỉ kích hoạt sau khi giao dịch được xác nhận. Gói không tự động gia hạn; muốn tiếp tục, bạn cần thanh toán kỳ mới.'],
        ['Nếu bạn đang có Pro còn hiệu lực, hệ thống hiện không cho mua lại gói đó để cộng dồn thời hạn. Hãy kiểm tra trạng thái và ngày hết hạn trong tài khoản trước khi thanh toán.'],
        ['Nếu trang thanh toán bị hủy, hệ thống không ghi nhận khoản thanh toán. Nếu bị trừ tiền nhưng gói chưa kích hoạt, hoặc phát sinh giao dịch trùng/sai số tiền, gửi mã đơn hàng đến support@oneforall.io.vn để được đối soát. Điều khoản này không loại trừ quyền khiếu nại hoặc quyền lợi bắt buộc theo pháp luật.'],
      ] }],
    },
    {
      id: 'gioi-han-tac-vu',
      title: 'Giới hạn tác vụ theo IP',
      blocks: [{ type: 'ul', items: [
        ['Free: tối đa 1 tác vụ đang chờ hoặc đang xử lý trên mỗi địa chỉ mạng (IP). Pro: tối đa 3 tác vụ như vậy trên mỗi IP.'],
        ['Giới hạn này dùng chung cho mọi tài khoản trên cùng IP. Đổi hoặc tạo thêm tài khoản không làm tăng giới hạn. Gói của tài khoản gửi yêu cầu quyết định giới hạn áp dụng cho tác vụ mới.'],
        ['Tác vụ đã hoàn tất, bị lỗi, bị hủy hoặc hết hạn không tính là đang hoạt động. Nếu chạm giới hạn, yêu cầu mới sẽ bị từ chối và không tạo tác vụ.'],
      ] }],
    },
    {
      id: 'tep-va-ket-qua',
      title: 'Tệp, kết quả và thời hạn',
      blocks: [{ type: 'ul', items: [
        ['Bạn cần có quyền hợp pháp với tệp hoặc liên kết gửi lên. Hãy tải kết quả về thiết bị ngay khi sẵn sàng; One ForAll không phải nơi lưu trữ lâu dài.'],
        ['Kết quả hoàn tất được giữ mặc định 5 phút với Free và 24 giờ với Pro, tính từ lúc hoàn tất. Tác vụ lỗi hoặc bị hủy có thời hạn mặc định 5 phút.'],
        ['Hệ thống chạy dọn tệp mỗi 5 phút, nên tệp có thể bị xóa ở chu kỳ kế tiếp hoặc muộn hơn nếu thao tác xóa phải thử lại. Link tải có hiệu lực 3 phút và hết hạn độc lập với tệp.'],
        ['Lịch sử tác vụ có thể được giữ tối đa 7 ngày sau khi tệp hết hạn. Không gửi tệp chứa thông tin bí mật hoặc nhạy cảm nếu bạn không muốn gửi chúng đến dịch vụ để xử lý.'],
      ] }],
    },
    {
      id: 'trach-nhiem',
      title: 'Nội dung được phép và trách nhiệm của bạn',
      blocks: [{ type: 'ul', items: [
        ['Chỉ gửi, chuyển đổi hoặc chia sẻ nội dung bạn có quyền sử dụng; tuân thủ pháp luật, bản quyền và điều khoản của nền tảng nguồn.'],
        ['Không dùng dịch vụ để phát tán mã độc, tấn công hệ thống, vượt biện pháp bảo vệ, lạm dụng tài nguyên hoặc xâm phạm quyền riêng tư.'],
        ['Không tạo, chỉnh sửa hoặc phát tán hình ảnh thân mật của người khác khi không có sự đồng ý và căn cứ hợp pháp; không dùng công cụ ảnh cho nội dung bất hợp pháp hoặc xâm hại người khác.'],
        ['Bạn chịu trách nhiệm kiểm tra kết quả trước khi sử dụng hoặc chia sẻ. Kết quả phụ thuộc tệp nguồn, nền tảng bên ngoài và tùy chọn xử lý; One ForAll không bảo đảm kết quả luôn chính xác hoặc phù hợp với mọi mục đích.'],
      ] }],
    },
    {
      id: 'ben-thu-ba',
      title: 'Nền tảng và nhà cung cấp bên thứ ba',
      blocks: [{ type: 'p', parts: ['Công cụ qua liên kết phụ thuộc vào khả năng truy cập và điều khoản của nền tảng nguồn. Đăng nhập Google, thanh toán SePay, hạ tầng Cloudflare/Supabase và quảng cáo tùy chọn chịu thêm điều khoản/chính sách riêng của nhà cung cấp tương ứng. One ForAll không kiểm soát tính sẵn sàng hoặc chính sách của các dịch vụ đó.'] }],
    },
    {
      id: 'tam-ngung',
      title: 'Gián đoạn hoặc hạn chế truy cập',
      blocks: [{ type: 'p', parts: ['Dịch vụ có thể gián đoạn để bảo trì, xử lý lỗi hoặc bảo vệ hệ thống. Khi có căn cứ hợp lý về lạm dụng, vi phạm điều khoản hoặc nguy cơ an toàn, One ForAll có thể từ chối tác vụ hoặc tạm thời giới hạn truy cập. Nếu cho rằng quyết định bị nhầm, hãy liên hệ support@oneforall.io.vn để yêu cầu xem xét.'] }],
    },
    {
      id: 'khieu-nai-tranh-chap',
      title: 'Khiếu nại và tranh chấp',
      blocks: [{ type: 'p', parts: ['Gửi phản ánh, khiếu nại hoặc vấn đề thanh toán đến ', { a: 'support@oneforall.io.vn', href: 'mailto:support@oneforall.io.vn' }, ' và cung cấp mã tác vụ hoặc mã đơn hàng liên quan. Việc liên hệ hỗ trợ không làm mất quyền gửi khiếu nại đến cơ quan có thẩm quyền hoặc sử dụng phương thức giải quyết tranh chấp theo pháp luật.'] }],
    },
    {
      id: 'cap-nhat-va-don-vi',
      title: 'Thay đổi điều khoản và liên hệ',
      blocks: [{ type: 'ul', items: [
        ['Bản hiện hành và ngày cập nhật hiển thị ở đầu trang. Nếu thay đổi làm ảnh hưởng đáng kể quyền hoặc nghĩa vụ, One ForAll sẽ thông báo và xin chấp thuận lại khi pháp luật yêu cầu.'],
        ['Dịch vụ được giới thiệu dưới thương hiệu One ForAll. Liên hệ: support@oneforall.io.vn.'],
      ] }],
    },
  ],
}
