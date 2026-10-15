import { type ReactNode } from 'react'
import { useOutletContext } from 'react-router-dom'
import { ArrowRight, Copy, HeartHandshake, Mail, Sparkles } from 'lucide-react'
import { LocaleLink } from '../../i18n/LocaleLink'
import { t } from '../../i18n/langStore'
import { showToast } from '../feedback/toastStore'
import { showErrorPopup } from '../feedback/errorPopupStore'

// Link ủng hộ Momo chính thức của dự án — đổi thành '' để ẩn hàng "Ủng hộ".
const DONATE_URL = 'https://me.momo.vn/MRI4ubs7CgtBuQfEi6T8'

// Dùng lại đúng địa chỉ support mà Footer và trang Privacy đang trỏ tới.
const CONTACT_URL =
  'https://mail.google.com/mail/?view=cm&fs=1&to=support@oneforall.io.vn&su=Ho%20tro%20One ForAll'

const linkBtnStyles =
  'inline-flex items-center justify-center gap-1.5 text-xs px-3 py-1.5 font-medium transition-all duration-200 cursor-pointer select-none whitespace-nowrap bg-surface text-slate-200 border border-[rgba(255,59,48,0.35)] hover:bg-brand/5 hover:border-[rgba(255,59,48,0.6)] clip-corner-btn focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF3B30]'

const shareChipStyles =
  'h-8 w-8 inline-flex items-center justify-center bg-surface text-slate-400 border border-edge hover:bg-[rgba(255,59,48,0.08)] hover:text-brand hover:border-[rgba(255,59,48,0.35)] transition-colors clip-corner-btn focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF3B30]'

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4" aria-hidden="true">
      <path d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.7 4.53-4.7 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.96.93-1.96 1.89v2.25h3.33l-.53 3.49h-2.8V24C19.61 23.1 24 18.1 24 12.07" />
    </svg>
  )
}

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4" aria-hidden="true">
      <path d="M18.9 1.15h3.68l-8.04 9.19L24 22.85h-7.41l-5.8-7.58-6.64 7.58H.46l8.6-9.83L0 1.15h7.59l5.24 6.93 6.07-6.93Zm-1.29 19.5h2.04L6.49 3.24H4.3l13.31 17.4Z" />
    </svg>
  )
}

function RedditIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4" aria-hidden="true">
      <path d="M12 0C5.373 0 0 5.373 0 12c0 3.314 1.343 6.314 3.515 8.485l-2.286 2.286C.775 23.225 1.097 24 1.738 24H12c6.627 0 12-5.373 12-12S18.627 0 12 0Zm4.388 3.199c1.104 0 1.999.895 1.999 1.999 0 1.105-.895 2-1.999 2-.946 0-1.739-.657-1.947-1.539v.002c-1.147.162-2.032 1.15-2.032 2.341v.007c1.776.067 3.4.567 4.686 1.363.473-.363 1.064-.58 1.707-.58 1.547 0 2.802 1.254 2.802 2.802 0 1.117-.655 2.081-1.601 2.531-.088 3.256-3.637 5.876-7.997 5.876-4.361 0-7.905-2.617-7.998-5.87-.954-.447-1.614-1.415-1.614-2.538 0-1.548 1.255-2.802 2.803-2.802.645 0 1.239.218 1.712.585 1.275-.79 2.881-1.291 4.64-1.365v-.01c0-1.663 1.263-3.034 2.88-3.207.188-.911.993-1.595 1.959-1.595Zm-8.085 8.376c-.784 0-1.459.78-1.506 1.797-.047 1.016.64 1.429 1.426 1.429.786 0 1.371-.369 1.418-1.385.047-1.017-.553-1.841-1.338-1.841Zm7.406 0c-.786 0-1.385.824-1.338 1.841.047 1.017.634 1.385 1.418 1.385.785 0 1.473-.413 1.426-1.429-.046-1.017-.721-1.797-1.506-1.797Zm-3.703 4.013c-.974 0-1.907.048-2.77.135-.147.015-.241.168-.183.305.483 1.154 1.622 1.964 2.953 1.964 1.33 0 2.47-.81 2.953-1.964.057-.137-.037-.29-.184-.305-.863-.087-1.795-.135-2.769-.135Z" />
    </svg>
  )
}

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4" aria-hidden="true">
      <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.36V9h3.41v1.56h.05c.47-.9 1.63-1.85 3.36-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12ZM7.12 20.45H3.56V9h3.56v11.45ZM22.22 0H1.77C.8 0 0 .78 0 1.75v20.5C0 23.22.8 24 1.77 24h20.45c.98 0 1.78-.78 1.78-1.75V1.75C24 .78 23.2 0 22.22 0Z" />
    </svg>
  )
}

