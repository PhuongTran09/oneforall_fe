import { useRef, type KeyboardEvent } from 'react'

export interface SegmentedControlProps {
  options: string[]
  value: string
  onChange: (option: string) => void
  ariaLabel: string
  labelFor?: (option: string) => string
}

export function SegmentedControl({ options, value, onChange, ariaLabel, labelFor }: SegmentedControlProps) {
  const groupRef = useRef<HTMLDivElement>(null)

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const i = options.indexOf(value)
    const last = options.length - 1
    let next = -1
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = i === last ? 0 : i + 1
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = i === 0 ? last : i - 1
    if (next >= 0) {
      e.preventDefault()
      onChange(options[next])
      // roving tabindex: move focus to the newly-selected option
      groupRef.current?.querySelectorAll('button')[next]?.focus()
    }
  }

  return (
    <div
      ref={groupRef}
      role="radiogroup"
      aria-label={ariaLabel}
      onKeyDown={handleKeyDown}
      className="flex h-10 max-w-full items-center gap-[3px] border border-edge bg-surface p-[3px] clip-corner-btn"
    >
      {options.map((option) => (
        <button
          key={option}
          type="button"
          role="radio"
          aria-checked={value === option}
          tabIndex={value === option ? 0 : -1}
          onClick={() => onChange(option)}
          className={`h-full flex-1 min-w-0 basis-auto cursor-pointer overflow-hidden whitespace-nowrap px-3 font-mono text-xs font-semibold uppercase clip-corner-btn transition-all duration-[180ms] focus-visible:outline-none focus-visible:shadow-[inset_0_0_0_2px_#ff3b30] ${
            value === option
              ? 'bg-brand-gradient text-white'
              : 'text-slate-300 hover:bg-[#ff3b30]/10 hover:text-white'
          }`}
        >
          {labelFor ? labelFor(option) : option}
        </button>
      ))}
    </div>
  )
}
