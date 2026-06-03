import prisma from '../config/prisma'
import { Prisma } from '../generated/prisma'
import { buildMonthStart, toSignedAmount } from '../utils/finance'
import { recalculateBudgets } from './budgetService'

type TransactionQuery = {
  page?: string
  pageSize?: string
  category?: string
  search?: string
  accountId?: string
  startDate?: string
  endDate?: string
  timeframe?: string
  type?: string
}

type TransactionInput = {
  description?: string
  merchant?: string
  category?: string
  amount?: number
  type?: 'INCOME' | 'EXPENSE'
  status?: 'PENDING' | 'CLEARED'
  accountId?: number
  occurredAt?: string
  isRecurring?: boolean
  recurringInterval?: string
}

export async function processRecurringTransactions(userId: number) {
  const now = new Date()
  const recurringTxs = await prisma.transaction.findMany({
    where: { userId, isRecurring: true },
    take: 50,
  })

  for (const recurringTx of recurringTxs) {
    const occurredAt = new Date(recurringTx.occurredAt)
    const nextDate = new Date(occurredAt)

    if (recurringTx.recurringInterval === 'weekly') {
      nextDate.setDate(nextDate.getDate() + 7)
    } else if (recurringTx.recurringInterval === 'monthly') {
      nextDate.setMonth(nextDate.getMonth() + 1)
    } else if (recurringTx.recurringInterval === 'yearly') {
      nextDate.setFullYear(nextDate.getFullYear() + 1)
    } else {
      await prisma.transaction.update({
        where: { id: recurringTx.id },
        data: { isRecurring: false },
      })
      continue
    }

    if (nextDate > now) continue

    await prisma.transaction.create({
      data: {
        userId: recurringTx.userId,
        accountId: recurringTx.accountId,
        description: recurringTx.description,
        merchant: recurringTx.merchant ?? null,
        category: recurringTx.category,
        amount: recurringTx.amount,
        type: recurringTx.type,
        status: 'CLEARED',
        occurredAt: nextDate,
        isRecurring: true,
        recurringInterval: recurringTx.recurringInterval,
      },
    })

    await prisma.transaction.update({
      where: { id: recurringTx.id },
      data: { isRecurring: false },
    })
  }
}

