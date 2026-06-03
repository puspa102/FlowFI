import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import {
  BarChart2,
  Brain,
  CreditCard,
  Target,
  RefreshCw,
  Shield,
  TrendingUp,
  Wallet,
} from 'lucide-react'
import { useTheme } from '@/theme/ThemeProvider'

const features = [
  {
    icon: CreditCard,
    title: 'Expense Tracking',
    desc: 'Monitor spending across all categories in real time. Every purchase automatically categorized and analyzed.',
    tag: 'Core',
    gradient: 'from-cyan-500/20 to-blue-500/20',
    border: 'border-cyan-500/20',
    iconBg: 'bg-cyan-500/15',
    iconColor: 'text-cyan-400',
    glow: 'hover:shadow-cyan-500/10',
    span: 'md:col-span-2',
  },
  {
    icon: Brain,
    title: 'AI Financial Insights',
    desc: 'Receive intelligent, personalized recommendations based on your unique spending behavior and financial goals.',
    tag: 'AI-Powered',
    gradient: 'from-emerald-500/20 to-cyan-500/20',
    border: 'border-emerald-500/20',
    iconBg: 'bg-emerald-500/15',
    iconColor: 'text-emerald-400',
    glow: 'hover:shadow-emerald-500/10',
    span: '',
  },
  {
    icon: Wallet,
    title: 'Smart Budget Management',
    desc: 'Create monthly budgets and receive proactive alerts before you overspend. Adaptive envelopes that learn your lifestyle.',
    tag: 'Proactive',
    gradient: 'from-purple-500/20 to-pink-500/20',
    border: 'border-purple-500/20',
    iconBg: 'bg-purple-500/15',
    iconColor: 'text-purple-400',
    glow: 'hover:shadow-purple-500/10',
    span: '',
  },
  {
    icon: BarChart2,
    title: 'Multi-Account Management',
    desc: 'Manage checking, savings, investments, and credit accounts in one unified, beautiful interface.',
    tag: 'Unified',
    gradient: 'from-orange-500/20 to-red-500/20',
    border: 'border-orange-500/20',
    iconBg: 'bg-orange-500/15',
    iconColor: 'text-orange-400',
    glow: 'hover:shadow-orange-500/10',
    span: '',
  },
  {
    icon: TrendingUp,
    title: 'Financial Health Score',
    desc: 'Understand your financial wellness through an automated score — powered by AI analysis of your habits.',
    tag: 'Wellness',
    gradient: 'from-teal-500/20 to-green-500/20',
    border: 'border-teal-500/20',
    iconBg: 'bg-teal-500/15',
    iconColor: 'text-teal-400',
    glow: 'hover:shadow-teal-500/10',
    span: '',
  },
  {
    icon: RefreshCw,
    title: 'Recurring Transaction Automation',
    desc: 'Automatically detect and manage subscriptions, bills, and recurring expenses without lifting a finger.',
    tag: 'Automation',
    gradient: 'from-pink-500/20 to-rose-500/20',
    border: 'border-pink-500/20',
    iconBg: 'bg-pink-500/15',
    iconColor: 'text-pink-400',
    glow: 'hover:shadow-pink-500/10',
    span: '',
  },
  {
    icon: Target,
    title: 'Savings Goals',
    desc: 'Define financial targets — emergency fund, vacation, new laptop — and track your progress visually every day.',
    tag: 'Goals',
    gradient: 'from-blue-500/20 to-indigo-500/20',
    border: 'border-blue-500/20',
    iconBg: 'bg-blue-500/15',
    iconColor: 'text-blue-400',
    glow: 'hover:shadow-blue-500/10',
    span: '',
  },
  {
    icon: Shield,
    title: 'Advanced Analytics',
    desc: 'Visualize trends, spending patterns, and cash flow with cinematic charts and weekly/monthly deep dives.',
    tag: 'Insights',
    gradient: 'from-indigo-500/20 to-violet-500/20',
    border: 'border-indigo-500/20',
    iconBg: 'bg-indigo-500/15',
    iconColor: 'text-indigo-400',
    glow: 'hover:shadow-indigo-500/10',
    span: 'md:col-span-2',
  },
]

function FeatureCard({ feature, index, isDark }: { feature: typeof features[0]; index: number; isDark: boolean }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  const Icon = feature.icon

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: index * 0.07, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
      className={`group relative rounded-3xl border p-7 transition-all duration-400 card-hover hover:shadow-2xl ${feature.border} ${feature.glow} ${feature.span}`}
      style={{ background: isDark ? 'rgba(255,255,255,0.025)' : 'var(--card)' }}
    >
      <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-400`} />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-5">
          <div className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl ${feature.iconBg} border ${feature.border}`}>
            <Icon className={`h-5 w-5 ${feature.iconColor}`} />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: isDark ? 'rgba(255,255,255,0.3)' : 'var(--muted-foreground)' }}>
            {feature.tag}
          </span>
        </div>

        <h3 className="text-lg font-bold mb-2 group-hover:gradient-text-cyan transition-all duration-300" style={{ color: isDark ? '#FFFFFF' : 'var(--foreground)' }}>
          {feature.title}
        </h3>
        <p className="text-sm leading-relaxed" style={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'var(--muted-foreground)' }}>{feature.desc}</p>

        <div className="mt-5 flex items-center gap-2 text-xs font-semibold transition-colors duration-300" style={{ color: isDark ? 'rgba(255,255,255,0.3)' : 'var(--muted-foreground)' }}>
          Learn more
          <svg className="h-3 w-3 group-hover:translate-x-1 transition-transform duration-300" viewBox="0 0 12 12" fill="none">
            <path d="M2 6h8M6 2l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    </motion.div>
  )
}

export default function FeaturesSection() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  const { mode } = useTheme()
  const isDark = mode === 'dark'

  return (
    <section
      className="relative py-28 overflow-hidden transition-colors duration-300"
      style={{ background: isDark ? '#050d1f' : 'var(--background)' }}
      id="features"
    >
      <div className="pointer-events-none absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-64 bg-cyan-500/5 blur-3xl rounded-full" />

      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.65 }}
          className="text-center mb-16"
        >
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-cyan-500/70 mb-4">
            Everything you need
          </p>
          <h2 className="text-4xl md:text-5xl font-extrabold leading-tight max-w-3xl mx-auto" style={{ color: isDark ? '#FFFFFF' : 'var(--foreground)' }}>
            Powerful features for{' '}
            <span className="gradient-text-emerald">smarter finances</span>
          </h2>
          <p className="mt-4 text-base max-w-xl mx-auto leading-relaxed" style={{ color: isDark ? 'rgba(255,255,255,0.45)' : 'var(--muted-foreground)' }}>
            From daily expense tracking to AI-driven wealth insights — Flofi gives you every tool you need to build lasting financial health.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-5">
          {features.map((feature, i) => (
            <FeatureCard key={feature.title} feature={feature} index={i} isDark={isDark} />
          ))}
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
    </section>
  )
}
