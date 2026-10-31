import { useRef, useState } from 'react'
import { Coffee, Copy, Download, Lock, X } from 'lucide-react'
import { showToast } from '../feedback/toastStore'
import { getLang, t } from '../../i18n/langStore'
import { useReducedMotion } from '../../hooks/useReducedMotion'

const BANK = 'TPBank'
const ACCOUNT = '14781478177'
const HOLDER = 'TRAN HOANG PHUONG'
const NOTE_PREFIX = 'TKPOFA UNG HO'
const PRESETS = [5000, 10000, 20000]
/** NAPAS cắt nội dung khoảng 21 ký tự, mà prefix + số tiền đã chiếm ~20 nên phần thêm chỉ còn ít. */
const EXTRA_MAX = 6

const chipStyles = (active: boolean) =>
  `px-2.5 py-1 text-xs font-mono clip-corner-btn border transition-colors cursor-pointer ${
    active
      ? 'bg-brand-gradient text-white border-transparent'
      : 'bg-page text-soft border-edge hover:text-ink hover:border-brand/50'
  }`

function InfoRow({ label, value, onCopy }: { label: string; value: string; onCopy?: () => void }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-20 shrink-0 text-soft">{label}</span>
      <span className="min-w-0 flex-1 font-mono text-ink break-words">{value}</span>
      {onCopy && (
        <button
          type="button"
          onClick={onCopy}
          aria-label={label}
          className="shrink-0 p-1 text-soft hover:text-brand transition-colors clip-corner-btn cursor-pointer"
        >
          <Copy className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  )
}

export function BuyMeCoffee() {
  const [phase, setPhase] = useState<'closed' | 'open' | 'closing'>('closed')
  const [intl, setIntl] = useState(false)
  const [amountText, setAmountText] = useState(String(PRESETS[1]))
  const [noteExtra, setNoteExtra] = useState('')
  const lang = getLang()
  const reduced = useReducedMotion()
  const exitTimer = useRef<ReturnType<typeof setTimeout>>(undefined)

  const toggle = () => {
    clearTimeout(exitTimer.current)
    if (phase === 'closed' || phase === 'closing') {
      setPhase('open')
      return
    }
    if (reduced) {
      setPhase('closed')
      return
    }
    setPhase('closing')
    exitTimer.current = setTimeout(() => setPhase((p) => (p === 'closing' ? 'closed' : p)), 180)
  }

  const amount = Number.parseInt(amountText.replace(/\D/g, ''), 10) || 0
  const money = new Intl.NumberFormat(lang)
  const content = [NOTE_PREFIX, noteExtra.replace(/\s+/g, ' ').trim(), amount || '']
    .filter(Boolean)
    .join(' ')
  const qrUrl =
    `https://vietqr.app/img?bank=${BANK}&acc=${ACCOUNT}&template=` +
    `${amount ? `&amount=${amount}` : ''}&des=${encodeURIComponent(content)}` +
    `&showinfo=true&fullacc=true&holder=${encodeURIComponent(HOLDER)}`

  const copy = async (value: string, message: string) => {
    try {
      await navigator.clipboard.writeText(value)
      showToast({ type: 'success', message })
    } catch {
      showToast({ type: 'error', message: t('coffee.copyError') })
    }
  }

  return (
    <div className="coffee-dock fixed bottom-4 right-4 z-40 flex flex-col items-end gap-2">
      {phase !== 'closed' && (
        /* card-3d nằm ngoài khung cuộn: vệt sáng đáy mới bám đúng mép dưới panel
           thay vì bị cắt khi nội dung tràn. */
        <div
          className={`${phase === 'closing' ? 'in-out' : 'in-up'} w-[min(21rem,calc(100vw-2rem))] bg-surface border border-[rgba(255,59,48,0.35)] clip-corner-card card-3d card-3d-glow`}
        >
          <div className="max-h-[min(36rem,calc(100vh-6rem))] overflow-y-auto p-4 space-y-3">
            <div className="flex items-start gap-2">
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-bold text-ink flex items-center gap-1.5">
                  <Coffee className="w-4 h-4 text-brand shrink-0" />
                  {t('coffee.title')}
                </h3>
                <p className="mt-1 text-xs text-soft leading-relaxed">{t('coffee.desc')}</p>
              </div>
              <button
                type="button"
                onClick={toggle}
                aria-label={t('common.close')}
                className="shrink-0 p-1 text-soft hover:text-ink hover:bg-elev transition-colors clip-corner-btn cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-[3px] p-[3px] bg-elev border border-edge clip-corner-btn">
              {[false, true].map((tab) => (
                <button
                  key={String(tab)}
                  type="button"
                  onClick={() => setIntl(tab)}
                  aria-pressed={intl === tab}
                  className={`py-1.5 text-xs font-semibold clip-corner-btn transition-colors cursor-pointer ${
                    intl === tab ? 'bg-brand-gradient text-white' : 'text-soft hover:text-ink'
                  }`}
                >
                  {tab ? t('coffee.tabIntl') : t('coffee.tabVietnam')}
                </button>
              ))}
            </div>

            {intl ? (
              <div className="space-y-3">
                <p className="text-xs text-soft leading-relaxed">{t('coffee.intlDesc')}</p>
                <a href="/coffi-qr.webp" target="_blank" rel="noopener noreferrer" className="block">
                  <img
                    src="/coffi-qr.webp"
                    alt="Coffi QR"
                    width={820}
                    height={820}
                    loading="lazy"
                    decoding="async"
                    className="mx-auto w-48 h-48 bg-white p-1.5 clip-corner-btn"
                  />
                </a>
                <a
                  href="/coffi-qr.webp"
                  download="coffi-qr.webp"
                  className="w-full inline-flex items-center justify-center gap-1.5 text-xs px-3 py-1.5 font-medium bg-brand-gradient text-white btn-3d clip-corner-btn"
                >
                  <Download className="w-3.5 h-3.5" />
                  {t('coffee.download')}
                </a>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <span className="text-xs font-semibold text-ink">{t('coffee.amount')}</span>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {PRESETS.map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setAmountText(String(preset))}
                        aria-pressed={amount === preset}
                        className={chipStyles(amount === preset)}
                      >
                        {money.format(preset)}
                      </button>
                    ))}
                    <label className="relative flex items-center">
                      <input
                        type="number"
                        min={0}
                        step={1000}
                        inputMode="numeric"
                        value={amountText}
                        onChange={(e) => setAmountText(e.target.value)}
                        aria-label={t('coffee.amount')}
                        placeholder={t('coffee.custom')}
                        className="w-24 pl-2 pr-6 py-1 text-xs font-mono bg-page border border-edge text-ink placeholder:text-soft clip-corner-btn outline-none focus:border-brand"
                      />
                      <span className="pointer-events-none absolute right-2 text-xs text-soft">₫</span>
                    </label>
                  </div>
                </div>

                <label className="block space-y-1.5">
                  <span className="text-xs font-semibold text-ink">{t('coffee.content')}</span>
                  <span className="flex items-center bg-page border border-edge clip-corner-btn focus-within:border-brand">
                    {/* Prefix cố định: thiếu "TKPOFA" là không đối soát được khoản ủng hộ. */}
                    <span className="flex shrink-0 items-center gap-1 px-2 py-1.5 text-xs font-mono text-soft border-r border-edge select-none">
                      <Lock className="w-3 h-3" />
                      {NOTE_PREFIX}
                    </span>
                    <input
                      type="text"
                      maxLength={EXTRA_MAX}
                      value={noteExtra}
                      onChange={(e) => setNoteExtra(e.target.value)}
                      placeholder={t('coffee.noteExtra')}
                      className="min-w-0 flex-1 px-1 py-1.5 text-xs font-mono bg-transparent text-ink placeholder:text-soft outline-none"
                    />
                  </span>
                </label>

                <a href={qrUrl} target="_blank" rel="noopener noreferrer" className="block">
                  <img
                    src={qrUrl}
                    alt="VietQR"
                    width={224}
                    height={296}
                    loading="lazy"
                    decoding="async"
                    className="mx-auto w-56 h-auto bg-white p-1.5 clip-corner-btn"
                  />
                </a>
                <p className="text-[11px] text-soft leading-relaxed">{t('coffee.scanHint')}</p>

                <div className="space-y-1 pt-1 border-t border-edge">
                  <InfoRow label={t('coffee.bank')} value={BANK} />
                  <InfoRow
                    label={t('coffee.account')}
                    value={ACCOUNT}
                    onCopy={() => copy(ACCOUNT, t('coffee.copiedAccount'))}
                  />
                  <InfoRow label={t('coffee.holder')} value={HOLDER} />
                  <InfoRow
                    label={t('coffee.note')}
                    value={content}
                    onCopy={() => copy(content, t('coffee.copiedNote'))}
                  />
                </div>

                <a
                  href={qrUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-1.5 text-xs px-3 py-1.5 font-medium bg-brand-gradient text-white btn-3d clip-corner-btn"
                >
                  <Download className="w-3.5 h-3.5" />
                  {t('coffee.download')}
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={toggle}
        aria-expanded={phase === 'open'}
        className="float-glow inline-flex items-center gap-2 px-4 py-2.5 text-sm font-bold tracking-wide bg-brand-gradient text-white btn-3d clip-corner-btn cursor-pointer"
      >
        <Coffee className="w-5 h-5" />
        {t('coffee.open')}
      </button>
    </div>
  )
}
