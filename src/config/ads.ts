
const smartlinkUrl = import.meta.env.VITE_ADS_SMARTLINK_URL ?? ''
const socialBarSrc = import.meta.env.VITE_ADS_SOCIALBAR_SRC ?? ''
const popunderSrc = import.meta.env.VITE_ADS_POPUNDER_SRC ?? ''

export const ADS = {

  smartlink: {
    enabled: import.meta.env.VITE_ADS_SMARTLINK_ENABLED === 'true' && smartlinkUrl !== '',
    url: smartlinkUrl,
  },

  socialBar: {
    enabled: import.meta.env.VITE_ADS_SOCIALBAR_ENABLED === 'true' && socialBarSrc !== '',
    src: socialBarSrc,
  },

  popunder: {
    enabled: import.meta.env.VITE_ADS_POPUNDER_ENABLED === 'true' && popunderSrc !== '',
    src: popunderSrc,
  },
} as const
