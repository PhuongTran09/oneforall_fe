import { useId, type ReactNode } from 'react'
import { SelectMenu } from './SelectMenu'

const FIELD_INPUT =
  'w-full px-3 py-2 bg-page border border-edge text-sm text-ink placeholder-slate-500 focus:outline-none focus:border-brand transition-colors clip-corner-btn disabled:cursor-not-allowed disabled:opacity-60'

export interface FieldProps {
  label: string
  htmlFor?: string
  hint?: string
  error?: string
  className?: string
  children: ReactNode
}

export function Field({ label, htmlFor, hint, error, className = '', children }: FieldProps) {
  return (
    <div className={`space-y-1.5 min-w-0 ${className}`}>
      <label htmlFor={htmlFor} className="block text-xs font-semibold text-slate-300">
        {label}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-slate-400 leading-relaxed">{hint}</p>}
      {error && (
        <p role="alert" className="text-xs text-brand leading-relaxed">
          {error}
        </p>
      )}
    </div>
  )
}

export interface TextFieldProps {
  label: string
  value: string
  onChange: (next: string) => void
  maxLength?: number
  placeholder?: string
  invalid?: boolean
  hint?: string
  error?: string
  disabled?: boolean
}

export function TextField({
  label,
  value,
  onChange,
  maxLength = 60,
  placeholder,
  invalid = false,
  hint,
  error,
  disabled = false,
}: TextFieldProps) {
  const id = useId()
  return (
    <Field label={label} htmlFor={id} hint={hint} error={error}>
      <input
        id={id}
        type="text"
        value={value}
        maxLength={maxLength}
        placeholder={placeholder}
        disabled={disabled}
        aria-invalid={invalid}
        onChange={(e) => onChange(e.target.value)}
        className={`${FIELD_INPUT} ${invalid ? 'border-brand' : ''}`}
      />
    </Field>
  )
}

export interface TextAreaFieldProps extends Omit<TextFieldProps, 'maxLength'> {
  rows?: number
  maxLength?: number
}

export function TextAreaField({ label, value, onChange, rows = 2, maxLength = 160, placeholder, hint, error, disabled }: TextAreaFieldProps) {
  const id = useId()
  return (
    <Field label={label} htmlFor={id} hint={hint} error={error}>
      <textarea
        id={id}
        rows={rows}
        value={value}
        maxLength={maxLength}
        placeholder={placeholder}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className={`${FIELD_INPUT} resize-none`}
      />
    </Field>
  )
}

export interface NumberFieldProps {
  label: string
  value: number
  onChange: (next: number) => void
  min?: number
  max?: number
  step?: number
  hint?: string
  error?: string
  disabled?: boolean
}

/** Giữ chuỗi đang gõ trong state cục bộ: bấm "1." rồi mất dấu thì người dùng không gõ nổi số lẻ. */
export function NumberField({ label, value, onChange, min = 0, max = 1_000_000, step = 1, hint, error, disabled }: NumberFieldProps) {
  const id = useId()
  return (
    <Field label={label} htmlFor={id} hint={hint} error={error}>
      <input
        id={id}
        type="number"
        inputMode="decimal"
        value={Number.isFinite(value) ? value : 0}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        aria-invalid={error !== undefined}
        onChange={(e) => {
          const next = Number(e.target.value)
          onChange(Number.isFinite(next) ? Math.min(max, Math.max(min, next)) : 0)
        }}
        className={`${FIELD_INPUT} font-mono ${error ? 'border-brand' : ''}`}
      />
    </Field>
  )
}

export interface SelectFieldProps {
  label: string
  value: string
  options: { value: string; label: string }[]
  onChange: (next: string) => void
  hint?: string
  disabled?: boolean
}

export function SelectField({ label, value, options, onChange, hint, disabled }: SelectFieldProps) {
  const id = useId()
  return (
    <Field label={label} htmlFor={id} hint={hint}>
      <SelectMenu id={id} options={options} value={value} onChange={onChange} disabled={disabled} />
    </Field>
  )
}

export interface ColorFieldProps {
  label: string
  value: string
  onChange: (next: string) => void
  presets?: string[]
  hint?: string
  disabled?: boolean
}

export function ColorField({ label, value, onChange, presets, hint, disabled = false }: ColorFieldProps) {
  const id = useId()
  const commit = (next: string) => {
    if (/^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test(next)) onChange(next)
  }
  return (
    <Field label={label} htmlFor={id} hint={hint}>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          aria-label={label}
          className="w-10 h-10 shrink-0 p-0 bg-page border border-edge cursor-pointer clip-corner-btn disabled:cursor-not-allowed disabled:opacity-60 [&::-webkit-color-swatch-wrapper]:p-1 [&::-webkit-color-swatch]:border-none"
        />
        <input
          id={id}
          type="text"
          value={value}
          maxLength={7}
          spellCheck={false}
          disabled={disabled}
          onChange={(e) => commit(e.target.value)}
          className={`${FIELD_INPUT} font-mono uppercase`}
        />
      </div>
      {presets && presets.length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
          {presets.map((hex) => (
            <button
              key={hex}
              type="button"
              title={hex}
              disabled={disabled}
              onClick={() => onChange(hex)}
              className={`w-6 h-6 shrink-0 border clip-corner-btn cursor-pointer transition-transform hover:scale-110 disabled:cursor-not-allowed disabled:opacity-60 ${
                hex.toLowerCase() === value.toLowerCase() ? 'border-brand' : 'border-edge'
              }`}
              style={{ background: hex }}
            />
          ))}
        </div>
      )}
    </Field>
  )
}

export interface RangeFieldProps {
  label: string
  value: number
  onChange: (next: number) => void
  min: number
  max: number
  step?: number
  /** Nhãn đọc được cho giá trị hiện tại, vd. "5.2s". */
  format: (value: number) => string
  hint?: string
  disabled?: boolean
}

export function RangeField({ label, value, onChange, min, max, step = 1, format, hint, disabled }: RangeFieldProps) {
  const id = useId()
  return (
    <Field label={label} htmlFor={id} hint={hint}>
      <div className="flex items-center gap-3">
        <input
          id={id}
          type="range"
          value={value}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          onChange={(e) => onChange(Number(e.target.value))}
          className="flex-1 h-1.5 bg-elev border border-edge cursor-pointer accent-[#ff3b30] disabled:cursor-not-allowed"
        />
        <span className="w-16 shrink-0 text-right text-xs font-mono text-ink">{format(value)}</span>
      </div>
    </Field>
  )
}

export interface SwitchFieldProps {
  label: string
  checked: boolean
  onChange: (next: boolean) => void
  hint?: string
}

export function SwitchField({ label, checked, onChange, hint }: SwitchFieldProps) {
  const id = useId()
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-2.5 cursor-pointer select-none">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="w-4 h-4 accent-[#ff3b30] cursor-pointer"
        />
        <span className="text-sm text-slate-200">{label}</span>
      </label>
      {hint && <p className="text-xs text-slate-400 leading-relaxed pl-6.5">{hint}</p>}
    </div>
  )
}
