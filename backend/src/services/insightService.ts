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

function formatMoney(value: number) {
  return `$${value.toFixed(2)}`
}

function normalizeText(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9\s]/g, ' ')
}

function findRequestedCategory(message: string, categories: string[]) {
  const normalizedMessage = normalizeText(message)
  return categories.find((category) => {
    const normalizedCategory = normalizeText(category)
    return normalizedMessage.includes(normalizedCategory) || normalizedCategory.split(/\s+/).some((word) => word.length > 3 && normalizedMessage.includes(word))
  })
}

export async function aiChat(userId: number, message: string, history: Array<{ type: string; content: string }> = []) {
  const lowerMessage = message.toLowerCase()
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const recentWindowStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  const [legacyAccounts, bankAccounts, transactions, budgets, goals, investments, subscriptions] = await Promise.all([
    prisma.account.findMany({ where: { userId } }),
    prisma.bankAccount.findMany({ where: { userId, isActive: true } }),
    prisma.transaction.findMany({ where: { userId }, orderBy: { occurredAt: 'desc' }, take: 100 }),
    prisma.budget.findMany({ where: { userId, month: monthStart }, include: { category: true } }),
    prisma.goal.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take: 5 }),
    prisma.investment.findMany({ where: { userId }, orderBy: { lastUpdated: 'desc' }, take: 10 }),
    prisma.subscription.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take: 10 }),
  ])

  const accounts = [...legacyAccounts, ...bankAccounts]
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
  const recentExpenses = transactions.filter((tx) => tx.type === 'EXPENSE' && tx.occurredAt >= recentWindowStart)
  const recentExpenseTotal = recentExpenses.reduce((sum, tx) => sum + Number(tx.amount), 0)
  const activeSubscriptions = subscriptions.filter((subscription) => subscription.status === 'ACTIVE')
  const subscriptionSpend = activeSubscriptions.reduce((sum, subscription) => sum + Number(subscription.monthlyPrice), 0)
  const investmentValue = investments.reduce((sum, investment) => sum + Number(investment.quantity) * Number(investment.currentPrice), 0)
  const netCashFlow = income - expenses

  const categoryTotals = transactions
    .filter((tx) => tx.type === 'EXPENSE')
    .reduce<Record<string, number>>((totals, tx) => {
      totals[tx.category] = (totals[tx.category] ?? 0) + Number(tx.amount)
      return totals
    }, {})
  const sortedCategories = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])
  const requestedCategory = findRequestedCategory(message, Object.keys(categoryTotals))
  const latestTransactions = transactions.slice(0, 5)

  const summaryLines = [
    `- Accounts: ${accounts.length}`,
    `- Total account balance: ${formatMoney(totalBalance)}`,
    `- Recent income: ${formatMoney(income)}`,
    `- Recent expenses: ${formatMoney(expenses)}`,
    `- Active subscriptions: ${activeSubscriptions.length} (${formatMoney(subscriptionSpend)}/month)`,
    `- Goals tracked: ${goals.length}`,
    `- Current investment value: ${formatMoney(investmentValue)}`,
  ]

  let response = ''

  const greetings = ['hello', 'hi', 'hey', 'good morning', 'good evening', 'good afternoon']
  const isGreeting = greetings.some((g) => lowerMessage.includes(g))
  const isSummaryRequest = lowerMessage.includes('summary') || lowerMessage.includes('summarize') || lowerMessage.includes('overview') || lowerMessage.includes('how am i doing') || lowerMessage.includes('finances')
  const isHelpRequest = lowerMessage.includes('help') || lowerMessage.includes('what can you do') || lowerMessage.includes('how do you work')

  if (isGreeting && lowerMessage.length < 30) {
    const topSpend = sortedCategories[0]
    const highlight = topSpend
      ? ` Your largest expense category recently is ${topSpend[0]} at ${formatMoney(topSpend[1])}.`
      : ''
    response = `Hello! Your current balance across all accounts is ${formatMoney(totalBalance)}.${highlight} Ask me about your budget, spending, goals, subscriptions, or investments for more detail.`
  } else if (isHelpRequest) {
    response = `I can help you with:\n- Spending analysis by category\n- Budget tracking and alerts\n- Savings goals progress\n- Investment portfolio overview\n- Subscription management\n- Recent transactions\n- Account balances\n\nJust ask a question like "How is my budget?" or "Show my subscriptions" and I will pull the relevant data from your FloFi account.`
  } else if (isSummaryRequest) {
    response = `Here is your financial overview:\n\n${summaryLines.join('\n')}\n\nNet cash flow: ${formatMoney(netCashFlow)}`
    if (sortedCategories.length > 0) {
      response += `\n\nTop spending categories:\n${sortedCategories.slice(0, 3).map(([cat, total]) => `- ${cat}: ${formatMoney(total)}`).join('\n')}`
    }
  } else if (requestedCategory) {
    const categoryTxs = transactions.filter((tx) => tx.type === 'EXPENSE' && tx.category === requestedCategory)
    const total = categoryTxs.reduce((sum, tx) => sum + Number(tx.amount), 0)
    const examples = categoryTxs
      .slice(0, 4)
      .map((tx) => `- ${tx.description}: ${formatMoney(Number(tx.amount))} on ${tx.occurredAt.toLocaleDateString()}`)
      .join('\n')
    response = `For ${requestedCategory}, I found ${categoryTxs.length} expense transaction${categoryTxs.length === 1 ? '' : 's'} totaling ${formatMoney(total)}.\n\n${examples || 'No individual transactions matched this category yet.'}`
  } else if (lowerMessage.includes('budget') && budgets.length) {
    response = budgets
      .slice(0, 5)
      .map((budget) => {
        const spent = Number(budget.spentAmount)
        const limit = Number(budget.limitAmount)
        const percent = limit > 0 ? Math.round((spent / limit) * 100) : 0
        return `- ${budget.category.name}: ${formatMoney(spent)} of ${formatMoney(limit)} used (${percent}%)`
      })
      .join('\n')
    response = `Here is your current budget picture:\n\n${response}`
  } else if ((lowerMessage.includes('goal') || lowerMessage.includes('save')) && goals.length) {
    const goalLines = goals.map((goal) => {
      const remaining = Math.max(0, Number(goal.targetAmount) - Number(goal.currentAmount))
      return `- ${goal.title}: ${goal.progressPercent}% complete, ${formatMoney(remaining)} remaining`
    }).join('\n')
    const savingsNote = netCashFlow > 0
      ? `Your recent net cash flow is positive at ${formatMoney(netCashFlow)}, so you have room to direct some surplus toward goals.`
      : `Your recent net cash flow is ${formatMoney(netCashFlow)}, so first look for expense reductions before increasing goal contributions.`
    response = `Here are your active goals from FloFi:\n\n${goalLines}\n\n${savingsNote}`
  } else if (lowerMessage.includes('save') || lowerMessage.includes('saving') || lowerMessage.includes('cut')) {
    const topCategory = sortedCategories[0]
    const subscriptionTip = subscriptionSpend > 0 ? ` Active subscriptions add up to ${formatMoney(subscriptionSpend)}/month.` : ''
    response = topCategory
      ? `The clearest saving opportunity is ${topCategory[0]}, your largest recent expense category at ${formatMoney(topCategory[1])}.${subscriptionTip} Start by reviewing the highest transactions in that category and any recurring charges.`
      : `I do not see enough expense history to identify a saving opportunity yet. Add a few transactions and I can rank the categories for you.`
  } else if (lowerMessage.includes('spending') || lowerMessage.includes('expense')) {
    const categoryLines = sortedCategories.slice(0, 5).map(([category, total]) => `- ${category}: ${formatMoney(total)}`).join('\n')
    response = `Based on your recent transactions, income totals ${formatMoney(income)} and expenses total ${formatMoney(expenses)}. Net cash flow is ${formatMoney(netCashFlow)}.\n\nTop expense categories:\n${categoryLines || '- No expense categories yet.'}`
  } else if (lowerMessage.includes('investment') || lowerMessage.includes('portfolio')) {
    const investmentLines = investments.slice(0, 5).map((investment) => `- ${investment.symbol}: ${formatMoney(Number(investment.quantity) * Number(investment.currentPrice))}`).join('\n')
    response = `Your tracked investments currently total about ${formatMoney(investmentValue)} across ${investments.length} holdings.\n\n${investmentLines || 'No individual holdings are saved yet.'}`
  } else if (lowerMessage.includes('subscription') || lowerMessage.includes('recurring')) {
    const subscriptionLines = activeSubscriptions.map((subscription) => `- ${subscription.name}: ${formatMoney(Number(subscription.monthlyPrice))}/month`).join('\n')
    response = activeSubscriptions.length
      ? `You have ${activeSubscriptions.length} active subscription${activeSubscriptions.length === 1 ? '' : 's'} totaling ${formatMoney(subscriptionSpend)}/month:\n\n${subscriptionLines}`
      : 'I do not see any active subscriptions saved in FloFi yet.'
  } else if (lowerMessage.includes('account') || lowerMessage.includes('balance')) {
    response = `Your total account balance is ${formatMoney(totalBalance)}.\n\n${accounts.map((account) => `- ${account.name}: ${formatMoney(Number(account.balance))}`).join('\n')}`
  } else if (lowerMessage.includes('recent') || lowerMessage.includes('latest') || lowerMessage.includes('last transaction')) {
    response = `Here are your latest saved transactions:\n\n${latestTransactions.map((tx) => `- ${tx.description}: ${formatMoney(Number(tx.amount))} ${tx.type.toLowerCase()} on ${tx.occurredAt.toLocaleDateString()}`).join('\n')}`
  } else if (lowerMessage.includes('thank') || lowerMessage.includes('thanks') || lowerMessage.includes('great') || lowerMessage.includes('awesome')) {
    response = `You're welcome! Let me know if there is anything else I can help with regarding your finances.`
  } else if (lowerMessage.length < 10) {
    response = `Could you give me a bit more detail? I can help with budgets, spending, goals, subscriptions, accounts, investments, or recent transactions.`
  } else {
    response = `Based on your FloFi data, here is a quick snapshot:\n\n${summaryLines.join('\n')}\n\nNet cash flow: ${formatMoney(netCashFlow)}\n\nFor more specific analysis, try asking about a category (e.g. "food spending"), your budget, goals, subscriptions, or investments.`
  }

  return {
    id: Date.now().toString(),
    type: 'assistant',
    content: response,
    timestamp: new Date(),
  }
}
