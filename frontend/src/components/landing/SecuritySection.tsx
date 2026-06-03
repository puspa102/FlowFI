import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { ShieldCheck, Lock, Eye, Database, Key, CheckCircle2 } from 'lucide-react'
import { useTheme } from '@/theme/ThemeProvider'

const securityFeatures = [
  {
    icon: ShieldCheck,
    title: 'Bank-Level Encryption',
    desc: 'All financial data is encrypted with AES-256 at rest and in transit — the same standard used by major banks.',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
  },
  {
    icon: Key,
    title: 'JWT Authentication',
    desc: 'Secure token-based authentication with automatic expiry and refresh — your session is always protected.',
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/20',
  },
  {
    icon: Lock,
    title: 'End-to-End Security',
    desc: 'Your data travels encrypted from your device to our servers. No plaintext financial information ever exposed.',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
  },
  {
    icon: Eye,
    title: 'Privacy First',
    desc: 'We never sell your data. Your financial information is yours — used only to power your personalized insights.',
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/20',
  },
  {
    icon: Database,
    title: 'Secure Data Storage',
    desc: 'Data stored in geo-redundant, GDPR-compliant infrastructure with automated backups and disaster recovery.',
    color: 'text-indigo-400',
    bg: 'bg-indigo-500/10',
    border: 'border-indigo-500/20',
  },
  {
    icon: ShieldCheck,
    title: 'Read-Only Access',
    desc: 'Flofi only reads your financial data — we can never move, transfer, or modify funds in any account.',
    color: 'text-teal-400',
    bg: 'bg-teal-500/10',
    border: 'border-teal-500/20',
  },
]

const trustBadges = [
  { label: 'SSL Secured', icon: '🔒' },
  { label: 'GDPR Compliant', icon: '🇪🇺' },
  { label: 'SOC 2 Type II', icon: '✅' },
  { label: 'ISO 27001', icon: '🛡️' },
  { label: '99.9% Uptime', icon: '⚡' },
]

export default function SecuritySection() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  const { mode } = useTheme()

  return (
    <section className="relative py-28 overflow-hidden transition-colors duration-300" style={{ background: mode === 'dark' ? '#050d1f' : 'var(--background)' }} id="security">
      <div className="pointer-events-none absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />
      <div className="pointer-events-none absolute inset-0 grid-pattern opacity-20" />
      <div className="pointer-events-none absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-64 bg-emerald-500/5 blur-3xl rounded-full" />

      <div className="mx-auto max-w-7xl px-6">
        {/* Header */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.65 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-4 py-1.5 text-xs font-semibold text-emerald-400 mb-6">
            <ShieldCheck className="h-3.5 w-3.5" />
            Enterprise-grade security
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold leading-tight" style={{ color: mode === 'dark' ? '#FFFFFF' : 'var(--foreground)' }}>
            Your data is{' '}
            <span className="gradient-text-emerald">always protected</span>
          </h2>
          <p className="mt-4 text-base max-w-xl mx-auto" style={{ color: mode === 'dark' ? 'rgba(255,255,255,0.45)' : 'var(--muted-foreground)' }}>
            We built Flofi with security at its core. Every layer of our architecture is designed to keep your financial data private and safe.
          </p>
        </motion.div>

        {/* Security features grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 mb-16">
          {securityFeatures.map((feat, i) => {
            const Icon = feat.icon
            return (
              <motion.div
                key={feat.title}
                initial={{ opacity: 0, y: 24 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.1 + i * 0.08, duration: 0.6 }}
                className={`group rounded-3xl border ${feat.border} ${feat.bg} p-6 hover:scale-[1.02] transition-all duration-300`}
              >
                <div className={`mb-4 flex h-10 w-10 items-center justify-center rounded-2xl ${feat.bg} border ${feat.border}`}>
                  <Icon className={`h-5 w-5 ${feat.color}`} />
                </div>
                <h3 className="text-sm font-bold mb-2" style={{ color: mode === 'dark' ? '#FFFFFF' : 'var(--foreground)' }}>{feat.title}</h3>
                <p className="text-xs leading-relaxed" style={{ color: mode === 'dark' ? 'rgba(255,255,255,0.5)' : 'var(--muted-foreground)' }}>{feat.desc}</p>
              </motion.div>
            )
          })}
        </div>

        {/* Trust badges row */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="flex flex-wrap justify-center gap-4 mb-16"
        >
          {trustBadges.map((badge) => (
            <div
              key={badge.label}
              className="flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-semibold"
              style={{ borderColor: mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'var(--border)', background: mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'var(--card)', color: mode === 'dark' ? 'rgba(255,255,255,0.6)' : 'var(--foreground)' }}
            >
              <span className="text-base">{badge.icon}</span>
              {badge.label}
            </div>
          ))}
        </motion.div>

        {/* Read-only promise card */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.7, duration: 0.65 }}
          className="max-w-3xl mx-auto rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 to-transparent p-8 md:p-10"
        >
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-3xl bg-emerald-500/20 border border-emerald-500/30">
              <Lock className="h-6 w-6 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold mb-2" style={{ color: mode === 'dark' ? '#FFFFFF' : 'var(--foreground)' }}>Our Security Promise</h3>
              <p className="text-sm leading-relaxed" style={{ color: mode === 'dark' ? 'rgba(255,255,255,0.55)' : 'var(--muted-foreground)' }}>
                Flofi operates on a strict <strong style={{ color: mode === 'dark' ? '#FFFFFF' : 'var(--foreground)' }}>read-only</strong> basis. We analyze your data to provide insights — but we <strong style={{ color: mode === 'dark' ? '#FFFFFF' : 'var(--foreground)' }}>never</strong> have the ability to move, transfer, or modify your funds. Your money is always 100% under your control.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                {['No fund access', 'Read-only data', 'Zero data selling', 'You own your data'].map((point) => (
                  <div key={point} className="flex items-center gap-1.5 text-xs font-medium text-emerald-400">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    {point}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="pointer-events-none absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
    </section>
  )
}
