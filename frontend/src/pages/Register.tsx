import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

import { Button } from '@/components/ui/button'
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
      fullName, email, password, confirmPassword, termsAccepted,
    })

    if (response.ok) { navigate('/login'); return }
    setError(response.data?.error ?? 'Unable to create account. Please try again.')
    setIsSubmitting(false)
  }

  return (
    <div className="relative min-h-screen bg-navy-950">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(0,212,170,0.08),transparent_45%),radial-gradient(circle_at_82%_10%,rgba(0,212,170,0.04),transparent_40%)]" />
      <div className="relative grid min-h-screen lg:grid-cols-2">
        {/* Register Form */}
        <div className="flex items-center justify-center px-6 py-12">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-md"
          >
            <div className="mb-8">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary mb-2">FloFi</p>
              <h1 className="font-display text-4xl italic text-white">Create your account</h1>
              <p className="text-sm text-platinum mt-2">Start engineering your wealth with intelligent insights.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-platinum">Full name</label>
                <Input type="text" placeholder="Alex Morgan" value={fullName} onChange={(e) => setFullName(e.target.value)} required className="bg-white/[0.04] border-white/[0.08] text-white rounded-md placeholder:text-platinum/40 focus:border-primary/40 focus:ring-primary/20" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-platinum">Email</label>
                <Input type="email" placeholder="alex@flofi.ai" value={email} onChange={(e) => setEmail(e.target.value)} required className="bg-white/[0.04] border-white/[0.08] text-white rounded-md placeholder:text-platinum/40 focus:border-primary/40 focus:ring-primary/20" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-platinum">Password</label>
                <Input type="password" placeholder="Create a password" value={password} onChange={(e) => setPassword(e.target.value)} required className="bg-white/[0.04] border-white/[0.08] text-white rounded-md placeholder:text-platinum/40 focus:border-primary/40 focus:ring-primary/20" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-platinum">Confirm password</label>
                <Input type="password" placeholder="Re-enter your password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="bg-white/[0.04] border-white/[0.08] text-white rounded-md placeholder:text-platinum/40 focus:border-primary/40 focus:ring-primary/20" />
              </div>
              <label className="flex items-center gap-2 text-xs text-platinum">
                <Checkbox id="terms" checked={termsAccepted} onCheckedChange={(checked) => setTermsAccepted(Boolean(checked))} />
                I agree to the terms and privacy policy
              </label>
              {error && <div className="rounded-md border border-coral/20 bg-coral/5 px-4 py-3 text-sm text-coral">{error}</div>}
              <Button className="w-full" type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Creating account...' : 'Create account'}
              </Button>
            </form>

            <p className="mt-6 text-sm text-platinum">
              Already have an account?{' '}
              <Link className="font-semibold text-primary hover:underline" to="/login">Sign in</Link>
            </p>
          </motion.div>
        </div>

        {/* Right Hero */}
        <div className="relative hidden items-center justify-center px-8 py-12 lg:flex">
          <div className="absolute inset-0 bg-gradient-to-br from-navy-900 via-navy-950 to-navy-800" />
          <div className="absolute inset-0 dot-pattern opacity-30" />
          <div className="relative z-10 flex max-w-md flex-col gap-6">
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-widest text-primary">Wealth orchestration</p>
              <h2 className="font-display text-3xl italic text-white">Launch your AI-driven wealth plan.</h2>
              <p className="text-sm text-platinum leading-relaxed">
                Connect assets, set intelligent budgets, and receive predictive signals tailored to your goals.
              </p>
            </div>
            <div className="glass-card rounded-lg p-5">
              <h3 className="text-sm font-semibold text-primary">AI Insight</h3>
              <p className="text-xs text-platinum mt-1">Model-driven recommendations for faster goal acceleration.</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="glass-card rounded-lg p-4">
                <p className="text-[10px] uppercase tracking-wider text-platinum">Targets tracked</p>
                <p className="text-xl font-bold text-white mt-1">12</p>
              </div>
              <div className="glass-card rounded-lg p-4">
                <p className="text-[10px] uppercase tracking-wider text-platinum">Monthly lift</p>
                <p className="text-xl font-bold text-white mt-1">+14%</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
