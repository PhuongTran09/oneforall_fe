import { useState } from 'react'
import { ChevronDown, Settings2 } from 'lucide-react'
import { Button } from './Button'
import { ParamFieldControl } from './ParamFieldControl'
import type { ParamField, ParamValues } from '../../config/conversionParams'
import { t } from '../../i18n/langStore'

export interface AdvancedParamsPanelProps {
  fields: ParamField[]
  values: ParamValues
  onChange: (key: string, value: string | boolean) => void
  onReset: () => void
  disabled?: boolean
}

function isFilled(field: ParamField, value: string | boolean | undefined): boolean {
  if (field.kind === 'bool') return value === true
  return typeof value === 'string' && value.trim() !== ''
}

/**
 * Collapsible block holding the options the backend reads for the current conversion.
 * Renders nothing when the chosen pair has no options, so users never see inert controls.
 */
export function AdvancedParamsPanel({
  fields,
  values,
  onChange,
  onReset,
  disabled = false,
}: AdvancedParamsPanelProps) {
  const [isOpen, setIsOpen] = useState(false)

  if (fields.length === 0) return null

  const bodyId = 'advanced-params-body'
  const hasFilledValue = fields.some((field) => isFilled(field, values[field.key]))

  return (
    <div className="border border-edge bg-surface overflow-hidden transition-colors clip-corner-card">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        aria-controls={bodyId}
        className="w-full flex items-center gap-2.5 px-4 py-3 text-left cursor-pointer hover:bg-[#ff3b30]/5 transition-colors"
      >
        <Settings2 className="w-4 h-4 text-[#FF3B30] shrink-0" />
        <span className="text-sm font-semibold text-slate-200">{t('params.advancedTitle')}</span>
        {hasFilledValue && (
          <span
            className="w-1.5 h-1.5 bg-[#ff3b30] shrink-0 clip-corner-btn"
            title={t('params.hasCustom')}
          />
        )}
        <ChevronDown
          className={`w-4 h-4 text-slate-400 ml-auto shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-[#FF3B30]' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div
          id={bodyId}
          className="px-4 pb-4 pt-3 border-t border-edge bg-page space-y-3 animate-fade-in"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {fields.map((field) => (
              <ParamFieldControl
                key={field.key}
                field={field}
                idPrefix="advanced-param"
                value={values[field.key]}
                onChange={onChange}
                disabled={disabled}
              />
            ))}
          </div>

          <div className="flex justify-end">
            <Button variant="ghost" size="sm" onClick={onReset} disabled={disabled}>
              {t('params.reset')}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
