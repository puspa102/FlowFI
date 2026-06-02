import { useRef, useState, useEffect } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Star } from 'lucide-react'

const testimonials = [
  {
    name: 'Alex Kim',
    role: 'Freelance Designer',
    initials: 'AK',
    avatarGrad: 'from-cyan-400 to-blue-500',
    rating: 5,
    text: "Flofi completely changed how I manage my irregular freelance income. The AI insights helped me realize I was losing $200/month on unused subscriptions. Best financial decision I ever made.",
    highlight: '$200/month saved',
  },
  {
    name: 'Priya Sharma',
    role: 'University Student',
    initials: 'PS',
    avatarGrad: 'from-emerald-400 to-teal-500',
    rating: 5,
    text: "As a student, I was always running out of money mid-month. Flofi's budget alerts literally text me before I overspend. My savings went from $0 to $500 in two months. Incredible.",
    highlight: '$500 saved in 2 months',
  },
  {
    name: 'Marcus Reid',
    role: 'Software Engineer',
    initials: 'MR',
    avatarGrad: 'from-purple-400 to-indigo-500',
    rating: 5,
    text: "The dashboard is stunning and the AI recommendations are genuinely useful — not generic advice. It noticed I was consistently overspending on food delivery and suggested meal-prepping. Saved me $300/month.",
    highlight: '$300/month on food costs',
  },
  {
    name: 'Sarah Chen',
    role: 'Small Business Owner',
    initials: 'SC',
    avatarGrad: 'from-orange-400 to-pink-500',
    rating: 5,
    text: "Managing personal and business finances was a nightmare before Flofi. The multi-account view is a game changer. I can finally see my complete financial picture in one beautiful place.",
    highlight: 'Complete financial clarity',
  },
  {
    name: 'David Torres',
    role: 'Family Budget Planner',
    initials: 'DT',
    avatarGrad: 'from-rose-400 to-red-500',
    rating: 5,
    text: "We have 3 kids and 2 incomes to manage. Flofi's family budgeting features helped us hit our home down-payment goal 6 months early. The AI predictions are remarkably accurate.",
    highlight: 'Goal hit 6 months early',
  },
  {
    name: 'Nadia Williams',
    role: 'Young Professional',
    initials: 'NW',
    avatarGrad: 'from-yellow-400 to-orange-500',
    rating: 5,
    text: "I've tried every budgeting app. Flofi is the first one I've stuck with past week one because the AI makes it feel effortless. It does the hard thinking for me. Absolutely love it.",
    highlight: 'First app I actually stuck with',
  },
]

function StarRating({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {[...Array(count)].map((_, i) => (
        <Star key={i} className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
      ))}
    </div>
  )
}

export default function TestimonialsSection() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  const [current, setCurrent] = useState(0)
  const [autoPlay, setAutoPlay] = useState(true)

  useEffect(() => {
    if (!autoPlay) return
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % testimonials.length)
    }, 4500)
    return () => clearInterval(timer)
  }, [autoPlay])

  const go = (dir: 1 | -1) => {
    setAutoPlay(false)
    setCurrent((prev) => (prev + dir + testimonials.length) % testimonials.length)
  }

  return (
    <section className="relative bg-[#050d1f] py-28 overflow-hidden" id="testimonials">
      <div className="pointer-events-none absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-yellow-500/20 to-transparent" />
      <div className="pointer-events-none absolute top-1/3 left-1/4 w-80 h-80 bg-yellow-500/5 blur-3xl rounded-full" />

      <div className="mx-auto max-w-7xl px-6">
        {/* Header */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.65 }}
          className="text-center mb-16"
        >
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-yellow-400/70 mb-4">
            Real people, real results
          </p>
          <h2 className="text-4xl md:text-5xl font-extrabold text-white leading-tight">
            Loved by{' '}
            <span className="gradient-text-cyan">50,000+ users</span>
          </h2>
          <p className="mt-4 text-base text-white/45 max-w-xl mx-auto">
            From students to business owners — Flofi is changing how real people relate to their money.
          </p>
        </motion.div>

        {/* Featured testimonial carousel */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.2, duration: 0.65 }}
          className="relative max-w-3xl mx-auto mb-12"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, x: 40, scale: 0.97 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -40, scale: 0.97 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="glass-dark rounded-3xl border border-white/[0.08] p-8 md:p-10"
            >
              {/* Quote mark */}
              <div className="text-5xl  text-cyan-500/30 font-serif leading-none mb-4">"</div>

              {/* Text */}
              <p className="text-base md:text-lg text-white/80 leading-relaxed mb-6">
                {testimonials[current].text}
              </p>

              {/* Highlight badge */}
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-4 py-1.5 text-xs font-semibold text-emerald-400 mb-6">
                ✨ {testimonials[current].highlight}
              </div>

              {/* Author */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`h-11 w-11 rounded-full bg-gradient-to-br ${testimonials[current].avatarGrad} flex items-center justify-center text-sm font-bold text-white shadow-lg`}>
                    {testimonials[current].initials}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{testimonials[current].name}</p>
                    <p className="text-xs text-white/40">{testimonials[current].role}</p>
                  </div>
                </div>
                <StarRating count={testimonials[current].rating} />
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Nav buttons */}
          <button
            onClick={() => go(-1)}
            className="absolute -left-5 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-all duration-200"
            aria-label="Previous"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={() => go(1)}
            className="absolute -right-5 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-all duration-200"
            aria-label="Next"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </motion.div>

        {/* Dot indicators */}
        <div className="flex justify-center gap-2 mb-16">
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => { setAutoPlay(false); setCurrent(i) }}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === current ? 'w-6 bg-cyan-400' : 'w-1.5 bg-white/20'
              }`}
              aria-label={`Go to testimonial ${i + 1}`}
            />
          ))}
        </div>

        {/* Mini grid of all testimonials */}
        <div className="grid md:grid-cols-3 gap-4">
          {testimonials.map((t, i) => (
            <motion.button
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.3 + i * 0.07, duration: 0.5 }}
              onClick={() => { setAutoPlay(false); setCurrent(i) }}
              className={`text-left rounded-2xl border p-5 transition-all duration-300 ${
                i === current
                  ? 'border-cyan-500/30 bg-cyan-500/10'
                  : 'border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/10'
              }`}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`h-8 w-8 rounded-full bg-gradient-to-br ${t.avatarGrad} flex items-center justify-center text-xs font-bold text-white`}>
                  {t.initials}
                </div>
                <div>
                  <p className="text-xs font-semibold text-white">{t.name}</p>
                  <p className="text-[10px] text-white/40">{t.role}</p>
                </div>
              </div>
              <StarRating count={t.rating} />
              <p className="mt-2 text-xs text-white/50 line-clamp-2 leading-relaxed">{t.text}</p>
            </motion.button>
          ))}
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
    </section>
  )
}
