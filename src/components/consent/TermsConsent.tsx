import { hasAcceptedTerms, setTermsAccepted, useConsent } from './consentStorage'
import { LocaleLink } from '../../i18n/LocaleLink'
import { getLang, t } from '../../i18n/langStore'



export function TermsConsent() {
  const { record } = useConsent()
  const accepted = hasAcceptedTerms()

  return (
    <label className="flex min-h-6 cursor-pointer select-none items-start gap-2.5">


      <input
        type="checkbox"
        checked={accepted}
        onChange={(e) => setTermsAccepted(e.target.checked)}
        className="mt-0.5 w-4 h-4 shrink-0 accent-[#FF3B30] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF3B30] focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
      />
      <span className="text-xs leading-relaxed text-slate-300">
        {t('consent.termsPre')}{' '}
        <LocaleLink to="/terms" className="text-brand hover:underline font-medium">
          {t('common.terms')}
        </LocaleLink>
        .
        {record.terms.acceptedAt && (
          <span className="block mt-1 text-[10px] text-slate-500">
            {t('consent.acceptedOn', {
              date: new Date(record.terms.acceptedAt).toLocaleDateString(
                getLang() === 'en' ? 'en-GB' : 'vi-VN',
              ),
            })}
          </span>
        )}
      </span>
    </label>
  )
}
