import type { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'

type TokenPayload = {
  userId: number
  iat?: number
  exp?: number
}

declare global {
  namespace Express {
    interface Request {
      user: { id: number }
      userId: number
    }
  }
}

export type AuthenticatedRequest = Request

export default function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authorization token is required.' })
  }

  const token = header.slice('Bearer '.length).trim()
  const jwtSecret = process.env.JWT_SECRET
  if (!jwtSecret) {
    return res.status(500).json({ error: 'JWT secret is not configured.' })
  }

  try {
    const payload = jwt.verify(token, jwtSecret) as TokenPayload
    if (!payload?.userId) {
      return res.status(401).json({ error: 'Invalid token.' })
    }
    req.userId = payload.userId
    req.user = { id: payload.userId }
    return next()
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token.' })
  }
}
