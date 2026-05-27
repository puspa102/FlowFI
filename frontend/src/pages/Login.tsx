import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
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
    <div className="relative min-h-screen bg-[#f5f7fb] text-slate-900">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(14,165,233,0.16),transparent_45%),radial-gradient(circle_at_82%_10%,rgba(2,132,199,0.12),transparent_40%)]" />
      <div className="relative grid min-h-screen lg:grid-cols-2">
        <div className="flex items-center justify-center px-6 py-12">
          <Card className="w-full max-w-lg border-slate-200/70 bg-white/90">
            <CardHeader className="space-y-2">
              <div className="space-y-1">
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-400">FloFi</p>
                <CardTitle className="text-3xl">Welcome back</CardTitle>
                <CardDescription>Log in to your precision wealth dashboard.</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              <form onSubmit={handleSubmit} className="space-y-4">
                <label className="space-y-2 text-sm font-medium text-slate-600">
                  Email
                  <Input
                    type="email"
                    placeholder="alex@flofi.ai"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                  />
                </label>
                <label className="space-y-2 text-sm font-medium text-slate-600">
                  Password
                  <Input
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                  />
                </label>
                <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-500">
                  <label className="flex items-center gap-2">
                    <Checkbox id="remember" />
                    <span>Remember me</span>
                  </label>
                  <button className="text-primary" type="button">
                    Forgot password?
                  </button>
                </div>
                {error ? <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div> : null}
                <Button className="w-full" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Signing in...' : 'Sign in'}
                </Button>
              </form>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Separator className="flex-1" />
                  <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Or continue</span>
                  <Separator className="flex-1" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" type="button">
                    Google
                  </Button>
                  <Button variant="outline" type="button">
                    Apple
                  </Button>
                </div>
              </div>
            </CardContent>
            <CardFooter className="text-sm text-slate-500">
              <span>Don't have an account?</span>
              <Link className="ml-2 font-semibold text-primary" to="/register">
                Sign up
              </Link>
            </CardFooter>
          </Card>
        </div>

        <div className="relative hidden items-center justify-center px-6 py-12 lg:flex">
          <div className="absolute inset-0 bg-linear-to-br from-slate-900 via-slate-900 to-slate-800" />
          <div className="relative z-10 flex max-w-md flex-col gap-6 text-white">
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">AI Intelligence</p>
              <h2 className="text-3xl font-semibold">Your portfolio, continuously optimized.</h2>
              <p className="text-sm text-slate-300">
                FloFi monitors your asset allocation and delivers proactive insights across risk, liquidity, and tax
                efficiency.
              </p>
            </div>
            <Card className="border-white/10 bg-white/10 text-white backdrop-blur">
              <CardHeader>
                <CardTitle className="text-lg">AI Insight</CardTitle>
                <CardDescription className="text-slate-300">
                  Portfolio rebalanced with 3.2% risk reduction this week.
                </CardDescription>
              </CardHeader>
            </Card>
            <div className="grid grid-cols-2 gap-3">
              <Card className="border-white/10 bg-white/10 p-4 text-white">
                <p className="text-xs uppercase text-slate-300">Net worth</p>
                <p className="text-xl font-semibold">$1.24M</p>
              </Card>
              <Card className="border-white/10 bg-white/10 p-4 text-white">
                <p className="text-xs uppercase text-slate-300">Cash runway</p>
                <p className="text-xl font-semibold">18 months</p>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
