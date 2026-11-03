import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Search, X } from 'lucide-react'
import { filterTools, useToolSearchIndex } from './toolSearchIndex'
import { t, withLocale } from '../../i18n/langStore'
import { useExitFade } from '../../hooks/useExitFade'

export interface ToolSearchFieldProps {
  value: string
  onChange: (next: string) => void

  dropdown?: boolean
  size?: 'md' | 'lg'

  tone?: 'default' | 'brand'
  placeholder?: string
  className?: string
}

export function ToolSearchField({
  value,
  onChange,
  dropdown = true,
  size = 'md',
  tone = 'default',
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


  const { show: listShown, closing: listClosing } = useExitFade(Boolean(dropdown) && open && hasQuery)

  useEffect(() => {
    if (!open) return
    const onDocClick = (event: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [open])






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
      ? 'h-10 sm:h-12 text-sm sm:text-base pl-9 sm:pl-11 pr-9 sm:pr-9'
      : 'h-9 sm:h-10 text-sm pl-8 pr-9 sm:pl-10'

  const frame =
    tone === 'brand'
      ? 'search-brand border-brand/45 hover:border-brand/70 focus:border-brand shadow-[0_16px_36px_-24px_rgba(255,59,48,0.85)]'
      : 'border-edge hover:border-[rgba(255,59,48,0.45)] focus:border-brand/70'
  const glyphFrame =
    tone === 'brand' ? 'search-brand border-brand/35 text-brand' : 'border-edge text-slate-400'
  const glyphBox = 'w-6 h-6 sm:w-7 sm:h-7'
  const glyph = size === 'lg' ? 'w-3.5 h-3.5 sm:w-4 sm:h-4' : 'w-3.5 h-3.5'

  return (
    <div ref={boxRef} className={`group relative w-full ${className}`}>





      <span
        aria-hidden="true"
        className={`pointer-events-none absolute left-1.5 top-1/2 z-10 grid place-items-center ${glyphBox} -translate-y-1/2 bg-page border ${glyphFrame} clip-corner-btn transition-colors duration-200 group-focus-within:border-[rgba(255,59,48,0.55)] group-focus-within:text-brand`}
      >
        <Search className={glyph} />
      </span>
      <input
        ref={inputRef}
        type="search"
        value={value}
        onChange={(event) => {
          onChange(event.target.value)
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
        className={`w-full bg-surface border ${frame} text-ink caret-brand placeholder:text-slate-500 clip-corner-btn input-3d outline-none transition-colors duration-200 ${inputSize}`}
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
            <ul data-lenis-prevent id={listId} role="listbox" aria-label={t('directory.searchAria')} className="overflow-y-auto scrollbar-none py-1">
              {results.map((entry, i) => (
                <li key={entry.slug} role="option" aria-selected={i === active}>
                  <button
                    type="button"
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

