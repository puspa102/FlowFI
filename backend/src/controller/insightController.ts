import type { Response } from 'express'
import type { AuthenticatedRequest } from '../middleware/requireAuth'
import { getInsights, aiChat, getAiPredictions, suggestCategory } from '../services/insightService'

export async function listInsights(req: AuthenticatedRequest, res: Response) {
  try {
    const insights = await getInsights(req.user.id)
    return res.status(200).json({ insights })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Internal server error.' })
  }
}

export async function chatWithAI(req: AuthenticatedRequest, res: Response) {
  try {
    const { message } = req.body

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ error: 'Message is required.' })
    }

    const response = await aiChat(req.user.id, message)
    return res.status(200).json(response)
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Internal server error.' })
  }
}

export async function getAiPredictionsHandler(req: AuthenticatedRequest, res: Response) {
  try {
    const predictions = await getAiPredictions(req.user.id)
    return res.status(200).json(predictions)
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Internal server error.' })
  }
}

export async function smartCategorizeHandler(req: AuthenticatedRequest, res: Response) {
  try {
    const { description } = req.query
    if (typeof description !== 'string') {
      return res.status(400).json({ error: 'Description query parameter is required.' })
    }
    const category = suggestCategory(description)
    return res.status(200).json({ category })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Internal server error.' })
  }
}

export async function getBudgetSuggestionsHandler(req: AuthenticatedRequest, res: Response) {
  try {
    const data = await getAiPredictions(req.user.id)
    return res.status(200).json(data.savingRecommendations)
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Internal server error.' })
  }
}

export async function getAnomaliesHandler(req: AuthenticatedRequest, res: Response) {
  try {
    const data = await getAiPredictions(req.user.id)
    return res.status(200).json(data.anomalies)
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Internal server error.' })
  }
}

export async function getSpendingPatternsHandler(req: AuthenticatedRequest, res: Response) {
  try {
    const data = await getAiPredictions(req.user.id)
    return res.status(200).json(data.spendingInsights)
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Internal server error.' })
  }
}

