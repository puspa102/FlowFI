import prisma from '../config/prisma'
import { ensureDemoData } from './demoDataService'
import { getMonthLabel, toSignedAmount } from '../utils/finance'

export async function getDashboard(userId: number) {
  await ensureDemoData(userId)

  const accounts = await prisma.account.findMany({ where: { userId } })
  const totalBalance = accounts.reduce((sum, account) => sum + Number(account.balance), 0)

  const health = await prisma.wealthHealth.findFirst({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  })

  const insight = await prisma.insight.findFirst({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  })

  const recentTransactions = await prisma.transaction.findMany({
    where: { userId },
    orderBy: { occurredAt: 'desc' },
    take: 4,
    include: { account: true },
  })

  const cashFlowData = await prisma.transaction.findMany({
    where: { userId },
    orderBy: { occurredAt: 'desc' },
    take: 120,
  })

  const monthly = new Map<string, { income: number; expense: number }>()
  for (const tx of cashFlowData) {
    const label = getMonthLabel(tx.occurredAt)
    const entry = monthly.get(label) ?? { income: 0, expense: 0 }
    if (tx.type === 'INCOME') {
      entry.income += Number(tx.amount)
    } else {
      entry.expense += Number(tx.amount)
    }
    monthly.set(label, entry)
  }

  const cashFlow = Array.from(monthly.entries())
    .slice(0, 6)
    .reverse()
    .map(([label, entry]) => ({
      label,
      income: entry.income,
      expense: entry.expense,
    }))

  const lastMonthNet = cashFlow.length
    ? cashFlow[cashFlow.length - 1].income - cashFlow[cashFlow.length - 1].expense
    : 0
  const balanceChangePercent = totalBalance === 0 ? 0 : Number(((lastMonthNet / totalBalance) * 100).toFixed(1))

  return {
    totalBalance,
    balanceChangePercent,
    health: health
      ? { score: health.score, label: health.label, summary: health.summary }
      : { score: 0, label: 'Unknown', summary: 'No data yet.' },
    cashFlow,
    insight: insight
      ? { title: insight.title, body: insight.body, ctaLabel: insight.ctaLabel, ctaHref: insight.ctaHref }
      : null,
    recentTransactions: recentTransactions.map((tx) => ({
      id: tx.id,
      date: tx.occurredAt,
      description: tx.description,
      category: tx.category,
      account: `${tx.account.name} • ${tx.account.last4 ?? ''}`.trim(),
      amount: toSignedAmount(Number(tx.amount), tx.type),
      status: tx.status,
    })),
  }
}

export async function getMonthlyAnalytics(userId: number) {
  await ensureDemoData(userId)

  const now = new Date()
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1)

  const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const prevMonthEnd = thisMonthStart

  // Fetch current month's transactions
  const thisMonthTxs = await prisma.transaction.findMany({
    where: {
      userId,
      occurredAt: { gte: thisMonthStart, lt: nextMonthStart }
    }
  })

  // Fetch previous month's transactions
  const prevMonthTxs = await prisma.transaction.findMany({
    where: {
      userId,
      occurredAt: { gte: prevMonthStart, lt: prevMonthEnd }
    }
  })

  // Calculate current month's income & expense
  const incomeThisMonth = thisMonthTxs
    .filter(t => t.type === 'INCOME')
    .reduce((sum, t) => sum + Number(t.amount), 0)
  const expenseThisMonth = thisMonthTxs
    .filter(t => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + Number(t.amount), 0)

  // Calculate previous month's income & expense
  const incomePrevMonth = prevMonthTxs
    .filter(t => t.type === 'INCOME')
    .reduce((sum, t) => sum + Number(t.amount), 0)
  const expensePrevMonth = prevMonthTxs
    .filter(t => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + Number(t.amount), 0)

  const netSavings = incomeThisMonth - expenseThisMonth
  const savingsRate = incomeThisMonth > 0 ? Math.round((netSavings / incomeThisMonth) * 100) : 0

  // Period over period change in %
  const incomeChange = incomePrevMonth > 0 
    ? Number((((incomeThisMonth - incomePrevMonth) / incomePrevMonth) * 100).toFixed(1)) 
    : 0
  const expenseChange = expensePrevMonth > 0 
    ? Number((((expenseThisMonth - expensePrevMonth) / expensePrevMonth) * 100).toFixed(1)) 
    : 0

  // Largest spending categories
  const categoryMap = new Map<string, number>()
  for (const t of thisMonthTxs.filter(tx => tx.type === 'EXPENSE')) {
    const amt = Number(t.amount)
    categoryMap.set(t.category, (categoryMap.get(t.category) ?? 0) + amt)
  }

  const largestCategories = Array.from(categoryMap.entries())
    .map(([category, amount]) => ({
      category,
      amount,
      percent: expenseThisMonth > 0 ? Math.round((amount / expenseThisMonth) * 100) : 0
    }))
    .sort((a, b) => b.amount - a.amount)

  // Budget utilization %
  const budgets = await prisma.budget.findMany({
    where: { userId, month: thisMonthStart }
  })
  const totalLimit = budgets.reduce((sum, b) => sum + Number(b.limitAmount), 0)
  const totalSpent = budgets.reduce((sum, b) => sum + Number(b.spentAmount), 0)
  const budgetUtilization = totalLimit > 0 ? Math.round((totalSpent / totalLimit) * 100) : 0

  // 6-month comparisons
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1)
  const sixMonthTxs = await prisma.transaction.findMany({
    where: {
      userId,
      occurredAt: { gte: sixMonthsAgo }
    }
  })

  const monthlyTotals = new Map<string, { income: number; expense: number }>()
  for (const tx of sixMonthTxs) {
    const monthKey = tx.occurredAt.toLocaleString('default', { month: 'short', year: '2-digit' })
    const data = monthlyTotals.get(monthKey) ?? { income: 0, expense: 0 }
    if (tx.type === 'INCOME') {
      data.income += Number(tx.amount)
    } else {
      data.expense += Number(tx.amount)
    }
    monthlyTotals.set(monthKey, data)
  }

  // Create ordered comparison array
  const sixMonthComparison = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const monthKey = d.toLocaleString('default', { month: 'short', year: '2-digit' })
    const data = monthlyTotals.get(monthKey) ?? { income: 0, expense: 0 }
    sixMonthComparison.push({
      label: monthKey,
      income: data.income,
      expense: data.expense,
      savings: data.income - data.expense
    })
  }

  return {
    incomeThisMonth,
    expenseThisMonth,
    netSavings,
    savingsRate,
    budgetUtilization,
    incomeChange,
    expenseChange,
    largestCategories,
    sixMonthComparison
  }
}

