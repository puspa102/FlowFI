import { Request, Response } from 'express'
import * as subscriptionService from '../services/subscriptionService'

export async function getSubscriptions(req: Request, res: Response) {
  try {
    const userId = (req as any).userId
    const subscriptions = await subscriptionService.getSubscriptions(userId)
    res.json(subscriptions)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch subscriptions' })
  }
}

export async function addSubscription(req: Request, res: Response) {
  try {
    const userId = (req as any).userId
    const { name, status, monthlyPrice, billingDate, category } = req.body
    const subscription = await subscriptionService.createSubscription(userId, {
      name,
      status,
      monthlyPrice,
      billingDate,
      category,
    })
    res.status(201).json(subscription)
  } catch (error) {
    res.status(500).json({ error: 'Failed to add subscription' })
  }
}

export async function updateSubscription(req: Request, res: Response) {
  try {
    const userId = (req as any).userId
    const { id } = req.params
    const { name, status, monthlyPrice, category } = req.body
    const subscription = await subscriptionService.updateSubscription(userId, parseInt(id), {
      name,
      status,
      monthlyPrice,
      category,
    })
    res.json(subscription)
  } catch (error) {
    res.status(500).json({ error: 'Failed to update subscription' })
  }
}

export async function deleteSubscription(req: Request, res: Response) {
  try {
    const userId = (req as any).userId
    const { id } = req.params
    await subscriptionService.deleteSubscription(userId, parseInt(id))
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete subscription' })
  }
}

export async function getSubscriptionStats(req: Request, res: Response) {
  try {
    const userId = (req as any).userId
    const stats = await subscriptionService.getSubscriptionStats(userId)
    res.json(stats)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch subscription stats' })
  }
}

export async function getAIRecommendations(req: Request, res: Response) {
  try {
    const userId = (req as any).userId
    const recommendations = await subscriptionService.getAIRecommendations(userId)
    res.json(recommendations)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch recommendations' })
  }
}
