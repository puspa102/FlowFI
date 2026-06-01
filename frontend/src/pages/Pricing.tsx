import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { apiGet } from '../api/client'

type PricingPlan = {
  id: number
  name: string
  priceLabel: string
  priceAmount: number | null
  priceSuffix: string | null
  summary: string
  ctaLabel: string
  ctaHref: string
  isPopular: boolean
  features: string[]
}

type PricingFaq = {
  id: number
  question: string
  answer: string
}

type PricingCta = {
  title: string
  subtitle: string
  primaryLabel: string
  primaryHref: string
  secondaryLabel: string | null
  secondaryHref: string | null
}

type PricingPayload = {
  plans: PricingPlan[]
  faqs: PricingFaq[]
  logos: { id: number; name: string }[]
  cta: PricingCta | null
}

const fallbackPricing: PricingPayload = {
  plans: [
    { id: 1, name: 'Starter', priceLabel: 'Free', priceAmount: null, priceSuffix: null, summary: 'Core tracking for emerging portfolios.', ctaLabel: 'Continue with Free', ctaHref: '/register', isPopular: false, features: ['Up to 3 Linked Accounts', 'Weekly AI Summaries', 'Real-time Dashboard', 'No Advanced Tax Strategy'] },
    { id: 2, name: 'Pro', priceLabel: '$19', priceAmount: 19, priceSuffix: '/mo', summary: 'Sophisticated wealth engineering for active investors.', ctaLabel: 'Get Pro Access', ctaHref: '/register', isPopular: true, features: ['Unlimited Linked Accounts', 'Daily AI Wealth Insights', 'Advanced Tax Loss Harvesting', 'Priority Email Support', 'Crypto & Stock Rebalancing'] },
    { id: 3, name: 'Enterprise', priceLabel: 'Custom', priceAmount: null, priceSuffix: null, summary: 'Tailored solutions for family offices and firms.', ctaLabel: 'Contact Sales', ctaHref: '/register', isPopular: false, features: ['Multi-User Workspaces', 'White-label Reporting', 'API Access & Integrations', 'Dedicated Financial Architect'] },
  ],
  faqs: [
    { id: 1, question: 'Can I change plans later?', answer: 'Absolutely. Upgrade or downgrade at any time. Changes take effect at the start of your next billing cycle.' },
    { id: 2, question: 'Is my data secure?', answer: 'We use institutional-grade 256-bit AES encryption and partner with Plaid for read-only access.' },
    { id: 3, question: 'What does "AI Insights" mean?', answer: 'Our LLM engine analyzes your patterns to suggest tax-optimization strategies and hidden opportunities.' },
    { id: 4, question: 'Do you offer yearly billing?', answer: 'Yes, annual billing saves 20% on Pro and Enterprise tiers.' },
  ],
  logos: [{ id: 1, name: 'Stark Capital' }, { id: 2, name: 'Nexus AI' }, { id: 3, name: 'Quantum Ventures' }, { id: 4, name: 'Omni Asset' }],
  cta: { title: 'Ready to engineer your financial future?', subtitle: 'Join 150,000+ investors using FloFi.', primaryLabel: 'Get Started Now', primaryHref: '/register', secondaryLabel: 'View Demo', secondaryHref: '/' },
}

