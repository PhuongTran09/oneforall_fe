import { t } from '../../../i18n/langStore'
import type { SpinPhase, SpinWinner } from '../hooks/useSquareSpin'

export interface WheelResult {
  slot: string
  label: string
  phase: SpinPhase
  winner: SpinWinner | null
  /** Số tên hợp lệ đang quay — hiện cạnh kết quả để chứng minh 1/N. */
  count: number
}

export interface SpinResultPanelProps {
  results: WheelResult[]
}

/** Vùng kết quả. `role="status"` nên screen reader đọc lại mỗi lần có kết quả mới. */
export function SpinResultPanel({ results }: SpinResultPanelProps) {
  return (
    <div className="spin-results space-y-2" role="status" aria-live="polite">
      <h3 className="text-sm font-semibold text-ink">{t('spin.results')}</h3>
      {results.length === 0 ? (
        <p className="text-xs text-slate-400">{t('spin.noResult')}</p>
      ) : (
        <div className="spin-result-rows" data-double={results.length > 1}>
          {results.map((result) => (
            <div
              key={result.slot}
              className="spin-result-row flex items-center gap-3 p-3 bg-page border border-edge clip-corner-card"
              data-slot={result.slot}
              data-phase={result.phase}
            >
              <span className="shrink-0 px-2 py-1 text-[10px] font-mono uppercase tracking-wide text-slate-300 bg-elev border border-edge clip-corner-btn">
                {result.label}
              </span>
              <div className="min-w-0 flex-1">
                {result.winner ? (
                  <>
                    <p className="spin-result-name text-base sm:text-lg font-bold text-ink break-words">{result.winner.name}</p>
                    <p className="text-[11px] font-mono text-slate-500">{t('spin.odds', { count: result.winner.poolSize })}</p>
                  </>
                ) : (
                  <p className="text-sm text-slate-400">
                    {result.phase === 'spinning' ? t('spin.state.spinning') : result.count === 0 ? t('spin.list.empty') : t('spin.noResult')}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
