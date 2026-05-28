import { prisma } from '../config/prisma'
import { Decimal } from '@prisma/client/runtime/library'

export async function getAnomalies(userId: number) {
  const anomalies = await prisma.anomalyAlert.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 10,
  })
  
  return anomalies.map((a) => ({
    ...a,
    detectedAmount: a.detectedAmount.toNumber(),
    averageAmount: a.averageAmount.toNumber(),
  }))
}

export async function createAnomaly(
  userId: number,
  data: {
    title: string
    description: string
    severity: string
    category: string
    detectedAmount: number
    averageAmount: number
  }
) {
  const anomaly = await prisma.anomalyAlert.create({
    data: {
      userId,
      title: data.title,
      description: data.description,
      severity: data.severity,
      category: data.category,
      detectedAmount: new Decimal(data.detectedAmount),
      averageAmount: new Decimal(data.averageAmount),
    },
  })
  
  return {
    ...anomaly,
    detectedAmount: anomaly.detectedAmount.toNumber(),
    averageAmount: anomaly.averageAmount.toNumber(),
  }
}

export async function getExpensePredictions(userId: number) {
  const predictions = await prisma.expensePrediction.findMany({
    where: { userId },
    orderBy: { month: 'desc' },
    take: 6,
  })
  
  return predictions.map((p) => ({
    ...p,
    predictedAmount: p.predictedAmount.toNumber(),
  }))
}

export async function getAIInsights(userId: number) {
  const insights = await prisma.insight.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 5,
  })

  return insights
}

export async function getSavingsVelocity(userId: number) {
  const transactions = await prisma.transaction.findMany({
    where: {
      userId,
      type: 'INCOME',
      occurredAt: {
        gte: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000), // Last 6 months
      },
    },
  })

  const incomes = transactions.reduce((sum, t) => sum.plus(t.amount), new Decimal(0))

  const expenses = await prisma.transaction.findMany({
    where: {
      userId,
      type: 'EXPENSE',
      occurredAt: {
        gte: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000),
      },
    },
  })

  const expenseTotal = expenses.reduce((sum, t) => sum.plus(t.amount), new Decimal(0))
  const savings = incomes.minus(expenseTotal)
  const savingsRate = incomes.isZero() ? 0 : savings.dividedBy(incomes).times(100).toNumber()

  return {
    totalIncome: incomes.toNumber(),
    totalExpenses: expenseTotal.toNumber(),
    totalSavings: savings.toNumber(),
    savingsRate: parseFloat(savingsRate.toFixed(2)),
    period: '6 months',
  }
}

export async function getHabitAnalytics(userId: number) {
  const last30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

  const transactions = await prisma.transaction.findMany({
    where: {
      userId,
      occurredAt: { gte: last30Days },
    },
    orderBy: { occurredAt: 'asc' },
  })

  const dailyData = Array.from({ length: 30 }, (_, i) => {
    const date = new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000)
    const dayTransactions = transactions.filter(
      (t) => t.occurredAt.toDateString() === date.toDateString() && t.type === 'EXPENSE'
    )
    const dayTotal = dayTransactions.reduce((sum, t) => sum.plus(t.amount), new Decimal(0))
    return {
      date: date.toLocaleDateString(),
      amount: dayTotal.toNumber(),
    }
  })

  return {
    period: 'Last 30 Days',
    data: dailyData,
    totalSpend: dailyData.reduce((sum, d) => sum + d.amount, 0),
    averageDaily: dailyData.reduce((sum, d) => sum + d.amount, 0) / 30,
  }
}
