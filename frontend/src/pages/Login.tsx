import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { motion } from 'framer-motion'
import { Settings2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { apiPost } from '../api/client'
import { setToken } from '@/store/slices/authSlice'

type LoginResponse = {
  token?: string
  error?: string
}

export default function Login() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)

    const response = await apiPost<LoginResponse>('/login', { email, password })

    if (response.ok && response.data?.token) {
      dispatch(setToken(response.data.token))
      navigate('/dashboard')
      return
    }

    setError(response.data?.error ?? 'Unable to log in. Please try again.')
    setIsSubmitting(false)
  }

  return (
    <div className="relative min-h-screen" style={{ background: 'var(--navy-950)' }}>
      <Link
        to="/settings"
        className="absolute right-4 top-4 z-20 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-white/80 backdrop-blur-md transition hover:border-primary/30 hover:bg-white/10 hover:text-white sm:right-6 sm:top-6"
      >
        <Settings2 className="h-4 w-4" />
        Appearance Settings
      </Link>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(20,184,166,0.08),transparent_45%),radial-gradient(circle_at_82%_10%,rgba(20,184,166,0.04),transparent_40%)]" />
      <div className="relative grid min-h-screen lg:grid-cols-2">
        <div className="flex items-center justify-center px-6 py-12 pt-24 lg:pt-12">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-md"
          >
            <div className="mb-8">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] mb-2" style={{ color: 'var(--primary)' }}>FloFi</p>
              <h1 className="font-display text-4xl italic text-white">Welcome back</h1>
              <p className="text-sm mt-2" style={{ color: 'var(--muted-foreground)' }}>Log in to your precision wealth dashboard.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>Email</label>
                <Input
                  type="email"
                  placeholder="alex@flofi.ai"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  className="bg-white/[0.04] border-white/[0.08] text-white rounded-md placeholder:text-white/30 focus:border-primary/40 focus:ring-primary/20"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>Password</label>
                <Input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  className="bg-white/[0.04] border-white/[0.08] text-white rounded-md placeholder:text-white/30 focus:border-primary/40 focus:ring-primary/20"
                />
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
                <label className="flex items-center gap-2" style={{ color: 'var(--muted-foreground)' }}>
                  <Checkbox id="remember" />
                  <span className="text-xs">Remember me</span>
                </label>
                <button className="text-xs hover:underline" type="button" style={{ color: 'var(--primary)' }}>
                  Forgot password?
                </button>
              </div>
              {error && <div className="rounded-md border px-4 py-3 text-sm" style={{ borderColor: 'rgba(239,68,68,0.2)', background: 'rgba(239,68,68,0.05)', color: 'var(--danger)' }}>{error}</div>}
              <Button className="w-full" type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Signing in...' : 'Sign in'}
              </Button>
            </form>

            <div className="mt-6 space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex-1 h-px bg-white/[0.06]" />
                <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'var(--muted-foreground)' }}>Or continue</span>
                <div className="flex-1 h-px bg-white/[0.06]" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" type="button">Google</Button>
                <Button variant="outline" type="button">Apple</Button>
              </div>
            </div>

            <p className="mt-6 text-sm" style={{ color: 'var(--muted-foreground)' }}>
              Don't have an account?{' '}
              <Link className="font-semibold hover:underline" style={{ color: 'var(--primary)' }} to="/register">Sign up</Link>
            </p>
          </motion.div>
        </div>

        <div className="relative hidden items-center justify-center px-8 py-12 lg:flex">
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom right, var(--navy-900), var(--navy-950), var(--navy-800))' }} />
          <div className="absolute inset-0 grid-pattern opacity-30" />
          <div className="relative z-10 flex max-w-md flex-col gap-6">
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--primary)' }}>AI Intelligence</p>
              <h2 className="font-display text-3xl italic text-white">Your portfolio, continuously optimized.</h2>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
                FloFi monitors your asset allocation and delivers proactive insights across risk, liquidity, and tax efficiency.
              </p>
            </div>
            <div className="glass-card rounded-lg p-5">
              <h3 className="text-sm font-semibold" style={{ color: 'var(--accent)' }}>AI Insight</h3>
              <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>Portfolio rebalanced with 3.2% risk reduction this week.</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="glass-card rounded-lg p-4">
                <p className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--muted-foreground)' }}>Net worth</p>
                <p className="text-xl font-bold text-white mt-1">$1.24M</p>
              </div>
              <div className="glass-card rounded-lg p-4">
                <p className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--muted-foreground)' }}>Cash runway</p>
                <p className="text-xl font-bold text-white mt-1">18 months</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
