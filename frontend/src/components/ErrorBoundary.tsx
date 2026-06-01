import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="min-h-screen flex items-center justify-center p-8"
          style={{ background: 'var(--background)', color: 'var(--foreground)' }}
        >
          <div className="max-w-md text-center space-y-4">
            <div
              className="inline-flex h-16 w-16 items-center justify-center rounded-full text-3xl"
              style={{ background: 'rgba(239,68,68,0.1)' }}
            >
              ⚠️
            </div>
            <h1 className="text-2xl font-semibold">Something went wrong</h1>
            <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
              An unexpected error occurred. Please try refreshing the page.
            </p>
            <pre
              className="text-xs text-left p-4 rounded-lg overflow-auto max-h-32"
              style={{
                background: 'rgba(239,68,68,0.05)',
                border: '1px solid rgba(239,68,68,0.15)',
                color: 'var(--danger)',
              }}
            >
              {this.state.error?.message}
            </pre>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold transition"
              style={{ background: 'var(--primary)', color: '#fff' }}
            >
              Reload Page
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
