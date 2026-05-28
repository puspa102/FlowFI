import { prisma } from '../config/prisma'
import { Decimal } from '@prisma/client/runtime/library'

export async function getSavingsGoals(userId: number) {
  const goals = await prisma.goal.findMany({
    where: { userId },
    orderBy: { targetDate: 'asc' },
  })

  return goals.map((goal) => ({
    ...goal,
    targetAmount: goal.targetAmount.toNumber(),
    currentAmount: goal.currentAmount.toNumber(),
    monthlyContribution: goal.monthlyContribution.toNumber(),
  }))
}

export async function createSavingsGoal(
  userId: number,
  data: {
    title: string
    targetAmount: number
    targetDate: string
    monthlyContribution: number
  }
) {
  const targetDate = new Date(data.targetDate)
  const progressPercent = 0

  const goal = await prisma.goal.create({
    data: {
      userId,
      title: data.title,
      targetAmount: new Decimal(data.targetAmount),
      targetDate,
      currentAmount: new Decimal(0),
      monthlyContribution: new Decimal(data.monthlyContribution),
      progressPercent,
      statusLabel: 'On Track',
    },
  })
  
  return {
    ...goal,
    targetAmount: goal.targetAmount.toNumber(),
    currentAmount: goal.currentAmount.toNumber(),
    monthlyContribution: goal.monthlyContribution.toNumber(),
  }
}

export async function updateSavingsGoal(
  userId: number,
  goalId: number,
  data: { currentAmount?: number; monthlyContribution?: number }
) {
  const goal = await prisma.goal.findUnique({
    where: { id: goalId },
  })

  if (!goal) {
    throw new Error('Goal not found')
  }

  const currentAmount = data.currentAmount !== undefined ? new Decimal(data.currentAmount) : goal.currentAmount
  const progressPercent = currentAmount.dividedBy(goal.targetAmount).times(100).toNumber()

  const updatedGoal = await prisma.goal.update({
    where: { id: goalId },
    data: {
      ...(data.currentAmount !== undefined && { currentAmount: new Decimal(data.currentAmount) }),
      ...(data.monthlyContribution !== undefined && { monthlyContribution: new Decimal(data.monthlyContribution) }),
      progressPercent: Math.min(100, progressPercent),
      statusLabel: progressPercent >= 100 ? 'Achieved' : 'On Track',
    },
  })
  
  return {
    ...updatedGoal,
    targetAmount: updatedGoal.targetAmount.toNumber(),
    currentAmount: updatedGoal.currentAmount.toNumber(),
    monthlyContribution: updatedGoal.monthlyContribution.toNumber(),
  }
}

export async function deleteSavingsGoal(userId: number, goalId: number) {
  return prisma.goal.delete({
    where: { id: goalId },
  })
}

export async function getGoalTimeline(userId: number) {
  const goals = await getSavingsGoals(userId)

  const timeline = goals
    .map((goal) => ({
      ...goal,
      status: goal.progressPercent >= 100 ? 'ACHIEVED' : 'IN_PROGRESS',
      daysRemaining: Math.ceil((new Date(goal.targetDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
    }))
    .sort((a, b) => {
      if (a.status === 'ACHIEVED' && b.status !== 'ACHIEVED') return 1
      if (a.status !== 'ACHIEVED' && b.status === 'ACHIEVED') return -1
      return a.daysRemaining - b.daysRemaining
    })

  return timeline
}
