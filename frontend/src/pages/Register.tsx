import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { apiPost } from '../api/client'

type RegisterResponse = {
  message?: string
  error?: string
}

export default function Register() {
  const navigate = useNavigate()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)

    const response = await apiPost<RegisterResponse>('/register', {
      fullName,
      email,
      password,
      confirmPassword,
      termsAccepted,
    })

    if (response.ok) {
      navigate('/login')
      return
    }

    setError(response.data?.error ?? 'Unable to create account. Please try again.')
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
                <CardTitle className="text-3xl">Create your account</CardTitle>
                <CardDescription>Start engineering your wealth with intelligent insights.</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <label className="space-y-2 text-sm font-medium text-slate-600">
                  Full name
                  <Input
                    type="text"
                    placeholder="Alex Morgan"
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                    required
                  />
                </label>
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
                    placeholder="Create a password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                  />
                </label>
                <label className="space-y-2 text-sm font-medium text-slate-600">
                  Confirm password
                  <Input
                    type="password"
                    placeholder="Re-enter your password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    required
                  />
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-500">
                  <Checkbox
                    id="terms"
                    checked={termsAccepted}
                    onCheckedChange={(checked) => setTermsAccepted(Boolean(checked))}
                  />
                  I agree to the terms and privacy policy
                </label>
                {error ? <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div> : null}
                <Button className="w-full" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Creating account...' : 'Create account'}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="text-sm text-slate-500">
              <span>Already have an account?</span>
              <Link className="ml-2 font-semibold text-primary" to="/login">
                Sign in
              </Link>
            </CardFooter>
          </Card>
        </div>

        <div className="relative hidden items-center justify-center px-6 py-12 lg:flex">
          <div className="absolute inset-0 bg-linear-to-br from-slate-900 via-slate-900 to-slate-800" />
          <div className="relative z-10 flex max-w-md flex-col gap-6 text-white">
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Wealth orchestration</p>
              <h2 className="text-3xl font-semibold">Launch your AI-driven wealth plan.</h2>
              <p className="text-sm text-slate-300">
                Connect assets, set intelligent budgets, and receive predictive signals tailored to your goals.
              </p>
            </div>
            <Card className="border-white/10 bg-white/10 text-white backdrop-blur">
              <CardHeader>
                <CardTitle className="text-lg">AI Insight</CardTitle>
                <CardDescription className="text-slate-300">
                  Model-driven recommendations for faster goal acceleration.
                </CardDescription>
              </CardHeader>
            </Card>
            <div className="grid grid-cols-2 gap-3">
              <Card className="border-white/10 bg-white/10 p-4 text-white">
                <p className="text-xs uppercase text-slate-300">Targets tracked</p>
                <p className="text-xl font-semibold">12</p>
              </Card>
              <Card className="border-white/10 bg-white/10 p-4 text-white">
                <p className="text-xs uppercase text-slate-300">Monthly lift</p>
                <p className="text-xl font-semibold">+14%</p>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
