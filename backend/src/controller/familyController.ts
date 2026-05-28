import { Request, Response } from 'express'
import * as familyService from '../services/familyService'

export async function getFamilyGroups(req: Request, res: Response) {
  try {
    const userId = (req as any).userId
    const groups = await familyService.getFamilyGroups(userId)
    res.json(groups)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch family groups' })
  }
}

export async function createFamilyGroup(req: Request, res: Response) {
  try {
    const userId = (req as any).userId
    const { name } = req.body
    const group = await familyService.createFamilyGroup(userId, name)
    res.status(201).json(group)
  } catch (error) {
    res.status(500).json({ error: 'Failed to create family group' })
  }
}

export async function addFamilyMember(req: Request, res: Response) {
  try {
    const userId = (req as any).userId
    const { familyId, name, email, role } = req.body
    const member = await familyService.addFamilyMember(userId, familyId, {
      name,
      email,
      role,
    })
    res.status(201).json(member)
  } catch (error) {
    res.status(500).json({ error: 'Failed to add family member' })
  }
}

export async function getFamilyBudgets(req: Request, res: Response) {
  try {
    const userId = (req as any).userId
    const { familyId } = req.params
    const budgets = await familyService.getFamilyBudgets(userId, parseInt(familyId))
    res.json(budgets)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch family budgets' })
  }
}

export async function createFamilyBudget(req: Request, res: Response) {
  try {
    const userId = (req as any).userId
    const { familyId, category, month, budgetAmount } = req.body
    const budget = await familyService.createFamilyBudget(userId, familyId, {
      category,
      month,
      budgetAmount,
    })
    res.status(201).json(budget)
  } catch (error) {
    res.status(500).json({ error: 'Failed to create family budget' })
  }
}

export async function updateFamilyBudgetSpending(req: Request, res: Response) {
  try {
    const userId = (req as any).userId
    const { budgetId } = req.params
    const { spentAmount } = req.body
    const budget = await familyService.updateFamilyBudgetSpending(userId, parseInt(budgetId), spentAmount)
    res.json(budget)
  } catch (error) {
    res.status(500).json({ error: 'Failed to update budget spending' })
  }
}

export async function getFamilyStats(req: Request, res: Response) {
  try {
    const userId = (req as any).userId
    const { familyId } = req.params
    const stats = await familyService.getFamilyStats(userId, parseInt(familyId))
    res.json(stats)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch family stats' })
  }
}
