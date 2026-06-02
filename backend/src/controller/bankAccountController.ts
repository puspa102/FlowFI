import { Request, Response } from 'express'
import * as bankAccountService from '../services/bankAccountService'

export async function getAll(req: Request, res: Response) {
  try {
    const userId = req.userId
    const accounts = await bankAccountService.getAllAccounts(userId)
    res.json(accounts)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch bank accounts' })
  }
}

export async function getById(req: Request, res: Response) {
  try {
    const userId = req.userId
    const id = Number(req.params.id)
    const account = await bankAccountService.getAccountById(userId, id)
    if (!account) return res.status(404).json({ error: 'Account not found' })
    res.json(account)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch account' })
  }
}

export async function create(req: Request, res: Response) {
  try {
    const userId = req.userId
    const { name, institution, type, balance, currency, color, icon } = req.body
    if (!name || !type) {
      return res.status(400).json({ error: 'Name and type are required' })
    }
    const account = await bankAccountService.createAccount(userId, {
      name,
      institution,
      type,
      balance,
      currency,
      color,
      icon,
    })
    res.status(201).json(account)
  } catch (error) {
    res.status(500).json({ error: 'Failed to create account' })
  }
}

export async function update(req: Request, res: Response) {
  try {
    const userId = req.userId
    const id = Number(req.params.id)
    const account = await bankAccountService.updateAccount(userId, id, req.body)
    if (!account) return res.status(404).json({ error: 'Account not found' })
    res.json(account)
  } catch (error) {
    res.status(500).json({ error: 'Failed to update account' })
  }
}

export async function remove(req: Request, res: Response) {
  try {
    const userId = req.userId
    const id = Number(req.params.id)
    const result = await bankAccountService.deleteAccount(userId, id)
    if (!result) return res.status(404).json({ error: 'Account not found' })
    res.json(result)
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete account' })
  }
}

export async function transfer(req: Request, res: Response) {
  try {
    const userId = req.userId
    const { fromAccountId, toAccountId, amount, description } = req.body
    if (!fromAccountId || !toAccountId || !amount) {
      return res.status(400).json({ error: 'fromAccountId, toAccountId, and amount are required' })
    }
    const result = await bankAccountService.transferBetweenAccounts(userId, {
      fromAccountId: Number(fromAccountId),
      toAccountId: Number(toAccountId),
      amount: Number(amount),
      description,
    })
    res.json(result)
  } catch (error: any) {
    const message = error?.message || 'Transfer failed'
    const status = message.includes('Insufficient') || message.includes('same account') || message.includes('positive') ? 400 : 500
    res.status(status).json({ error: message })
  }
}

export async function getTransfers(req: Request, res: Response) {
  try {
    const userId = req.userId
    const transfers = await bankAccountService.getTransferHistory(userId)
    res.json(transfers)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch transfers' })
  }
}

export async function getSummary(req: Request, res: Response) {
  try {
    const userId = req.userId
    const summary = await bankAccountService.getAccountsSummary(userId)
    res.json(summary)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch summary' })
  }
}
