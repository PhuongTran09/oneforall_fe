import type { LegalDoc } from './types'

export const privacyEn: LegalDoc = {
  title: 'Privacy Policy',
  route: '/en/privacy',
  description: 'How One ForAll handles account data, Google Sign-In, file processing, retention periods, and third-party services.',
  lastUpdated: '21/10/2026',
  intro: 'This page explains what information and files One ForAll handles, how long files may be kept, and how to contact us about your data.',
  quickFactsTitle: 'At a glance',
  quickFacts: [
    { label: 'Files you submit', text: 'Your files are sent to the service to complete the task you choose.' },
    { label: 'How long files stay', text: 'Default retention varies by plan and task; actual retention may change.' },
    { label: 'Deletion requests', text: 'Contact support and wait for confirmation; a request alone does not mean data was deleted.' },
  ],
  sections: [
    {
      id: 'du-lieu-thu-thap',
      title: 'Account Data and Use',
      blocks: [{ type: 'ul', items: [
        [{ b: 'Google Sign-In:' }, ' Google Sign-In is handled through Supabase Auth. One ForAll uses the email provided during sign-in to identify your account and support account features.'],
        [{ b: 'Account and sign-in session:' }, ' Supabase Auth maintains your sign-in session. Your profile and plan information support account features. The browser also saves some app settings. Google or Supabase may use their own storage during sign-in under their policies.'],
        [{ b: 'Files and tasks:' }, ' The service may process your input files, results, filenames, selected operation, options, status, and timestamps to run a task and show progress or history. Link-based tools also send the source URL to One ForAll. Signed-in tasks may be linked to your account ID; signed-out tasks use a service session.'],
        [{ b: 'Information saved on your device:' }, ' The browser saves settings such as theme, language, and cookie or advertising choices. In some flows, selected files and previews stay in browser memory.'],
      ] }],
    },
    {
      id: 'google-api-muc-dich',
      title: 'Purpose of Google API Use',
      blocks: [{ type: 'p', parts: ['One ForAll uses Google OAuth to verify your identity and support sign-in. Data received through Google APIs is not used to train AI models, is not shared with third parties, and is not used for purposes that violate safety requirements. Data is handled under the Google API Services User Data Policy.'] }],
    },
    {
      id: 'an-toan-su-dung',
      title: 'Safe and responsible use',
      tone: 'warning',
      blocks: [{ type: 'p', parts: ['One ForAll provides tools for supported media links, file conversion, and image processing. Google Sign-In is used to verify users and support account features.'] },
        { type: 'p', parts: ['Do not use the service to create or share intimate images of another person without their consent. One ForAll does not use Google APIs to create or distribute such images.'] }],
    },
    {
      id: 'luu-tru-xoa-tep',
      title: 'File Processing, Storage, and Retention',
      blocks: [{ type: 'ul', items: [
        ['Your files are sent to One ForAll’s service to complete the task and are stored temporarily while it runs. Task details and history may be stored separately from file contents. This policy does not name the storage provider.'],
        ['The currently documented defaults keep completed results for 5 minutes on Free and 12 hours on Pro. Failed or canceled tasks use a 5-minute default. Cleanup runs every 5 minutes, so deletion may happen in the next cycle. Actual retention may differ based on service configuration.'],
        ['A download link is valid for 3 minutes. This is separate from how long the file itself is stored.'],
        ['Task history is scheduled for deletion up to 7 days after result files expire. Since cleanup runs every 5 minutes, actual deletion may happen in the next cycle.'],
      ] }],
    },
    {
      id: 'cookie-ben-thu-ba',
      title: 'Cookies and Third-Party Services',
      blocks: [{ type: 'ul', items: [
        ['The website may show Google AdSense ads or partner content, depending on configuration and your advertising consent. If enabled, those providers may process data under their own policies.'],
        ['Cookie settings include an “analytics” choice. The website interface does not currently show a Google Analytics/GA4 integration or a third-party analytics tool. The website displays active-session counts; infrastructure providers may keep technical logs under their own policies.'],
              ] }],
    },
    {
      id: 'quyen-nguoi-dung',
      title: 'Requests to Access, Correct, or Delete Data',
      blocks: [{ type: 'p', parts: ['To ask about your data or request account deletion, email ', { a: 'support@oneforall.io.vn', href: 'mailto:support@oneforall.io.vn' }, '. The website does not currently have a self-service delete button. Sending an email does not automatically delete your data; wait for a reply confirming how the request will be handled. Do not email passwords or sign-in codes.'] }],
    },
    {
      id: 'bao-mat',
      title: 'Security',
      blocks: [{ type: 'p', parts: ['The website uses HTTPS, and result download links expire after a short time. No system can promise perfect security. Contact support if you have questions about data protection.'] }],
    },
    {
      id: 'thay-doi-chinh-sach',
      title: 'Changes to This Policy',
      blocks: [{ type: 'p', parts: ['The current version and its update date appear on this page. Review the policy published here for changes.'] }],
    },
    {
      id: 'lien-he',
      title: 'Contact',
      blocks: [{ type: 'p', parts: ['For privacy questions, email ', { a: 'support@oneforall.io.vn', href: 'mailto:support@oneforall.io.vn' }, '.'] }],
    },
  ],
}
