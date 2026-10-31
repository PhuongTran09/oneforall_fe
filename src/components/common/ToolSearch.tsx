import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Search, X } from 'lucide-react'
import { filterTools, useToolSearchIndex } from './toolSearchIndex'
import { t, withLocale } from '../../i18n/langStore'
import { useExitFade } from '../../hooks/useExitFade'

export interface ToolSearchFieldProps {
  value: string
  onChange: (next: string) => void
  /** Hiện danh sách kết quả kiểu combobox. Tắt khi trang tự render lưới công cụ. */
  dropdown?: boolean
  size?: 'md' | 'lg'
  placeholder?: string
  className?: string
}

export function ToolSearchField({
  value,
  onChange,
  dropdown = true,
  size = 'md',
  placeholder,
  className = '',
}: ToolSearchFieldProps) {
  const index = useToolSearchIndex()
  const navigate = useNavigate()
  const results = useMemo(() => filterTools(index, value), [index, value])
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const boxRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const listId = 'tool-search-listbox'
  const hasQuery = value.trim().length > 0
  // Danh sách fade cả hai chiều: đóng bằng Esc/click ra ngoài hay xoá hết chữ đều là một
  // nhịp mờ dần, không phải biến mất giữa lúc mắt đang dõi theo.
  const { show: listShown, closing: listClosing } = useExitFade(Boolean(dropdown) && open && hasQuery)

  useEffect(() => {
    if (!open) return
    const onDocClick = (event: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [open])

  /* Danh sách mặc định nở xuống, nhưng bàn phím ảo chiếm quá nửa màn hình điện thoại thì
     phần dưới còn lại không đủ — đo chỗ trống thật rồi lật nó lên trên. Chỉ đổi class qua
     ref: kết quả thay đổi từng keystroke, render lại cả combobox chỉ vì một cái class là thừa.
     useLayoutEffect để lật xong trước khi vẽ — để useEffect thì danh sách nháy một khung
     hình ở tư thế nở xuống. */
  useLayoutEffect(() => {
    if (!open || !hasQuery) return
    const place = () => {
      const box = boxRef.current
      const list = listRef.current
      if (!box || !list) return
      const viewport = window.visualViewport
      const height = viewport ? viewport.height : window.innerHeight
      const rect = box.getBoundingClientRect()
      const below = height - rect.bottom
      const up = below < 240 && rect.top > below
      list.classList.toggle('drop-up', up)
      box.style.setProperty(
        '--search-list-max',
        up ? `${Math.round(Math.max(120, rect.top - 12))}px` : '20rem',
      )
    }
    place()
    const viewport = window.visualViewport
    viewport?.addEventListener('resize', place)
    return () => viewport?.removeEventListener('resize', place)
  }, [open, hasQuery, results.length])

  const go = (slug: string) => {
    setOpen(false)
    onChange('')
    // Input còn focus là bàn phím ở lại trang mới, che mất nội dung vừa chuyển tới.
    inputRef.current?.blur()
    navigate(withLocale(slug))
  }

  const submit = () => {
    if (results.length > 0) {
      go(results[Math.min(active, results.length - 1)].slug)
      return
    }
    if (hasQuery) {
      onChange('')
      navigate(`${withLocale('/tools')}?q=${encodeURIComponent(value.trim())}`)
    }
  }

  const inputSize =
    size === 'lg'
      ? 'h-10 sm:h-14 text-sm sm:text-base pl-9 sm:pl-12 pr-9 sm:pr-11'
      : 'h-9 sm:h-10 text-sm pl-8 pr-9 sm:pl-10'

  return (
    <div ref={boxRef} className={`group relative w-full ${className}`}>
      {/* Icon nằm trong ô cắt góc riêng: đứng một mình giữa khoảng trắng lớn thì nó
          chỉ là hình trang trí, nhốt vào ô thì đọc ra đây là điều khiển được. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute left-1.5 top-1/2 grid place-items-center w-6 h-6 sm:w-7 sm:h-7 -translate-y-1/2 bg-page border border-edge text-slate-400 clip-corner-btn transition-colors duration-200 group-focus-within:border-[rgba(255,59,48,0.55)] group-focus-within:text-brand"
      >
        <Search className="w-3.5 h-3.5" />
      </span>
      <input
        ref={inputRef}
        type="search"
        value={value}
        onChange={(event) => {
          onChange(event.target.value)
          // Đổi từ khóa là danh sách đổi thứ tự — con trỏ bàn phím phải về đầu.
          setActive(0)
          if (dropdown) setOpen(true)
        }}
        onFocus={() => dropdown && setOpen(true)}
        onKeyDown={(event) => {
          if (!dropdown || results.length === 0) {
            if (event.key === 'Enter') {
              event.preventDefault()
              submit()
            }
            if (event.key === 'Escape') setOpen(false)
            return
          }
          if (event.key === 'ArrowDown') {
            event.preventDefault()
            setActive((i) => (i + 1) % results.length)
          } else if (event.key === 'ArrowUp') {
            event.preventDefault()
            setActive((i) => (i - 1 + results.length) % results.length)
          } else if (event.key === 'Enter') {
            event.preventDefault()
            submit()
          } else if (event.key === 'Escape') {
            setOpen(false)
          }
        }}
        role="combobox"
        aria-expanded={dropdown && open && results.length > 0}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-label={t('directory.searchAria')}
        placeholder={placeholder ?? t('directory.searchPlaceholder')}
        className={`w-full bg-surface border border-edge hover:border-[rgba(255,59,48,0.45)] focus:border-brand/70 text-ink caret-brand placeholder:text-slate-500 clip-corner-btn input-3d outline-none transition-colors duration-200 ${inputSize}`}
      />
      {hasQuery && (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label={t('common.close')}
          className="absolute right-2 top-1/2 grid place-items-center w-6 h-6 -translate-y-1/2 text-slate-400 hover:text-brand hover:bg-page border border-transparent hover:border-edge clip-corner-btn cursor-pointer transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}

      {listShown && (
        <div
          ref={listRef}
          className={`tool-search-list absolute z-30 left-0 right-0 bg-elev border border-[rgba(255,59,48,0.35)] clip-corner-card card-3d overflow-hidden ${
            listClosing ? 'out-fade' : 'in-fade'
          }`}
        >
          {results.length === 0 ? (
            <div className="p-4 space-y-2">
              <p className="text-sm text-soft">{t('directory.noResult', { q: value })}</p>
              <p className="text-xs text-slate-500">{t('directory.noResultHint')}</p>
            </div>
          ) : (
            <ul id={listId} role="listbox" aria-label={t('directory.searchAria')} className="overflow-y-auto scrollbar-none py-1">
              {results.map((entry, i) => (
                <li key={entry.slug} role="option" aria-selected={i === active}>
                  <button
                    type="button"
                    // mousedown giữ focus trên input, nếu không hiệu ứng blur sẽ đóng danh sách trước khi click kịp chạy
                    onMouseDown={(event) => event.preventDefault()}
                    onMouseEnter={() => setActive(i)}
                    onClick={() => go(entry.slug)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 text-left cursor-pointer transition-colors ${
                      i === active ? 'bg-brand/10' : 'hover:bg-brand/5'
                    }`}
                  >
                    <span className="w-8 h-8 shrink-0 grid place-items-center bg-page border border-edge text-brand clip-corner-btn">
                      {entry.icon}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold text-ink truncate">{entry.name}</span>
                      <span className="block text-xs text-slate-400 truncate">{entry.hint}</span>
                    </span>
                    <ArrowRight className="w-4 h-4 shrink-0 text-brand" aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}

