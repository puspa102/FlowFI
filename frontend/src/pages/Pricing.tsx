import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
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
    {
      id: 1,
      name: 'Starter',
      priceLabel: 'Free',
      priceAmount: null,
      priceSuffix: null,
      summary: 'Core tracking for emerging portfolios.',
      ctaLabel: 'Continue with Free',
      ctaHref: '/pricing',
      isPopular: false,
      features: ['Up to 3 Linked Accounts', 'Weekly AI Summaries', 'Real-time Dashboard', 'No Advanced Tax Strategy'],
    },
    {
      id: 2,
      name: 'Pro',
      priceLabel: '$19',
      priceAmount: 19,
      priceSuffix: '/mo',
      summary: 'Sophisticated wealth engineering for active investors.',
      ctaLabel: 'Get Pro Access',
      ctaHref: '/pricing',
      isPopular: true,
      features: [
        'Unlimited Linked Accounts',
        'Daily AI Wealth Insights',
        'Advanced Tax Loss Harvesting',
        'Priority Email Support',
        'Crypto & Stock Rebalancing',
      ],
    },
    {
      id: 3,
      name: 'Enterprise',
      priceLabel: 'Custom',
      priceAmount: null,
      priceSuffix: null,
      summary: 'Tailored solutions for family offices and firms.',
      ctaLabel: 'Contact Sales',
      ctaHref: '/pricing',
      isPopular: false,
      features: ['Multi-User Workspaces', 'White-label Reporting', 'API Access & Integrations', 'Dedicated Financial Architect'],
    },
  ],
  faqs: [
    {
      id: 1,
      question: 'Can I change plans later?',
      answer:
        'Absolutely. You can upgrade or downgrade your plan at any time. Changes take effect at the start of your next billing cycle.',
    },
    {
      id: 2,
      question: 'Is my data secure with FloFi?',
      answer:
        'Security is our foundation. We use institutional-grade 256-bit AES encryption and partner with Plaid for read-only access to your financial institutions.',
    },
    {
      id: 3,
      question: 'What does "AI Insights" actually mean?',
      answer:
        'Our LLM-powered engine analyzes your spending patterns and portfolio performance to suggest tax-optimization strategies and hidden investment opportunities you might have missed.',
    },
    {
      id: 4,
      question: 'Do you offer yearly billing?',
      answer: 'Yes, choose annual billing at checkout to save 20% on the Pro and Enterprise tiers.',
    },
  ],
  logos: [
    { id: 1, name: 'Stark Capital' },
    { id: 2, name: 'Nexus AI' },
    { id: 3, name: 'Quantum Ventures' },
    { id: 4, name: 'Omni Asset' },
  ],
  cta: {
    title: 'Ready to engineer your financial future?',
    subtitle: 'Join 150,000+ investors using FloFi to automate their wealth growth.',
    primaryLabel: 'Get Started Now',
    primaryHref: '/pricing',
    secondaryLabel: 'View Demo',
    secondaryHref: '/pricing',
  },
}

