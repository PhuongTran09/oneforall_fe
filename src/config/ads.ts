/**
 * Cấu hình quảng cáo tập trung — chỗ duy nhất bật/tắt từng định dạng.
 * URL/ID Adsterra giữ nguyên từng ký tự: đổi URL là đổi đối tượng thống kê của
 * publisher, nên không tham số hoá, không suy luận từ env.
 */
export const ADS = {
  /**
   * Smartlink: không có block quảng cáo nào trên trang; một tab tự mở khi người
   * dùng bấm "Bắt đầu xử lý"/"Bắt đầu tải" hợp lệ — cùng cách mở với tab affiliate.
   */
  smartlink: {
    enabled: import.meta.env.VITE_ADS_SMARTLINK_ENABLED === 'true',
    url: 'https://auctionr.org/4/c82d1249e94901fde16ea842607a4c49',
  },
  /** Social Bar: script bên thứ ba tự chèn thanh của nó vào document. */
  socialBar: {
    enabled: import.meta.env.VITE_ADS_SOCIALBAR_ENABLED === 'true',
    src: 'https://bauval.org/14/df18540f90166bd46c1f22815c909389',
  },
  /**
   * Popunder: mặc định TẮT. Đo 10/2026 trên chính script (87 KB) — nó bind
   * click/mousedown/mousemove/touchstart ở mức document, nên mọi cú nhấn
   * "Download"/"Start Processing" đều là trigger mở tab. Chỉ bật sau khi chủ
   * site xác nhận chính sách mạng quảng cáo cho phép và hành vi đã được kiểm
   * trên domain thật. Bật cờ một mình không có tác dụng: adScripts.ts không còn
   * hàm nạp popunder — phải cố tình viết lại điểm nạp mới chạy được.
   */
  popunder: {
    enabled: import.meta.env.VITE_ADS_POPUNDER_ENABLED === 'true',
    src: 'https://abscloud.org/1/19969e1bfc84e619ca2e34966319c39a',
  },
} as const
