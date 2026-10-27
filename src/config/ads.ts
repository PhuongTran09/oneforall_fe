/** Cấu hình quảng cáo tập trung — chỗ duy nhất bật/tắt từng định dạng. */
const smartlinkUrl = import.meta.env.VITE_ADS_SMARTLINK_URL ?? ''
const socialBarSrc = import.meta.env.VITE_ADS_SOCIALBAR_SRC ?? ''
const popunderSrc = import.meta.env.VITE_ADS_POPUNDER_SRC ?? ''

export const ADS = {
  /** Smartlink opens a tab only after a valid processing or download action. */
  smartlink: {
    enabled: import.meta.env.VITE_ADS_SMARTLINK_ENABLED === 'true' && smartlinkUrl !== '',
    url: smartlinkUrl,
  },
  /** Social Bar: script bên thứ ba tự chèn thanh của nó vào document. */
  socialBar: {
    enabled: import.meta.env.VITE_ADS_SOCIALBAR_ENABLED === 'true' && socialBarSrc !== '',
    src: socialBarSrc,
  },
  /** Popunder stays disabled until publisher approval and live-domain testing; it opens tabs on normal clicks. */
  popunder: {
    enabled: import.meta.env.VITE_ADS_POPUNDER_ENABLED === 'true' && popunderSrc !== '',
    src: popunderSrc,
  },
} as const
