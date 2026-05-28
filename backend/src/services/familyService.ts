import { prisma } from '../config/prisma'
import { Decimal } from '@prisma/client/runtime/library'

export async function getFamilyGroups(userId: number) {
  const familyMembers = await prisma.familyMember.findMany({
    where: { userId },
    include: {
      family: true,
    },
  })

  return familyMembers.map((m) => m.family)
}

export async function createFamilyGroup(userId: number, name: string) {
  return prisma.familyGroup.create({
    data: {
      name,
      createdBy: userId,
      members: {
        create: {
          userId,
          name: 'You',
          role: 'OWNER',
        },
      },
    },
    include: {
      members: true,
    },
  })
}

export async function addFamilyMember(
  userId: number,
  familyId: number,
  data: { name: string; email?: string; role: string }
) {
  return prisma.familyMember.create({
    data: {
      userId,
      familyId,
      name: data.name,
      email: data.email,
      role: data.role,
    },
  })
}

export async function getFamilyBudgets(userId: number, familyId: number) {
  const budgets = await prisma.familyBudget.findMany({
    where: { familyId },
    orderBy: { month: 'desc' },
  })

  return budgets.map((b) => ({
    ...b,
    budgetAmount: b.budgetAmount.toNumber(),
    spentAmount: b.spentAmount.toNumber(),
  }))
}

export async function createFamilyBudget(
  userId: number,
  familyId: number,
  data: { category: string; month: string; budgetAmount: number }
) {
  const budget = await prisma.familyBudget.create({
    data: {
      familyId,
      category: data.category,
      month: new Date(data.month),
      budgetAmount: new Decimal(data.budgetAmount),
      spentAmount: new Decimal(0),
      percentUsed: 0,
    },
  })
  
  return {
    ...budget,
    budgetAmount: budget.budgetAmount.toNumber(),
    spentAmount: budget.spentAmount.toNumber(),
  }
}

export async function updateFamilyBudgetSpending(userId: number, budgetId: number, spentAmount: number) {
  const budget = await prisma.familyBudget.findUnique({
    where: { id: budgetId },
  })

  if (!budget) {
    throw new Error('Budget not found')
  }

  const percentUsed = new Decimal(spentAmount).dividedBy(budget.budgetAmount).times(100).toNumber()

  const updatedBudget = await prisma.familyBudget.update({
    where: { id: budgetId },
    data: {
      spentAmount: new Decimal(spentAmount),
      percentUsed: Math.min(100, percentUsed),
    },
  })
  
  return {
    ...updatedBudget,
    budgetAmount: updatedBudget.budgetAmount.toNumber(),
    spentAmount: updatedBudget.spentAmount.toNumber(),
  }
}

export async function getFamilyStats(userId: number, familyId: number) {
  const budgets = await getFamilyBudgets(userId, familyId)
  const members = await prisma.familyMember.findMany({
    where: { familyId },
  })

  const totalBudgeted = budgets.reduce((sum, b) => sum + b.budgetAmount, 0)
  const totalSpent = budgets.reduce((sum, b) => sum + b.spentAmount, 0)

  return {
    familyId,
    totalMembers: members.length,
    totalBudgets: budgets.length,
    totalBudgeted,
    totalSpent,
    remainingBudget: totalBudgeted - totalSpent,
    percentUsed: totalBudgeted > 0 ? Math.round((totalSpent / totalBudgeted) * 100) : 0,
  }
}
