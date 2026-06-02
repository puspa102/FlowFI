import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { motion } from 'framer-motion'
import { Eye, EyeOff } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import Logo from '@/components/ui/Logo'
import { apiPost, getApiBase } from '../api/client'
import { setToken } from '@/store/slices/authSlice'

type RegisterResponse = {
  token?: string
  error?: string
}

export default function Register() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  function handleGoogleSignup() {
    setError(null)
    const params = new URLSearchParams({ returnTo: window.location.origin })
    window.location.assign(`${getApiBase()}/auth/google?${params.toString()}`)
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)

    // Match backend confirmPassword requirements by supplying password as confirmPassword
    const response = await apiPost<RegisterResponse>('/register', {
      fullName,
      email,
      password,
      confirmPassword: password,
      termsAccepted,
    })

    if (response.ok && response.data?.token) {
      dispatch(setToken(response.data.token))
      navigate('/dashboard')
      return
    }

    if (response.ok) {
      navigate('/login')
      return
    }

    setError(response.data?.error ?? response.error ?? 'Unable to create account. Please try again.')
    setIsSubmitting(false)
  }

  return (
    <div className="relative min-h-screen bg-[#f4f7f6] flex flex-col font-sans text-slate-800">
      {/* Main Container */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-[460px]"
        >
          {/* Card */}
          <div className="bg-white border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.02)] rounded-[32px] p-8 sm:p-10 w-full">
           {/* logo */}
          <Logo size={36} textClassName="text-2xl font-bold tracking-tight text-slate-900" className="mb-6 justify-center" />
           
            {/* Title & Subtitle */}
            <div className="text-center mb-6">
              <h1 className="text-xl font-bold tracking-tight text-slate-900">Create your account</h1>
              <p className="text-xs text-slate-500 mt-1">Start your precision wealth journey today.</p>
            </div>

            {/* Google Signup Button */}
            <button
              type="button"
              onClick={handleGoogleSignup}
              className="flex items-center justify-center gap-2.5 w-full py-3 border border-slate-200 hover:bg-slate-50 transition-colors rounded-xl text-xs font-bold text-slate-700 bg-white"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
              </svg>
              Sign up with Google
            </button>

            {/* Divider */}
            <div className="flex items-center gap-4 my-5 text-[9px] font-bold tracking-wider text-slate-400">
              <div className="flex-1 h-px bg-slate-100" />
              <span>OR CONTINUE WITH EMAIL</span>
              <div className="flex-1 h-px bg-slate-100" />
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 rounded-xl border border-red-100 bg-red-50/50 px-4 py-3 text-xs text-red-600">
                {error}
              </div>
            )}

            {/* Registration Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold tracking-wide text-slate-600 block">Full Name</label>
                <Input
                  type="text"
                  placeholder="E.g. Alexander Hamilton"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="bg-white border border-slate-200 text-slate-800 rounded-xl px-4 py-3 text-xs placeholder:text-slate-400 focus-visible:border-[#006660] focus-visible:ring-[#006660]/20 focus:border-[#006660] focus:ring-[#006660] focus:ring-1 outline-none w-full"
                />
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold tracking-wide text-slate-600 block">Work Email</label>
                <Input
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-white border border-slate-200 text-slate-800 rounded-xl px-4 py-3 text-xs placeholder:text-slate-400 focus-visible:border-[#006660] focus-visible:ring-[#006660]/20 focus:border-[#006660] focus:ring-[#006660] focus:ring-1 outline-none w-full"
                />
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold tracking-wide text-slate-600 block">Password</label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="bg-white border border-slate-200 text-slate-800 rounded-xl px-4 py-3 text-xs placeholder:text-slate-400 focus-visible:border-[#006660] focus-visible:ring-[#006660]/20 focus:border-[#006660] focus:ring-[#006660] focus:ring-1 outline-none w-full pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Terms Checkbox */}
              <div className="flex items-start gap-2.5 pt-1.5">
                <Checkbox
                  id="terms"
                  checked={termsAccepted}
                  onCheckedChange={(checked) => setTermsAccepted(Boolean(checked))}
                  className="border-slate-300 text-[#006660] data-[state=checked]:bg-[#006660] data-[state=checked]:border-[#006660] rounded mt-0.5"
                />
                <label htmlFor="terms" className="text-[11px] leading-snug text-slate-500 select-none">
                  I agree to the{' '}
                  <a href="#" className="text-[#006660] hover:underline font-semibold">
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a href="#" className="text-[#006660] hover:underline font-semibold">
                    Privacy Policy
                  </a>{' '}
                  including cookie usage.
                </label>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#006660] hover:bg-[#00524d] active:bg-[#00423e] text-white font-bold py-3.5 rounded-xl text-xs transition-colors shadow-sm mt-3"
              >
                {isSubmitting ? 'Creating account...' : 'Create Account'}
              </Button>
            </form>

            {/* Redirect footer */}
            <div className="text-center mt-6">
              <p className="text-xs text-slate-500">
                Already have an account?{' '}
                <Link to="/login" className="text-[#006660] hover:underline font-bold ml-1">
                  Sign In
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-7xl mx-auto px-6 py-6 border-t border-slate-200/50 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
        <p>© {new Date().getFullYear()} FloFi Precision Wealth Engineering. All rights reserved.</p>
        <div className="flex items-center gap-5">
          <a href="#" className="hover:text-slate-600 transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-slate-600 transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-slate-600 transition-colors">Security</a>
          <a href="#" className="hover:text-slate-600 transition-colors">Help Center</a>
        </div>
      </footer>
    </div>
  )
}
