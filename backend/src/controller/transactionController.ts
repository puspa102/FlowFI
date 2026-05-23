import type { Response } from 'express'
import type { AuthenticatedRequest } from '../middleware/requireAuth'
import { addTransaction, getTransactions, updateTransaction, deleteTransaction } from '../services/transactionService'

export async function listTransactions(req: AuthenticatedRequest, res: Response) {
  try {
    const result = await getTransactions(req.user.id, req.query)
    return res.status(200).json(result)
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Internal server error.' })
  }
}

export async function createTransaction(req: AuthenticatedRequest, res: Response) {
  try {
    const result = await addTransaction(req.user.id, req.body)

    if (!result.ok) {
      return res.status(result.status).json({ error: result.error })
    }

    return res.status(201).json({ transaction: result.transaction })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Internal server error.' })
  }
}

export async function editTransaction(req: AuthenticatedRequest, res: Response) {
  try {
    const id = Number(req.params.id)
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: 'Invalid transaction ID.' })
    }
    const result = await updateTransaction(req.user.id, id, req.body)
    if (!result.ok) {
      return res.status(result.status).json({ error: result.error })
    }
    return res.status(200).json({ transaction: result.transaction })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Internal server error.' })
  }
}

export async function removeTransaction(req: AuthenticatedRequest, res: Response) {
  try {
    const id = Number(req.params.id)
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: 'Invalid transaction ID.' })
    }
    const result = await deleteTransaction(req.user.id, id)
    if (!result.ok) {
      return res.status(result.status).json({ error: result.error })
    }
    return res.status(200).json({ status: 'ok' })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Internal server error.' })
  }
}

