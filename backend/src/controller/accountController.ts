import type { Response } from 'express'
import type { AuthenticatedRequest } from '../middleware/requireAuth'
import { getAccounts, getUserProfile, updateUserSettings, uploadProfileImage } from '../services/accountService'

export async function listAccounts(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const accounts = await getAccounts(req.user.id)
    res.status(200).json({ accounts })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internal server error.' })
  }
}

export async function getProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const profile = await getUserProfile(req.user.id)
    res.status(200).json(profile)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internal server error.' })
  }
}

export async function updateSettings(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const result = await updateUserSettings(req.user.id, req.body)
    res.status(200).json(result)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internal server error.' })
  }
}

export async function uploadAvatarImage(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No image file provided.' })
      return
    }
    const result = await uploadProfileImage(req.user.id, req.file.path)
    res.status(200).json(result)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internal server error.' })
  }
}
