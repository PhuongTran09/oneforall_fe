import type { LegalDoc } from './types'

// To edit legal content: edit only this file (title/sections/lastUpdated).
// No need to touch the display component or page. Entirely in English.
export const termsEn: LegalDoc = {
  title: 'Terms of Use',
  route: '/en/terms',
  description:
    'Terms of use for the OneForAll online tools platform: scope of application, user responsibilities, limitation of liability.',
  // TODO (project owner to verify): lastUpdated is the first-draft date; update it upon official publication.
  lastUpdated: '12/10/2026',
  intro:
    'This document sets out your rights and obligations when you use the file processing and media download tools on OneForAll. The entire content is presented in English.',
  sections: [
    {
      id: 'pham-vi',
      title: 'Scope of Application',
      blocks: [
        {
          type: 'p',
          parts: [
            'These Terms apply to all access to and use of the OneForAll website (media download and processing tools, online file conversion). By using the service, you are deemed to have read and agreed to the terms below.',
          ],
        },
      ],
    },
    {
      id: 'dich-vu',
      title: 'Service Description',
      blocks: [
        {
          type: 'p',
          parts: [
            'OneForAll provides server-side file processing tools: downloading media from public links, converting file formats, compressing, resizing, and processing images. Some features may require account registration or belong to a paid plan according to the pricing shown on the website.',
          ],
        },
        {
          type: 'p',
          parts: [
            'The service is provided "as is". Processing results are stored only temporarily and automatically deleted within a few minutes after the task finishes — you must download the results to your device within the time indicated on the page.',
          ],
        },
      ],
    },
    {
      id: 'trach-nhiem',
      title: 'User Responsibilities',
      blocks: [
        { type: 'p', parts: ['You undertake to:'] },
        {
          type: 'ul',
          items: [
            ['Upload or process only content that you have the legal right to use.'],
            [
              'Comply with the terms and copyright rules of the source platform (YouTube, TikTok, etc.) when using the download tools; responsibility for the downloaded content lies with you.',
            ],
            [
              'Refrain from abusing the service to distribute malware, exploit resources, or process content prohibited by law.',
            ],
          ],
        },
      ],
    },
    {
      id: 'quang-cao-affiliate',
      title: 'Advertising and Partner Links',
      blocks: [
        {
          type: 'p',
          parts: [
            'The website may display advertisements (Google AdSense) when enabled and may open an affiliate partner link in a new tab when you begin processing a valid task. Your access to that third party\'s page is governed by their own policies; OneForAll is not responsible for the content or transactions on third-party websites.',
          ],
        },
      ],
    },
    {
      id: 'gioi-han',
      title: 'Limitation of Liability',
      blocks: [
        {
          type: 'p',
          parts: [
            'To the extent permitted by law, OneForAll is not liable for indirect damages arising from the use of, or inability to use, the service (loss of utility due to overload, changes to source platform APIs, etc.). We strive to keep the service stable but do not guarantee absolutely uninterrupted uptime.',
          ],
        },
      ],
    },
    {
      id: 'thay-doi',
      title: 'Changes to the Terms',
      blocks: [
        {
          type: 'p',
          parts: [
            'We may update these terms; the effective version is the one displayed on this page together with the last-updated date. Continuing to use the service after the terms change means you accept the new version.',
          ],
        },
      ],
    },
    {
      id: 'lien-he',
      title: 'Contact',
      blocks: [
        {
          type: 'p',
          parts: [
            'For any questions about the Terms of Use, please email ',
            // TODO (project owner to verify): use the email already present in the Footer; confirm this is the official contact email.
            { a: 'support@oneforall.app', href: 'mailto:support@oneforall.app' },
            '.',
          ],
        },
      ],
    },
  ],
}
