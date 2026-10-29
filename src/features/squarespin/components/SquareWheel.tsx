import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { Play } from 'lucide-react'
import { t } from '../../../i18n/langStore'
import { glassFill, glassTint, litColor, mixHex, pickInk, toHex, CELL_TINT, CELL_TINT_LIT } from '../defaults'
import type { WheelSlot } from '../types'
import { hubBox, hubBtnShowsLabel } from '../utils/hub'
import {
  CELL_BORDER,
  fitFontSize,
  hasRoom,
  MAX_FONT,
  MIN_FONT,
  type WheelCell,
  type WheelLayout,
} from '../utils/wheel'
import type { SpinPhase } from '../hooks/useSquareSpin'

export interface SquareWheelProps {
  slot: WheelSlot
  layout: WheelLayout
  phase: SpinPhase
  /** Ô đang sáng giữa lượt quay, null khi đứng. */
  litSlot: number | null
  winnerEntryId: string | null
  /** Kết quả — truyền thẳng vì ô có thể đã bị xoá (remove-winner). */
  winnerName: string | null
  /** Nhãn vòng khi quay đôi. */
  label: string
  /** Số tên hợp lệ trên vành. */
  count: number
  onSpin: () => void
  /** Đang quay: dùng aria-disabled thay vì disabled để không đá focus về body. */
  busy: boolean
}

interface CellStyle extends CSSProperties {
  left: string
  top: string
  width: string
  height: string
  '--cell-fs'?: string
  '--cell-color'?: string
  '--cell-ink'?: string
  '--cell-lit'?: string
  '--cell-lit-ink'?: string
}

interface HubStyle extends CSSProperties {
  '--hub-meta-fs': string
  '--hub-name-fs': string
  '--hub-btn-w': string
  '--hub-btn-h': string
  '--hub-btn-fs': string
  '--hub-name-h': string
  '--hub-gap': string
  '--hub-bg'?: string
  '--hub-edge'?: string
  '--hub-ink'?: string
  '--hub-meta-ink'?: string
}

/** Ô theo % của bảng, trừ padding + viền để ra hộp thật. */
function cellBox(cell: WheelCell, boardPx: number, pad: number) {
  const loss = 2 * (pad + CELL_BORDER)
  return { w: (cell.width / 100) * boardPx - loss, h: (cell.height / 100) * boardPx - loss }
}

/**
 * Cặp tint + mực cho một màu nền: tint là gì CSS sẽ vẽ trong suốt `alpha` trên nền
 * bảng, mực kiểm trên màu ghép thật. board chưa đọc được (lần render đầu) thì bỏ
 * qua phép pha, dùng màu nguyên chất.
 */
function cellGlass(board: string | null, hex: string, alpha: number) {
  if (board === null) return { tint: hex, ink: pickInk(hex) }
  const tint = glassTint(board, hex, alpha)
  return { tint, ink: pickInk(glassFill(board, tint, alpha)) }
}

/** Nền bảng đổi theo theme — đọc hex đã phân giải để JS tính tương phản đúng. */
function readBoardBg(): string | null {
  if (typeof document === 'undefined') return null
  return toHex(getComputedStyle(document.documentElement).getPropertyValue('--bg-elevated'))
}

