import prisma from '../config/prisma'

export async function getInsights(userId: number) {
  const insights = await prisma.insight.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 6,
  })

  return insights.map((insight) => ({
    id: insight.id,
    title: insight.title,
    body: insight.body,
    ctaLabel: insight.ctaLabel,
    ctaHref: insight.ctaHref,
    createdAt: insight.createdAt,
  }))
}

export function suggestCategory(description: string): string {
  const desc = description.toLowerCase()
  if (desc.includes('uber') || desc.includes('lyft') || desc.includes('taxi') || desc.includes('transport') || desc.includes('flight') || desc.includes('bus')) {
    return 'Transport & Travel'
  }
  if (desc.includes('food') || desc.includes('dining') || desc.includes('restaurant') || desc.includes('grocery') || desc.includes('pizza') || desc.includes('burger')) {
    return 'Food & Groceries'
  }
  if (desc.includes('netflix') || desc.includes('spotify') || desc.includes('gym') || desc.includes('movie') || desc.includes('game')) {
    return 'Entertainment & Fun'
  }
  if (desc.includes('rent') || desc.includes('mortgage') || desc.includes('utility') || desc.includes('electricity') || desc.includes('internet')) {
    return 'Rent & Mortgage'
  }
  if (desc.includes('invest') || desc.includes('dividend') || desc.includes('stock') || desc.includes('crypto') || desc.includes('trading')) {
    return 'Investments'
  }
  if (desc.includes('amazon') || desc.includes('shopping') || desc.includes('store') || desc.includes('target') || desc.includes('walmart')) {
    return 'Shopping & Lifestyle'
  }
  if (desc.includes('ai') || desc.includes('openai') || desc.includes('claude') || desc.includes('chatgpt')) {
    return 'AI Insights'
  }
  return 'Other'
}

export async function getAiPredictions(userId: number) {
  const now = new Date()
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)

  const budgets = await prisma.budget.findMany({
    where: { userId, month: thisMonthStart },
    include: { category: true },
  })

  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  const elapsedDays = Math.max(1, now.getDate())

  const expensePredictions = budgets.map((budget) => {
    const currentSpent = Number(budget.spentAmount)
    const limit = Number(budget.limitAmount)
    const predictedSpent = Math.round((currentSpent / elapsedDays) * daysInMonth * 100) / 100
    const paceFactor = limit > 0 ? predictedSpent / limit : 0

    let alert = 'ON_TRACK'
    let message = `You are on pace to spend ${Math.round(paceFactor * 100)}% of your limit.`
    if (paceFactor > 1.1) {
      alert = 'OVERSPEND_ALERT'
      message = `You are on pace to overspend this budget. Projected: $${predictedSpent.toLocaleString()} vs limit: $${limit.toLocaleString()}.`
    } else if (paceFactor > 0.9) {
      alert = 'WARNING'
      message = `You are close to this budget limit. Projected: $${predictedSpent.toLocaleString()} vs limit: $${limit.toLocaleString()}.`
    }

    return {
      categoryId: budget.categoryId,
      categoryName: budget.category.name,
      limit,
      currentSpent,
      predictedSpent,
      alert,
      message,
    }
  })

  const allTxs = await prisma.transaction.findMany({
    where: { userId },
    orderBy: { occurredAt: 'desc' },
  })

  let weekendSpend = 0
  let weekendCount = 0
  let weekdaySpend = 0
  let weekdayCount = 0

  for (const tx of allTxs) {
    if (tx.type !== 'EXPENSE') continue
    const day = tx.occurredAt.getDay()
    const amount = Number(tx.amount)
    if (day === 0 || day === 6) {
      weekendSpend += amount
      weekendCount += 1
    } else {
      weekdaySpend += amount
      weekdayCount += 1
    }
  }

  const avgWeekend = weekendCount > 0 ? weekendSpend / weekendCount : 0
  const avgWeekday = weekdayCount > 0 ? weekdaySpend / weekdayCount : 0
  const weekendPaceDiff = avgWeekday > 0 ? Math.round(((avgWeekend - avgWeekday) / avgWeekday) * 100) : 0

  const spendingInsights = []
  if (weekendCount > 0 && weekdayCount > 0 && weekendPaceDiff > 10) {
    spendingInsights.push({
      type: 'weekend_pattern',
      title: 'Weekend Spend Spike',
      body: `Your weekend expense average is ${weekendPaceDiff}% higher than weekdays based on your saved transactions.`,
      severity: 'medium',
    })
  } else if (weekendCount > 0 && weekdayCount > 0) {
    spendingInsights.push({
      type: 'weekend_pattern',
      title: 'Weekend Spend is Stable',
      body: `Your weekend and weekday expense averages are close based on your saved transactions.`,
      severity: 'low',
    })
  }

  const subs = allTxs.filter((tx) => {
    const desc = tx.description.toLowerCase()
    return tx.type === 'EXPENSE' && ['subscription', 'netflix', 'hulu', 'spotify', 'disney'].some((term) => desc.includes(term))
  })
  const subSum = subs.reduce((sum, tx) => sum + Number(tx.amount), 0)

  if (subs.length > 0) {
    spendingInsights.push({
      type: 'subscription_growth',
      title: 'Recurring Payments Detected',
      body: `Detected ${subs.length} subscription-like transactions totaling $${subSum.toFixed(2)}.`,
      severity: subSum > 100 ? 'medium' : 'low',
    })
  }

  const anomalies = []
  const categoriesList = Array.from(new Set(allTxs.map((tx) => tx.category)))
  for (const category of categoriesList) {
    const categoryTxs = allTxs.filter((tx) => tx.category === category && tx.type === 'EXPENSE')
    if (categoryTxs.length < 3) continue

    const average = categoryTxs.reduce((sum, tx) => sum + Number(tx.amount), 0) / categoryTxs.length
    for (const tx of categoryTxs) {
      const amount = Number(tx.amount)
      if (amount > average * 2.2 && amount > 100) {
        anomalies.push({
          id: tx.id,
          description: tx.description,
          category: tx.category,
          amount,
          average: Math.round(average * 100) / 100,
          date: tx.occurredAt,
          message: `${tx.description} is more than 2x your average spend in ${tx.category}.`,
        })
      }
    }
  }

  const savingRecommendations = []
  if (subSum > 30) {
    savingRecommendations.push({
      title: 'Review Recurring Subscriptions',
      body: `Subscription-like transactions total $${subSum.toFixed(2)}. Review whether each one is still useful.`,
      savings: Math.round(subSum * 0.2 * 100) / 100,
    })
  }
  if (weekendCount > 0 && weekdayCount > 0 && weekendPaceDiff > 25) {
    savingRecommendations.push({
      title: 'Review Weekend Spending',
      body: `Weekend spending is ${weekendPaceDiff}% higher than weekdays in your saved transactions.`,
      savings: Math.round(Math.max(0, avgWeekend - avgWeekday) * 4 * 100) / 100,
    })
  }

  return {
    expensePredictions,
    spendingInsights,
    anomalies,
    savingRecommendations,
  }
}

