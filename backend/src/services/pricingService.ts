import prisma from '../config/prisma'

export async function fetchPricing() {
  const [plans, faqs, logos, cta] = await Promise.all([
    prisma.pricingPlan.findMany({ orderBy: { order: 'asc' } }),
    prisma.pricingFaq.findMany({ orderBy: { order: 'asc' } }),
    prisma.partnerLogo.findMany({ orderBy: { order: 'asc' } }),
    prisma.pricingCta.findFirst(),
  ])

  return {
    plans: plans.map((plan) => ({
      id: plan.id,
      name: plan.name,
      priceLabel: plan.priceLabel,
      priceAmount: plan.priceAmount ? Number(plan.priceAmount) : null,
      priceSuffix: plan.priceSuffix,
      summary: plan.summary,
      ctaLabel: plan.ctaLabel,
      ctaHref: plan.ctaHref,
      isPopular: plan.isPopular,
      features: plan.features,
    })),
    faqs: faqs.map((faq) => ({
      id: faq.id,
      question: faq.question,
      answer: faq.answer,
    })),
    logos: logos.map((logo) => ({ id: logo.id, name: logo.name })),
    cta: cta
      ? {
          title: cta.title,
          subtitle: cta.subtitle,
          primaryLabel: cta.primaryLabel,
          primaryHref: cta.primaryHref,
          secondaryLabel: cta.secondaryLabel,
          secondaryHref: cta.secondaryHref,
        }
      : null,
  }
}
