import { useState } from 'react'
import { Button } from '../common/Button'
import { saveCookieChoices, useConsent } from './consentStorage'
import { t } from '../../i18n/langStore'

interface RowProps {
  title: string
  description: string
  checked: boolean
  disabled?: boolean
  onChange?: (value: boolean) => void
}

function CategoryRow({ title, description, checked, disabled = false, onChange }: RowProps) {
  return (
    <div className="flex items-start justify-between gap-4 p-3 border border-edge bg-page clip-corner-card">
      <div>
        <p className="text-sm font-medium text-ink">
          {title}
          {disabled && <span className="ml-2 text-[10px] uppercase tracking-wider text-emerald-400">{t('consent.alwaysOn')}</span>}
        </p>
        <p className="mt-1 text-xs leading-relaxed text-slate-400">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={`Cookie ${title}`}
        disabled={disabled}
        onClick={() => onChange?.(!checked)}
        className={`relative shrink-0 w-11 h-6 mt-0.5 clip-corner-btn border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#FF3B30] ${
          checked ? 'bg-brand border-brand' : 'bg-elev border-edge'
        } ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
      >
        <span
          aria-hidden="true"
          className={`absolute top-0.5 left-0.5 w-[18px] h-[18px] transition-transform ${
            checked ? 'translate-x-5 bg-white' : 'translate-x-0 bg-slate-400'
          }`}
        />
      </button>
    </div>
  )
}

// Màn "Tùy chỉnh cookie" trong ConsentModal. Mặc định tất cả OFF trừ cookie cần thiết.
export function CookiePreferences() {
  const { record } = useConsent()
  const [analytics, setAnalytics] = useState(record.cookies.analytics)
  const [advertising, setAdvertising] = useState(record.cookies.advertising)

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        saveCookieChoices({ analytics, advertising })
      }}
      className="space-y-3"
    >
      <CategoryRow
        title={t('consent.catNecessary')}
        disabled
        checked
        description={t('consent.catNecessaryDesc')}
      />
      <CategoryRow
        title={t('consent.catAnalytics')}
        checked={analytics}
        onChange={setAnalytics}
        description={t('consent.catAnalyticsDesc')}
      />
      <CategoryRow
        title={t('consent.catAdvertising')}
        checked={advertising}
        onChange={setAdvertising}
        description={t('consent.catAdvertisingDesc')}
      />
      <Button type="submit" variant="primary" fullWidth size="md">
        {t('consent.saveChoice')}
      </Button>
    </form>
  )
}
