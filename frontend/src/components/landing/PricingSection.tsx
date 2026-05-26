import { useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { Check, Zap, Star } from 'lucide-react'
import { Link } from 'react-router-dom'

const plans = [
  {
    id: 'free',
    name: 'Free',
    monthlyPrice: 0,
    yearlyPrice: 0,
    desc: 'Perfect to get started with personal finance management.',
    badge: null,
    cta: 'Get Started Free',
    ctaLink: '/register',
    ctaStyle: 'border border-white/15 bg-white/5 text-white hover:bg-white/10',
    features: [
      'Expense tracking (up to 100/month)',
      'Budget management (3 budgets)',
      'Basic spending reports',
      '2 account connections',
      'Mobile app access',
      'Email support',
    ],
    missing: [
      'AI financial insights',
      'Advanced analytics',
      'Unlimited accounts',
      'Savings goals tracking',
      'Priority support',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    monthlyPrice: 9,
    yearlyPrice: 7,
    desc: 'For individuals serious about their financial growth.',
    badge: 'Most Popular',
    cta: 'Start Pro Trial',
    ctaLink: '/register?plan=pro',
    ctaStyle: 'bg-gradient-to-r from-cyan-500 to-emerald-500 text-white shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-105',
    features: [
      'Unlimited expense tracking',
      'Unlimited budget creation',
      'Advanced analytics & trends',
      'AI financial insights',
      'Unlimited account connections',
      'Savings goals tracking',
      'CSV/PDF exports',
      'Priority email support',
    ],
    missing: [
      'Full AI assistant chat',
      'Financial forecasting',
    ],
  },
  {
    id: 'premium',
    name: 'Premium',
    monthlyPrice: 19,
    yearlyPrice: 15,
    desc: 'Full AI power for ambitious financial goals.',
    badge: 'Best Value',
    cta: 'Start Premium',
    ctaLink: '/register?plan=premium',
    ctaStyle: 'border border-purple-500/40 bg-purple-500/15 text-white hover:bg-purple-500/25',
    features: [
      'Everything in Pro',
      'Full AI chat assistant',
      'Advanced financial forecasting',
      'Personalized wealth coaching',
      'Custom financial reports',
      'Investment tracking',
      'Tax optimization hints',
      'Priority phone support',
      'Early access to new features',
    ],
    missing: [],
  },
]

export default function PricingSection() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  const [yearly, setYearly] = useState(false)

  return (
    <section className="relative bg-[#030912] py-28 overflow-hidden" id="pricing">
      <div className="pointer-events-none absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent" />
      <div className="pointer-events-none absolute top-1/3 right-0 w-96 h-96 bg-indigo-500/6 blur-3xl rounded-full" />
      <div className="pointer-events-none absolute bottom-1/4 left-0 w-80 h-80 bg-cyan-500/5 blur-3xl rounded-full" />

      <div className="mx-auto max-w-7xl px-6">
        {/* Header */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.65 }}
          className="text-center mb-12"
        >
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-indigo-400/70 mb-4">
            Simple pricing
          </p>
          <h2 className="text-4xl md:text-5xl font-extrabold text-white leading-tight">
            Invest in your{' '}
            <span className="gradient-text-blue">financial future</span>
          </h2>
          <p className="mt-4 text-base text-white/45 max-w-xl mx-auto">
            Start free. Upgrade when you need more power. No hidden fees, ever.
          </p>

          {/* Billing toggle */}
          <div className="mt-8 inline-flex items-center gap-4 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-1.5">
            <button
              onClick={() => setYearly(false)}
              className={`rounded-xl px-5 py-2 text-sm font-semibold transition-all duration-200 ${
                !yearly ? 'bg-white/10 text-white shadow-sm' : 'text-white/40 hover:text-white/60'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setYearly(true)}
              className={`flex items-center gap-2 rounded-xl px-5 py-2 text-sm font-semibold transition-all duration-200 ${
                yearly ? 'bg-white/10 text-white shadow-sm' : 'text-white/40 hover:text-white/60'
              }`}
            >
              Yearly
              <span className="rounded-full bg-emerald-500/20 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                Save 20%
              </span>
            </button>
          </div>
        </motion.div>

        {/* Plans */}
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan, i) => {
            const price = yearly ? plan.yearlyPrice : plan.monthlyPrice
            const isPopular = plan.badge === 'Most Popular'

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 32 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.15 + i * 0.1, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
                className={`relative flex flex-col rounded-3xl border p-7 transition-all duration-300 card-hover ${
                  isPopular
                    ? 'border-cyan-500/30 bg-gradient-to-b from-cyan-500/[0.08] to-transparent shadow-2xl shadow-cyan-500/10'
                    : 'border-white/[0.07] bg-white/[0.025]'
                }`}
              >
                {/* Popular badge */}
                {plan.badge && (
                  <div className={`absolute -top-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 rounded-full px-4 py-1 text-[11px] font-bold shadow-lg ${
                    isPopular
                      ? 'bg-gradient-to-r from-cyan-500 to-emerald-500 text-white shadow-cyan-500/30'
                      : 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-purple-500/30'
                  }`}>
                    {isPopular ? <Star className="h-3 w-3 fill-current" /> : <Zap className="h-3 w-3 fill-current" />}
                    {plan.badge}
                  </div>
                )}

                {/* Plan name + desc */}
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-white mb-1">{plan.name}</h3>
                  <p className="text-xs text-white/45 leading-relaxed">{plan.desc}</p>
                </div>

                {/* Price */}
                <div className="mb-7">
                  <div className="flex items-end gap-2">
                    <span className="text-4xl font-extrabold text-white">
                      ${price}
                    </span>
                    {price > 0 && (
                      <span className="text-sm text-white/40 mb-1.5">/ month</span>
                    )}
                    {price === 0 && (
                      <span className="text-sm text-white/40 mb-1.5">forever</span>
                    )}
                  </div>
                  {yearly && price > 0 && (
                    <p className="text-xs text-emerald-400 mt-1">
                      Billed ${price * 12}/year · Save ${(plan.monthlyPrice - price) * 12}/year
                    </p>
                  )}
                </div>

                {/* CTA */}
                <Link
                  to={plan.ctaLink}
                  className={`mb-7 block w-full rounded-2xl px-5 py-3 text-center text-sm font-bold transition-all duration-300 ${plan.ctaStyle}`}
                >
                  {plan.cta}
                </Link>

                {/* Divider */}
                <div className="h-px w-full bg-white/[0.06] mb-6" />

                {/* Features */}
                <div className="flex-1 space-y-3">
                  {plan.features.map((f) => (
                    <div key={f} className="flex items-start gap-2.5">
                      <Check className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span className="text-xs text-white/65 leading-relaxed">{f}</span>
                    </div>
                  ))}
                  {plan.missing.map((f) => (
                    <div key={f} className="flex items-start gap-2.5 opacity-40">
                      <div className="h-4 w-4 shrink-0 mt-0.5 flex items-center justify-center">
                        <div className="h-0.5 w-2.5 rounded-full bg-white/30" />
                      </div>
                      <span className="text-xs text-white/40 leading-relaxed">{f}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Footer note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.7, duration: 0.5 }}
          className="text-center text-xs text-white/30 mt-10"
        >
          All plans include a 14-day free trial. No credit card required. Cancel anytime.
        </motion.p>
      </div>

      <div className="pointer-events-none absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
    </section>
  )
}
