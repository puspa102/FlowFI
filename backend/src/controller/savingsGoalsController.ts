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
    const goal = await goalsService.updateSavingsGoal(userId, Number(id), {
      currentAmount,
      monthlyContribution,
    })
    res.json(goal)
  } catch (error) {
    res.status(500).json({ error: 'Failed to update goal' })
  }
}

export async function contributeGoal(req: Request, res: Response) {
  try {
    const userId = (req as any).userId
    const { id } = req.params
    const { amount } = req.body
    
    // fetch the goal first to get currentAmount
    const goals = await goalsService.getSavingsGoals(userId)
    const goalId = Number(id)
    const goal = goals.find((g: any) => g.id === goalId)
    
    if (!goal) {
      return res.status(404).json({ error: 'Goal not found' })
    }

    const newAmount = goal.currentAmount + parseFloat(amount)
    const updatedGoal = await goalsService.updateSavingsGoal(userId, goalId, {
      currentAmount: newAmount
    })
    res.json(updatedGoal)
  } catch (error) {
    res.status(500).json({ error: 'Failed to contribute to goal' })
  }
}

export async function deleteGoal(req: Request, res: Response) {
  try {
    const userId = (req as any).userId
    const { id } = req.params
    await goalsService.deleteSavingsGoal(userId, Number(id))
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
