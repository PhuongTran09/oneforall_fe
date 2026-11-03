import type { LegalDoc } from './types'

export const privacyEn: LegalDoc = {
  title: 'Privacy Policy',
  route: '/en/privacy',
  description: 'What One ForAll processes, which providers may receive data, file retention periods, and how to exercise your rights.',
  lastUpdated: '03/11/2026',
  intro: 'This policy explains what information One ForAll receives, how it is used, how long it is kept, and how to contact us about your data.',
  quickFactsTitle: 'The short version',
  quickFacts: [
    { label: 'Data', text: 'Account email, task details, files or links you submit, payment records, and technical data needed for security.' },
    { label: 'File retention', text: 'Completed results: 5 minutes on Free and 24 hours on Pro. Failed or cancelled results: 5 minutes. Cleanup runs every 5 minutes.' },
    { label: 'Contact', text: 'Send data requests to support@oneforall.io.vn. Sending a request does not itself delete data.' },
  ],
  sections: [
    {
      id: 'operator',
      title: 'About One ForAll',
      blocks: [{ type: 'p', parts: [
        'One ForAll is the service at oneforall.io.vn. For help or questions about your information, contact ',
        { a: 'support@oneforall.io.vn', href: 'mailto:support@oneforall.io.vn' },
        '.',
      ] }],
    },
    {
      id: 'data-purpose',
      title: 'Data we process and why',
      blocks: [{ type: 'ul', items: [
        [{ b: 'Account:' }, ' email, name/profile image if supplied by Google, account ID, sign-in state, and plan. Used for authentication, account display, and plan access.'],
        [{ b: 'Tasks and files:' }, ' input/output files, filenames and file types, source URLs, processing options, status, and timestamps. Used to run tasks, return results, show progress, and provide history. Link-based tasks send the source URL to One ForAll servers for processing.'],
        [{ b: 'Payments:' }, ' order code, plan, amount, transaction status, and transaction reference returned by SePay. Used to confirm payment, activate a plan, and resolve payment questions.'],
        [{ b: 'Connection information:' }, ' your internet address (IP) and connection details may be used to protect the service, prevent misuse, and apply task limits. Task records use an identifier made from the IP to count those limits.'],
        [{ b: 'On your device:' }, ' language/interface settings and terms/cookie choices are stored in browser storage. Some selected files and previews exist only in temporary browser memory.'],
      ] }],
    },
    {
      id: 'providers',
      title: 'Providers and processing locations',
      blocks: [{ type: 'ul', items: [
        ['Google and Supabase help you sign in. Supabase also stores account information needed for the service.'],
        ['Cloudflare helps protect connections. Some features may use Cloudflare to check automated access or store result files.'],
        ['SePay handles the checkout page and information needed to confirm payment. SePay and the relevant bank/payment provider also apply their own policies. Do not send One ForAll your bank password, OTP, or sign-in credentials.'],
        ['Google or partner ads may appear only when advertising is enabled and you have agreed. Those providers have their own policies. One ForAll does not currently use a third-party analytics tool; the analytics choice is only saved in your browser.'],
        ['Some providers may handle data outside Vietnam. The location depends on the provider and how the service is set up.'],
      ] }],
    },
    {
      id: 'retention',
      title: 'How long files are kept',
      blocks: [{ type: 'ul', items: [
        ['Completed tasks: results are kept by default for 5 minutes on Free and 24 hours on Pro, measured from completion. Failed or cancelled tasks have a default 5-minute retention period.'],
        ['Expired files are removed by a cleanup cycle that runs every 5 minutes. Deletion may occur in the next cycle or later if deletion fails and must be retried.'],
        ['A result download link is valid for 3 minutes, separately from the file-retention period.'],
        ['Task-history records are retained for up to 7 days after result files expire, then queued for cleanup. The code has no common automatic deletion period for account, plan, and payment records; they may be kept as needed to operate the service, support transactions, or meet legal obligations.'],
      ] }],
    },
    {
      id: 'browser-advertising',
      title: 'Browser storage, cookies, and advertising',
      blocks: [{ type: 'ul', items: [
        ['The site saves your terms and cookie choices in your browser on your device. They may stay there until you clear this website’s data in your browser.'],
        ['Necessary storage supports sessions and settings. Advertising and analytics choices are optional and can be changed under “Cookie settings” in the footer. Refusing advertising does not disable core file-processing features.'],
        ['Third-party advertising code loads only when the relevant feature is enabled and your advertising choice allows it. Depending on configuration, this may include Google AdSense or partner scripts.'],
        ['The analytics choice currently does not activate a third-party analytics tool in the code. If that changes, One ForAll must update this notice and the choice flow before enabling it.'],
      ] }],
    },
    {
      id: 'your-rights',
      title: 'Your rights and how to contact us',
      blocks: [{ type: 'ul', items: [
        ['You may request access, correction, a copy, deletion, restriction, or objection to processing of personal data, and withdraw consent where applicable. Withdrawal does not affect processing that was lawful before withdrawal.'],
        ['Email support@oneforall.io.vn with your account email (if any), the request type, and enough information to verify you. Do not send passwords, OTPs, or bank details. The site currently has no self-service account-deletion button; an email request does not delete data automatically.'],
        ['Under Article 5 of Decree 356/2025/ND-CP, procedural guidance is due within 2 working days. Fulfilment periods depend on the right: access/correction/copy in 10 days (15 when a processor/third party is involved); withdrawal/restriction/objection in 15 days (20 when another party is involved); deletion in 20 days (30 when another party is involved). Extensions are only made where law permits and with reasons communicated.'],
        ['Some information may need to be retained where required by law or to resolve a transaction or dispute. If a request cannot be fully completed, we will explain why and what can be done.'],
      ] }],
    },
    {
      id: 'security-updates',
      title: 'Security and updates',
      blocks: [{ type: 'p', parts: ['One ForAll uses HTTPS and access controls appropriate to the service. No online system can remove every risk. If data handling, providers, or retention periods change, this policy will be updated; the revision date appears at the top of the page.'] }],
    },
    {
      id: 'contact',
      title: 'Contact',
      blocks: [{ type: 'p', parts: ['For data questions, complaints, or requests, email ', { a: 'support@oneforall.io.vn', href: 'mailto:support@oneforall.io.vn' }, '.'] }],
    },
  ],
}