function ActionRow({
  title,
  desc,
  children,
}: {
  title: string
  desc: string
  children: ReactNode
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 sm:px-6 py-4">
      <div className="min-w-0">
        <h3 className="font-bold text-ink text-sm">{title}</h3>
        <p className="text-xs text-slate-400 leading-relaxed mt-0.5">{desc}</p>
      </div>
      <div className="flex items-center gap-2 flex-wrap shrink-0">{children}</div>
    </div>
  )
}

export function ToolFooterActions() {
  // Nút "Nâng cấp Pro": layout cung cấp openPro (chưa đăng nhập → bắt đăng ký,
  // đã đăng nhập → modal gói Pro). href /#pricing vẫn là fallback khi thiếu context.
  const layout = useOutletContext<{ openPro?: () => void } | null>()
  const pageUrl = typeof window !== 'undefined' ? window.location.href : ''
  const shareText = typeof document !== 'undefined' ? document.title : 'One ForAll'
  const encodedUrl = encodeURIComponent(pageUrl)
  const encodedText = encodeURIComponent(shareText)

  const shareLinks = [
    {
      label: t('toolFooter.shareFacebook'),
      network: 'Facebook',
      icon: <FacebookIcon />,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    },
    {
      label: t('toolFooter.shareX'),
      network: 'X',
      icon: <XIcon />,
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`,
    },
    {
      label: t('toolFooter.shareReddit'),
      network: 'Reddit',
      icon: <RedditIcon />,
      href: `https://www.reddit.com/submit?url=${encodedUrl}&title=${encodedText}`,
    },
    {
      label: t('toolFooter.shareLinkedIn'),
      network: 'LinkedIn',
      icon: <LinkedInIcon />,
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    },
  ]

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(pageUrl)
      showToast({ type: 'success', message: t('toolFooter.copySuccess') })
    } catch {
      showErrorPopup({ message: t('toolFooter.copyError') })
    }
  }

  return (
    <div className="pt-2">
      <div className="bg-surface border border-[rgba(255,59,48,0.25)] clip-corner-card card-3d card-3d-dim divide-y divide-edge">
          <ActionRow title={t('toolFooter.upgradeTitle')} desc={t('toolFooter.upgradeDesc')}>
            <LocaleLink
              to="/#pricing"
              className={linkBtnStyles}
              onClick={(e) => {
                if (layout?.openPro) {
                  e.preventDefault()
                  layout.openPro()
                }
              }}
            >
              <Sparkles className="w-3.5 h-3.5" />
              {t('toolFooter.upgradeCta')}
              <ArrowRight className="w-3.5 h-3.5" />
            </LocaleLink>
          </ActionRow>

          {DONATE_URL && (
            <ActionRow title={t('toolFooter.donateTitle')} desc={t('toolFooter.donateDesc')}>
              <a
                href={DONATE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className={linkBtnStyles}
              >
                <HeartHandshake className="w-3.5 h-3.5" />
                {t('toolFooter.donateCta')}
              </a>
            </ActionRow>
          )}

          <ActionRow title={t('toolFooter.shareTitle')} desc={t('toolFooter.shareDesc')}>
            {shareLinks.map((s) => (
              <a
                key={s.network}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                title={s.network}
                className={shareChipStyles}
              >
                {s.icon}
              </a>
            ))}
          </ActionRow>

          <ActionRow title={t('toolFooter.copyTitle')} desc={pageUrl}>
            <button type="button" onClick={copyLink} className={linkBtnStyles}>
              <Copy className="w-3.5 h-3.5" />
              {t('toolFooter.copyCta')}
            </button>
          </ActionRow>

          <ActionRow title={t('toolFooter.contactTitle')} desc={t('toolFooter.contactDesc')}>
            <a href={CONTACT_URL} target="_blank" rel="noopener noreferrer" className={linkBtnStyles}>
              <Mail className="w-3.5 h-3.5" />
              {t('toolFooter.contactCta')}
            </a>
          </ActionRow>
        </div>
    </div>
  )
}
