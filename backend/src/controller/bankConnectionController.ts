import { Request, Response } from 'express'
import * as bankService from '../services/bankConnectionService'

export async function getBankConnections(req: Request, res: Response) {
  try {
    const userId = (req as any).userId
    const connections = await bankService.getBankConnections(userId)
    res.json(connections)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch bank connections' })
  }
}

export async function addBankConnection(req: Request, res: Response) {
  try {
    const userId = (req as any).userId
    const { accountName, accountType, balance, maskedAccountNumber } = req.body
    const connection = await bankService.createBankConnection(userId, {
      accountName,
      accountType,
      balance,
      maskedAccountNumber,
    })
    res.status(201).json(connection)
  } catch (error) {
    res.status(500).json({ error: 'Failed to add bank connection' })
  }
}

export async function updateBankConnection(req: Request, res: Response) {
  try {
    const userId = (req as any).userId
    const { id } = req.params
    const { balance, syncStatus } = req.body
    const connection = await bankService.updateBankConnection(userId, parseInt(id), {
      balance,
      syncStatus,
    })
    res.json(connection)
  } catch (error) {
    res.status(500).json({ error: 'Failed to update bank connection' })
  }
}

export async function removeBankConnection(req: Request, res: Response) {
  try {
    const userId = (req as any).userId
    const { id } = req.params
    await bankService.deleteBankConnection(userId, parseInt(id))
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ error: 'Failed to remove bank connection' })
  }
}

export async function getNetLiquidity(req: Request, res: Response) {
  try {
    const userId = (req as any).userId
    const liquidity = await bankService.getNetLiquidity(userId)
    res.json(liquidity)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch net liquidity' })
  }
}

export async function syncBankAccounts(req: Request, res: Response) {
  try {
    const userId = (req as any).userId
    const result = await bankService.syncBankAccounts(userId)
    res.json(result)
  } catch (error) {
    res.status(500).json({ error: 'Failed to sync accounts' })
  }
}
