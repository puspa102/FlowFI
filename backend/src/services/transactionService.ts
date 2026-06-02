import prisma from '../config/prisma'
import { Prisma } from '../generated/prisma'
import { toSignedAmount } from '../utils/finance'

type TransactionQuery = {
  page?: string
  pageSize?: string
  category?: string
  search?: string
  accountId?: string
  startDate?: string
  endDate?: string
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
  let attempts = 0
  const maxAttempts = 100 // Prevent infinite loops

  while (attempts < maxAttempts) {
    // Find a recurring transaction where the next occurrence is in the past
    const recurringTx = await prisma.transaction.findFirst({
      where: { userId, isRecurring: true },
    })

    if (!recurringTx) break

    const occurredAt = new Date(recurringTx.occurredAt)
    const nextDate = new Date(occurredAt)

    if (recurringTx.recurringInterval === 'weekly') {
      nextDate.setDate(nextDate.getDate() + 7)
    } else if (recurringTx.recurringInterval === 'monthly') {
      nextDate.setMonth(nextDate.getMonth() + 1)
    } else if (recurringTx.recurringInterval === 'yearly') {
      nextDate.setFullYear(nextDate.getFullYear() + 1)
    } else {
      // Invalid interval, disable recurring
      await prisma.transaction.update({
        where: { id: recurringTx.id },
        data: { isRecurring: false },
      })
      attempts++
      continue
    }

    // If the next occurrence is in the future, we have caught up for this particular transaction series.
    // To prevent checking the same future transaction repeatedly in our loop, we break or skip.
    // A simple way is to query only those whose next calculated date would be <= now.
    // Let's filter in memory or just check if nextDate is indeed in the past:
    if (nextDate > new Date()) {
      // Find another recurring transaction that might be overdue
      const otherOverdue = await prisma.transaction.findFirst({
        where: {
          userId,
          isRecurring: true,
          id: { not: recurringTx.id },
          occurredAt: { lt: new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000) } // generic overdue threshold
        }
      })
      if (!otherOverdue) break

      // If we got here, there are no overdue ones we can easily identify, let's break to avoid loop
      break
    }

    // Create the new auto-logged transaction
    await prisma.transaction.create({
      data: {
        userId: recurringTx.userId,
        accountId: recurringTx.accountId,
        description: recurringTx.description,
        merchant: recurringTx.merchant ?? null,
        category: recurringTx.category,
        amount: recurringTx.amount,
        type: recurringTx.type,
        status: 'CLEARED', // Auto-logged recurring bills are cleared
        occurredAt: nextDate,
        isRecurring: true,
        recurringInterval: recurringTx.recurringInterval,
      },
    })

    // Mark the previous one as no longer recurring so it is not processed again
    await prisma.transaction.update({
      where: { id: recurringTx.id },
      data: { isRecurring: false },
    })

    attempts++
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

  let oldAccount = transaction.account
  let newAccountId = input.accountId ? Number(input.accountId) : transaction.accountId
  let newAmount = input.amount !== undefined ? Math.abs(Number(input.amount)) : Number(transaction.amount)
  let newType = input.type !== undefined ? input.type : transaction.type

  // Handle balance reversion if amount, type, or account changes
  if (
    newAccountId !== transaction.accountId ||
    newAmount !== Number(transaction.amount) ||
    newType !== transaction.type
  ) {
    // Revert old transaction's impact
    const revertOldBalance = transaction.type === 'INCOME'
      ? Number(oldAccount.balance) - Number(transaction.amount)
      : Number(oldAccount.balance) + Number(transaction.amount)

    await prisma.account.update({
      where: { id: oldAccount.id },
      data: { balance: revertOldBalance }
    })

    // Fetch the new account if it changed, otherwise use the old one
    const targetAccount = newAccountId === oldAccount.id
      ? await prisma.account.findUnique({ where: { id: oldAccount.id } })
      : await prisma.account.findFirst({ where: { id: newAccountId, userId } })

    if (!targetAccount) {
      return { ok: false, status: 404, error: 'Target account not found.' }
    }

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

  return { ok: true, status: 200 }
}

