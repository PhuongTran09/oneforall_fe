import type { LegalDoc } from './types'

export const termsEn: LegalDoc = {
  title: 'Terms of Use',
  route: '/en/terms',
  description: 'Terms for using One ForAll online tools, user responsibilities, and limits of liability.',
  lastUpdated: '18/10/2026',
  intro: 'These terms apply when you visit One ForAll and use the service’s online tools.',
  sections: [
    { id: 'pham-vi', title: 'Scope and Services', blocks: [{ type: 'p', parts: ['One ForAll provides tools for supported media links, file format conversion, image compression and resizing, and other image operations. Available tools and limits may vary by feature and plan; check the tool and pricing pages. Google Sign-In is provided for authentication and access to account features.'] }] },
    { id: 'trach-nhiem', title: 'Your Responsibilities', blocks: [
      { type: 'p', parts: ['You are responsible for content you submit, process, download, or share and must have the legal rights required for those actions. When using URL-based tools, you must also comply with applicable law, copyright, and the source platform’s terms.'] },
      { type: 'ul', items: [
        ['Do not use the service to distribute malware, attack systems, abuse resources, or bypass safeguards.'],
        ['Do not violate privacy rights or create, edit, or distribute another person’s intimate imagery without consent and legal authority.'],
        ['Do not download, convert, or distribute content in violation of an owner’s rights or source platform terms.'],
      ] },
    ] },
    { id: 'han-che-truy-cap', title: 'Access Restrictions', blocks: [{ type: 'p', parts: ['To the extent permitted by law, One ForAll may refuse, limit, or suspend access when there are reasonable grounds to believe the service is being abused, may cause harm, or is being used contrary to these terms.'] }] },
    { id: 'luu-tru', title: 'Results and Retention', blocks: [{ type: 'p', parts: ['Files and results are retained according to task and plan settings; download URLs have a separate lifetime. Retention periods, cleanup, and limits are described in the tool and Privacy Policy. Do not use the service as long-term storage; download results you need to keep.'] }] },
    { id: 'quang-cao-affiliate', title: 'Advertising and Partner Links', blocks: [{ type: 'p', parts: ['The website includes Google AdSense and partner scripts/links subject to configuration; their display may depend on settings and advertising consent. Third-party pages and transactions are governed by that provider’s policies.'] }] },
    { id: 'gioi-han', title: 'Limitation of Liability', blocks: [{ type: 'p', parts: ['The service is provided as is and may be interrupted or changed. To the extent permitted by law, One ForAll is not liable for indirect damages arising from use of, or inability to use, the service. Nothing in these terms excludes or limits liability, rights, or remedies that applicable law does not permit to be excluded or limited.'] }] },
    { id: 'thay-doi', title: 'Changes to These Terms', blocks: [{ type: 'p', parts: ['The current terms and update date are published on this page. Continued use after a change is subject to applicable law; where separate consent is required, the service will request it in an appropriate manner.'] }] },
    { id: 'lien-he', title: 'Contact', blocks: [{ type: 'p', parts: ['For questions about these terms, email ', { a: 'support@oneforall.io.vn', href: 'mailto:support@oneforall.io.vn' }, '.'] }] },
  ],
}
