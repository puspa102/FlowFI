import express from 'express'
import { getBudgetSummary } from '../controller/budgetController'
import { setBudgetLimit, deleteBudget } from '../services/budgetService'
import type { AuthenticatedRequest } from '../middleware/requireAuth'

const router = express.Router()

router.get('/summary', getBudgetSummary)

router.post('/', async (req: AuthenticatedRequest, res): Promise<void> => {
  try {
    const userId = req.user.id
    const { categoryId, limitAmount, month } = req.body

    if (!categoryId || limitAmount === undefined) {
      res.status(400).json({ error: 'CategoryId and limitAmount are required.' })
      return
    }

    const result = await setBudgetLimit(userId, Number(categoryId), Number(limitAmount), month)
    
    if (!result.ok) {
      res.status(result.status ?? 400).json({ error: result.error })
      return
    }

    res.status(200).json(result.budget)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internal server error.' })
  }
})

router.delete('/:id', async (req: AuthenticatedRequest, res): Promise<void> => {
  try {
    const userId = req.user.id
    const id = Number(req.params.id)

    if (Number.isNaN(id)) {
      res.status(400).json({ error: 'Invalid budget ID.' })
      return
    }

    const result = await deleteBudget(userId, id)

    if (!result.ok) {
      res.status(result.status ?? 400).json({ error: result.error })
      return
    }

    res.status(200).json({ status: 'ok' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internal server error.' })
  }
})

export default router

