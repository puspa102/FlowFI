import type { Response } from 'express'
import type { AuthenticatedRequest } from '../middleware/requireAuth'
import { fetchBudgetSummary } from '../services/budgetService'

export async function getBudgetSummary(req: AuthenticatedRequest, res: Response) {
  try {
    const month = typeof req.query.month === 'string' ? req.query.month : undefined
    const summary = await fetchBudgetSummary(req.user.id, month)
    return res.status(200).json(summary)
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Internal server error.' })
  }
}
