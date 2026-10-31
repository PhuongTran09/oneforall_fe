import { hasAcceptedTerms, setTermsAccepted, useConsent } from './consentStorage'
import { LocaleLink } from '../../i18n/LocaleLink'
import { getLang, t } from '../../i18n/langStore'

// Checkbox điều khoản tách riêng khỏi các nút cookie (spec: không gộp hai loại đồng ý).
// Trong thanh cookie nó bỏ khung và nền: một dòng kiểm là đủ, thêm thẻ nữa là hai lớp đè lên nhau.
export function TermsConsent() {
  const { record } = useConsent()
  const accepted = hasAcceptedTerms()

  return (
    <label className="flex items-start gap-2.5 cursor-pointer select-none">
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
