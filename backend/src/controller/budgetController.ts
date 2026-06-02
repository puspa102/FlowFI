import type { Response } from 'express'
import type { AuthenticatedRequest } from '../middleware/requireAuth'
import { fetchBudgetSummary } from '../services/budgetService'

export async function getBudgetSummary(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const month = typeof req.query.month === 'string' ? req.query.month : undefined
    const summary = await fetchBudgetSummary(req.user.id, month)
    res.status(200).json(summary)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internal server error.' })
  }
}
