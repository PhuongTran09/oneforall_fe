import type { LegalDoc } from './types'

// To edit legal content: edit only this file (title/sections/lastUpdated).
// The storage/deletion description must match the backend's actual mechanism (TTL job, cycle cleanup, presign TTL).
export const privacyEn: LegalDoc = {
  title: 'Privacy Policy',
  route: '/en/privacy',
  description:
    'The OneForAll privacy policy: data collected, the file storage and automatic deletion mechanism, cookies, and third-party services.',
  // TODO (project owner to verify): lastUpdated is the first-draft date; update it upon official publication.
  lastUpdated: '12/10/2026',
  intro:
    'This policy describes the data OneForAll processes and how files are temporarily stored and automatically deleted, exactly matching the system\'s actual operating mechanism.',
  sections: [
    {
      id: 'du-lieu-thu-thap',
      title: 'Data We Process',
      blocks: [
        {
          type: 'ul',
          items: [
            [
              { b: 'Files you upload and processing results' },
              ': used only to perform the task you request.',
            ],
            [
              { b: 'Task metadata' },
              ': task ID, source/target format, size, status, creation and completion times.',
            ],
            [
              { b: 'Account information (if you register)' },
              ': login email — used for signing in and managing your service plan.',
            ],
            [
              { b: 'Browser data' },
              ': the light/dark interface you choose is stored in your device\'s localStorage to keep the preference between visits.',
            ],
          ],
        },
      ],
    },
    {
      id: 'luu-tru-xoa-tep',
      title: 'File Storage and Deletion (accurate to the actual system)',
      blocks: [
        {
          type: 'ul',
          items: [
            [
              'Source files and results are held temporarily on an object storage service and in the temporary working directory of the processing server; the temporary directory is deleted immediately after the task finishes.',
            ],
            [
              'After a task completes (or fails), the task\'s record and files expire after approximately 3–5 minutes, and an automatic cleanup process running every 5 minutes deletes the files from storage and then deletes the corresponding metadata.',
            ],
            [
              'The result download link is a pre-signed link valid for approximately 15 minutes; once it expires, you must return to the processing page.',
            ],
            [
              'During a working session, the images/files you have selected and the most recent result are kept in browser memory so they can be restored when you switch tabs within the site; this data is never written to disk and is lost when you close the tab or click Reset.',
            ],
          ],
        },
        {
          type: 'p',
          parts: [
            'Therefore, download the results to your device as soon as the task completes — we do not keep long-term archives of your content and cannot recover files once the cleanup deadline has passed.',
          ],
        },
      ],
    },
    {
      id: 'cookie-bên-thứ-ba',
      title: 'Cookies and Third-Party Services',
      blocks: [
        {
          type: 'ul',
          items: [
            [
              { b: 'Sign-in' },
              ': the sign-up/sign-in session is operated through the Supabase authentication service; the session cookies/localStorage are managed by that service according to its own policies.',
            ],
            [
              { b: 'Advertising' },
              ': when Google AdSense advertising is enabled, Google may use cookies to serve ads in accordance with Google\'s policies.',
            ],
            [
              { b: 'Partner links' },
              ': the site may open an affiliate marketing partner\'s page in a new tab; data collection on that page is governed by the third party.',
            ],
          ],
        },
      ],
    },
    {
      id: 'bang-chung',
      title: 'Commitment Not to Use Your Content Without Permission',
      blocks: [
        {
          type: 'p',
          parts: [
            'Your files are processed only to return exactly the result you request. We do not sell users\' file content.',
          ],
        },
      ],
    },
    {
      id: 'bao-mat',
      title: 'Security',
      blocks: [
        {
          type: 'p',
          parts: [
            'All communication between the browser and the server uses HTTPS; result links carry a short-lived signature to block access from outside. However, no system is 100% secure — you should not upload content whose disclosure would cause serious harm.',
          ],
        },
      ],
    },
    {
      id: 'thay-doi-chinh-sach',
      title: 'Changes to This Policy',
      blocks: [
        {
          type: 'p',
          parts: [
            'The effective version is the one displayed on this page together with the last-updated date. If a significant change affects your rights and interests, we will announce it on the website before applying it.',
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
            'Please send privacy requests to ',
            // TODO (project owner to verify): use the email already present in the Footer; confirm this is the official contact email.
            { a: 'support@oneforall.app', href: 'mailto:support@oneforall.app' },
            '.',
          ],
        },
      ],
    },
  ],
}