export async function aiChat(userId: number, message: string) {
  const lowerMessage = message.toLowerCase()
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

  const [accounts, transactions, budgets, goals, investments, subscriptions] = await Promise.all([
    prisma.account.findMany({ where: { userId } }),
    prisma.transaction.findMany({ where: { userId }, orderBy: { occurredAt: 'desc' }, take: 100 }),
    prisma.budget.findMany({ where: { userId, month: monthStart }, include: { category: true } }),
    prisma.goal.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take: 5 }),
    prisma.investment.findMany({ where: { userId }, orderBy: { lastUpdated: 'desc' }, take: 10 }),
    prisma.subscription.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take: 10 }),
  ])

  const hasData = accounts.length || transactions.length || budgets.length || goals.length || investments.length || subscriptions.length
  if (!hasData) {
    return {
      id: Date.now().toString(),
      type: 'assistant',
      content: 'I do not have enough financial data yet to analyze. Add accounts, transactions, budgets, goals, investments, or subscriptions, then ask me again.',
      timestamp: new Date(),
    }
  }

  const totalBalance = accounts.reduce((sum, account) => sum + Number(account.balance), 0)
  const income = transactions.filter((tx) => tx.type === 'INCOME').reduce((sum, tx) => sum + Number(tx.amount), 0)
  const expenses = transactions.filter((tx) => tx.type === 'EXPENSE').reduce((sum, tx) => sum + Number(tx.amount), 0)
  const activeSubscriptions = subscriptions.filter((subscription) => subscription.status === 'ACTIVE')
  const subscriptionSpend = activeSubscriptions.reduce((sum, subscription) => sum + Number(subscription.monthlyPrice), 0)
  const investmentValue = investments.reduce((sum, investment) => sum + Number(investment.quantity) * Number(investment.currentPrice), 0)

  let response = [
    'Here is what I can see from your real FloFi data:',
    `- Accounts: ${accounts.length}`,
    `- Total account balance: $${totalBalance.toFixed(2)}`,
    `- Recent income: $${income.toFixed(2)}`,
    `- Recent expenses: $${expenses.toFixed(2)}`,
    `- Active subscriptions: ${activeSubscriptions.length} ($${subscriptionSpend.toFixed(2)}/month)`,
    `- Goals tracked: ${goals.length}`,
    `- Current investment value: $${investmentValue.toFixed(2)}`,
  ].join('\n')

  if (lowerMessage.includes('budget') && budgets.length) {
    response = budgets
      .slice(0, 5)
      .map((budget) => {
        const spent = Number(budget.spentAmount)
        const limit = Number(budget.limitAmount)
        const percent = limit > 0 ? Math.round((spent / limit) * 100) : 0
        return `- ${budget.category.name}: $${spent.toFixed(2)} of $${limit.toFixed(2)} used (${percent}%)`
      })
      .join('\n')
    response = `Here is your current budget picture:\n\n${response}`
  } else if ((lowerMessage.includes('goal') || lowerMessage.includes('save')) && goals.length) {
    response = `Here are your active goals from FloFi:\n\n${goals.map((goal) => `- ${goal.title}: ${goal.progressPercent}% complete`).join('\n')}`
  } else if (lowerMessage.includes('spending') || lowerMessage.includes('expense')) {
    response = `Based on your recent transactions, income totals $${income.toFixed(2)} and expenses total $${expenses.toFixed(2)}. Net cash flow is $${(income - expenses).toFixed(2)}.`
  } else if (lowerMessage.includes('investment') || lowerMessage.includes('portfolio')) {
    response = `Your tracked investments currently total about $${investmentValue.toFixed(2)} across ${investments.length} holdings.`
  }

  return {
    id: Date.now().toString(),
    type: 'assistant',
    content: response,
    timestamp: new Date(),
  }
}
