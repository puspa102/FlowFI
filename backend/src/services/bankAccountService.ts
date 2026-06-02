import { prisma } from '../config/prisma'
import { Decimal } from '@prisma/client/runtime/library'

export async function getAllAccounts(userId: number) {
  const accounts = await prisma.bankAccount.findMany({
    where: { userId },
    orderBy: [{ isActive: 'desc' }, { updatedAt: 'desc' }],
  })

  return accounts.map((a) => ({
    ...a,
    balance: a.balance.toNumber(),
  }))
}

export async function getAccountById(userId: number, id: number) {
  const account = await prisma.bankAccount.findFirst({
    where: { id, userId },
  })
  if (!account) return null
  return { ...account, balance: account.balance.toNumber() }
}

export async function createAccount(
  userId: number,
  data: {
    name: string
    institution?: string
    type: string
    balance?: number
    currency?: string
    color?: string
    icon?: string
  }
) {
  const account = await prisma.bankAccount.create({
    data: {
      userId,
      name: data.name,
      institution: data.institution,
      type: data.type as any,
      balance: new Decimal(data.balance ?? 0),
      currency: data.currency ?? 'NPR',
      color: data.color,
      icon: data.icon,
    },
  })
  return { ...account, balance: account.balance.toNumber() }
}

export async function updateAccount(
  userId: number,
  id: number,
  data: {
    name?: string
    institution?: string
    type?: string
    balance?: number
    currency?: string
    color?: string
    icon?: string
    isActive?: boolean
  }
) {
  const existing = await prisma.bankAccount.findFirst({ where: { id, userId } })
  if (!existing) return null

  const account = await prisma.bankAccount.update({
    where: { id },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.institution !== undefined && { institution: data.institution }),
      ...(data.type !== undefined && { type: data.type as any }),
      ...(data.balance !== undefined && { balance: new Decimal(data.balance) }),
      ...(data.currency !== undefined && { currency: data.currency }),
      ...(data.color !== undefined && { color: data.color }),
      ...(data.icon !== undefined && { icon: data.icon }),
      ...(data.isActive !== undefined && { isActive: data.isActive }),
    },
  })
  return { ...account, balance: account.balance.toNumber() }
}

export async function deleteAccount(userId: number, id: number) {
  const existing = await prisma.bankAccount.findFirst({ where: { id, userId } })
  if (!existing) return null
  await prisma.bankAccount.delete({ where: { id } })
  return { success: true }
}

export async function transferBetweenAccounts(
  userId: number,
  data: {
    fromAccountId: number
    toAccountId: number
    amount: number
    description?: string
  }
) {
  if (data.amount <= 0) {
    throw new Error('Transfer amount must be positive')
  }
  if (data.fromAccountId === data.toAccountId) {
    throw new Error('Cannot transfer to the same account')
  }

  const fromAccount = await prisma.bankAccount.findFirst({
    where: { id: data.fromAccountId, userId },
  })
  const toAccount = await prisma.bankAccount.findFirst({
    where: { id: data.toAccountId, userId },
  })

  if (!fromAccount || !toAccount) {
    throw new Error('One or both accounts not found')
  }

  if (fromAccount.balance.toNumber() < data.amount) {
    throw new Error('Insufficient balance')
  }

  const result = await prisma.$transaction(async (tx) => {
    const updated_from = await tx.bankAccount.update({
      where: { id: data.fromAccountId },
      data: { balance: { decrement: data.amount } },
    })

    const updated_to = await tx.bankAccount.update({
      where: { id: data.toAccountId },
      data: { balance: { increment: data.amount } },
    })

    const transfer = await tx.accountTransfer.create({
      data: {
        userId,
        fromAccountId: data.fromAccountId,
        toAccountId: data.toAccountId,
        amount: new Decimal(data.amount),
        description: data.description,
      },
    })

    return {
      transfer: { ...transfer, amount: transfer.amount.toNumber() },
      fromAccount: { ...updated_from, balance: updated_from.balance.toNumber() },
      toAccount: { ...updated_to, balance: updated_to.balance.toNumber() },
    }
  })

  return result
}

export async function getTransferHistory(userId: number) {
  const transfers = await prisma.accountTransfer.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 20,
    include: {
      fromAccount: { select: { id: true, name: true, icon: true, color: true } },
    },
  })

  return transfers.map((t) => ({
    ...t,
    amount: t.amount.toNumber(),
  }))
}

export async function getAccountsSummary(userId: number) {
  const accounts = await getAllAccounts(userId)
  const active = accounts.filter((a) => a.isActive)
  const totalBalance = active.reduce((sum, a) => sum + a.balance, 0)

  const byType: Record<string, { count: number; total: number }> = {}
  for (const a of active) {
    if (!byType[a.type]) byType[a.type] = { count: 0, total: 0 }
    byType[a.type].count++
    byType[a.type].total += a.balance
  }

  return {
    totalBalance,
    activeCount: active.length,
    archivedCount: accounts.length - active.length,
    byType,
  }
}
