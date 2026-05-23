import type { Request, Response } from 'express'
import { fetchPricing } from '../services/pricingService'

export async function getPricing(_req: Request, res: Response) {
  try {
    const pricing = await fetchPricing()
    return res.status(200).json(pricing)
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Internal server error.' })
  }
}
