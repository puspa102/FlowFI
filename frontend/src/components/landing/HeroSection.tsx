import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useAnimation } from 'framer-motion'
import { ArrowRight, Play, TrendingUp, Wallet, ShieldCheck } from 'lucide-react'


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
    visible: { opacity: 1, y: 0, transition: { duration: 0.7 } },
  }

  return (
    <section
      ref={ref}
      className="relative min-h-screen overflow-hidden bg-[#030912]"
      id="hero"
    >
      {/* ── FULL-VIEWPORT BACKGROUND IMAGE ── */}
      <div className="absolute inset-0 w-full h-full">
        <img
          src="/hero-image.png"
          alt="FloFi Dashboard Background"
          className="w-full h-full object-cover object-center"
          style={{ display: 'block' }}
        />
        {/* Dark overlay so text stays readable */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#030912]/95 via-[#030912]/70 to-[#030912]/30" />
        {/* Bottom fade to blend into the rest of the page */}
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#030912] to-transparent" />
      </div>

      {/* Ambient gradient blobs on top of image */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] -translate-x-1/2 -translate-y-1/4 rounded-full bg-cyan-500/10 blur-[120px]" />
        <div className="absolute top-1/3 right-0 w-[500px] h-[500px] translate-x-1/4 rounded-full bg-emerald-500/10 blur-[120px]" />
      </div>

      {/* Grid pattern overlay */}
      <div className="pointer-events-none absolute inset-0 grid-pattern opacity-20" />

      {/* ── TEXT CONTENT — overlaps the image ── */}
      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 pt-36 pb-24 min-h-screen flex flex-col justify-center">
        <motion.div
          variants={container}
          initial="hidden"
          animate="visible"
          className="max-w-2xl space-y-8"
        >

          {/* Headline */}
          <motion.div variants={item} className="space-y-3">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.06] tracking-tight text-white drop-shadow-2xl">
              Take Control of
              <br />
              Your{' '}
              <span className="gradient-text-cyan">Financial</span>
              <br />
              Future
            </h1>
          </motion.div>

          {/* Subheadline */}
          <motion.p variants={item} className="text-base md:text-lg text-white/70 max-w-lg leading-relaxed">
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
            <button className="inline-flex items-center gap-2.5 rounded-full border border-white/20 bg-white/10 px-6 py-3.5 text-sm font-semibold text-white hover:bg-white/15 hover:border-white/30 transition-all duration-300 backdrop-blur-sm">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20">
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
              <div key={text} className="flex items-center gap-2 text-xs text-white/60">
                <Icon className="h-3.5 w-3.5 text-emerald-400" />
                {text}
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Stat ticker */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0, duration: 0.6 }}
          className="mt-auto pt-16 grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {[
            { value: '50K+', label: 'Active Users' },
            { value: '$2.4B', label: 'Tracked Finances' },
            { value: '98%', label: 'Satisfaction Rate' },
            { value: '4.9★', label: 'App Store Rating' },
          ].map((stat) => (
            <div key={stat.label} className="text-center py-5 px-4 rounded-2xl border border-white/[0.08] bg-black/30 backdrop-blur-sm">
              <p className="text-2xl md:text-3xl font-extrabold gradient-text-cyan">{stat.value}</p>
              <p className="text-xs text-white/45 mt-1 font-medium">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
