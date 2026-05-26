import { Link } from 'react-router-dom'
import { Zap, Code, Globe2, Share2 } from 'lucide-react'

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
  return (
    <footer className="relative bg-[#020810] border-t border-white/[0.05]">
      {/* Top glow line */}
      <div className="pointer-events-none absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />

      <div className="mx-auto max-w-7xl px-6 py-16">
        {/* Main grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10 mb-14">
          {/* Brand column */}
          <div className="col-span-2">
            {/* Logo */}
            <Link to="/" className="inline-flex items-center gap-2.5 mb-5 group">
              <div className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-emerald-400 shadow-lg group-hover:shadow-cyan-400/40 transition-all duration-300">
                <Zap className="h-4 w-4 text-white" fill="white" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                Flo<span className="gradient-text-cyan">fi</span>
              </span>
            </Link>

            <p className="text-sm text-white/40 leading-relaxed max-w-xs mb-6">
              AI-powered personal finance management for individuals, students, freelancers, and families ready to take control of their financial future.
            </p>

            {/* Social links */}
            <div className="flex gap-3">
              {socials.map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.03] text-white/40 hover:text-white hover:bg-white/[0.08] hover:border-white/15 transition-all duration-200"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([group, links]) => (
            <div key={group}>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/30 mb-4">
                {group}
              </p>
              <ul className="space-y-3">
                {links.map(({ label, href }) => (
                  <li key={label}>
                    {href.startsWith('/') ? (
                      <Link
                        to={href}
                        className="text-sm text-white/45 hover:text-white transition-colors duration-200"
                      >
                        {label}
                      </Link>
                    ) : (
                      <a
                        href={href}
                        className="text-sm text-white/45 hover:text-white transition-colors duration-200"
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
        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] px-6 py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-12">
          <div>
            <p className="text-sm font-semibold text-white">Stay in the loop</p>
            <p className="text-xs text-white/40 mt-0.5">Get financial tips and product updates. No spam.</p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <input
              type="email"
              placeholder="you@example.com"
              className="flex-1 sm:w-56 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/25 outline-none focus:border-cyan-500/40 transition-colors"
            />
            <button className="shrink-0 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 px-5 py-2.5 text-sm font-bold text-white hover:scale-105 transition-transform shadow-lg shadow-cyan-500/20">
              Subscribe
            </button>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-white/[0.05]">
          <p className="text-xs text-white/25">
            © {new Date().getFullYear()} Flofi. All rights reserved. Built with ❤️ for financial freedom.
          </p>
          <div className="flex items-center gap-1.5 text-xs text-white/25">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            All systems operational
          </div>
        </div>
      </div>
    </footer>
  )
}
