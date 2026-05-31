import { useEffect } from 'react'
import Navbar from '@/components/landing/Navbar'
import HeroSection from '@/components/landing/HeroSection'
import TrustedSection from '@/components/landing/TrustedSection'
import FeaturesSection from '@/components/landing/FeaturesSection'
import DashboardShowcase from '@/components/landing/DashboardShowcase'
import AISection from '@/components/landing/AISection'
import WhySection from '@/components/landing/WhySection'
import TestimonialsSection from '@/components/landing/TestimonialsSection'
import PricingSection from '@/components/landing/PricingSection'
import SecuritySection from '@/components/landing/SecuritySection'
import CTASection from '@/components/landing/CTASection'
import Footer from '@/components/landing/Footer'

export default function Home() {
  // Update document meta
  useEffect(() => {
    document.title = 'Flofi — AI-Powered Personal Finance Management'
    const meta = document.querySelector('meta[name="description"]')
    if (meta) {
      meta.setAttribute(
        'content',
        'Track expenses, manage budgets, monitor accounts, and receive AI-powered financial insights — all in one intelligent platform. Free to start.'
      )
    }
  }, [])

  return (
    <div className="relative min-h-screen bg-navy-950 text-white antialiased">
      {/* SEO: single h1 is in HeroSection */}

      {/* Sticky Navbar */}
      <Navbar />

      <main>
        {/* 1 — Hero */}
        <HeroSection />

        {/* 2 — Trusted By / Stats */}
        <TrustedSection />

        {/* 3 — Core Features */}
        <FeaturesSection />

        {/* 4 — Dashboard Showcase */}
        <DashboardShowcase />

        {/* 5 — AI Assistant */}
        <AISection />

        {/* 6 — Why Flofi */}
        <WhySection />

        {/* 7 — Testimonials */}
        <TestimonialsSection />

        {/* 8 — Pricing */}
        <PricingSection />

        {/* 9 — Security */}
        <SecuritySection />

        {/* 10 — CTA */}
        <CTASection />
      </main>

      {/* 11 — Footer */}
      <Footer />
    </div>
  )
}
