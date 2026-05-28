import { Request, Response } from 'express'
import * as aiCoachService from '../services/aiCoachService'

export async function getAnomalies(req: Request, res: Response) {
  try {
    const userId = (req as any).userId
    const anomalies = await aiCoachService.getAnomalies(userId)
    res.json(anomalies)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch anomalies' })
  }
}

export async function createAnomaly(req: Request, res: Response) {
  try {
    const userId = (req as any).userId
    const { title, description, severity, category, detectedAmount, averageAmount } = req.body
    const anomaly = await aiCoachService.createAnomaly(userId, {
      title,
      description,
      severity,
      category,
      detectedAmount,
      averageAmount,
    })
    res.status(201).json(anomaly)
  } catch (error) {
    res.status(500).json({ error: 'Failed to create anomaly alert' })
  }
}

export async function getExpensePrediction(req: Request, res: Response) {
  try {
    const userId = (req as any).userId
    const predictions = await aiCoachService.getExpensePredictions(userId)
    res.json(predictions)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch expense predictions' })
  }
}

export async function getAIInsights(req: Request, res: Response) {
  try {
    const userId = (req as any).userId
    const insights = await aiCoachService.getAIInsights(userId)
    res.json(insights)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch AI insights' })
  }
}

export async function getSavingsVelocity(req: Request, res: Response) {
  try {
    const userId = (req as any).userId
    const velocity = await aiCoachService.getSavingsVelocity(userId)
    res.json(velocity)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch savings velocity' })
  }
}

export async function getHabitAnalytics(req: Request, res: Response) {
  try {
    const userId = (req as any).userId
    const analytics = await aiCoachService.getHabitAnalytics(userId)
    res.json(analytics)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch habit analytics' })
  }
}
