import { Link } from 'react-router-dom'
import { Code, Globe2, Share2 } from 'lucide-react'
import Logo from '@/components/ui/Logo'
import { useTheme } from '@/theme/ThemeProvider'

const footerLinks = {
  Product: [
    { label: 'Features', href: '#features' },
    { label: 'Dashboard', href: '#dashboard' },
    { label: 'AI Assistant', href: '/ai-assistant' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'Security', href: '#security' },
  ],
  Resources: [
    { label: 'Documentation', href: '#' },
    { label: 'Blog', href: '#' },
    { label: 'Support', href: '#' },
    { label: 'Status', href: '#' },
    { label: 'Changelog', href: '#' },
  ],
  Company: [
    { label: 'About', href: '#' },
    { label: 'Contact', href: '#' },
    { label: 'Privacy Policy', href: '#' },
    { label: 'Terms of Service', href: '#' },
    { label: 'Cookie Policy', href: '#' },
  ],
}

const socials = [
  { icon: Code, label: 'GitHub', href: '#' },
  { icon: Globe2, label: 'LinkedIn', href: '#' },
  { icon: Share2, label: 'Twitter / X', href: '#' },
]

export default function Footer() {
  const { mode } = useTheme()
  const isDark = mode === 'dark'

  return (
    <footer
      className="relative border-t transition-colors duration-300"
      style={{
        background: isDark ? '#020810' : 'var(--card)',
        borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'var(--border)',
      }}
    >
      {/* Top glow line */}
      <div className="pointer-events-none absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />

      <div className="mx-auto max-w-7xl px-6 py-16">
        {/* Main grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10 mb-14">
          {/* Brand column */}
          <div className="col-span-2">
            <Link to="/" className="mb-5 block">
              <Logo size={28} textClassName="text-xl font-bold tracking-tight" textColorClass={isDark ? 'text-white' : 'text-gray-900'} />
            </Link>

            <p className="text-sm leading-relaxed max-w-xs mb-6" style={{ color: isDark ? 'rgba(255,255,255,0.4)' : 'var(--muted-foreground)' }}>
              AI-powered personal finance management for individuals, students, freelancers, and families ready to take control of their financial future.
            </p>

            {/* Social links */}
            <div className="flex gap-3">
              {socials.map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border transition-all duration-200"
                  style={{
                    borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'var(--border)',
                    background: isDark ? 'rgba(255,255,255,0.03)' : 'var(--surface-sunken)',
                    color: isDark ? 'rgba(255,255,255,0.4)' : 'var(--muted-foreground)',
                  }}
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([group, links]) => (
            <div key={group}>
              <p className="text-xs font-bold uppercase tracking-[0.2em] mb-4" style={{ color: isDark ? 'rgba(255,255,255,0.3)' : 'var(--muted-foreground)' }}>
                {group}
              </p>
              <ul className="space-y-3">
                {links.map(({ label, href }) => (
                  <li key={label}>
                    {href.startsWith('/') ? (
                      <Link
                        to={href}
                        className="text-sm transition-colors duration-200"
                        style={{ color: isDark ? 'rgba(255,255,255,0.45)' : 'var(--muted-foreground)' }}
                      >
                        {label}
                      </Link>
                    ) : (
                      <a
                        href={href}
                        className="text-sm transition-colors duration-200"
                        style={{ color: isDark ? 'rgba(255,255,255,0.45)' : 'var(--muted-foreground)' }}
                      >
                        {label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter strip */}
        <div
          className="rounded-2xl border px-6 py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-12"
          style={{
            borderColor: isDark ? 'rgba(255,255,255,0.07)' : 'var(--border)',
            background: isDark ? 'rgba(255,255,255,0.02)' : 'var(--surface-sunken)',
          }}
        >
          <div>
            <p className="text-sm font-semibold" style={{ color: isDark ? '#FFFFFF' : 'var(--foreground)' }}>Stay in the loop</p>
            <p className="text-xs mt-0.5" style={{ color: isDark ? 'rgba(255,255,255,0.4)' : 'var(--muted-foreground)' }}>Get financial tips and product updates. No spam.</p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <input
              type="email"
              placeholder="you@example.com"
              className="flex-1 sm:w-56 rounded-xl border px-4 py-2.5 text-sm outline-none focus:border-cyan-500/40 transition-colors"
              style={{
                borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'var(--border)',
                background: isDark ? 'rgba(255,255,255,0.05)' : 'var(--card)',
                color: isDark ? '#FFFFFF' : 'var(--foreground)',
              }}
            />
            <button className="shrink-0 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 px-5 py-2.5 text-sm font-bold text-white hover:scale-105 transition-transform shadow-lg shadow-cyan-500/20">
              Subscribe
            </button>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t" style={{ borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'var(--border)' }}>
          <p className="text-xs" style={{ color: isDark ? 'rgba(255,255,255,0.25)' : 'var(--muted-foreground)' }}>
            &copy; {new Date().getFullYear()} Flofi. All rights reserved.
          </p>
          <div className="flex items-center gap-1.5 text-xs" style={{ color: isDark ? 'rgba(255,255,255,0.25)' : 'var(--muted-foreground)' }}>
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            All systems operational
          </div>
        </div>
      </div>
    </footer>
  )
}
