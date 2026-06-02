import { Request, Response } from 'express'
import * as investmentService from '../services/investmentService'

export async function getInvestmentPortfolio(req: Request, res: Response) {
  try {
    const userId = (req as any).userId
    const portfolio = await investmentService.getPortfolio(userId)
    res.json(portfolio)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch portfolio' })
  }
}

export async function addInvestment(req: Request, res: Response) {
  try {
    const userId = (req as any).userId
    const { symbol, name, type, quantity, purchasePrice, currentPrice, allocation } = req.body
    const investment = await investmentService.createInvestment(userId, {
      symbol,
      name,
      type,
      quantity,
      purchasePrice,
      currentPrice,
      allocation,
    })
    res.status(201).json(investment)
  } catch (error) {
    res.status(500).json({ error: 'Failed to add investment' })
  }
}

export async function updateInvestment(req: Request, res: Response) {
  try {
    const userId = (req as any).userId
    const { id } = req.params
    const { currentPrice, quantity, allocation } = req.body
    const investment = await investmentService.updateInvestment(userId, Number(id), {
      currentPrice,
      quantity,
      allocation,
    })
    res.json(investment)
  } catch (error) {
    res.status(500).json({ error: 'Failed to update investment' })
  }
}

export async function deleteInvestment(req: Request, res: Response) {
  try {
    const userId = (req as any).userId
    const { id } = req.params
    await investmentService.deleteInvestment(userId, Number(id))
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete investment' })
  }
}

export async function getTopPerformingAssets(req: Request, res: Response) {
  try {
    const userId = (req as any).userId
    const assets = await investmentService.getTopPerformingAssets(userId)
    res.json(assets)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch top assets' })
  }
}

export async function getPortfolioStats(req: Request, res: Response) {
  try {
    const userId = (req as any).userId
    const stats = await investmentService.getPortfolioStats(userId)
    res.json(stats)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch portfolio stats' })
  }
}
