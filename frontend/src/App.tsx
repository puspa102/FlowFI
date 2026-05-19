import { useState, type FormEvent } from 'react'
import './App.css'

function App() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  })
  const [statusMessage, setStatusMessage] = useState('')
  const [statusType, setStatusType] = useState<'idle' | 'success' | 'error'>('idle')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3001'

  const updateField = (
    field: keyof typeof formData,
    value: string | boolean,
  ) => {
    setFormData((current) => ({
      ...current,
      [field]: value,
    }))
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)
    setStatusMessage('')
    setStatusType('idle')

    try {
      const response = await fetch(`${apiBaseUrl}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      })

      const payload = (await response.json().catch(() => ({}))) as {
        message?: string
        token?: string
        error?: string
      }

      if (!response.ok) {
        throw new Error(payload.error ?? 'Login failed.')
      }

      if (payload.token) {
        if (formData.rememberMe) {
          localStorage.setItem('flofi_auth_token', payload.token)
        } else {
          sessionStorage.setItem('flofi_auth_token', payload.token)
        }
      }

      setStatusType('success')
      setStatusMessage(payload.message ?? 'Login successful.')
      setFormData({
        email: '',
        password: '',
        rememberMe: false,
      })
    } catch (error) {
      setStatusType('error')
      setStatusMessage(error instanceof Error ? error.message : 'Login failed.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="auth-shell">
      <section className="auth-hero" aria-label="Brand showcase">
        <div className="brand-badge">FloFi</div>
        <div className="hero-copy">
          <h1>Precision Wealth Engineering.</h1>
          <p>
            Advanced AI-driven insights for the next generation of financial mastery.
          </p>
        </div>

        <div className="hero-dots" aria-hidden="true">
          <span className="is-active" />
          <span />
          <span />
        </div>

        <div className="hero-wave" aria-hidden="true">
          <span className="wave wave-one" />
          <span className="wave wave-two" />
          <span className="wave wave-three" />
          <span className="wave wave-four" />
          <span className="wave wave-five" />
          <span className="wave wave-six" />
          <span className="wave wave-seven" />
        </div>
      </section>

      <section className="auth-panel" aria-label="Login form">
        <div className="panel-header">
          <h2>Welcome Back</h2>
          <p className="panel-copy">Access your FloFi Pro dashboard</p>
        </div>

        <form className="registration-form login-form" onSubmit={handleSubmit}>
          <label>
            <span>Email Address</span>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              autoComplete="email"
              value={formData.email}
              onChange={(event) => updateField('email', event.target.value)}
              required
            />
          </label>

          <label>
            <span>Password</span>
            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              autoComplete="current-password"
              value={formData.password}
              onChange={(event) => updateField('password', event.target.value)}
              required
            />
          </label>

          <div className="login-meta">
            <label className="remember-row">
              <input
                type="checkbox"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={(event) => updateField('rememberMe', event.target.checked)}
              />
              <span>Remember me</span>
            </label>

            <a href="#">Forgot password?</a>
          </div>

          <button type="submit" className="primary-button" disabled={isSubmitting}>
            {isSubmitting ? 'Signing in...' : 'Sign In'}
          </button>

          {statusMessage ? (
            <p className={`status-message status-${statusType}`}>{statusMessage}</p>
          ) : null}

          <div className="divider divider-text" role="presentation">
            <span>OR CONTINUE WITH</span>
          </div>

          <div className="auth-actions compact-actions" aria-label="Social login options">
            <button type="button" className="social-button">
              Google
            </button>
            <button type="button" className="social-button">
              Apple
            </button>
          </div>

          <p className="footer-copy">
            Don&apos;t have an account? <a href="#">Sign up</a>
          </p>
        </form>
      </section>
    </main>
  )
}

export default App
