import { prisma } from '../config/prisma'
import { Decimal } from '@prisma/client/runtime/library'

export async function getBankConnections(userId: number) {
  const connections = await prisma.bankConnection.findMany({
    where: { userId },
    orderBy: { lastSynced: 'desc' },
  })
  
  return connections.map((c) => ({
    ...c,
    balance: c.balance.toNumber(),
  }))
}

export async function createBankConnection(
  userId: number,
  data: {
    accountName: string
    accountType: string
    balance: number
    maskedAccountNumber: string
  }
) {
  return prisma.bankConnection.create({
    data: {
      userId,
      accountName: data.accountName,
      accountType: data.accountType,
      balance: new Decimal(data.balance),
      maskedAccountNumber: data.maskedAccountNumber,
      lastSynced: new Date(),
      syncStatus: 'SYNCED',
    },
  })
}

export async function updateBankConnection(
  userId: number,
  connectionId: number,
  data: { balance?: number; syncStatus?: string }
) {
  return prisma.bankConnection.update({
    where: { id: connectionId },
    data: {
      ...(data.balance !== undefined && { balance: new Decimal(data.balance) }),
      ...(data.syncStatus && { syncStatus: data.syncStatus as any }),
      lastSynced: new Date(),
    },
  })
}

export async function deleteBankConnection(userId: number, connectionId: number) {
  return prisma.bankConnection.delete({
    where: { id: connectionId },
  })
}

export async function getNetLiquidity(userId: number) {
  const connections = await getBankConnections(userId)

  const totalLiquidity = connections.reduce((sum, conn) => sum + conn.balance, 0)

  return {
    totalLiquidity,
    connections,
    lastUpdated: new Date(),
  }
}

export async function syncBankAccounts(userId: number) {
  const connections = await getBankConnections(userId)

  const updatedConnections = await Promise.all(
    connections.map((conn) =>
      prisma.bankConnection.update({
        where: { id: conn.id },
        data: {
          syncStatus: 'SYNCED',
          lastSynced: new Date(),
        },
      })
    )
  )

  return {
    success: true,
    synced: updatedConnections.length,
    connections: updatedConnections.map((c) => ({
      ...c,
      balance: c.balance.toNumber(),
    })),
  }
}
