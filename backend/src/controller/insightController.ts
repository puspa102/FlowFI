import type { Response } from 'express'
import type { AuthenticatedRequest } from '../middleware/requireAuth'
import { getInsights, aiChat, getAiPredictions, suggestCategory } from '../services/insightService'

export async function listInsights(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const insights = await getInsights(req.user.id)
    res.status(200).json({ insights })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internal server error.' })
  }
}

export async function chatWithAI(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { message, history } = req.body

    if (!message || typeof message !== 'string' || !message.trim()) {
      res.status(400).json({ error: 'Message is required.' })
      return
    }

    const safeHistory = Array.isArray(history) ? history : []
    const response = await aiChat(req.user.id, message, safeHistory)
    res.status(200).json(response)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internal server error.' })
  }
}

export async function getAiPredictionsHandler(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const predictions = await getAiPredictions(req.user.id)
    res.status(200).json(predictions)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internal server error.' })
  }
}

export async function smartCategorizeHandler(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const description = typeof req.body?.description === 'string' ? req.body.description : req.query.description
    if (typeof description !== 'string') {
      res.status(400).json({ error: 'Description is required.' })
      return
    }
    const category = suggestCategory(description)
    res.status(200).json({ category })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internal server error.' })
  }
}

export async function getBudgetSuggestionsHandler(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const data = await getAiPredictions(req.user.id)
    res.status(200).json(data.savingRecommendations)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internal server error.' })
  }
}

export async function getAnomaliesHandler(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const data = await getAiPredictions(req.user.id)
    res.status(200).json(data.anomalies)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internal server error.' })
  }
}

export async function getSpendingPatternsHandler(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const data = await getAiPredictions(req.user.id)
    res.status(200).json(data.spendingInsights)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internal server error.' })
  }
}

