import { prisma } from '../config/prisma'
import { Decimal } from '@prisma/client/runtime/library'

export async function getPortfolio(userId: number) {
  const investments = await prisma.investment.findMany({
    where: { userId },
  })

  const totalValue = investments.reduce((sum, inv) => {
    return sum.plus(new Decimal(inv.quantity).times(new Decimal(inv.currentPrice)))
  }, new Decimal(0))

  const totalCost = investments.reduce((sum, inv) => {
    return sum.plus(new Decimal(inv.quantity).times(new Decimal(inv.purchasePrice)))
  }, new Decimal(0))

  const gainLoss = totalValue.minus(totalCost)
  const gainLossPercent = totalCost.isZero() ? 0 : gainLoss.dividedBy(totalCost).times(100).toNumber()

  return {
    totalValue: totalValue.toNumber(),
    totalCost: totalCost.toNumber(),
    gainLoss: gainLoss.toNumber(),
    gainLossPercent: parseFloat(gainLossPercent.toFixed(2)),
    investments: investments.map((inv) => ({
      ...inv,
      quantity: inv.quantity.toNumber(),
      purchasePrice: inv.purchasePrice.toNumber(),
      currentPrice: inv.currentPrice.toNumber(),
    })),
  }
}

export async function createInvestment(
  userId: number,
  data: {
    symbol: string
    name: string
    type: string
    quantity: number
    purchasePrice: number
    currentPrice: number
    allocation: number
  }
) {
  const investment = await prisma.investment.create({
    data: {
      userId,
      symbol: data.symbol,
      name: data.name,
      type: data.type as any,
      quantity: new Decimal(data.quantity),
      purchasePrice: new Decimal(data.purchasePrice),
      currentPrice: new Decimal(data.currentPrice),
      allocation: data.allocation,
    },
  })
  
  return {
    ...investment,
    quantity: investment.quantity.toNumber(),
    purchasePrice: investment.purchasePrice.toNumber(),
    currentPrice: investment.currentPrice.toNumber(),
  }
}

export async function updateInvestment(
  userId: number,
  investmentId: number,
  data: { currentPrice?: number; quantity?: number; allocation?: number }
) {
  const investment = await prisma.investment.update({
    where: {
      id: investmentId,
    },
    data: {
      ...(data.currentPrice !== undefined && { currentPrice: new Decimal(data.currentPrice) }),
      ...(data.quantity !== undefined && { quantity: new Decimal(data.quantity) }),
      ...(data.allocation !== undefined && { allocation: data.allocation }),
      lastUpdated: new Date(),
    },
  })
  
  return {
    ...investment,
    quantity: investment.quantity.toNumber(),
    purchasePrice: investment.purchasePrice.toNumber(),
    currentPrice: investment.currentPrice.toNumber(),
  }
}

export async function deleteInvestment(userId: number, investmentId: number) {
  return prisma.investment.delete({
    where: {
      id: investmentId,
    },
  })
}

export async function getTopPerformingAssets(userId: number, limit = 3) {
  const investments = await prisma.investment.findMany({
    where: { userId },
    orderBy: { allocation: 'desc' },
    take: limit,
  })

  return investments.map((inv) => ({
    ...inv,
    currentValue: new Decimal(inv.quantity).times(new Decimal(inv.currentPrice)).toNumber(),
    gainLoss: new Decimal(inv.quantity)
      .times(new Decimal(inv.currentPrice).minus(new Decimal(inv.purchasePrice)))
      .toNumber(),
  }))
}

export async function getPortfolioStats(userId: number) {
  const portfolio = await getPortfolio(userId)
  return portfolio
}
