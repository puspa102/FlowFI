import type { NextFunction, Request, Response } from 'express'

export default function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  console.error(error)
  res.status(500).json({ error: 'Internal server error.' })
}