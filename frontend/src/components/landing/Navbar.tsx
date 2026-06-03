import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, Moon, SunMedium, X } from 'lucide-react'
import Logo from '@/components/ui/Logo'
import { useTheme } from '@/theme/ThemeProvider'

const navLinks = [
  { label: 'Features', href: '#features' },
  { label: 'Dashboard', href: '#dashboard' },
  { label: 'AI Assistant', href: '#ai-assistant' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Security', href: '#security' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { mode, setMode } = useTheme()

  const toggleTheme = () => {
    setMode(mode === 'light' ? 'dark' : 'light')
  }

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 24)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  const isDark = mode === 'dark'

  return (
    <>
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? isDark
              ? 'bg-[#050d1f]/90 backdrop-blur-2xl border-b border-white/[0.06] shadow-2xl shadow-black/30'
              : 'bg-white/90 backdrop-blur-2xl border-b border-gray-200 shadow-lg'
            : 'bg-transparent'
        }`}
      >
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-6 px-6 py-4">
          {/* Logo */}
          <Link to="/">
            <Logo size={28} textClassName="text-xl font-bold tracking-tight" textColorClass={isDark ? 'text-white' : 'text-gray-900'} />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8" aria-label="Primary">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className={`text-sm font-medium transition-colors duration-200 ${isDark ? 'text-white/60 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* CTA buttons */}
          <div className="hidden md:flex items-center gap-3">
            <button
              type="button"
              onClick={toggleTheme}
              title={mode === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
              aria-label={mode === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
              className={`flex h-10 w-10 items-center justify-center rounded-full border transition-colors ${isDark ? 'border-white/10 bg-white/[0.04] text-white/70 hover:bg-white/[0.08] hover:text-white' : 'border-gray-200 bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900'}`}
            >
              {mode === 'light' ? <Moon className="h-4 w-4" /> : <SunMedium className="h-4 w-4" />}
            </button>
            <Link
              to="/login"
              className={`text-sm font-medium transition-colors duration-200 px-4 py-2 ${isDark ? 'text-white/70 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
            >
              Sign in
            </Link>
            <Link
              to="/register"
              className="relative inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-500 to-emerald-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/50 hover:scale-105 transition-all duration-300"
            >
              Get Started Free
              <span className="absolute inset-0 rounded-full bg-white/10 opacity-0 hover:opacity-100 transition-opacity duration-300" />
            </Link>
          </div>

          {/* Mobile menu toggle */}
          <button
            className={`md:hidden transition-colors ${isDark ? 'text-white/70 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </motion.header>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.25 }}
            className={`fixed inset-x-0 top-[68px] z-40 backdrop-blur-2xl border-b px-6 py-6 flex flex-col gap-4 md:hidden ${isDark ? 'bg-[#050d1f]/95 border-white/[0.06]' : 'bg-white/95 border-gray-200'}`}
          >
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`text-base font-medium transition-colors py-2 border-b ${isDark ? 'text-white/70 hover:text-white border-white/[0.06]' : 'text-gray-600 hover:text-gray-900 border-gray-100'}`}
              >
                {link.label}
              </a>
            ))}
            <button
              type="button"
              onClick={toggleTheme}
              className={`flex items-center justify-center gap-2 text-sm font-medium py-2.5 rounded-xl border ${isDark ? 'text-white/70 hover:text-white border-white/10' : 'text-gray-600 hover:text-gray-900 border-gray-200'}`}
            >
              {mode === 'light' ? <Moon className="h-4 w-4" /> : <SunMedium className="h-4 w-4" />}
              {mode === 'light' ? 'Dark mode' : 'Light mode'}
            </button>
            <div className="flex flex-col gap-3 pt-2">
              <Link
                to="/login"
                onClick={() => setMobileOpen(false)}
                className={`text-center text-sm font-medium py-2.5 rounded-xl border ${isDark ? 'text-white/70 hover:text-white border-white/10' : 'text-gray-600 hover:text-gray-900 border-gray-200'}`}
              >
                Sign in
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileOpen(false)}
                className="text-center text-sm font-semibold text-white py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500"
              >
                Get Started Free
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
