/**
 * Cấu hình quảng cáo tập trung — chỗ duy nhất bật/tắt từng định dạng.
 * URL Adsterra đọc từ env như VITE_AFFILIATE_URL. Env rỗng = định dạng đó TẮT:
 * openSmartlinkTab không kiểm tra url, còn đổi URL là đổi đối tượng thống kê của
 * publisher — giá trị thật vì thế nằm trong env của nơi deploy, không nằm trong code.
 */
const smartlinkUrl = import.meta.env.VITE_ADS_SMARTLINK_URL ?? ''
const socialBarSrc = import.meta.env.VITE_ADS_SOCIALBAR_SRC ?? ''
const popunderSrc = import.meta.env.VITE_ADS_POPUNDER_SRC ?? ''

export const ADS = {
  /**
   * Smartlink: không có block quảng cáo nào trên trang; một tab tự mở khi người
   * dùng bấm "Bắt đầu xử lý"/"Bắt đầu tải" hợp lệ — cùng cách mở với tab affiliate.
   */
  smartlink: {
    enabled: import.meta.env.VITE_ADS_SMARTLINK_ENABLED === 'true' && smartlinkUrl !== '',
    url: smartlinkUrl,
  },
  /** Social Bar: script bên thứ ba tự chèn thanh của nó vào document. */
  socialBar: {
    enabled: import.meta.env.VITE_ADS_SOCIALBAR_ENABLED === 'true' && socialBarSrc !== '',
    src: socialBarSrc,
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
    enabled: import.meta.env.VITE_ADS_POPUNDER_ENABLED === 'true' && popunderSrc !== '',
    src: popunderSrc,
  },
} as const