export default function Pricing() {
  const [pricing, setPricing] = useState<PricingPayload | null>(null)
  const [authRequired, setAuthRequired] = useState(false)

  useEffect(() => {
    let isMounted = true
    apiGet<PricingPayload>('/api/pricing')
      .then((response) => {
        if (!isMounted) return
        if (response.ok && response.data) {
          setPricing(response.data)
        } else if (response.status === 401) {
          setAuthRequired(true)
        }
      })
      .catch(() => {
        if (!isMounted) return
      })

    return () => {
      isMounted = false
    }
  }, [])

  const content = pricing ?? fallbackPricing

  return (
    <div className="relative min-h-screen bg-[#f5f7fb] text-slate-900">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_12%,rgba(14,165,233,0.16),transparent_45%),radial-gradient(circle_at_80%_16%,rgba(2,132,199,0.12),transparent_40%)]" />
      <header className="sticky top-0 z-20 border-b border-slate-200/70 bg-white/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-6 px-6 py-4">
          <div className="text-xl font-semibold">FloFi</div>
          <nav className="hidden items-center gap-6 text-sm font-medium text-slate-500 md:flex">
            <Link className="transition hover:text-slate-900" to="/">
              Platform
            </Link>
            <a className="transition hover:text-slate-900" href="#solutions">
              Solutions
            </a>
            <a className="transition hover:text-slate-900" href="#ai">
              AI Insights
            </a>
            <span className="text-slate-900">Pricing</span>
          </nav>
          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" size="sm">
              <Link to="/login">Log in</Link>
            </Button>
            <Button asChild size="sm">
              <Link to="/register">Get started</Link>
            </Button>
          </div>
        </div>
      </header>

      <section className="relative mx-auto max-w-5xl px-6 pb-10 pt-16 text-center">
        <Badge variant="accent" className="mx-auto">
          Pricing
        </Badge>
        <h1 className="mt-6 text-4xl font-semibold md:text-5xl">Precision Wealth Engineering</h1>
        <p className="mx-auto mt-4 max-w-3xl text-base text-slate-600 md:text-lg">
          Select the tier that aligns with your financial velocity. From personal tracking to
          institutional-grade AI management.
        </p>
        {authRequired ? (
          <div className="mx-auto mt-6 w-fit rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-700">
            Set a JWT in localStorage as <span className="font-semibold">flofi_token</span> to load live pricing.
          </div>
        ) : null}
      </section>

      <section className="mx-auto grid w-full max-w-6xl gap-6 px-6 pb-12 md:grid-cols-3" id="solutions">
        {content.plans.map((plan) => (
          <Card key={plan.id} className="relative border-slate-200/70 bg-white">
            {plan.isPopular ? (
              <Badge variant="accent" className="absolute right-6 top-6">
                Most popular
              </Badge>
            ) : null}
            <CardHeader>
              <CardTitle className="text-xl">{plan.name}</CardTitle>
              <CardDescription>{plan.summary}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-semibold text-slate-900">{plan.priceLabel}</span>
                {plan.priceSuffix ? <span className="text-sm text-slate-500">{plan.priceSuffix}</span> : null}
              </div>
              <ul className="space-y-2 text-sm text-slate-600">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-primary" />
                    {feature}
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button className="w-full" variant={plan.isPopular ? 'default' : 'outline'} type="button">
                {plan.ctaLabel}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 pb-10 text-center" id="ai">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Powering sophisticated capital flows</p>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-6 text-sm font-semibold text-slate-600">
          {content.logos.map((logo) => (
            <span key={logo.id}>{logo.name}</span>
          ))}
        </div>
      </section>

      <Separator className="mx-auto max-w-5xl" />

      <section className="mx-auto w-full max-w-5xl px-6 py-14">
        <h2 className="text-center text-2xl font-semibold">Frequently Asked Questions</h2>
        <div className="mt-8 grid gap-4">
          {content.faqs.map((faq) => (
            <Card key={faq.id} className="border-slate-200/70 bg-white">
              <CardHeader>
                <CardTitle className="text-base">{faq.question}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-slate-600">{faq.answer}</CardContent>
            </Card>
          ))}
        </div>
      </section>

      {content.cta ? (
        <section className="mx-auto w-full max-w-6xl px-6 pb-16">
          <Card className="border-slate-900 bg-slate-950 text-white">
            <CardContent className="flex flex-col gap-6 p-8 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle className="text-2xl">{content.cta.title}</CardTitle>
                <CardDescription className="mt-2 text-slate-300">{content.cta.subtitle}</CardDescription>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button asChild size="lg">
                  <Link to="/register">{content.cta.primaryLabel}</Link>
                </Button>
                {content.cta.secondaryLabel ? (
                  <Button variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10">
                    {content.cta.secondaryLabel}
                  </Button>
                ) : null}
              </div>
            </CardContent>
          </Card>
        </section>
      ) : null}

      <footer className="border-t border-slate-200/70 bg-white">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-6 py-10 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
          <div className="text-base font-semibold text-slate-900">FloFi</div>
          <div className="flex flex-wrap gap-4">
            <a className="transition hover:text-slate-900" href="/privacy-policy">
              Privacy Policy
            </a>
            <a className="transition hover:text-slate-900" href="/terms-of-service">
              Terms of Service
            </a>
            <a className="transition hover:text-slate-900" href="#security">
              Security
            </a>
            <a className="transition hover:text-slate-900" href="#contact">
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
