import { useRef, type ClipboardEvent, type KeyboardEvent } from 'react'

export interface OtpInputProps {
  /** Chuỗi digit tối đa `length` ký tự. */
  value: string
  onChange: (next: string) => void
  length?: number
  disabled?: boolean
  describedBy?: string
}

/**
 * Ô nhập OTP 6 chữ số: mỗi ô 1 ký tự, tự nhảy ô khi gõ, paste nguyên chuỗi,
 * Backspace ở ô trống quay về lùi ô trước, điều hướng mũi tên.
 */
export function OtpInput({ value, onChange, length = 6, disabled, describedBy }: OtpInputProps) {
  const refs = useRef<(HTMLInputElement | null)[]>([])

  const setAt = (index: number, char: string) => {
    const chars = value.padEnd(length, ' ').slice(0, length).split('')
    chars[index] = char === ' ' ? '' : char
    onChange(chars.join('').replace(/\s/g, '').slice(0, length))
  }

  const focusBox = (index: number) => {
    refs.current[Math.max(0, Math.min(length - 1, index))]?.focus()
  }

  const handleChange = (index: number, raw: string) => {
    const digits = raw.replace(/\D/g, '')
    if (!digits) {
      setAt(index, '')
      return
    }
    if (digits.length === 1) {
      setAt(index, digits)
      focusBox(index + 1)
      return
    }
    // Gõ nhanh/nhiều ký tự một lúc → điền tuần tự từ ô hiện tại.
    const chars = value.padEnd(length, ' ').split('')
    let cursor = index
    for (const d of digits) {
      if (cursor >= length) break
      chars[cursor] = d
      cursor += 1
    }
    onChange(chars.join('').replace(/\s/g, '').slice(0, length))
    focusBox(cursor)
  }

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const digits = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length)
    if (!digits) return
    onChange(digits)
    focusBox(digits.length)
  }

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !value[index] && index > 0) {
      e.preventDefault()
      setAt(index - 1, '')
      focusBox(index - 1)
    } else if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault()
      focusBox(index - 1)
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      e.preventDefault()
      focusBox(index + 1)
    }
  }

  return (
    <div className="flex justify-center gap-2" role="group" aria-label="OTP">
      {Array.from({ length }, (_, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el
          }}
          type="text"
          inputMode="numeric"
          autoComplete={i === 0 ? 'one-time-code' : 'off'}
          pattern="\d*"
          maxLength={length}
          disabled={disabled}
          value={value[i] ?? ''}
          onChange={(e) => handleChange(i, e.target.value)}
          onPaste={handlePaste}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onFocus={(e) => e.target.select()}
          aria-label={`Chữ số ${i + 1}`}
          aria-describedby={describedBy}
          className="w-11 sm:w-12 py-2.5 px-0 bg-page border border-brand/30 focus:border-brand focus:ring-1 focus:ring-[#ff3b30] text-center text-lg text-slate-100 outline-none transition-all clip-corner-btn font-mono disabled:opacity-50"
        />
      ))}
    </div>
  )
}
