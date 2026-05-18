import type { Request, Response } from 'express'
import path from 'path'
import { getPasswordStrength, loginUser, registerUser } from '../services/authService'

export async function register(req: Request, res: Response) {
  try {
    const result = await registerUser(req.body)

    if (!result.ok) {
      return res.status(result.status).json({ error: result.error })
    }

    return res.status(result.status).json({ message: result.message, user: result.user })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Internal server error.' })
  }
}

export async function login(req: Request, res: Response) {
  try {
    const result = await loginUser(req.body)

    if (!result.ok) {
      return res.status(result.status).json({ error: result.error })
    }

    return res.status(result.status).json({ message: result.message, token: result.token })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Internal server error.' })
  }
}

export function passwordStrength(req: Request, res: Response) {
  const result = getPasswordStrength(req.body.password)

  if (!result.ok) {
    return res.status(result.status).json({ error: result.error })
  }

  return res.status(result.status).json({ strength: result.strength })
}

export function termsOfService(_req: Request, res: Response) {
  return res.sendFile(path.join(__dirname, '../../public/terms-of-service.html'))
}

export function privacyPolicy(_req: Request, res: Response) {
  return res.sendFile(path.join(__dirname, '../../public/privacy-policy.html'))
}