export default function Pricing() {
  const [pricing, setPricing] = useState<PricingPayload | null>(null)
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  useEffect(() => {
    let isMounted = true
    apiGet<PricingPayload>('/api/pricing')
      .then((response) => {
        if (!isMounted) return
        if (response.ok && response.data) setPricing(response.data)
      })
      .catch(() => {})
    return () => { isMounted = false }
  }, [])

  const content = pricing ?? fallbackPricing

  return (
    <div className="relative min-h-screen bg-navy-950 text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_12%,rgba(0,212,170,0.06),transparent_45%),radial-gradient(circle_at_80%_16%,rgba(0,212,170,0.04),transparent_40%)]" />

      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-white/6 bg-navy-950/80 backdrop-blur-lg">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-6 px-6 py-4">
          <Link to="/" className="font-display text-xl italic text-white">Flofi</Link>
          <nav className="hidden items-center gap-6 text-sm font-medium text-platinum md:flex">
            <Link className="transition hover:text-white" to="/">Platform</Link>
            <span className="text-primary">Pricing</span>
          </nav>
          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" size="sm"><Link to="/login">Log in</Link></Button>
            <Button asChild size="sm"><Link to="/register">Get started</Link></Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative mx-auto max-w-5xl px-6 pb-10 pt-20 text-center">
        <Badge className="bg-primary/10 text-primary border-0 mb-4">Pricing</Badge>
        <h1 className="font-display text-5xl italic text-white md:text-6xl">Precision Wealth Engineering</h1>
        <p className="mx-auto mt-4 max-w-3xl text-base text-platinum md:text-lg">
          Select the tier that aligns with your financial velocity.
        </p>
      </section>

      {/* Plans */}
      <section className="mx-auto grid w-full max-w-6xl gap-6 px-6 pb-16 md:grid-cols-3">
        {content.plans.map((plan, i) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * i, duration: 0.4 }}
            whileHover={{ scale: 1.01 }}
            className={`relative glass-card rounded-lg p-6 flex flex-col ${plan.isPopular ? 'ring-1 ring-primary/40' : ''}`}
          >
            {plan.isPopular && <Badge className="absolute right-4 top-4 bg-primary/10 text-primary border-0 text-[10px]">Most popular</Badge>}
            <h3 className="text-lg font-semibold text-white">{plan.name}</h3>
            <p className="text-xs text-platinum mt-1">{plan.summary}</p>
            <div className="flex items-baseline gap-1 mt-5">
              <span className="text-3xl font-bold text-white">{plan.priceLabel}</span>
              {plan.priceSuffix && <span className="text-sm text-platinum">{plan.priceSuffix}</span>}
            </div>
            <ul className="space-y-2.5 text-sm text-platinum mt-6 flex-1">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>
            <Button className="w-full mt-6" variant={plan.isPopular ? 'default' : 'outline'} asChild>
              <Link to={plan.ctaHref}>{plan.ctaLabel}</Link>
            </Button>
          </motion.div>
        ))}
      </section>

      {/* Logos */}
      <section className="mx-auto w-full max-w-6xl px-6 pb-10 text-center">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-platinum">Powering sophisticated capital flows</p>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-8 text-sm font-medium text-platinum/60">
          {content.logos.map((logo) => <span key={logo.id}>{logo.name}</span>)}
        </div>
      </section>

      <div className="mx-auto max-w-5xl h-px bg-white/6" />

      {/* FAQs */}
      <section className="mx-auto w-full max-w-3xl px-6 py-16">
        <h2 className="text-center font-display text-3xl italic text-white mb-8">Frequently Asked Questions</h2>
        <div className="space-y-3">
          {content.faqs.map((faq) => (
            <div key={faq.id} className="glass-card rounded-lg overflow-hidden">
              <button
                onClick={() => setOpenFaq(openFaq === faq.id ? null : faq.id)}
                className="w-full text-left px-5 py-4 flex items-center justify-between"
              >
                <span className="text-sm font-medium text-white">{faq.question}</span>
                <span className="text-platinum text-lg">{openFaq === faq.id ? '−' : '+'}</span>
              </button>
              {openFaq === faq.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  transition={{ duration: 0.2 }}
                  className="px-5 pb-4 text-sm text-platinum"
                >
                  {faq.answer}
                </motion.div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      {content.cta && (
        <section className="mx-auto w-full max-w-6xl px-6 pb-16">
          <div className="relative rounded-lg overflow-hidden border-gradient-teal p-8 bg-navy-900 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-white">{content.cta.title}</h2>
              <p className="mt-2 text-sm text-platinum">{content.cta.subtitle}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg"><Link to="/register">{content.cta.primaryLabel}</Link></Button>
              {content.cta.secondaryLabel && <Button variant="outline" size="lg">{content.cta.secondaryLabel}</Button>}
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t border-white/6">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-6 py-10 text-sm text-platinum md:flex-row md:items-center md:justify-between">
          <span className="font-display text-base italic text-white">Flofi</span>
          <div className="flex flex-wrap gap-4 text-xs">
            <a className="transition hover:text-white" href="/privacy-policy">Privacy Policy</a>
            <a className="transition hover:text-white" href="/terms-of-service">Terms of Service</a>
            <a className="transition hover:text-white" href="#security">Security</a>
            <a className="transition hover:text-white" href="#contact">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
