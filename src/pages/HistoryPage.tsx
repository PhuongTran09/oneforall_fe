import { useCallback, useEffect, useRef, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import {
  Download,
  Trash2,
  Search,
  FileImage,
  Video,
  RefreshCw,
  Inbox,
  Clock,
  ChevronDown,
  Check,
  XCircle,
} from 'lucide-react'
import { Button } from '../components/common/Button'
import { ConfirmModal } from '../components/feedback/ConfirmModal'
import { showErrorPopup } from '../components/feedback/errorPopupStore'
import { t, getLang } from '../i18n/langStore'
import { useAuth } from '../services/authStore'
import { jobsApi } from '../services/api/jobsApi'
import { filesApi } from '../services/api/filesApi'
import { ApiClientError, type JobHistoryItem } from '../services/api/types'
import { describeError } from '../utils/apiError'
import { forgetJobInToolSnapshots } from '../utils/toolStateStore'

interface LayoutContext {
  openAuth: (mode: 'login' | 'register') => void
}

const PAGE_SIZE = 20

const STATUS_KEYS = ['queued', 'processing', 'completed', 'failed', 'cancelled', 'expired'] as const
// Giá trị khớp đúng chữ backend ghi vào jobs.type (image.py / media.py / convert_file.py)
// — filter gửi lên là so sánh bằng nhau ở BE, nên lệch một ký tự là ra danh sách trống.
const TYPE_KEYS = ['image_process', 'video', 'convert_file'] as const

function formatDateTime(iso: string | null): string {
  if (!iso) return '—'
  try {
    return new Intl.DateTimeFormat(getLang(), { dateStyle: 'medium', timeStyle: 'short' }).format(
      new Date(iso),
    )
  } catch {
    return iso
  }
}

function formatSize(bytes: number | null): string {
  if (bytes == null) return '—'
  const units = ['B', 'KB', 'MB', 'GB']
  let v = bytes
  let i = 0
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024
    i++
  }
  return `${i === 0 ? v : v.toFixed(1)} ${units[i]}`
}

function statusLabel(status: string): string {
  return (STATUS_KEYS as readonly string[]).includes(status)
    ? t(`history.status.${status}`)
    : status
}

function typeLabel(type: string): string {
  return (TYPE_KEYS as readonly string[]).includes(type) ? t(`history.type.${type}`) : type
}

function TypeIcon({ type }: { type: string }) {
  const cls = 'w-5 h-5'
  if (type === 'image_process') return <FileImage className={cls} />
  if (type === 'video') return <Video className={cls} />
  return <RefreshCw className={cls} />
}

function statusChipClass(status: string): string {
  if (status === 'completed')
    return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
  if (status === 'failed')
    return 'text-brand-2 border-brand/40 bg-brand/10'
  if (status === 'processing' || status === 'queued')
    return 'text-brand-3 border-brand-2/30 bg-brand-2/10'
  return 'text-soft border-edge bg-page'
}

const fieldClass =
  'bg-page border border-brand/30 focus:border-brand focus:ring-1 focus:ring-[#ff3b30] text-sm text-ink outline-none transition-all clip-corner-btn'

interface FilterOption {
  value: string
  label: string
}