export async function getTransactions(userId: number, query: TransactionQuery) {
  await processRecurringTransactions(userId)

  const page = Math.max(1, Number(query.page ?? 1))
  const pageSize = Math.min(100, Math.max(1, Number(query.pageSize ?? 25)))

  const where: Prisma.TransactionWhereInput = { userId }

  if (query.category) {
    where.category = query.category
  }

  if (query.accountId) {
    const accountId = Number(query.accountId)
    if (!Number.isNaN(accountId)) {
      where.accountId = accountId
    }
  }

  if (query.type) {
    where.type = query.type as any
  }

  if (query.search) {
    where.OR = [
      { description: { contains: query.search, mode: 'insensitive' } },
      { merchant: { contains: query.search, mode: 'insensitive' } },
    ]
  }

  if (query.startDate || query.endDate) {
    where.occurredAt = {
      gte: query.startDate ? new Date(query.startDate) : undefined,
      lte: query.endDate ? new Date(query.endDate) : undefined,
    }
  } else if (query.timeframe) {
    const now = new Date()
    const start = new Date(now)

    if (query.timeframe === '30_DAYS') {
      start.setDate(now.getDate() - 30)
      where.occurredAt = { gte: start }
    } else if (query.timeframe === 'QUARTER') {
      start.setMonth(now.getMonth() - 3)
      where.occurredAt = { gte: start }
    } else if (query.timeframe === 'YEAR') {
      start.setFullYear(now.getFullYear() - 1)
      where.occurredAt = { gte: start }
    }
  }

  const [total, items] = await Promise.all([
    prisma.transaction.count({ where }),
    prisma.transaction.findMany({
      where,
      include: { account: true },
      orderBy: { occurredAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ])

  return {
    page,
    pageSize,
    total,
    items: items.map((tx) => ({
      id: tx.id,
      date: tx.occurredAt,
      description: tx.description,
      merchant: tx.merchant,
      category: tx.category,
      accountId: tx.accountId,
      account: `${tx.account.name} • ${tx.account.last4 ?? ''}`.trim(),
      amount: toSignedAmount(Number(tx.amount), tx.type),
      status: tx.status,
      type: tx.type,
      isRecurring: tx.isRecurring,
      recurringInterval: tx.recurringInterval,
    })),
  }
}

export async function addTransaction(userId: number, input: TransactionInput) {
  const description = typeof input.description === 'string' ? input.description.trim() : ''
  const merchant = typeof input.merchant === 'string' ? input.merchant.trim() : undefined
  const category = typeof input.category === 'string' ? input.category : 'OTHER'
  const type = typeof input.type === 'string' ? input.type : 'EXPENSE'
  const status = typeof input.status === 'string' ? input.status : 'PENDING'
  const amount = Number(input.amount)
  const accountId = Number(input.accountId)
  const occurredAt = input.occurredAt ? new Date(input.occurredAt) : new Date()
  const isRecurring = !!input.isRecurring
  const recurringInterval = input.recurringInterval ?? null

  if (!description || !category || !type || Number.isNaN(amount) || Number.isNaN(accountId)) {
    return {
      ok: false,
      status: 400,
      error: 'Description, category, type, amount, and accountId are required.',
    }
  }

  const account = await prisma.account.findFirst({ where: { id: accountId, userId } })
  if (!account) {
    return {
      ok: false,
      status: 404,
      error: 'Account not found.',
    }
  }

  // Auto adjusting balance based on transaction type
  const actualAmount = amount < 0 ? Math.abs(amount) : amount
  const newBalance = type === 'INCOME'
    ? Number(account.balance) + actualAmount
    : Number(account.balance) - actualAmount

  await prisma.account.update({
    where: { id: accountId },
    data: { balance: newBalance }
  })

  const transaction = await prisma.transaction.create({
    data: {
      userId,
      accountId: account.id,
      description,
      merchant,
      category,
      amount: actualAmount,
      type: type as any,
      status: status as any,
      occurredAt,
      isRecurring,
      recurringInterval,
    },
    include: { account: true },
  })

  await recalculateBudgets(userId, buildMonthStart(transaction.occurredAt))

  return {
    ok: true,
    status: 201,
    transaction: {
      id: transaction.id,
      date: transaction.occurredAt,
      description: transaction.description,
      merchant: transaction.merchant,
      category: transaction.category,
      accountId: transaction.accountId,
      account: `${transaction.account.name} • ${transaction.account.last4 ?? ''}`.trim(),
      amount: toSignedAmount(Number(transaction.amount), transaction.type),
      status: transaction.status,
      type: transaction.type,
      isRecurring: transaction.isRecurring,
      recurringInterval: transaction.recurringInterval,
    },
  }
}

export async function updateTransaction(userId: number, transactionId: number, input: TransactionInput) {
  const transaction = await prisma.transaction.findFirst({
    where: { id: transactionId, userId },
    include: { account: true }
  })

  if (!transaction) {
    return { ok: false, status: 404, error: 'Transaction not found.' }
  }

  const updateData: Prisma.TransactionUpdateInput = {}

  if (input.description !== undefined) updateData.description = input.description.trim()
  if (input.merchant !== undefined) updateData.merchant = input.merchant.trim()
  if (input.category !== undefined) updateData.category = input.category
  if (input.status !== undefined) updateData.status = input.status as any
  if (input.occurredAt !== undefined) updateData.occurredAt = new Date(input.occurredAt)
  if (input.isRecurring !== undefined) updateData.isRecurring = input.isRecurring
  if (input.recurringInterval !== undefined) updateData.recurringInterval = input.recurringInterval

  const oldAccount = transaction.account
  const newAccountId = input.accountId ? Number(input.accountId) : transaction.accountId
  const newAmount = input.amount !== undefined ? Math.abs(Number(input.amount)) : Number(transaction.amount)
  const newType = input.type !== undefined ? input.type : transaction.type

  if (Number.isNaN(newAccountId) || Number.isNaN(newAmount)) {
    return { ok: false, status: 400, error: 'Valid accountId and amount are required.' }
  }

  // Handle balance reversion if amount, type, or account changes
  if (
    newAccountId !== transaction.accountId ||
    newAmount !== Number(transaction.amount) ||
    newType !== transaction.type
  ) {
    const targetAccount = newAccountId === oldAccount.id
      ? oldAccount
      : await prisma.account.findFirst({ where: { id: newAccountId, userId } })

    if (!targetAccount) {
      return { ok: false, status: 404, error: 'Target account not found.' }
    }

    // Revert old transaction's impact
    const revertOldBalance = transaction.type === 'INCOME'
      ? Number(oldAccount.balance) - Number(transaction.amount)
      : Number(oldAccount.balance) + Number(transaction.amount)

    await prisma.account.update({
      where: { id: oldAccount.id },
      data: { balance: revertOldBalance }
    })

    // Apply new transaction impact
    const applyNewBalance = newType === 'INCOME'
      ? Number(targetAccount.balance) + newAmount
      : Number(targetAccount.balance) - newAmount

    await prisma.account.update({
      where: { id: targetAccount.id },
      data: { balance: applyNewBalance }
    })

    updateData.account = { connect: { id: targetAccount.id } }
    updateData.amount = newAmount
    updateData.type = newType as any
  }

  const updatedTx = await prisma.transaction.update({
    where: { id: transactionId },
    data: updateData,
    include: { account: true }
  })

  await recalculateBudgets(userId, buildMonthStart(transaction.occurredAt))
  await recalculateBudgets(userId, buildMonthStart(updatedTx.occurredAt))

  return {
    ok: true,
    status: 200,
    transaction: {
      id: updatedTx.id,
      date: updatedTx.occurredAt,
      description: updatedTx.description,
      merchant: updatedTx.merchant,
      category: updatedTx.category,
      accountId: updatedTx.accountId,
      account: `${updatedTx.account.name} • ${updatedTx.account.last4 ?? ''}`.trim(),
      amount: toSignedAmount(Number(updatedTx.amount), updatedTx.type),
      status: updatedTx.status,
      type: updatedTx.type,
      isRecurring: updatedTx.isRecurring,
      recurringInterval: updatedTx.recurringInterval,
    }
  }
}

export async function deleteTransaction(userId: number, transactionId: number) {
  const transaction = await prisma.transaction.findFirst({
    where: { id: transactionId, userId },
    include: { account: true }
  })

  if (!transaction) {
    return { ok: false, status: 404, error: 'Transaction not found.' }
  }

  // Revert transaction balance impact before deletion
  const revertBalance = transaction.type === 'INCOME'
    ? Number(transaction.account.balance) - Number(transaction.amount)
    : Number(transaction.account.balance) + Number(transaction.amount)

  await prisma.account.update({
    where: { id: transaction.accountId },
    data: { balance: revertBalance }
  })

  await prisma.transaction.delete({
    where: { id: transactionId }
  })

  await recalculateBudgets(userId, buildMonthStart(transaction.occurredAt))

  return { ok: true, status: 200 }
}

