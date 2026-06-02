import type { Response } from 'express'
import type { AuthenticatedRequest } from '../middleware/requireAuth'
import { getDashboard, getMonthlyAnalytics } from '../services/dashboardService'

export async function getDashboardSummary(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const summary = await getDashboard(req.user.id)
    res.status(200).json(summary)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internal server error.' })
  }
}

export async function getDashboardAnalytics(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const analytics = await getMonthlyAnalytics(req.user.id)
    res.status(200).json(analytics)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internal server error.' })
  }
}

