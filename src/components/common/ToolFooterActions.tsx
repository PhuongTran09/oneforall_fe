import { type ReactNode } from 'react'
import { useOutletContext } from 'react-router-dom'
import { ArrowRight, Bookmark, Copy, HeartHandshake, Mail, Sparkles } from 'lucide-react'
import { LocaleLink } from '../../i18n/LocaleLink'
import { t } from '../../i18n/langStore'
import { showToast } from '../feedback/toastStore'
import { showErrorPopup } from '../feedback/errorPopupStore'

// Link ủng hộ Momo chính thức của dự án — đổi thành '' để ẩn hàng "Ủng hộ".
const DONATE_URL = 'https://me.momo.vn/MRI4ubs7CgtBuQfEi6T8'

// Dùng lại đúng địa chỉ support mà Footer và trang Privacy đang trỏ tới.
const CONTACT_URL =
  'https://mail.google.com/mail/?view=cm&fs=1&to=support@oneforall.io.vn&su=Ho%20tro%20OneForAll'

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
      <path d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0Zm5.97 8.27c.01.04.02.09.02.13 0 1.22-1.02 2.22-2.27 2.22-.6 0-1.15-.24-1.56-.62a5.8 5.8 0 0 1-3.5 1.1l.72 3.36 2.34-.47a1.64 1.64 0 0 1 3.22.44 1.64 1.64 0 0 1-2.63 1.3 3.4 3.4 0 0 1-2.3.87c-1.9 0-3.44-1.1-3.44-2.45 0-.43.15-.83.41-1.17l2.5.5-.77-3.6a5.93 5.93 0 0 1-3.72-1.2 2.22 2.22 0 0 1-3.79-1.56c0-.05 0-.09.01-.13C3.05 8.23 2.8 7.77 2.8 7.25c0-1.22 1-2.2 2.24-2.2.6 0 1.14.25 1.54.65a4.7 4.7 0 0 1 1.67-.37 6.2 6.2 0 0 1 1.8.62 6.1 6.1 0 0 1 3.84 0 4.7 4.7 0 0 1 1.65.37 2.19 2.19 0 0 1 1.53-.65c1.24 0 2.24.98 2.24 2.2 0 .52-.25.98-.64 1.3ZM8.22 15.72c0 .9.83 1.64 1.85 1.72l.03-1.64a2.9 2.9 0 0 1-1.64-1.33 1.53 1.53 0 0 0-.24.81v.44Zm7.3 2.93a.88.88 0 1 0 0-1.76.88.88 0 0 0 0 1.76Zm-2.18-1.3a.66.66 0 1 1 0-1.32.66.66 0 0 1 0 1.32Zm1.4-1.95c-1.03.86-3.4.86-4.43 0a.28.28 0 1 1 .38-.41c.65.55 2.05.71 3.67.05a.28.28 0 1 1 .38.36Zm.17-.8a.66.66 0 1 1 0-1.32.66.66 0 0 1 0 1.32Zm-6.42-3.3a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Zm7.02 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" />
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
  const shareText = typeof document !== 'undefined' ? document.title : 'OneForAll'
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

  // Trình duyệt không cho web page tự tạo bookmark — chỉ hướng dẫn phím tắt thật.
  const bookmarkHint = () => {
    const isMac = /Mac|iPhone|iPad/.test(navigator.userAgent)
    showToast({
      type: 'info',
      message: t('toolFooter.bookmarkHint', { shortcut: isMac ? '⌘D' : 'Ctrl+D' }),
    })
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

          <ActionRow title={t('toolFooter.bookmarkTitle')} desc={t('toolFooter.bookmarkDesc')}>
            <button type="button" onClick={bookmarkHint} className={linkBtnStyles}>
              <Bookmark className="w-3.5 h-3.5" />
              {t('toolFooter.bookmarkCta')}
            </button>
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
