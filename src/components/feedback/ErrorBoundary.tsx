import { Component, type ErrorInfo, type ReactNode } from 'react'
import { AlertOctagon, RotateCcw, Home } from 'lucide-react'
import { Button } from '../common/Button'
import { t } from '../../i18n/langStore'

interface State {
  error: Error | null
}

// Chốt chặn cuối cho lỗi KHÔNG kiểm soát được (throw lúc render/event) —
// API/job error đã có ErrorPopupViewport lo riêng.
export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack)
  }

  private reset = () => this.setState({ error: null })

  render() {
    const { error } = this.state
    if (!error) return this.props.children

    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md p-6 sm:p-8 bg-surface border border-[rgba(255,59,48,0.35)] clip-corner-lg card-3d text-center space-y-4">
          <div className="inline-flex w-14 h-14 items-center justify-center bg-brand/10 border border-brand/30 text-brand clip-corner-btn">
            <AlertOctagon className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-bold text-ink">{t('errorBoundary.title')}</h2>
          <p className="text-sm text-slate-400 leading-relaxed">{t('errorBoundary.desc')}</p>
          {import.meta.env.DEV && error.message && (
            <p className="text-xs font-mono text-brand-2 bg-page border border-edge clip-corner-card px-3 py-2 break-words [overflow-wrap:anywhere] text-left">
              {error.message}
            </p>
          )}
          <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
            <Button variant="primary" fullWidth size="md" leftIcon={<RotateCcw className="w-4 h-4" />} onClick={this.reset}>
              {t('errorBoundary.retry')}
            </Button>
            <Button
              variant="secondary"
              fullWidth
              size="md"
              leftIcon={<Home className="w-4 h-4" />}
              onClick={() => {
                window.location.href = '/'
              }}
            >
              {t('common.home')}
            </Button>
          </div>
        </div>
      </div>
    )
  }
}
