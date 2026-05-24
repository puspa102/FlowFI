import prisma from '../config/prisma'
import { buildMonthStart, shiftMonths, toCurrencyNumber } from '../utils/finance'

const demoTransactions = [
  {
    description: 'NeuralMind Subscription',
    category: 'AI_INSIGHTS',
    amount: 49.99,
    type: 'EXPENSE',
    status: 'CLEARED',
  },
  {
    description: 'Horizon Properties',
    category: 'RENT_UTILITIES',
    amount: 3200,
    type: 'EXPENSE',
    status: 'CLEARED',
  },
  {
    description: 'Whole Foods Market',
    category: 'FOOD_DINING',
    amount: 142.18,
    type: 'EXPENSE',
    status: 'CLEARED',
  },
  {
    description: 'Vanguard Dividend Yield',
    category: 'INVESTMENTS',
    amount: 842.1,
    type: 'INCOME',
    status: 'CLEARED',
  },
  {
    description: 'Apple Store',
    category: 'SHOPPING',
    amount: 1299,
    type: 'EXPENSE',
    status: 'PENDING',
  },
]

const pricingPlans = [
  {
    name: 'Starter',
    priceLabel: 'Free',
    priceAmount: null,
    priceSuffix: null,
    summary: 'Core tracking for emerging portfolios.',
    ctaLabel: 'Continue with Free',
    ctaHref: '/pricing',
    isPopular: false,
    features: [
      'Up to 3 Linked Accounts',
      'Weekly AI Summaries',
      'Real-time Dashboard',
      'No Advanced Tax Strategy',
    ],
    order: 1,
  },
  {
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
    order: 2,
  },
  {
    name: 'Enterprise',
    priceLabel: 'Custom',
    priceAmount: null,
    priceSuffix: null,
    summary: 'Tailored solutions for family offices and firms.',
    ctaLabel: 'Contact Sales',
    ctaHref: '/pricing',
    isPopular: false,
    features: [
      'Multi-User Workspaces',
      'White-label Reporting',
      'API Access & Integrations',
      'Dedicated Financial Architect',
    ],
    order: 3,
  },
]

const pricingFaqs = [
  {
    question: 'Can I change plans later?',
    answer:
      'Absolutely. You can upgrade or downgrade your plan at any time. Changes take effect at the start of your next billing cycle.',
    order: 1,
  },
  {
    question: 'Is my data secure with FloFi?',
    answer:
      'Security is our foundation. We use institutional-grade 256-bit AES encryption and partner with Plaid for read-only access to your financial institutions.',
    order: 2,
  },
  {
    question: 'What does "AI Insights" actually mean?',
    answer:
      'Our LLM-powered engine analyzes your spending patterns and portfolio performance to suggest tax-optimization strategies and hidden investment opportunities you might have missed.',
    order: 3,
  },
  {
    question: 'Do you offer yearly billing?',
    answer: 'Yes, choose annual billing at checkout to save 20% on the Pro and Enterprise tiers.',
    order: 4,
  },
]

const partnerLogos = [
  { name: 'Stark Capital', order: 1 },
  { name: 'Nexus AI', order: 2 },
  { name: 'Quantum Ventures', order: 3 },
  { name: 'Omni Asset', order: 4 },
]

export async function ensureDemoData(userId: number) {
  const existingAccounts = await prisma.account.count({ where: { userId } })
  if (existingAccounts > 0) {
    return
  }

  const primaryAccount = await prisma.account.create({
    data: {
      userId,
      name: 'FloFi Main',
      type: 'CHECKING',
      balance: 1248392.45,
      currency: 'USD',
      last4: '9904',
    },
  })

  const reserveAccount = await prisma.account.create({
    data: {
      userId,
      name: 'Wealth Reserve',
      type: 'INVESTMENT',
      balance: 580420.12,
      currency: 'USD',
      last4: '1122',
    },
  })

  const now = new Date()

  await prisma.transaction.createMany({
    data: demoTransactions.map((transaction, index) => ({
      userId,
      accountId: index % 2 === 0 ? primaryAccount.id : reserveAccount.id,
      description: transaction.description,
      category: transaction.category,
      amount: toCurrencyNumber(transaction.amount),
      type: transaction.type,
      status: transaction.status,
      occurredAt: new Date(now.getTime() - (index + 1) * 24 * 60 * 60 * 1000),
    })),
  })

  const monthlySeeds = Array.from({ length: 6 }).map((_, index) => {
    const monthDate = shiftMonths(buildMonthStart(now), -index)
    return {
      income: 52000 - index * 900,
      expense: 38000 - index * 750,
      monthDate,
    }
  })

  for (const seed of monthlySeeds) {
    await prisma.transaction.create({
      data: {
        userId,
        accountId: primaryAccount.id,
        description: 'Portfolio Income',
        category: 'INVESTMENTS',
        amount: toCurrencyNumber(seed.income),
        type: 'INCOME',
        status: 'CLEARED',
        occurredAt: seed.monthDate,
      },
    })

    await prisma.transaction.create({
      data: {
        userId,
        accountId: primaryAccount.id,
        description: 'Portfolio Expenses',
        category: 'OTHER',
        amount: toCurrencyNumber(seed.expense),
        type: 'EXPENSE',
        status: 'CLEARED',
        occurredAt: seed.monthDate,
      },
    })
  }

  await prisma.wealthHealth.create({
    data: {
      userId,
      score: 85,
      label: 'Excellent',
      summary: 'Top 5% of risk-adjusted portfolios in your bracket.',
    },
  })

  await prisma.insight.create({
    data: {
      userId,
      title: 'AI Wealth Insight',
      body: 'You spent 12% less on dining this week. On track for your Q4 savings goal of $50,000.',
      ctaLabel: 'Adjust Contribution Plan',
      ctaHref: '/portfolio',
    },
  })
}

