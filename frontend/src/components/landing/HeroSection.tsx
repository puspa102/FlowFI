import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useAnimation } from 'framer-motion'
import { ArrowRight, Play, TrendingUp, Wallet, Brain, ShieldCheck } from 'lucide-react'

// Mini Dashboard Card
function DashMiniCard({
  label,
  value,
  change,
  positive = true,
  delay = 0,
}: {
  label: string
  value: string
  change: string
  positive?: boolean
  delay?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="glass-dark rounded-2xl p-4 min-w-[140px]"
    >
      <p className="text-xs text-white/50 font-medium uppercase tracking-wider mb-2">{label}</p>
      <p className="text-xl font-bold text-white">{value}</p>
      <p className={`text-xs font-medium mt-1 ${positive ? 'text-emerald-400' : 'text-red-400'}`}>
        {change}
      </p>
    </motion.div>
  )
}

// Floating AI insight card
function AiInsightCard({ text, delay }: { text: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 30, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      transition={{ delay, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="glass-navy rounded-2xl px-4 py-3 flex items-start gap-3 max-w-[260px]"
    >
      <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cyan-500/20 border border-cyan-500/30">
        <Brain className="h-3 w-3 text-cyan-400" />
      </div>
      <p className="text-xs text-white/80 leading-relaxed">{text}</p>
    </motion.div>
  )
}

// Animated bar chart
function SpendingChart() {
  const bars = [
    { label: 'Food', height: 55, color: '#22d3ee' },
    { label: 'Rent', height: 85, color: '#34d399' },
    { label: 'Travel', height: 40, color: '#818cf8' },
    { label: 'Bills', height: 65, color: '#f472b6' },
    { label: 'Shop', height: 45, color: '#fb923c' },
    { label: 'Save', height: 72, color: '#34d399' },
  ]
  const [animated, setAnimated] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 800)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="glass-dark rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-semibold text-white/60 uppercase tracking-wider">Spending by Category</p>
        <span className="text-xs text-emerald-400 font-medium">May 2026</span>
      </div>
      <div className="flex items-end gap-2 h-20">
        {bars.map((bar, i) => (
          <div key={bar.label} className="flex flex-col items-center gap-1 flex-1">
            <div className="w-full rounded-t-md overflow-hidden" style={{ height: '76px', display: 'flex', alignItems: 'flex-end' }}>
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: animated ? `${bar.height}%` : '0%' }}
                transition={{ delay: 0.9 + i * 0.08, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="w-full rounded-t-md"
                style={{ background: bar.color, opacity: 0.85 }}
              />
            </div>
            <p className="text-[9px] text-white/40">{bar.label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// Budget progress
function BudgetProgress({ label, spent, total, color }: { label: string; spent: number; total: number; color: string }) {
  const pct = Math.round((spent / total) * 100)
  const [animated, setAnimated] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 1200)
    return () => clearTimeout(t)
  }, [])
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs text-white/60">
        <span>{label}</span>
        <span className="font-semibold text-white">${spent} / ${total}</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-white/10">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: animated ? `${pct}%` : '0%' }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="h-full rounded-full"
          style={{ background: color }}
        />
      </div>
    </div>
  )
}

export default function HeroSection() {
  const controls = useAnimation()
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    controls.start('visible')
  }, [controls])

  const container = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.12, delayChildren: 0.2 } },
  }
  const item = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
  }

  return (
    <section
      ref={ref}
      className="relative min-h-screen overflow-hidden bg-[#030912] flex flex-col"
      id="hero"
    >
      {/* Ambient gradient blobs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] -translate-x-1/2 -translate-y-1/4 rounded-full bg-cyan-500/10 blur-[120px]" />
        <div className="absolute top-1/3 right-0 w-[500px] h-[500px] translate-x-1/4 rounded-full bg-emerald-500/10 blur-[120px]" />
        <div className="absolute bottom-0 left-1/2 w-[400px] h-[400px] translate-y-1/2 -translate-x-1/2 rounded-full bg-blue-500/8 blur-[100px]" />
      </div>

      {/* Grid pattern */}
      <div className="pointer-events-none absolute inset-0 grid-pattern opacity-40" />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 pt-36 pb-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* LEFT: Copy */}
          <motion.div
            variants={container}
            initial="hidden"
            animate="visible"
            className="space-y-8"
          >
            {/* Badge */}
            <motion.div variants={item}>
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/25 bg-cyan-500/10 px-4 py-1.5 text-xs font-semibold text-cyan-400 backdrop-blur-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
                Powered by Advanced AI · Free to start
              </div>
            </motion.div>

            {/* Headline */}
            <motion.div variants={item} className="space-y-3">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.06] tracking-tight text-white">
                Take Control of
                <br />
                Your{' '}
                <span className="gradient-text-cyan">Financial</span>
                <br />
                Future
              </h1>
            </motion.div>

            {/* Subheadline */}
            <motion.p variants={item} className="text-base md:text-lg text-white/55 max-w-lg leading-relaxed">
              Track expenses, manage budgets, monitor accounts, and receive AI-powered financial insights — all in one intelligent platform built for modern life.
            </motion.p>

            {/* CTA Row */}
            <motion.div variants={item} className="flex flex-wrap gap-4">
              <Link
                to="/register"
                className="group relative inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-500 to-emerald-500 px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 hover:scale-105 transition-all duration-300"
              >
                Get Started Free
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <button className="inline-flex items-center gap-2.5 rounded-full border border-white/15 bg-white/5 px-6 py-3.5 text-sm font-semibold text-white hover:bg-white/10 hover:border-white/25 transition-all duration-300 backdrop-blur-sm">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/15">
                  <Play className="h-3 w-3 fill-current" />
                </div>
                Watch Demo
              </button>
            </motion.div>

            {/* Trust micro-badges */}
            <motion.div variants={item} className="flex flex-wrap gap-4 pt-2">
              {[
                { icon: ShieldCheck, text: 'Bank-level Security' },
                { icon: TrendingUp, text: '50K+ Users' },
                { icon: Wallet, text: 'Free Forever Plan' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2 text-xs text-white/45">
                  <Icon className="h-3.5 w-3.5 text-emerald-400" />
                  {text}
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* RIGHT: Dashboard preview */}
          <motion.div
            initial={{ opacity: 0, x: 50, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="relative lg:flex hidden"
          >
            {/* Main dashboard card */}
            <div className="relative w-full max-w-lg mx-auto animate-float">
              {/* Dashboard container */}
              <div className="glass-dark rounded-3xl p-6 shadow-2xl shadow-black/50 border border-white/[0.07]">
                {/* Top row */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-xs text-white/50 font-medium">Total Balance</p>
                    <p className="text-3xl font-bold text-white mt-0.5">$24,831.50</p>
                    <p className="text-xs text-emerald-400 mt-0.5 font-medium">↑ +$1,240 this month</p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500/20 to-emerald-500/20 border border-cyan-500/20">
                    <Wallet className="h-5 w-5 text-cyan-400" />
                  </div>
                </div>

                {/* Stat mini-cards */}
                <div className="grid grid-cols-3 gap-3 mb-5">
                  {[
                    { label: 'Income', val: '$5,400', color: 'text-emerald-400' },
                    { label: 'Spent', val: '$3,160', color: 'text-red-400' },
                    { label: 'Saved', val: '$2,240', color: 'text-cyan-400' },
                  ].map((s) => (
                    <div key={s.label} className="rounded-xl bg-white/5 p-3">
                      <p className="text-[10px] text-white/40 font-medium">{s.label}</p>
                      <p className={`text-sm font-bold mt-1 ${s.color}`}>{s.val}</p>
                    </div>
                  ))}
                </div>

                {/* Chart */}
                <SpendingChart />

                {/* Budget rows */}
                <div className="mt-5 space-y-3">
                  <p className="text-xs font-semibold text-white/50 uppercase tracking-wider">Budget Progress</p>
                  <BudgetProgress label="Groceries" spent={240} total={400} color="#22d3ee" />
                  <BudgetProgress label="Entertainment" spent={120} total={200} color="#34d399" />
                  <BudgetProgress label="Transportation" spent={85} total={150} color="#818cf8" />
                </div>

                {/* Health score */}
                <div className="mt-5 flex items-center justify-between rounded-2xl bg-gradient-to-r from-emerald-500/15 to-cyan-500/15 border border-emerald-500/20 px-4 py-3">
                  <div>
                    <p className="text-[10px] text-white/50 font-medium uppercase tracking-wider">Financial Health Score</p>
                    <p className="text-2xl font-extrabold text-white mt-0.5">84 <span className="text-sm text-emerald-400">/ 100</span></p>
                  </div>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className={`h-8 w-1.5 rounded-full ${i < 4 ? 'bg-emerald-400' : 'bg-white/15'}`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Floating AI insight cards */}
              <div className="absolute -right-8 top-8 space-y-3">
                <AiInsightCard text="💡 You could save $180 by reducing dining out this week." delay={1.2} />
                <AiInsightCard text="📊 Subscription costs up 22% — review Netflix, Spotify." delay={1.5} />
              </div>
            </div>

            {/* Glow beneath card */}
            <div className="absolute inset-x-12 bottom-0 h-24 translate-y-8 rounded-full bg-cyan-500/20 blur-3xl" />
          </motion.div>
        </div>

        {/* Stat ticker - mobile visible */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0, duration: 0.6 }}
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {[
            { value: '50K+', label: 'Active Users' },
            { value: '$2.4B', label: 'Tracked Finances' },
            { value: '98%', label: 'Satisfaction Rate' },
            { value: '4.9★', label: 'App Store Rating' },
          ].map((stat) => (
            <div key={stat.label} className="text-center py-5 px-4 rounded-2xl border border-white/[0.06] bg-white/[0.02]">
              <p className="text-2xl md:text-3xl font-extrabold gradient-text-cyan">{stat.value}</p>
              <p className="text-xs text-white/45 mt-1 font-medium">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Bottom fade */}
      <div className="pointer-events-none absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-[#030912] to-transparent" />
    </section>
  )
}
