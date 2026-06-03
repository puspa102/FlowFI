import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { X, CheckCircle2 } from 'lucide-react'
import { useTheme } from '@/theme/ThemeProvider'

const painPoints = [
  { pain: 'Losing track of where money goes', solution: 'Automatic categorization of every transaction in real time' },
  { pain: 'Overspending without realizing it', solution: 'Proactive budget alerts before you exceed your limits' },
  { pain: 'Difficulty maintaining budgets', solution: 'Adaptive budgets that learn and adjust to your lifestyle' },
  { pain: 'Lack of financial visibility', solution: 'Beautiful dashboards with instant 360° financial overview' },
  { pain: 'Managing multiple accounts separately', solution: 'All accounts unified in one intelligent workspace' },
  { pain: 'Missing savings opportunities', solution: 'AI finds and surfaces savings opportunities you\'d never spot alone' },
]

export default function WhySection() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  const { mode } = useTheme()
  const isDark = mode === 'dark'

  return (
    <section
      className="relative py-28 overflow-hidden transition-colors duration-300"
      style={{ background: isDark ? '#030912' : 'var(--background)' }}
      id="why"
    >
      <div className="pointer-events-none absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />
      <div className="pointer-events-none absolute top-1/2 right-1/4 w-96 h-96 bg-purple-500/6 blur-3xl rounded-full" />

      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.65 }}
          className="text-center mb-16"
        >
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-purple-400/70 mb-4">
            Why Flofi
          </p>
          <h2 className="text-4xl md:text-5xl font-extrabold leading-tight max-w-3xl mx-auto" style={{ color: isDark ? '#FFFFFF' : 'var(--foreground)' }}>
            Solve the real problems
            <br />
            <span className="gradient-text-blue">holding you back</span>
          </h2>
          <p className="mt-4 text-base max-w-xl mx-auto" style={{ color: isDark ? 'rgba(255,255,255,0.45)' : 'var(--muted-foreground)' }}>
            Most people struggle with the same financial challenges. Flofi was built specifically to solve each one.
          </p>
        </motion.div>

        {/* Two-column pain vs solution */}
        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {/* Pain column */}
          <div className="space-y-4">
            <div className="mb-6 flex items-center gap-2">
              <div className="h-6 w-6 flex items-center justify-center rounded-full bg-red-500/20 border border-red-500/30">
                <X className="h-3 w-3 text-red-400" />
              </div>
              <p className="text-sm font-bold text-red-400 uppercase tracking-wider">The Problem</p>
            </div>
            {painPoints.map((item, i) => (
              <motion.div
                key={item.pain}
                initial={{ opacity: 0, x: -24 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: 0.2 + i * 0.08, duration: 0.55 }}
                className="flex items-start gap-3 rounded-2xl border border-red-500/10 bg-red-500/5 px-5 py-4"
              >
                <X className="h-4 w-4 text-red-400/60 mt-0.5 shrink-0" />
                <p className="text-sm leading-relaxed" style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'var(--muted-foreground)' }}>{item.pain}</p>
              </motion.div>
            ))}
          </div>

          {/* Solution column */}
          <div className="space-y-4">
            <div className="mb-6 flex items-center gap-2">
              <div className="h-6 w-6 flex items-center justify-center rounded-full bg-emerald-500/20 border border-emerald-500/30">
                <CheckCircle2 className="h-3 w-3 text-emerald-400" />
              </div>
              <p className="text-sm font-bold text-emerald-400 uppercase tracking-wider">Flofi's Answer</p>
            </div>
            {painPoints.map((item, i) => (
              <motion.div
                key={item.solution}
                initial={{ opacity: 0, x: 24 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: 0.25 + i * 0.08, duration: 0.55 }}
                className="flex items-start gap-3 rounded-2xl border border-emerald-500/15 bg-emerald-500/5 px-5 py-4"
              >
                <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
                <p className="text-sm leading-relaxed" style={{ color: isDark ? 'rgba(255,255,255,0.7)' : 'var(--foreground)' }}>{item.solution}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bottom highlight stat */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.8, duration: 0.65 }}
          className="mt-16 max-w-3xl mx-auto text-center rounded-3xl border py-10 px-8"
          style={{
            borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'var(--border)',
            background: isDark ? 'rgba(255,255,255,0.02)' : 'var(--card)',
          }}
        >
          <p className="text-5xl md:text-6xl font-extrabold gradient-text-emerald mb-3">$450</p>
          <p className="text-lg font-semibold mb-2" style={{ color: isDark ? '#FFFFFF' : 'var(--foreground)' }}>Average monthly savings discovered per user</p>
          <p className="text-sm" style={{ color: isDark ? 'rgba(255,255,255,0.4)' : 'var(--muted-foreground)' }}>Based on AI-driven spending analysis across Flofi&apos;s user base</p>
        </motion.div>
      </div>

      <div className="pointer-events-none absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
    </section>
  )
}
