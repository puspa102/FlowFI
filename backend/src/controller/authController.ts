import type { Request, Response } from 'express'
import path from 'path'
import {
  getGoogleAuthorizationUrl,
  getPasswordStrength,
  loginUser,
  loginWithGoogle,
  registerUser,
} from '../services/authService'

function getFrontendUrl() {
  return (process.env.FRONTEND_URL ?? 'http://localhost:5173').replace(/\/$/, '')
}

function getSafeFrontendUrl(value?: string) {
  if (!value) {
    return getFrontendUrl()
  }

  try {
    const url = new URL(value)

    if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
      return url.origin
    }
  } catch {
    return getFrontendUrl()
  }

  return getFrontendUrl()
}

function encodeOAuthState(frontendUrl: string) {
  return Buffer.from(JSON.stringify({ frontendUrl })).toString('base64url')
}

function decodeOAuthState(state: unknown) {
  if (typeof state !== 'string') {
    return getFrontendUrl()
  }

  try {
    const parsed = JSON.parse(Buffer.from(state, 'base64url').toString('utf8')) as { frontendUrl?: string }
    return getSafeFrontendUrl(parsed.frontendUrl)
  } catch {
    return getFrontendUrl()
  }
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Google token exchange failed'
}

function redirectToLogin(res: Response, error: string, frontendUrl = getFrontendUrl()) {
  const loginUrl = new URL('/login', frontendUrl)
  loginUrl.searchParams.set('error', error)
  return res.redirect(loginUrl.toString())
}

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

export function googleLogin(req: Request, res: Response) {
  const frontendUrl = getSafeFrontendUrl(typeof req.query.returnTo === 'string' ? req.query.returnTo : req.get('origin'))
  const authorizationUrl = getGoogleAuthorizationUrl(encodeOAuthState(frontendUrl))

  if (!authorizationUrl) {
    return redirectToLogin(
      res,
      'Google OAuth credentials are missing. Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to backend/.env.',
      frontendUrl,
    )
  }

  return res.redirect(authorizationUrl)
}

export async function googleCallback(req: Request, res: Response) {
  const frontendUrl = decodeOAuthState(req.query.state)

  try {
    if (typeof req.query.error === 'string') {
      const description = typeof req.query.error_description === 'string' ? req.query.error_description : req.query.error
      return redirectToLogin(res, description, frontendUrl)
    }

    const code = typeof req.query.code === 'string' ? req.query.code : undefined
    const result = await loginWithGoogle(code)
    console.log('Google login result ok:', result.ok)
    console.log('Google login result has token:', !!result.token)
    console.log('Google login result error:', result.error)

    if (!result.ok || !result.token) {
      return redirectToLogin(res, result.error ?? 'Google token exchange failed', frontendUrl)
    }

    const callbackUrl = new URL('/auth/callback', frontendUrl)
    callbackUrl.searchParams.set('token', result.token)
    console.log('Redirecting Google login to frontend callback:', callbackUrl.origin + callbackUrl.pathname)
    return res.redirect(callbackUrl.toString())
  } catch (error) {
    console.error(error)
    return redirectToLogin(res, getErrorMessage(error), frontendUrl)
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