// Dropdown custom theo style web — icon sát ngay nhãn (gap-1), menu vát góc.
function FilterSelect({
  ariaLabel,
  value,
  options,
  onChange,
}: {
  ariaLabel: string
  value: string
  options: FilterOption[]
  onChange: (value: string) => void
}) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const selected = options.find((o) => o.value === value) ?? options[0]

  useEffect(() => {
    if (!open) return
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  return (
    <div className="relative shrink-0" ref={rootRef}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className={`inline-flex items-center gap-1 px-3.5 py-2.5 ${fieldClass} ${
          open ? 'border-brand ring-1 ring-[#ff3b30]' : ''
        }`}
      >
        <span className="truncate">{selected.label}</span>
        <ChevronDown
          className={`w-4 h-4 shrink-0 text-soft transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <div
          role="listbox"
          aria-label={ariaLabel}
          className="absolute left-0 mt-2 min-w-full bg-surface border border-[rgba(255,59,48,0.35)] clip-corner-card shadow-xl py-1 z-50"
        >
          {options.map((o) => (
            <button
              key={o.value || 'all'}
              type="button"
              role="option"
              aria-selected={o.value === value}
              onClick={() => {
                onChange(o.value)
                setOpen(false)
              }}
              className={`flex items-center gap-2 w-full px-3 py-2 text-sm text-left whitespace-nowrap transition-colors ${
                o.value === value
                  ? 'text-brand-2 bg-brand/10 font-medium'
                  : 'text-soft hover:text-ink hover:bg-brand/10'
              }`}
            >
              <Check className={`w-4 h-4 shrink-0 ${o.value === value ? 'opacity-100' : 'opacity-0'}`} />
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export function HistoryPage() {
  const context = useOutletContext<LayoutContext | null>()
  const { session, ready } = useAuth()
  const user = session?.user ?? null

  const [items, setItems] = useState<JobHistoryItem[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState('')
  const [type, setType] = useState('')
  const [q, setQ] = useState('')
  const [query, setQuery] = useState('') // giá trị đã debounce, mới đưa vào request
  const [busyIds, setBusyIds] = useState<Set<string>>(new Set())
  const [reloadTick, setReloadTick] = useState(0) // popup lỗi "Thử lại" → tăng để fetch lại
  const [confirmAction, setConfirmAction] = useState<{ item: JobHistoryItem; kind: 'delete' | 'cancel' } | null>(null)
  const searchTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const load = useCallback(
    async (signal?: AbortSignal) => {
      if (!user) return
      setLoading(true)
      try {
        const res = await jobsApi.listJobs(
          { status: status || undefined, type: type || undefined, q: query.trim() || undefined, page, page_size: PAGE_SIZE },
          signal,
        )
        if (signal?.aborted) return
        setItems(res.items)
        setTotalPages(res.total_pages || 1)
      } catch {
        if (!signal?.aborted) {
          showErrorPopup({ message: t('history.error'), onRetry: () => setReloadTick((n) => n + 1) })
        }
      } finally {
        if (!signal?.aborted) setLoading(false)
      }
    },
    [user, status, type, query, page],
  )

  // Fetch khi đổi filter/page — KHÔNG auto-poll (§8). q đã debounce vào query.
  useEffect(() => {
    if (!user) return
    const controller = new AbortController()
    // defer 1 microtask: setLoading trong load không chạy đồng bộ trong effect body.
    void Promise.resolve().then(() => load(controller.signal))
    return () => controller.abort()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, status, type, page, query, reloadTick])

  const markGone = (id: string, downloadable: boolean) =>
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, downloadable } : it)))

  const onSearch = (value: string) => {
    setQ(value)
    if (searchTimer.current) clearTimeout(searchTimer.current)
    searchTimer.current = setTimeout(() => {
      setQuery(value)
      setPage(1)
    }, 400)
  }

  const handleDownload = async (item: JobHistoryItem) => {
    setBusyIds((s) => new Set(s).add(item.id))
    try {
      // Bearer qua apiClient, backend tự lấy output_key theo quyền sở hữu (§4).
      const res = await filesApi.getPresignedDownloadUrl(item.id)
      if (res.url) {
        const a = document.createElement('a')
        a.href = res.url
        a.rel = 'noopener'
        document.body.appendChild(a)
        a.click()
        a.remove()
      }
    } catch (err) {
      // 404/410: job đã bị dọn / hết hạn giữa chừng → báo không khả dụng (§6/§9).
      if (err instanceof ApiClientError && (err.status === 404 || err.status === 410)) {
        markGone(item.id, false)
      } else {
        showErrorPopup({ message: describeError(err, t('history.downloadError')).message })
      }
    } finally {
      setBusyIds((s) => {
        const next = new Set(s)
        next.delete(item.id)
        return next
      })
    }
  }

  // Hủy job đang chờ/xử lý: BE CAS theo trạng thái, 409 = vừa hoàn tất → refresh lại.
  const handleCancel = async (item: JobHistoryItem) => {
    setBusyIds((s) => new Set(s).add(item.id))
    try {
      await jobsApi.cancelJob(item.id)
    } catch (err) {
      showErrorPopup({ message: describeError(err, t('history.cancelError')).message })
    } finally {
      setBusyIds((s) => {
        const next = new Set(s)
        next.delete(item.id)
        return next
      })
    }
    void load()
  }

  const isRunning = (item: JobHistoryItem) =>
    item.status === 'queued' || item.status === 'processing'

  // BE giữ §5: không xóa row đang queued/processing (worker còn có thể ghi kết quả).
  // Nên xóa một job đang chạy = hủy trước (worker dừng subprocess + nhả slot) rồi xóa.
  // 409 ở bước hủy = job vừa tự hoàn tất/fail trong nhịp vừa rồi → xóa tiếp bình thường.
  const handleDelete = async (item: JobHistoryItem) => {
    setBusyIds((s) => new Set(s).add(item.id))
    try {
      if (isRunning(item)) {
        try {
          await jobsApi.cancelJob(item.id)
        } catch (err) {
          if (!(err instanceof ApiClientError && err.status === 409)) throw err
        }
      }
      await jobsApi.deleteJob(item.id)
      forgetJobInToolSnapshots(item.id)
      setItems((prev) => prev.filter((it) => it.id !== item.id))
    } catch (err) {
      if (err instanceof ApiClientError && err.status === 404) {
        // Đã bị dọn trước đó → xóa khỏi UI và làm mới để đồng bộ.
        forgetJobInToolSnapshots(item.id)
        setItems((prev) => prev.filter((it) => it.id !== item.id))
        void load()
      } else {
        showErrorPopup({ message: describeError(err, t('history.deleteError')).message })
      }
    } finally {
      setBusyIds((s) => {
        const next = new Set(s)
        next.delete(item.id)
        return next
      })
    }
  }

  if (!ready) {
    return <div className="py-16 text-center text-soft">{t('history.loading')}</div>
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="inline-flex w-16 h-16 items-center justify-center bg-brand/10 border border-brand/30 clip-corner-btn mb-4">
          <Clock className="w-8 h-8 text-brand-2" />
        </div>
        <p className="text-slate-300 mb-4">{t('history.needLogin')}</p>
        <Button variant="glow" onClick={() => context?.openAuth('login')}>
          {t('auth.login')}
        </Button>
      </div>
    )
  }

  // Job còn queued/processing: xóa = dừng rồi xóa, nên lời xác nhận phải nói rõ.
  const confirmMessage = !confirmAction
    ? ''
    : confirmAction.kind === 'cancel'
      ? t('history.cancelConfirm')
      : isRunning(confirmAction.item)
        ? t('history.confirmDeleteRunning')
        : t('history.confirmDelete')

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-2xl sm:text-3xl font-bold text-ink tracking-tight mb-1">{t('history.title')}</h1>
      <p className="text-soft mb-6">{t('history.subtitle')}</p>

      {/* Toolbar: search + filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-soft pointer-events-none z-10" />
          <input
            type="text"
            value={q}
            onChange={(e) => onSearch(e.target.value)}
            placeholder={t('history.searchPlaceholder')}
            className={`w-full pl-10 pr-3 py-2.5 ${fieldClass}`}
          />
        </div>
        <FilterSelect
          ariaLabel={t('history.colStatus')}
          value={status}
          options={[
            { value: '', label: t('history.filterAllStatus') },
            ...STATUS_KEYS.map((s) => ({ value: s, label: statusLabel(s) })),
          ]}
          onChange={(v) => {
            setStatus(v)
            setPage(1)
          }}
        />
        <FilterSelect
          ariaLabel={t('history.colType')}
          value={type}
          options={[
            { value: '', label: t('history.filterAllType') },
            ...TYPE_KEYS.map((s) => ({ value: s, label: typeLabel(s) })),
          ]}
          onChange={(v) => {
            setType(v)
            setPage(1)
          }}
        />
      </div>

      {loading ? (
        <div className="bg-surface border border-edge clip-corner-lg divide-y divide-edge overflow-hidden">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="p-4 flex items-center gap-4 animate-pulse" aria-hidden="true">
              <div className="w-10 h-10 bg-elev clip-corner-btn shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-2/3 bg-elev clip-corner-btn" />
                <div className="h-3 w-1/3 bg-elev/70 clip-corner-btn" />
              </div>
              <div className="hidden md:block w-20 h-6 bg-elev badge-angular" />
              <div className="w-24 h-8 bg-elev clip-corner-btn" />
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="bg-surface border border-[rgba(255,59,48,0.22)] clip-corner-lg card-3d py-16 px-4 text-center">
          <div className="inline-flex w-16 h-16 items-center justify-center bg-brand/10 border border-brand/30 clip-corner-btn mb-4">
            <Inbox className="w-8 h-8 text-brand-2" />
          </div>
          <p className="text-soft">{t('history.empty')}</p>
        </div>
      ) : (
        <div className="bg-surface border border-[rgba(255,59,48,0.35)] clip-corner-lg overflow-hidden divide-y divide-edge">
          {items.map((item) => (
            <div
              key={item.id}
              className="p-4 flex flex-col md:flex-row md:items-center gap-3 md:gap-4 hover:bg-brand/5 transition-colors"
            >
              <div className="w-10 h-10 shrink-0 bg-tint border border-[rgba(255,59,48,0.25)] clip-corner-btn flex items-center justify-center text-brand-2">
                <TypeIcon type={item.type} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="truncate text-ink font-medium" title={item.filename ?? undefined}>
                  {item.filename ?? t('common.unknownFile')}
                </div>
                <div className="text-xs text-soft mt-0.5">
                  {typeLabel(item.type)} · {formatDateTime(item.created_at)} · {formatSize(item.file_size)}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 md:ml-auto">
                <span
                  className={`inline-flex items-center px-2.5 py-1 text-[10px] font-bold badge-angular border ${statusChipClass(item.status)}`}
                >
                  {statusLabel(item.status)}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={!item.downloadable || busyIds.has(item.id)}
                  onClick={() => void handleDownload(item)}
                  leftIcon={<Download className="w-4 h-4" />}
                  title={item.downloadable ? t('history.download') : t('history.unavailable')}
                >
                  {t('history.download')}
                </Button>
                {(item.status === 'queued' || item.status === 'processing') && (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={busyIds.has(item.id)}
                    onClick={() => setConfirmAction({ item, kind: 'cancel' })}
                    leftIcon={<XCircle className="w-4 h-4" />}
                    title={t('history.cancelHint')}
                  >
                    {t('history.cancel')}
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={busyIds.has(item.id)}
                  onClick={() => setConfirmAction({ item, kind: 'delete' })}
                  leftIcon={<Trash2 className="w-4 h-4" />}
                  aria-label={t('history.delete')}
                >
                  {t('history.delete')}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-6">
          <Button size="sm" variant="secondary" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            {t('history.prev')}
          </Button>
          <span className="text-sm text-soft">{t('history.page', { page, total: totalPages })}</span>
          <Button
            size="sm"
            variant="secondary"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            {t('history.next')}
          </Button>
        </div>
      )}

      <ConfirmModal
        isOpen={confirmAction !== null}
        title={
          confirmAction?.kind === 'delete' ? t('history.confirmDeleteTitle') : t('history.cancelConfirmTitle')
        }
        message={confirmMessage}
        onConfirm={() => {
          const action = confirmAction
          setConfirmAction(null)
          if (!action) return
          void (action.kind === 'delete' ? handleDelete(action.item) : handleCancel(action.item))
        }}
        onClose={() => setConfirmAction(null)}
      />
    </div>
  )
}
