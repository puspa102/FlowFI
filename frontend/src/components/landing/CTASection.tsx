import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { ArrowRight, Calendar } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useTheme } from '@/theme/ThemeProvider'

function MiniGrowthChart() {
  const values = [20, 35, 28, 50, 42, 65, 58, 78, 70, 88, 82, 100]
  const max = 100
  const width = 280
  const height = 80
  const points = values.map((v, i) => {
    const x = (i / (values.length - 1)) * width
    const y = height - (v / max) * height
    return `${x},${y}`
  })

  return (
    <div className="relative">
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
        {/* Area fill */}
        <defs>
          <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
          </linearGradient>
        </defs>
        <motion.path
          d={`M ${points[0]} ${points.slice(1).map((p) => `L ${p}`).join(' ')} L ${width},${height} L 0,${height} Z`}
          fill="url(#chartGrad)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 1 }}
        />
        {/* Line */}
        <motion.polyline
          points={points.join(' ')}
          fill="none"
          stroke="#22d3ee"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 0.2, duration: 1.5, ease: 'easeInOut' }}
        />
        {/* End dot */}
        <motion.circle
          cx={width}
          cy={height - (values[values.length - 1] / max) * height}
          r="4"
          fill="#22d3ee"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 1.6, type: 'spring' }}
        />
      </svg>
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.7, duration: 0.4 }}
        className="absolute -top-6 right-0 rounded-xl bg-emerald-500/20 border border-emerald-500/30 px-3 py-1 text-xs font-bold text-emerald-400"
      >
        +400% growth ↑
      </motion.div>
    </div>
  )
}

export default function CTASection() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  const { mode } = useTheme()

  return (
    <section className="relative py-28 overflow-hidden transition-colors duration-300" style={{ background: mode === 'dark' ? '#030912' : 'var(--background)' }} id="cta">
      <div className="pointer-events-none absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />

      {/* Background gradient blobs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] -translate-y-1/2 rounded-full bg-cyan-500/10 blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] translate-y-1/2 rounded-full bg-emerald-500/10 blur-[100px]" />
      </div>

      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 32, scale: 0.97 }}
          animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
          transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
          className="relative rounded-[2rem] border border-white/[0.08] bg-gradient-to-br from-white/[0.05] to-white/[0.01] overflow-hidden"
        >
          {/* Inner glow */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-emerald-500/10" />

          {/* Corner dots */}
          <div className="pointer-events-none absolute inset-0 dot-pattern opacity-20" />

          <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center p-10 md:p-16">
            {/* Left: Copy */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/25 bg-cyan-500/10 px-4 py-1.5 text-xs font-semibold text-cyan-400">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
                Start building wealth today
              </div>

              <h2 className="text-4xl md:text-5xl font-extrabold leading-tight" style={{ color: mode === 'dark' ? '#FFFFFF' : 'var(--foreground)' }}>
                Start Building Better
                <br />
                <span className="gradient-text-cyan">Financial Habits</span>
                <br />
                Today
              </h2>

              <p className="text-base leading-relaxed max-w-md" style={{ color: mode === 'dark' ? 'rgba(255,255,255,0.55)' : 'var(--muted-foreground)' }}>
                Join thousands of users taking control of their finances with AI-powered insights. Free to start — no credit card required.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link
                  to="/register"
                  className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-500 to-emerald-500 px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 hover:scale-105 transition-all duration-300"
                >
                  Create Free Account
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <button
                  className="inline-flex items-center gap-2.5 rounded-full border px-6 py-3.5 text-sm font-semibold transition-all duration-300 backdrop-blur-sm"
                  style={{
                    borderColor: mode === 'dark' ? 'rgba(255,255,255,0.15)' : 'var(--border)',
                    background: mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'var(--card)',
                    color: mode === 'dark' ? '#FFFFFF' : 'var(--foreground)',
                  }}
                >
                  <Calendar className="h-4 w-4" style={{ color: mode === 'dark' ? 'rgba(255,255,255,0.6)' : 'var(--muted-foreground)' }} />
                  Book a Demo
                </button>
              </div>

              <p className="text-xs" style={{ color: mode === 'dark' ? 'rgba(255,255,255,0.3)' : 'var(--muted-foreground)' }}>
                ✓ Free forever plan &nbsp;·&nbsp; ✓ No credit card &nbsp;·&nbsp; ✓ Cancel anytime
              </p>
            </div>

            {/* Right: Growth chart */}
            <div className="flex flex-col items-center justify-center gap-8">
              {/* Chart card */}
              <div className="w-full max-w-xs rounded-3xl border p-6 backdrop-blur-sm" style={{ borderColor: mode === 'dark' ? 'rgba(255,255,255,0.07)' : 'var(--border)', background: mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'var(--card)' }}>
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <p className="text-xs font-medium" style={{ color: mode === 'dark' ? 'rgba(255,255,255,0.4)' : 'var(--muted-foreground)' }}>Your Savings Growth</p>
                    <p className="text-3xl font-extrabold mt-0.5" style={{ color: mode === 'dark' ? '#FFFFFF' : 'var(--foreground)' }}>$12,400</p>
                    <p className="text-xs text-emerald-400 mt-0.5 font-medium">After 12 months with Flofi</p>
                  </div>
                </div>
                <MiniGrowthChart />
                <div className="flex justify-between text-[10px] mt-4" style={{ color: mode === 'dark' ? 'rgba(255,255,255,0.25)' : 'var(--muted-foreground)' }}>
                  <span>Month 1</span>
                  <span>Month 6</span>
                  <span>Month 12</span>
                </div>
              </div>

              {/* Mini stats */}
              <div className="grid grid-cols-2 gap-3 w-full max-w-xs">
                {[
                  { val: '↑ 41%', label: 'Avg savings increase' },
                  { val: '$450', label: 'Monthly savings found' },
                  { val: '14 days', label: 'Free trial period' },
                  { val: '5 min', label: 'Setup time' },
                ].map((s) => (
                  <div key={s.label} className="rounded-2xl border p-4 text-center" style={{ borderColor: mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'var(--border)', background: mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'var(--card)' }}>
                    <p className="text-lg font-extrabold gradient-text-cyan">{s.val}</p>
                    <p className="text-[10px] mt-0.5" style={{ color: mode === 'dark' ? 'rgba(255,255,255,0.35)' : 'var(--muted-foreground)' }}>{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
