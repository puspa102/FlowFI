import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'

const avatarColors = [
  'from-cyan-400 to-blue-500',
  'from-emerald-400 to-teal-500',
  'from-purple-400 to-pink-500',
  'from-orange-400 to-red-500',
  'from-yellow-400 to-orange-500',
  'from-pink-400 to-rose-500',
]

const initials = ['AK', 'SL', 'MR', 'JP', 'TC', 'NW', 'RB', 'KS', 'LM', 'FD']

function AnimatedCounter({ end, suffix = '', duration = 2 }: { end: number; suffix?: string; duration?: number }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true })

  useEffect(() => {
    if (!inView) return
    let start = 0
    const step = end / (duration * 60)
    const timer = setInterval(() => {
      start += step
      if (start >= end) {
        setCount(end)
        clearInterval(timer)
      } else {
        setCount(Math.floor(start))
      }
    }, 1000 / 60)
    return () => clearInterval(timer)
  }, [inView, end, duration])

  return (
    <span ref={ref}>
      {count.toLocaleString()}
      {suffix}
    </span>
  )
}

const stats = [
  { value: 50000, suffix: '+', label: 'Active Users', desc: 'Trust Flofi daily' },
  { value: 2400000000, suffix: '+', label: 'Dollars Tracked', desc: 'In financial data' },
  { value: 98, suffix: '%', label: 'Satisfaction', desc: 'From user surveys' },
  { value: 12000000, suffix: '+', label: 'Transactions', desc: 'Processed monthly' },
]

const userTypes = [
  'Young Professionals',
  'University Students',
  'Freelancers',
  'Small Business Owners',
  'Growing Families',
  'First-time Budgeters',
  'Savvy Investors',
  'Financial Planners',
]

export default function TrustedSection() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  const container = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.1 } },
  }
  const itemAnim = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] } },
  }

  return (
    <section className="relative bg-[#030912] py-24 overflow-hidden" id="trust">
      {/* Subtle divider glow */}
      <div className="pointer-events-none absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />

      <div className="mx-auto max-w-7xl px-6" ref={ref}>
        {/* Top label */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-white/35 mb-4">
            Trusted by a growing community
          </p>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white">
            Helping people take control of{' '}
            <span className="gradient-text-cyan">their finances</span>
          </h2>
        </motion.div>

        {/* Stats grid */}
        <motion.div
          variants={container}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-20"
        >
          {stats.map((stat) => (
            <motion.div
              key={stat.label}
              variants={itemAnim}
              className="group relative rounded-3xl border border-white/[0.07] bg-white/[0.025] p-7 text-center hover:border-cyan-500/25 transition-all duration-300 card-hover"
            >
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-cyan-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <p className="text-3xl md:text-4xl font-extrabold gradient-text-cyan leading-none">
                {inView ? (
                  stat.value >= 1000000 ? (
                    <>
                      <AnimatedCounter end={stat.value / 1000000} duration={2} />
                      {stat.value >= 1000000000 ? 'B' : 'M'}
                      {stat.suffix}
                    </>
                  ) : (
                    <>
                      <AnimatedCounter end={stat.value} duration={2} />
                      {stat.suffix}
                    </>
                  )
                ) : '0'}
              </p>
              <p className="text-sm font-semibold text-white mt-2">{stat.label}</p>
              <p className="text-xs text-white/40 mt-0.5">{stat.desc}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Avatar marquee */}
        <div className="mb-10 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/30 mb-6">
            Used by people just like you
          </p>
          <div className="flex justify-center -space-x-3 mb-4">
            {initials.map((init, i) => (
              <div
                key={init}
                className={`h-10 w-10 rounded-full bg-gradient-to-br ${avatarColors[i % avatarColors.length]} flex items-center justify-center text-xs font-bold text-white border-2 border-[#030912] shadow-lg`}
                style={{ zIndex: initials.length - i }}
              >
                {init}
              </div>
            ))}
            <div className="h-10 w-10 rounded-full bg-white/10 border-2 border-[#030912] flex items-center justify-center text-xs font-bold text-white/60">
              +
            </div>
          </div>
          <p className="text-sm text-white/50">
            Join <span className="text-white font-semibold">50,000+</span> users already managing their finances smarter
          </p>
        </div>

        {/* User type tags marquee */}
        <div className="relative overflow-hidden">
          <div className="flex gap-3 animate-scroll-x" style={{ width: 'max-content' }}>
            {[...userTypes, ...userTypes].map((type, i) => (
              <div
                key={`${type}-${i}`}
                className="shrink-0 rounded-full border border-white/10 bg-white/[0.04] px-5 py-2 text-sm font-medium text-white/60 whitespace-nowrap"
              >
                {type}
              </div>
            ))}
          </div>
          <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#030912] to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[#030912] to-transparent" />
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
    </section>
  )
}
