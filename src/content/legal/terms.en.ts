import type { LegalDoc } from './types'

export const termsEn: LegalDoc = {
  title: 'Terms of Use',
  route: '/en/terms',
  description: 'Clear rules for One ForAll tools, per-IP job limits, payments, file retention, and complaints.',
  lastUpdated: '03/11/2026',
  intro: 'These terms explain how to use One ForAll tools and account features. They apply when you accept them to continue.',
  quickFactsTitle: 'Before you use the service',
  quickFacts: [
    { label: 'Active jobs per IP', text: 'Free: 1. Pro: 3. Accounts sharing an IP share the same active-job limit.' },
    { label: 'Result retention', text: 'Completed results: 5 minutes on Free and 24 hours on Pro. Download links last 3 minutes.' },
    { label: 'Pro payment', text: 'Price and duration appear before checkout. Plans do not renew automatically.' },
  ],
  sections: [
    { id: 'service', title: 'What One ForAll provides', blocks: [{ type: 'p', parts: ['One ForAll provides selected media-link tools, file conversion, and image processing. Available features, formats, and file-size limits vary by tool and plan; the information shown in the tool and checkout flow applies to your request. Google Sign-In supports account features.'] }] },
    { id: 'account-payment', title: 'Accounts and payments', blocks: [{ type: 'ul', items: [
      ['Keep your sign-in details secure and contact support@oneforall.io.vn if you suspect unauthorized access.'],
      ['Pro is currently offered as a one-time 30-day plan for VND 45,000. The price and duration shown at checkout control if they change. SePay processes payment; access activates after payment confirmation. There is no automatic renewal.'],
      ['If Pro is already active, the current system does not allow another purchase to extend or stack its duration. A cancelled checkout is not recorded as a payment. If charged without activation, or charged twice or for the wrong amount, send the order code to support@oneforall.io.vn for review. These terms do not remove rights provided by law.'],
    ] }] },
    { id: 'ip-limits', title: 'Active-job limits by IP', blocks: [{ type: 'ul', items: [
      ['Free allows at most 1 task waiting or being processed per internet address (IP). Pro allows at most 3 tasks at a time per IP.'],
      ['The limit is shared by all accounts using the same IP. Creating or switching accounts does not provide a separate allowance. The plan of the account submitting a new job determines the limit applied to that request.'],
      ['Completed, failed, cancelled, and expired jobs do not count as active. A request rejected because the limit is full does not create a job.'],
    ] }] },
    { id: 'files-results', title: 'Files, results, and expiry', blocks: [{ type: 'ul', items: [
      ['You must have the right to submit the files or links you use. Download results promptly; One ForAll is not long-term storage.'],
      ['Completed results are kept by default for 5 minutes on Free and 24 hours on Pro, measured from completion. Failed or cancelled tasks have a default 5-minute retention period.'],
      ['File cleanup runs every 5 minutes, so removal may occur in the next cycle or later if a deletion must be retried. Download links expire after 3 minutes, independently of file retention.'],
      ['Task-history records may remain for up to 7 days after result files expire. Do not submit confidential or sensitive information unless you accept sending it to the service for processing.'],
    ] }] },
    { id: 'responsibilities', title: 'Your content and responsibilities', blocks: [{ type: 'ul', items: [
      ['Only submit, convert, or share content you have the right to use. Follow applicable law, copyright rules, and the source platform’s terms.'],
      ['Do not distribute malware, attack systems, bypass safeguards, abuse service resources, or violate another person’s privacy. Do not create, alter, or distribute intimate images of another person without their consent and a lawful basis.'],
      ['Check results before using or sharing them. Results depend on input files, external platforms, and processing options; One ForAll does not guarantee they are always accurate or fit for every purpose.'],
    ] }] },
    { id: 'third-parties', title: 'External platforms and providers', blocks: [{ type: 'p', parts: ['Link-based tools depend on access to and the terms of the source platform. Google sign-in, SePay payments, Cloudflare/Supabase infrastructure, and optional advertising are also subject to the relevant providers’ policies. One ForAll does not control those providers’ availability or policies.'] }] },
    { id: 'availability', title: 'Service interruptions and access limits', blocks: [{ type: 'p', parts: ['The service may be interrupted for maintenance, error recovery, or system protection. Where there are reasonable grounds to suspect misuse, a terms violation, or a safety risk, One ForAll may reject a job or temporarily limit access. Contact support@oneforall.io.vn to request a review if you believe a decision was mistaken.'] }] },
    { id: 'complaints', title: 'Complaints and disputes', blocks: [{ type: 'p', parts: ['Send feedback, complaints, or payment questions to ', { a: 'support@oneforall.io.vn', href: 'mailto:support@oneforall.io.vn' }, ' and include the relevant job or order code. Contacting support does not waive your right to use any complaint or dispute process provided by law.'] }] },
    { id: 'changes-operator', title: 'Changes and contact', blocks: [{ type: 'ul', items: [
      ['The current version and revision date appear at the top of this page. If a change materially affects rights or obligations, One ForAll will notify users and request renewed consent where required by law.'],
      ['The service is presented under the One ForAll brand. Contact: support@oneforall.io.vn.'],
    ] }] },
  ],
}
