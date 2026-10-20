import type { LegalDoc } from './types'

export const termsVi: LegalDoc = {
  title: 'Điều khoản sử dụng',
  route: '/terms',
  description: 'Điều khoản sử dụng các công cụ trực tuyến One ForAll, trách nhiệm người dùng và giới hạn trách nhiệm.',
  lastUpdated: '21/10/2026',
  intro: 'Khi sử dụng One ForAll, bạn đồng ý tuân theo các quy định dưới đây. Vui lòng đọc kỹ phần trách nhiệm và nội dung bị cấm.',
  quickFactsTitle: 'Điều cần biết trước khi dùng',
  quickFacts: [
    { label: 'Bạn chịu trách nhiệm về tệp', text: 'Chỉ gửi hoặc chia sẻ nội dung mà bạn có quyền sử dụng.' },
    { label: 'Không dùng để xâm phạm', text: 'Cấm dùng công cụ ảnh cho nội dung đồi trụy, trái pháp luật hoặc xâm phạm riêng tư.' },
    { label: 'Tải kết quả về', text: 'Tệp và liên kết tải có thời hạn; đừng dùng dịch vụ làm nơi lưu trữ lâu dài.' },
  ],
  sections: [
    { id: 'pham-vi', title: 'Dịch vụ của One ForAll', blocks: [{ type: 'p', parts: ['One ForAll cung cấp công cụ xử lý một số liên kết media, chuyển đổi tệp và xử lý ảnh. Công cụ, định dạng và giới hạn sử dụng có thể khác nhau tùy tính năng và gói. Hãy xem thông tin trên trang công cụ và trang giá. Google Sign-In dùng để đăng nhập và truy cập chức năng tài khoản.'] }] },
    { id: 'trach-nhiem', title: 'Trách nhiệm của người dùng', blocks: [
      { type: 'p', parts: ['Bạn chịu trách nhiệm với nội dung mình gửi lên, xử lý, tải xuống hoặc chia sẻ. Chỉ thực hiện các thao tác mà bạn có quyền hợp pháp. Khi dùng công cụ qua liên kết, hãy tuân thủ pháp luật, bản quyền và điều khoản của nền tảng cung cấp nội dung.'] },
      { type: 'ul', items: [
        ['Không phát tán mã độc, tấn công hệ thống, lạm dụng tài nguyên hoặc tìm cách vượt qua biện pháp bảo vệ.'],
        ['Không xâm phạm quyền riêng tư hoặc tạo, chỉnh sửa, chia sẻ hình ảnh nhạy cảm của người khác khi chưa được đồng ý và chưa có quyền hợp pháp.'],
        ['Không tải, chuyển đổi hoặc chia sẻ nội dung trái với quyền của chủ sở hữu hoặc điều khoản của nền tảng nguồn.'],
      ] },
    ] },
    { id: 'an-toan-noi-dung', title: 'Nội dung bị cấm', tone: 'warning', blocks: [
      { type: 'p', parts: ['Nghiêm cấm lợi dụng các công cụ xử lý ảnh trên nền tảng để tải lên, chỉnh sửa hoặc phát tán hình ảnh đồi trụy, vi phạm pháp luật hoặc xâm phạm quyền riêng tư.'] },
    ] },
    { id: 'han-che-truy-cap', title: 'Khi nào quyền truy cập có thể bị hạn chế', blocks: [{ type: 'p', parts: ['Trong phạm vi pháp luật cho phép, One ForAll có thể từ chối, giới hạn hoặc tạm ngưng quyền truy cập nếu có căn cứ hợp lý cho thấy dịch vụ bị lạm dụng, có thể gây hại hoặc bị dùng trái với điều khoản.'] }] },
    { id: 'luu-tru', title: 'Tệp và kết quả tải xuống', blocks: [{ type: 'p', parts: ['Tệp và kết quả được lưu theo thời hạn của tác vụ và gói sử dụng. Liên kết tải có thời hạn riêng. Hãy xem thời hạn và giới hạn tại trang công cụ hoặc Chính sách quyền riêng tư. Tải kết quả về thiết bị nếu muốn giữ lại; One ForAll không phải nơi lưu trữ lâu dài.'] }] },
    { id: 'quang-cao-affiliate', title: 'Quảng cáo và liên kết ngoài', blocks: [{ type: 'p', parts: ['Website có thể hiển thị quảng cáo hoặc liên kết của đối tác tùy cấu hình và lựa chọn đồng ý quảng cáo. Khi truy cập trang hoặc giao dịch của bên thứ ba, chính sách của bên đó sẽ áp dụng.'] }] },
    { id: 'gioi-han', title: 'Giới hạn trách nhiệm', blocks: [{ type: 'p', parts: ['Dịch vụ được cung cấp theo hiện trạng và có thể thay đổi hoặc gián đoạn. Trong phạm vi pháp luật cho phép, One ForAll không chịu trách nhiệm về thiệt hại gián tiếp phát sinh từ việc bạn sử dụng hoặc không thể sử dụng dịch vụ. Điều khoản này không giới hạn trách nhiệm hoặc quyền mà pháp luật không cho phép giới hạn.'] }] },
    { id: 'thay-doi', title: 'Thay đổi điều khoản', blocks: [{ type: 'p', parts: ['Bản điều khoản hiện hành và ngày cập nhật được đăng trên trang này. Khi có thay đổi, hãy xem lại nội dung mới. Nếu pháp luật yêu cầu bạn chấp thuận riêng, dịch vụ sẽ yêu cầu sự chấp thuận đó.'] }] },
    { id: 'lien-he', title: 'Liên hệ', blocks: [{ type: 'p', parts: ['Gửi câu hỏi về điều khoản đến ', { a: 'support@oneforall.io.vn', href: 'mailto:support@oneforall.io.vn' }, '.'] }] },
  ],
}
