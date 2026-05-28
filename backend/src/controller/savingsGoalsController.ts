import { Request, Response } from 'express'
import * as goalsService from '../services/savingsGoalsService'

export async function getSavingsGoals(req: Request, res: Response) {
  try {
    const userId = (req as any).userId
    const goals = await goalsService.getSavingsGoals(userId)
    res.json(goals)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch savings goals' })
  }
}

export async function createGoal(req: Request, res: Response) {
  try {
    const userId = (req as any).userId
    const { title, targetAmount, targetDate, monthlyContribution } = req.body
    const goal = await goalsService.createSavingsGoal(userId, {
      title,
      targetAmount,
      targetDate,
      monthlyContribution,
    })
    res.status(201).json(goal)
  } catch (error) {
    res.status(500).json({ error: 'Failed to create goal' })
  }
}

export async function updateGoal(req: Request, res: Response) {
  try {
    const userId = (req as any).userId
    const { id } = req.params
    const { currentAmount, monthlyContribution } = req.body
    const goal = await goalsService.updateSavingsGoal(userId, parseInt(id), {
      currentAmount,
      monthlyContribution,
    })
    res.json(goal)
  } catch (error) {
    res.status(500).json({ error: 'Failed to update goal' })
  }
}

export async function deleteGoal(req: Request, res: Response) {
  try {
    const userId = (req as any).userId
    const { id } = req.params
    await goalsService.deleteSavingsGoal(userId, parseInt(id))
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete goal' })
  }
}

export async function getGoalTimeline(req: Request, res: Response) {
  try {
    const userId = (req as any).userId
    const timeline = await goalsService.getGoalTimeline(userId)
    res.json(timeline)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch goal timeline' })
  }
}