export async function ensurePricingData() {
  const existingPlans = await prisma.pricingPlan.count()
  if (existingPlans > 0) {
    return
  }

  await prisma.pricingPlan.createMany({
    data: pricingPlans.map((plan) => ({
      name: plan.name,
      priceLabel: plan.priceLabel,
      priceAmount: plan.priceAmount ?? undefined,
      priceSuffix: plan.priceSuffix ?? undefined,
      summary: plan.summary,
      ctaLabel: plan.ctaLabel,
      ctaHref: plan.ctaHref,
      isPopular: plan.isPopular,
      features: plan.features,
      order: plan.order,
    })),
  })

  await prisma.pricingFaq.createMany({
    data: pricingFaqs,
  })

  await prisma.partnerLogo.createMany({
    data: partnerLogos,
  })

  await prisma.pricingCta.create({
    data: {
      title: 'Ready to engineer your financial future?',
      subtitle: 'Join 150,000+ investors using FloFi to automate their wealth growth.',
      primaryLabel: 'Get Started Now',
      primaryHref: '/pricing',
      secondaryLabel: 'View Demo',
      secondaryHref: '/pricing',
    },
  })
}

export async function ensureBudgetData(userId: number) {
  const existingBudgets = await prisma.budget.count({ where: { userId } })
  if (existingBudgets > 0) {
    return
  }

  const categoryFood = await prisma.budgetCategory.create({
    data: {
      userId,
      name: 'Food & Groceries',
      icon: 'food',
      tone: 'warning',
      order: 1,
    },
  })

  const categoryHome = await prisma.budgetCategory.create({
    data: {
      userId,
      name: 'Rent & Mortgage',
      icon: 'home',
      tone: 'primary',
      order: 2,
    },
  })

  const categoryFun = await prisma.budgetCategory.create({
    data: {
      userId,
      name: 'Entertainment',
      icon: 'spark',
      tone: 'healthy',
      order: 3,
    },
  })

  const monthStart = buildMonthStart(new Date())

  await prisma.budget.createMany({
    data: [
      {
        userId,
        categoryId: categoryFood.id,
        month: monthStart,
        limitAmount: toCurrencyNumber(800),
        spentAmount: toCurrencyNumber(740),
        status: 'WARNING',
      },
      {
        userId,
        categoryId: categoryHome.id,
        month: monthStart,
        limitAmount: toCurrencyNumber(2400),
        spentAmount: toCurrencyNumber(2400),
        status: 'ON_TRACK',
      },
      {
        userId,
        categoryId: categoryFun.id,
        month: monthStart,
        limitAmount: toCurrencyNumber(300),
        spentAmount: toCurrencyNumber(120.5),
        status: 'HEALTHY',
      },
    ],
  })

  await prisma.goal.createMany({
    data: [
      {
        userId,
        title: 'New Tesla Model 3',
        targetAmount: toCurrencyNumber(45000),
        targetDate: new Date(new Date().getFullYear(), new Date().getMonth() + 6, 1),
        currentAmount: toCurrencyNumber(29250),
        monthlyContribution: toCurrencyNumber(1200),
        progressPercent: 65,
        statusLabel: 'In Progress',
      },
      {
        userId,
        title: 'Emergency Fund',
        targetAmount: toCurrencyNumber(20000),
        targetDate: new Date(new Date().getFullYear(), new Date().getMonth() + 2, 1),
        currentAmount: toCurrencyNumber(17600),
        monthlyContribution: toCurrencyNumber(900),
        progressPercent: 88,
        statusLabel: 'Almost There',
      },
    ],
  })

  await prisma.budgetSuggestion.create({
    data: {
      userId,
      title: 'AI Suggestion',
      body: 'Shift $200 from Dining to Savings to hit your goal 2 months early.',
      ctaLabel: 'Apply Optimization',
      ctaHref: '/portfolio',
    },
  })

  await prisma.savingsStreak.create({
    data: {
      userId,
      months: 14,
      progress: 72,
      label: 'Months Consecutive',
    },
  })
}
