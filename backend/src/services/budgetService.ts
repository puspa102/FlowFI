import prisma from '../config/prisma'
import { ensureBudgetData } from './demoDataService'
import { buildMonthStart } from '../utils/finance'

export async function recalculateBudgets(userId: number, monthStart: Date) {
  const nextMonthStart = new Date(monthStart)
  nextMonthStart.setMonth(nextMonthStart.getMonth() + 1)

  const budgets = await prisma.budget.findMany({
    where: { userId, month: monthStart },
    include: { category: true },
  })

  for (const budget of budgets) {
    // Sum up expenses for this category
    const txs = await prisma.transaction.findMany({
      where: {
        userId,
        occurredAt: {
          gte: monthStart,
          lt: nextMonthStart,
        },
        type: 'EXPENSE',
      },
    })

    const budgetCatNormalized = budget.category.name.toUpperCase().replace(/[^A-Z0-9]/g, '_')
    const spentSum = txs
      .filter((tx) => {
        const txCatNormalized = tx.category.toUpperCase().replace(/[^A-Z0-9]/g, '_')
        return txCatNormalized === budgetCatNormalized || tx.category.toLowerCase() === budget.category.name.toLowerCase()
      })
      .reduce((sum, tx) => sum + Number(tx.amount), 0)

    const limitVal = Number(budget.limitAmount)
    const status = spentSum > limitVal 
      ? 'WARNING' 
      : spentSum > limitVal * 0.85 
        ? 'WARNING' 
        : 'HEALTHY'

    await prisma.budget.update({
      where: { id: budget.id },
      data: {
        spentAmount: spentSum,
        status: status as any,
      },
    })
  }
}

export async function fetchBudgetSummary(userId: number, month?: string) {
  await ensureBudgetData(userId)

  const monthDate = month ? new Date(month) : new Date()
  const monthStart = buildMonthStart(monthDate)

  // Recalculate spending dynamically before returning
  await recalculateBudgets(userId, monthStart)

  const [budgets, goals, suggestion, streak] = await Promise.all([
    prisma.budget.findMany({
      where: { userId, month: monthStart },
      include: { category: true },
      orderBy: { category: { order: 'asc' } },
    }),
    prisma.goal.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } }),
    prisma.budgetSuggestion.findFirst({ where: { userId }, orderBy: { createdAt: 'desc' } }),
    prisma.savingsStreak.findFirst({ where: { userId }, orderBy: { createdAt: 'desc' } }),
  ])

  return {
    month: monthStart.toISOString(),
    suggestion: suggestion
      ? {
          title: suggestion.title,
          body: suggestion.body,
          ctaLabel: suggestion.ctaLabel,
          ctaHref: suggestion.ctaHref,
        }
      : null,
    streak: streak
      ? {
          months: streak.months,
          progress: streak.progress,
          label: streak.label,
        }
      : null,
    budgets: budgets.map((budget) => ({
      id: budget.id,
      category: {
        id: budget.category.id,
        name: budget.category.name,
        icon: budget.category.icon,
        tone: budget.category.tone,
      },
      limitAmount: Number(budget.limitAmount),
      spentAmount: Number(budget.spentAmount),
      progressPercent: Math.min(100, Math.round((Number(budget.spentAmount) / Number(budget.limitAmount)) * 100)),
      status: budget.status,
    })),
    goals: goals.map((goal) => ({
      id: goal.id,
      title: goal.title,
      targetAmount: Number(goal.targetAmount),
      targetDate: goal.targetDate,
      currentAmount: Number(goal.currentAmount),
      monthlyContribution: Number(goal.monthlyContribution),
      progressPercent: goal.progressPercent,
      statusLabel: goal.statusLabel,
    })),
  }
}

export async function setBudgetLimit(userId: number, categoryId: number, limitAmount: number, month?: string) {
  const monthDate = month ? new Date(month) : new Date()
  const monthStart = buildMonthStart(monthDate)

  const category = await prisma.budgetCategory.findFirst({
    where: { id: categoryId, userId },
  })

  if (!category) {
    return { ok: false, status: 404, error: 'Category not found.' }
  }

  let budget = await prisma.budget.findFirst({
    where: { userId, categoryId, month: monthStart },
  })

  if (budget) {
    budget = await prisma.budget.update({
      where: { id: budget.id },
      data: { limitAmount },
    })
  } else {
    budget = await prisma.budget.create({
      data: {
        userId,
        categoryId,
        month: monthStart,
        limitAmount,
        spentAmount: 0,
        status: 'ON_TRACK',
      },
    })
  }

  await recalculateBudgets(userId, monthStart)

  return { ok: true, budget }
}

export async function deleteBudget(userId: number, budgetId: number) {
  const budget = await prisma.budget.findFirst({
    where: { id: budgetId, userId },
  })

  if (!budget) {
    return { ok: false, status: 404, error: 'Budget not found.' }
  }

  await prisma.budget.delete({
    where: { id: budgetId },
  })

  return { ok: true }
}

