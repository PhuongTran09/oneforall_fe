import { useEffect, useId, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react'
import { createPortal } from 'react-dom'
import { Check, ChevronDown } from 'lucide-react'
import { useExitFade } from '../../../hooks/useExitFade'

export interface SelectOption {
  value: string
  label: string
}

export interface SelectMenuProps {
  options: SelectOption[]
  value: string
  onChange: (next: string) => void
  /** Nối với <label htmlFor>; thiếu thì tự sinh. */
  id?: string
  ariaLabel?: string
  disabled?: boolean
  className?: string
}

/** Chiều cao tối đa của danh sách (max-h-60) — dùng để quyết định mở lên hay xuống. */
const MENU_MAX = 240
const GAP = 4

interface Box {
  left: number
  width: number
  edge: number
  side: 'top' | 'bottom'
}

/**
 * Listbox tự绘制 thay cho <select>: popup hệ điều hành không theo được nền tối của
 * trang, và <select> gốc cũng không mở được bên trong modal đang scroll.
 */
export function SelectMenu({ options, value, onChange, id, ariaLabel, disabled = false, className = '' }: SelectMenuProps) {
  const genId = useId()
  const triggerId = id ?? `select-${genId}`
  const listId = `select-list-${genId}`
  const trigger = useRef<HTMLButtonElement>(null)
  const list = useRef<HTMLUListElement>(null)
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const [box, setBox] = useState<Box | null>(null)
  // List fade ra khi đóng (Escape/click ngoài/chọn xong) — `box` vẫn còn nên vị trí không nhảy.
  const { show, closing } = useExitFade(open)

  const selectedIndex = Math.max(
    0,
    options.findIndex((o) => o.value === value),
  )

  const place = () => {
    const rect = trigger.current?.getBoundingClientRect()
    if (!rect) return
    const below = window.innerHeight - rect.bottom
    const flip = below < MENU_MAX + GAP && rect.top > below
    setBox({ left: rect.left, width: rect.width, edge: flip ? window.innerHeight - rect.top + GAP : rect.bottom + GAP, side: flip ? 'bottom' : 'top' })
  }

  useEffect(() => {
    if (!open) return
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node
      if (trigger.current?.contains(target) || list.current?.contains(target)) return
      setOpen(false)
    }
    // vị trí tính một lần lúc mở, nên cuộn hoặc đổi kích thước là đóng lại
    const onClose = () => setOpen(false)
    document.addEventListener('pointerdown', onPointerDown, true)
    window.addEventListener('scroll', onClose, true)
    window.addEventListener('resize', onClose)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown, true)
      window.removeEventListener('scroll', onClose, true)
      window.removeEventListener('resize', onClose)
    }
  }, [open])

  useEffect(() => {
    if (open) list.current?.querySelector<HTMLElement>('[data-active="true"]')?.scrollIntoView({ block: 'nearest' })
  }, [open, active, box])

  const begin = (index: number) => {
    setActive(index)
    place()
    setOpen(true)
  }

  const commit = (index: number) => {
    const option = options[index]
    if (option) onChange(option.value)
    setOpen(false)
    trigger.current?.focus()
  }

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (options.length === 0) return
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault()
      const step = e.key === 'ArrowDown' ? 1 : -1
      begin(open ? (active + step + options.length) % options.length : selectedIndex)
    } else if (e.key === 'Home' || e.key === 'End') {
      e.preventDefault()
      begin(e.key === 'Home' ? 0 : options.length - 1)
    } else if (open && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault()
      commit(active)
    } else if (open && (e.key === 'Escape' || e.key === 'Tab')) {
      setOpen(false)
    }
  }

  const menuStyle: CSSProperties | undefined = box
    ? { position: 'fixed', left: box.left, width: box.width, [box.side]: box.edge }
    : undefined

  return (
    <div className={`min-w-0 ${className}`}>
      <button
        ref={trigger}
        id={triggerId}
        type="button"
        role="combobox"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-activedescendant={open ? `${listId}-${active}` : undefined}
        aria-label={ariaLabel}
        onClick={() => (open ? setOpen(false) : begin(selectedIndex))}
        onKeyDown={onKeyDown}
        className={`flex w-full items-center justify-between gap-2 px-3 py-2 bg-page border text-sm text-ink transition-colors clip-corner-btn cursor-pointer focus:outline-none focus-visible:border-brand disabled:cursor-not-allowed disabled:opacity-60 ${
          open ? 'border-brand' : 'border-edge'
        }`}
      >
        <span className="truncate">{options[selectedIndex]?.label ?? ''}</span>
        <ChevronDown className={`w-4 h-4 shrink-0 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {show &&
        box &&
        createPortal(
          <ul
            ref={list}
            id={listId}
            role="listbox"
            aria-labelledby={ariaLabel ? undefined : triggerId}
            aria-label={ariaLabel}
            style={menuStyle}
            className={`z-[70] max-h-60 overflow-y-auto bg-surface border border-edge p-1 shadow-[0_16px_40px_rgba(0,0,0,0.5)] clip-corner-btn ${
              closing ? 'out-fade' : 'in-fade'
            }`}
          >
            {options.map((option, i) => (
              <li
                key={option.value}
                id={`${listId}-${i}`}
                role="option"
                aria-selected={option.value === value}
                data-active={i === active}
                onPointerDown={(e) => e.preventDefault()}
                onPointerEnter={() => setActive(i)}
                onClick={() => commit(i)}
                className={`flex cursor-pointer items-center justify-between gap-2 rounded-md px-2.5 py-1.5 text-sm ${
                  i === active ? 'bg-brand/10 text-ink' : 'text-slate-300'
                }`}
              >
                <span className="truncate">{option.label}</span>
                {option.value === value && <Check className="w-4 h-4 shrink-0 text-brand" />}
              </li>
            ))}
          </ul>,
          document.body,
        )}
    </div>
  )
}
