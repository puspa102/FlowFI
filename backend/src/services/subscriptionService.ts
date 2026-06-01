import { prisma } from '../config/prisma'
import { Decimal } from '@prisma/client/runtime/library'

export async function getSubscriptions(userId: number) {
  const subscriptions = await prisma.subscription.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  })

  return subscriptions.map((s) => ({
    ...s,
    monthlyPrice: s.monthlyPrice.toNumber(),
  }))
}

export async function createSubscription(
  userId: number,
  data: {
    name: string
    status: string
    monthlyPrice: number
    billingDate: string
    category: string
  }
) {
  return prisma.subscription.create({
    data: {
      userId,
      name: data.name,
      status: data.status as any,
      monthlyPrice: new Decimal(data.monthlyPrice),
      billingDate: new Date(data.billingDate),
      category: data.category,
    },
  })
}

export async function updateSubscription(
  userId: number,
  subscriptionId: number,
  data: { name?: string; status?: string; monthlyPrice?: number; category?: string }
) {
  return prisma.subscription.update({
    where: { id: subscriptionId },
    data: {
      ...(data.name && { name: data.name }),
      ...(data.status && { status: data.status }),
      ...(data.monthlyPrice !== undefined && { monthlyPrice: new Decimal(data.monthlyPrice) }),
      ...(data.category && { category: data.category }),
    },
  })
}

export async function deleteSubscription(userId: number, subscriptionId: number) {
  return prisma.subscription.delete({
    where: { id: subscriptionId },
  })
}

export async function getSubscriptionStats(userId: number) {
  const subscriptions = await getSubscriptions(userId)

  const activeSubscriptions = subscriptions.filter((s) => s.status === 'ACTIVE')
  const monthlyBurnRate = activeSubscriptions.reduce((sum, s) => sum + s.monthlyPrice, 0)

  return {
    totalSubscriptions: subscriptions.length,
    activeSubscriptions: activeSubscriptions.length,
    monthlyBurnRate,
    subscriptions,
  }
}

export async function getAIRecommendations(userId: number) {
  const subscriptions = await getSubscriptions(userId)
  const inactiveSubscriptions = subscriptions.filter((s) => {
    const daysSinceActivity = s.lastActivity
      ? Math.floor((Date.now() - s.lastActivity.getTime()) / (1000 * 60 * 60 * 24))
      : 0
    return daysSinceActivity > 45
  })

  const recommendations = []

  for (const sub of inactiveSubscriptions) {
    recommendations.push({
      title: `Save $${sub.monthlyPrice} monthly`,
      body: `You haven't used ${sub.name} in over 45 days. Would you like us to negotiate a lower rate or cancel?`,
      icon: 'AlertCircle',
      action: 'Review',
    })
  }

  return recommendations
}