export function SquareWheel({
  slot,
  layout,
  phase,
  litSlot,
  winnerEntryId,
  winnerName,
  label,
  count,
  onSpin,
  busy,
}: SquareWheelProps) {
  const boardRef = useRef<HTMLDivElement>(null)
  const [boardPx, setBoardPx] = useState(0)
  const [boardHex, setBoardHex] = useState(readBoardBg)

  // Theme đổi qua data-theme trên <html>, không có event nào khác — phải tự theo dõi.
  useEffect(() => {
    const sync = () => {
      const next = readBoardBg()
      setBoardHex((prev) => (prev === next ? prev : next))
    }
    sync()
    const observer = new MutationObserver(sync)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    return () => observer.disconnect()
  }, [])

  // Cỡ chữ phụ thuộc bề ngang thật của bảng.
  useEffect(() => {
    const el = boardRef.current
    if (!el) return
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width ?? 0
      setBoardPx((prev) => (Math.abs(prev - w) < 0.5 ? prev : w))
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const pad = layout.pad
  const cta = t('spin.cta')

  const hub = hubBox(boardPx, layout.depth)
  const nameFits = hub.inner > 0 && winnerName !== null && hasRoom(winnerName, hub.inner - 16, Math.max(0, hub.nameH - 8))
  const hubFs = hub.inner > 0 && winnerName !== null ? fitFontSize(winnerName, hub.inner - 16, Math.max(0, hub.nameH - 8)) : MAX_FONT
  const showLabel = hubBtnShowsLabel(hub.btnW, hub.btnH, hub.btnFs, cta)

  // Hub cũng là hộp kết quả — có trúng thì kính của ô trúng tô luôn khung, mực đổi theo.
  const winnerColor = winnerEntryId !== null ? layout.cells.find((c) => c.entry?.id === winnerEntryId)?.entry?.color ?? null : null
  const hubGlass = winnerColor === null ? null : cellGlass(boardHex, winnerColor, CELL_TINT)

  const boardStyle = {
    '--spin-per': String(layout.per),
    '--spin-depth': layout.depth.toFixed(4),
    '--spin-pad': `${pad}px`,
  } as CSSProperties

  const hubStyle: HubStyle = {
    '--hub-meta-fs': `${hub.metaFs.toFixed(2)}px`,
    '--hub-name-fs': `${hubFs}px`,
    '--hub-btn-w': `${hub.btnW.toFixed(2)}px`,
    '--hub-btn-h': `${hub.btnH.toFixed(2)}px`,
    '--hub-btn-fs': `${hub.btnFs}px`,
    '--hub-name-h': `${hub.nameH.toFixed(2)}px`,
    '--hub-gap': `${hub.gap}px`,
    ...(hubGlass !== null
      ? {
          '--hub-bg': hubGlass.tint,
          '--hub-edge': mixHex(hubGlass.tint, '#ffffff', 0.45),
          '--hub-ink': hubGlass.ink,
          '--hub-meta-ink': hubGlass.ink,
        }
      : {}),
  }

  // Mô hình chữ trong utils/wheel chỉ là ước lượng; đo lại trên DOM và hạ cỡ chữ
  // cho tới khi tên nằm gọn — không bao giờ bị cắt hay đè sang ô kề.
  useEffect(() => {
    const board = boardRef.current
    if (!board || boardPx <= 0) return
    const over = (el: HTMLElement) => el.scrollHeight > el.clientHeight || el.scrollWidth > el.clientWidth
    const shrink = (host: HTMLElement, cssVar: string, from: number) => {
      let fs = from
      host.style.setProperty(cssVar, `${fs}px`)
      while (fs > MIN_FONT && over(host)) {
        fs -= 0.25
        host.style.setProperty(cssVar, `${fs.toFixed(2)}px`)
      }
      return !over(host)
    }

    for (const cell of layout.cells) {
      if (!cell.entry) continue
      const el = board.querySelector<HTMLElement>(`.spin-cell[data-cell="${cell.slot}"]`)
      if (!el) continue
      const box = cellBox(cell, boardPx, pad)
      shrink(el, '--cell-fs', fitFontSize(cell.entry.name, box.w, box.h))
    }

    const btnEl = board.querySelector<HTMLElement>('.spin-hub-btn')
    if (btnEl?.querySelector('.spin-hub-btn-text')) shrink(btnEl, '--hub-btn-fs', hub.btnFs)

    // Đo trên namebox, không đo trên .spin-hub — hub còn chứa nút quay.
    const nameBox = board.querySelector<HTMLElement>('.spin-hub-namebox')
    if (nameBox) {
      const fits = shrink(nameBox, '--hub-name-fs', fitFontSize(winnerName ?? '', hub.inner - 16, Math.max(0, hub.nameH - 8)))
      nameBox.style.visibility = winnerName !== null && fits ? 'visible' : 'hidden'
    }
  }, [boardPx, layout, pad, hub.inner, hub.nameH, hub.btnFs, phase, winnerName])

  return (
    <div className="spin-wheel" data-slot={slot} data-phase={phase} role="group" aria-label={label}>
      <div className="spin-board" ref={boardRef} style={boardStyle}>
        {layout.cells.map((cell) => {
          const win = winnerEntryId !== null && cell.entry?.id === winnerEntryId
          const style: CellStyle = {
            left: `${cell.left}%`,
            top: `${cell.top}%`,
            width: `${cell.width}%`,
            height: `${cell.height}%`,
          }
          if (cell.entry) {
            // tint + mực là hex JS trộn sẵn để tương phản đúng trên cả hai theme.
            const base = cell.entry.color
            const rest = cellGlass(boardHex, base, CELL_TINT)
            const lit = cellGlass(boardHex, litColor(base), CELL_TINT_LIT)
            style['--cell-color'] = rest.tint
            style['--cell-ink'] = rest.ink
            style['--cell-lit'] = lit.tint
            style['--cell-lit-ink'] = lit.ink
            if (boardPx > 0) {
              const box = cellBox(cell, boardPx, pad)
              style['--cell-fs'] = `${fitFontSize(cell.entry.name, box.w, box.h)}px`
            }
          }
          return (
            <div
              key={cell.slot}
              className="spin-cell"
              data-cell={cell.slot}
              data-empty={cell.entry === null}
              data-lit={cell.slot === litSlot}
              data-win={win}
              style={style}
              title={cell.entry?.name}
            >
              {cell.entry ? <span className="spin-cell-name">{cell.entry.name}</span> : null}
            </div>
          )
        })}

        <div className="spin-hub" style={hubStyle}>
          <span className={hub.tight ? 'spin-hub-label sr-only' : 'spin-hub-label'}>{label}</span>
          <span className={hub.tight ? 'spin-hub-state sr-only' : 'spin-hub-state'}>
            {phase === 'spinning' ? t('spin.state.spinning') : phase === 'stopped' ? t('spin.state.stopped') : t('spin.state.idle', { count })}
          </span>
          {/* Vùng kết quả luôn được render để giữ chỗ — nút không dịch khi có kết quả. */}
          <div className="spin-hub-namebox" key={winnerEntryId ?? 'win'}>
            {winnerName !== null && nameFits ? <span className="spin-hub-name">{winnerName}</span> : null}
          </div>
          {/* Nút quay đáy hub: nhỏ, dài, style nút primary của dự án (gradient + vát góc + 3D). */}
          <button
            type="button"
            className="spin-hub-btn"
            onClick={onSpin}
            disabled={count === 0}
            aria-disabled={busy}
            data-busy={busy}
            aria-label={t('spin.hubSpinAria', { label })}
          >
            {showLabel ? <span className="spin-hub-btn-text">{cta}</span> : <Play className="spin-hub-icon" aria-hidden="true" />}
          </button>
        </div>
      </div>
    </div>
  )
}
