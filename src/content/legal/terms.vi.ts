import type { LegalDoc } from './types'

export const termsVi: LegalDoc = {
  title: 'Điều khoản sử dụng',
  route: '/terms',
  description: 'Điều khoản sử dụng các công cụ trực tuyến One ForAll, trách nhiệm người dùng và giới hạn trách nhiệm.',
  lastUpdated: '18/10/2026',
  intro: 'Các điều khoản này áp dụng khi bạn truy cập One ForAll và sử dụng các công cụ trực tuyến của dịch vụ.',
  sections: [
    { id: 'pham-vi', title: 'Phạm vi và dịch vụ', blocks: [{ type: 'p', parts: ['One ForAll cung cấp công cụ xử lý liên kết media được hỗ trợ, chuyển đổi định dạng tệp, nén và thay đổi kích thước ảnh cùng một số thao tác hình ảnh khác. Công cụ và giới hạn khả dụng có thể khác nhau theo tính năng và gói; hãy tham khảo thông tin hiển thị tại công cụ và trang giá. Google Sign-In được cung cấp để xác thực và truy cập chức năng tài khoản.'] }] },
    { id: 'trach-nhiem', title: 'Trách nhiệm của người dùng', blocks: [
      { type: 'p', parts: ['Bạn chịu trách nhiệm về nội dung mình gửi, xử lý, tải xuống hoặc chia sẻ và cần có quyền hợp pháp để thực hiện các thao tác đó. Khi dùng công cụ theo liên kết, bạn cũng phải tuân thủ luật áp dụng, bản quyền và điều khoản của nền tảng nguồn.'] },
      { type: 'ul', items: [
        ['Không sử dụng dịch vụ để phát tán mã độc, tấn công hệ thống, lạm dụng tài nguyên hoặc vượt qua cơ chế bảo vệ.'],
        ['Không xâm phạm quyền riêng tư; không tạo, chỉnh sửa hoặc phân phối hình ảnh nhạy cảm của người khác khi chưa có sự đồng thuận và quyền hợp pháp.'],
        ['Không tải xuống, chuyển đổi hoặc phân phối nội dung vi phạm quyền của chủ sở hữu hoặc điều khoản nền tảng nguồn.'],
      ] },
    ] },
    { id: 'han-che-truy-cap', title: 'Hạn chế sử dụng', blocks: [{ type: 'p', parts: ['Trong phạm vi pháp luật cho phép, One ForAll có thể từ chối, giới hạn hoặc đình chỉ quyền truy cập khi có căn cứ hợp lý cho thấy dịch vụ bị lạm dụng, có nguy cơ gây hại hoặc bị sử dụng trái với các điều khoản này.'] }] },
    { id: 'luu-tru', title: 'Kết quả và lưu trữ', blocks: [{ type: 'p', parts: ['Tệp và kết quả được lưu theo thời hạn của tác vụ và gói sử dụng; URL tải có thời hạn riêng. Thời hạn, quy trình dọn dẹp và các giới hạn được mô tả tại công cụ và Chính sách quyền riêng tư. Không coi dịch vụ là nơi lưu trữ lâu dài; hãy tải kết quả cần giữ về thiết bị.'] }] },
    { id: 'quang-cao-affiliate', title: 'Quảng cáo và liên kết đối tác', blocks: [{ type: 'p', parts: ['Website có tích hợp Google AdSense và liên kết/script đối tác theo cấu hình; việc hiển thị có thể phụ thuộc vào thiết lập và lựa chọn đồng ý quảng cáo. Trang hoặc giao dịch tại bên thứ ba chịu sự điều chỉnh của chính sách bên đó.'] }] },
    { id: 'gioi-han', title: 'Giới hạn trách nhiệm', blocks: [{ type: 'p', parts: ['Dịch vụ được cung cấp theo hiện trạng và có thể gián đoạn hoặc thay đổi. Trong phạm vi pháp luật cho phép, One ForAll không chịu trách nhiệm đối với thiệt hại gián tiếp phát sinh từ việc sử dụng hoặc không thể sử dụng dịch vụ. Điều khoản này không loại trừ hoặc giới hạn trách nhiệm, quyền hay biện pháp khắc phục mà pháp luật bắt buộc không cho phép loại trừ hoặc giới hạn.'] }] },
    { id: 'thay-doi', title: 'Thay đổi điều khoản', blocks: [{ type: 'p', parts: ['Điều khoản hiện hành và ngày cập nhật được đăng trên trang này. Việc tiếp tục sử dụng sau khi điều khoản thay đổi được xem xét theo pháp luật áp dụng; nếu cần sự chấp thuận riêng, dịch vụ sẽ yêu cầu theo cách phù hợp.'] }] },
    { id: 'lien-he', title: 'Liên hệ', blocks: [{ type: 'p', parts: ['Gửi câu hỏi về điều khoản đến ', { a: 'support@oneforall.io.vn', href: 'mailto:support@oneforall.io.vn' }, '.'] }] },
  ],
}
