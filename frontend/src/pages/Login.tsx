import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { apiPost, setAuthToken } from '../api/client'

type LoginResponse = {
  token?: string
  error?: string
}

export default function Login() {
  const navigate = useNavigate()
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
      setAuthToken(response.data.token)
      navigate('/dashboard')
      return
    }

    setError(response.data?.error ?? 'Unable to log in. Please try again.')
    setIsSubmitting(false)
  }

  return (
    <div className="relative min-h-screen bg-navy-950">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(0,212,170,0.08),transparent_45%),radial-gradient(circle_at_82%_10%,rgba(0,212,170,0.04),transparent_40%)]" />
      <div className="relative grid min-h-screen lg:grid-cols-2">
        {/* Login Form */}
        <div className="flex items-center justify-center px-6 py-12">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-md"
          >
            <div className="mb-8">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary mb-2">FloFi</p>
              <h1 className="font-display text-4xl italic text-white">Welcome back</h1>
              <p className="text-sm text-platinum mt-2">Log in to your precision wealth dashboard.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-platinum">Email</label>
                <Input
                  type="email"
                  placeholder="alex@flofi.ai"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  className="bg-white/[0.04] border-white/[0.08] text-white rounded-md placeholder:text-platinum/40 focus:border-primary/40 focus:ring-primary/20"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-platinum">Password</label>
                <Input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  className="bg-white/[0.04] border-white/[0.08] text-white rounded-md placeholder:text-platinum/40 focus:border-primary/40 focus:ring-primary/20"
                />
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
                <label className="flex items-center gap-2 text-platinum">
                  <Checkbox id="remember" />
                  <span className="text-xs">Remember me</span>
                </label>
                <button className="text-xs text-primary hover:underline" type="button">
                  Forgot password?
                </button>
              </div>
              {error && <div className="rounded-md border border-coral/20 bg-coral/5 px-4 py-3 text-sm text-coral">{error}</div>}
              <Button className="w-full" type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Signing in...' : 'Sign in'}
              </Button>
            </form>

            <div className="mt-6 space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex-1 h-px bg-white/[0.06]" />
                <span className="text-[10px] font-semibold uppercase tracking-widest text-platinum">Or continue</span>
                <div className="flex-1 h-px bg-white/[0.06]" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" type="button">Google</Button>
                <Button variant="outline" type="button">Apple</Button>
              </div>
            </div>

            <p className="mt-6 text-sm text-platinum">
              Don't have an account?{' '}
              <Link className="font-semibold text-primary hover:underline" to="/register">Sign up</Link>
            </p>
          </motion.div>
        </div>

        {/* Right Hero */}
        <div className="relative hidden items-center justify-center px-8 py-12 lg:flex">
          <div className="absolute inset-0 bg-gradient-to-br from-navy-900 via-navy-950 to-navy-800" />
          <div className="absolute inset-0 grid-pattern opacity-30" />
          <div className="relative z-10 flex max-w-md flex-col gap-6">
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-widest text-primary">AI Intelligence</p>
              <h2 className="font-display text-3xl italic text-white">Your portfolio, continuously optimized.</h2>
              <p className="text-sm text-platinum leading-relaxed">
                FloFi monitors your asset allocation and delivers proactive insights across risk, liquidity, and tax efficiency.
              </p>
            </div>
            <div className="glass-card rounded-lg p-5">
              <h3 className="text-sm font-semibold text-primary">AI Insight</h3>
              <p className="text-xs text-platinum mt-1">Portfolio rebalanced with 3.2% risk reduction this week.</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="glass-card rounded-lg p-4">
                <p className="text-[10px] uppercase tracking-wider text-platinum">Net worth</p>
                <p className="text-xl font-bold text-white mt-1">$1.24M</p>
              </div>
              <div className="glass-card rounded-lg p-4">
                <p className="text-[10px] uppercase tracking-wider text-platinum">Cash runway</p>
                <p className="text-xl font-bold text-white mt-1">18 months</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
