import type { LegalDoc } from './types'

export const termsEn: LegalDoc = {
  title: 'Terms of Use',
  route: '/en/terms',
  description: 'Terms for using One ForAll online tools, user responsibilities, and limits of liability.',
  lastUpdated: '21/10/2026',
  intro: 'By using One ForAll, you agree to follow these rules. Please read the sections on your responsibilities and prohibited content.',
  quickFactsTitle: 'Before you use the service',
  quickFacts: [
    { label: 'You are responsible for your files', text: 'Only submit or share content you have the right to use.' },
    { label: 'Do not misuse image tools', text: 'Obscene, unlawful, or privacy-infringing images are prohibited.' },
    { label: 'Download your results', text: 'Files and download links expire; the service is not long-term storage.' },
  ],
  sections: [
    { id: 'pham-vi', title: 'What One ForAll provides', blocks: [{ type: 'p', parts: ['One ForAll provides tools for selected media links, file conversion, and image processing. Available tools, formats, and limits vary by feature and plan. Check the tool and pricing pages for details. Google Sign-In lets you sign in and use account features.'] }] },
    { id: 'trach-nhiem', title: 'Your Responsibilities', blocks: [
      { type: 'p', parts: ['You are responsible for files and content you submit, process, download, or share. Only take actions you have the legal right to take. When using a link-based tool, follow the law, copyright rules, and the source platform’s terms.'] },
      { type: 'ul', items: [
        ['Do not spread malware, attack systems, misuse service resources, or bypass safeguards.'],
        ['Do not violate someone’s privacy or create, edit, or share their intimate images without consent and legal authority.'],
        ['Do not download, convert, or share content in violation of its owner’s rights or the source platform’s terms.'],
      ] },
    ] },
    { id: 'content-safety', title: 'Prohibited image content', tone: 'warning', blocks: [
      { type: 'p', parts: ['You must not misuse the platform’s image-processing tools to upload, edit, or distribute obscene images, unlawful images, or images that violate someone’s privacy.'] },
    ] },
    { id: 'han-che-truy-cap', title: 'When access may be limited', blocks: [{ type: 'p', parts: ['Where the law allows, One ForAll may refuse, limit, or suspend access if there are reasonable grounds to believe the service is being misused, may cause harm, or is being used against these terms.'] }] },
    { id: 'luu-tru', title: 'Files and downloads', blocks: [{ type: 'p', parts: ['Files and results are kept according to task and plan settings. Download links expire separately. Check the tool pages or Privacy Policy for retention details. Download results you want to keep; One ForAll is not long-term storage.'] }] },
    { id: 'quang-cao-affiliate', title: 'Ads and external links', blocks: [{ type: 'p', parts: ['The website may show ads or partner links depending on configuration and your advertising consent. Third-party pages and transactions follow that provider’s policies.'] }] },
    { id: 'gioi-han', title: 'Limits of responsibility', blocks: [{ type: 'p', parts: ['The service is provided as available and may change or be interrupted. Where the law allows, One ForAll is not responsible for indirect harm caused by using or being unable to use the service. These terms do not limit responsibilities or rights that the law says cannot be limited.'] }] },
    { id: 'thay-doi', title: 'Changes to these terms', blocks: [{ type: 'p', parts: ['The current terms and update date appear on this page. Review the new version when terms change. If the law requires separate consent, the service will ask for it.'] }] },
    { id: 'lien-he', title: 'Contact', blocks: [{ type: 'p', parts: ['For questions about these terms, email ', { a: 'support@oneforall.io.vn', href: 'mailto:support@oneforall.io.vn' }, '.'] }] },
  ],
}
