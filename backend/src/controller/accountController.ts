import type { Response } from 'express'
import type { AuthenticatedRequest } from '../middleware/requireAuth'
import { getAccounts, getUserProfile, updateUserSettings } from '../services/accountService'

export async function listAccounts(req: AuthenticatedRequest, res: Response) {
  try {
    const accounts = await getAccounts(req.user.id)
    return res.status(200).json({ accounts })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Internal server error.' })
  }
}

export async function getProfile(req: AuthenticatedRequest, res: Response) {
  try {
    const profile = await getUserProfile(req.user.id)
    return res.status(200).json(profile)
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Internal server error.' })
  }
}

export async function updateSettings(req: AuthenticatedRequest, res: Response) {
  try {
    const result = await updateUserSettings(req.user.id, req.body)
    return res.status(200).json(result)
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Internal server error.' })
  }
}
