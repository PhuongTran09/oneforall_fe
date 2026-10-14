import type { ParamField } from '../../config/conversionParams'
import { isParamValid } from '../../config/conversionParams'
import { t } from '../../i18n/langStore'

export interface ParamFieldControlProps {
  field: ParamField
  /** Field id is namespaced so the same key can appear in several panels. */
  idPrefix: string
  value: string | boolean | undefined
  onChange: (key: string, value: string | boolean) => void
  disabled?: boolean
}

const chipClass = (active: boolean): string =>
  `px-2.5 py-1 font-mono text-xs font-semibold transition-all cursor-pointer clip-corner-btn disabled:cursor-not-allowed ${
    active
      ? 'bg-brand-gradient text-white'
      : 'bg-elev text-slate-200 border border-edge hover:bg-brand/15 hover:border-[rgba(255,59,48,0.40)]'
  }`

function invalidMessage(field: ParamField): string {
  if (field.kind === 'int') {
    return t('params.invalidInt', { min: field.min ?? 0, max: field.max ?? 0 })
  }
  if (field.key === 'time') {
    return t('params.invalidTime')
  }
  if (field.kind === 'select') {
    return t('params.invalidSelect')
  }
  return t('params.invalidText', { max: field.max ?? 120 })
}

export function ParamFieldControl({
  field,
  idPrefix,
  value,
  onChange,
  disabled = false,
}: ParamFieldControlProps) {
  const id = `${idPrefix}-${field.key}`
  const hintId = `${id}-hint`
  const invalid = !isParamValid(field, value)
  const text = typeof value === 'string' ? value : ''

  return (
    <div className="space-y-1.5">
      <label
        htmlFor={field.kind === 'bool' ? undefined : id}
        className="block text-xs font-semibold text-slate-300"
      >
        {field.label}
      </label>

      {field.kind === 'bool' ? (
        <label className="flex items-center gap-2.5 cursor-pointer select-none">
          <input
            id={id}
            type="checkbox"
            checked={value === true}
            disabled={disabled}
            onChange={(event) => onChange(field.key, event.target.checked)}
            className="w-4 h-4 accent-[#ff3b30] cursor-pointer disabled:cursor-not-allowed"
          />
          <span className="text-xs text-slate-200">{field.hint}</span>
        </label>
      ) : field.kind === 'select' ? (
        <select
          id={id}
          value={text}
          disabled={disabled}
          onChange={(event) => onChange(field.key, event.target.value)}
          aria-describedby={field.hint ? hintId : undefined}
          className="w-full px-3 py-2 bg-surface border border-edge text-xs font-mono text-ink focus:outline-none focus:border-brand clip-corner-btn cursor-pointer disabled:cursor-not-allowed"
        >
          {field.choices?.map((choice) => (
            <option key={choice.value || 'auto'} value={choice.value}>
              {choice.label}
            </option>
          ))}
        </select>
      ) : (
        <div
          className={`flex items-center gap-2 px-3 py-2 bg-surface border transition-colors clip-corner-btn ${
            invalid
              ? 'border-brand'
              : 'border-edge hover:border-[rgba(255,59,48,0.40)] focus-within:border-[rgba(255,59,48,0.55)]'
          }`}
        >
          <input
            id={id}
            type="text"
            inputMode={field.kind === 'int' ? 'numeric' : 'text'}
            value={text}
            maxLength={field.max}
            placeholder={field.placeholder}
            disabled={disabled}
            onChange={(event) => onChange(field.key, event.target.value)}
            aria-describedby={field.hint ? hintId : undefined}
            aria-invalid={invalid}
            className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none disabled:cursor-not-allowed"
          />
        </div>
      )}

      {field.kind === 'int' && field.presets && (
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            disabled={disabled}
            onClick={() => onChange(field.key, '')}
            className={chipClass(text === '')}
          >
            {t('params.default')}
          </button>
          {field.presets.map((preset) => (
            <button
              key={preset}
              type="button"
              disabled={disabled}
              onClick={() => onChange(field.key, String(preset))}
              className={chipClass(text === String(preset))}
            >
              {preset}
            </button>
          ))}
        </div>
      )}

      {field.hint && field.kind !== 'bool' && (
        <p id={hintId} className="text-xs text-slate-400 leading-relaxed">
          {field.hint}
        </p>
      )}

      {invalid && (
        <p role="alert" className="text-xs text-brand leading-relaxed">
          {invalidMessage(field)}
        </p>
      )}
    </div>
  )
}
