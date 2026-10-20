import type { LegalDoc } from './types'

export const privacyEn: LegalDoc = {
  title: 'Privacy Policy',
  route: '/en/privacy',
  description: 'How One ForAll handles account data, Google Sign-In, file processing, retention periods, and third-party services.',
  lastUpdated: '20/10/2026',
  intro: 'One ForAll provides online tools for supported media links, file conversion, and image processing. This policy describes data processed when you use the website and its tools.',
  sections: [
    {
      id: 'du-lieu-thu-thap',
      title: 'Account Data and Use',
      blocks: [{ type: 'ul', items: [
        [{ b: 'Google Sign-In:' }, ' Google Sign-In is handled through Supabase Auth. One ForAll uses the email provided during sign-in to identify your account and support account features.'],
        [{ b: 'Profile and session data:' }, ' Supabase Auth maintains the sign-in session. Account profile and plan data support account features. The frontend does not set sign-in cookies itself; the Supabase client is configured to persist the session in browser storage. Google or Supabase may use their own storage technologies during authentication under their respective policies.'],
        [{ b: 'Task data:' }, ' Input files, results, filenames, operation type, options, status, and timestamps may be processed to perform a task, show progress, and display history. URL-based tools also send the source URL to One ForAll’s service. Signed-in tasks may be associated with an account ID; anonymous tasks use the service session mechanism.'],
        [{ b: 'Browser data:' }, ' Theme, language, consent/ad choices, and some application state are stored in localStorage. A per-tab session ID and recovery/payment return state use sessionStorage. Selected files and previews in some flows stay in browser memory.'],
      ] }],
    },
    {
      id: 'an-toan-su-dung',
      title: 'Safety and Responsible Use',
      blocks: [{ type: 'p', parts: ['One ForAll provides online tools for downloading supported media links, converting files, and processing images. Google Sign-In is used to authenticate users and provide supported account features.'] },
        { type: 'p', parts: ['One ForAll does not use Google APIs to create, generate, or distribute AI-generated non-consensual intimate imagery (NCII). The platform prohibits the creation or distribution of non-consensual intimate imagery.'] }],
    },
    {
      id: 'luu-tru-xoa-tep',
      title: 'File Processing, Storage, and Retention',
      blocks: [{ type: 'ul', items: [
        ['Files are sent to One ForAll’s processing service and are stored temporarily while a task runs. Task and history records may be stored separately from file contents; the specific production storage provider has not been verified.'],
        ['The configured defaults retain completed results for 5 minutes on the Free plan and 12 hours on the Premium plan. Failed or canceled tasks use a 5-minute default. Cleanup is scheduled every 5 minutes, so deletion may occur at the next cleanup cycle. Production settings may override these values and were not inspected.'],
        ['A result download URL provided for a task is valid for 3 minutes. This URL lifetime is separate from file retention.'],
        ['A task history record is kept for up to 7 days after its result files expire, then removed from the system. Cleanup runs every 5 minutes, so the actual deletion may happen at the next cycle.'],
      ] }],
    },
    {
      id: 'cookie-ben-thu-ba',
      title: 'Cookies and Third-Party Services',
      blocks: [{ type: 'ul', items: [
                ['The source includes Google AdSense and partner scripts/links. Their display depends on configuration and advertising consent; whether they are enabled in the current production configuration has not been verified. If enabled, the relevant provider may process data under its own policy.'],
        ['The interface stores an “analytics” consent choice. No Google Analytics/GA4 integration or third-party analytics SDK was found in the checked frontend. The service displays active-session counts; infrastructure or external service logs cannot be determined from this repository.'],
              ] }],
    },
    {
      id: 'quyen-nguoi-dung',
      title: 'Requests to Access, Correct, or Delete Data',
      blocks: [{ type: 'p', parts: ['You may send account data requests to ', { a: 'support@oneforall.io.vn', href: 'mailto:support@oneforall.io.vn' }, '. The website has no self-service account deletion feature. A support process for deleting an account and all related data has not been verified. Sending a request therefore does not itself confirm deletion; the service owner must confirm and carry out that process. Do not send passwords or sign-in tokens by email.'] }],
    },
    {
      id: 'bao-mat',
      title: 'Security',
      blocks: [{ type: 'p', parts: ['The production website is accessed over HTTPS, and result download links have a short lifetime. We do not claim absolute security. For questions about how data is protected, contact support.'] }],
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
