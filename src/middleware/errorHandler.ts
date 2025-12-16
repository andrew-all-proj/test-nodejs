import { Request, Response, NextFunction } from 'express'

type ErrorLike = {
  status?: unknown
  statusCode?: unknown
  message?: unknown
}

function extractStatus(err: ErrorLike): number | null {
  if (typeof err.status === 'number') return err.status
  if (typeof err.statusCode === 'number') return err.statusCode
  return null
}

function extractMessage(err: ErrorLike): string | null {
  return typeof err.message === 'string' ? err.message : null
}

// Centralized error handling middleware
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  console.error(err)

  const status = extractStatus((err as ErrorLike) ?? {}) ?? 500
  const message = extractMessage((err as ErrorLike) ?? {}) ?? 'Internal Server Error'

  res.status(status).json({ error: message })
}
