import { Request, Response, NextFunction } from 'express'
import { eq } from 'drizzle-orm'
import { verifyAccessToken } from '../services/tokenService'
import { db, schema } from '../db'

export interface AuthRequest extends Request {
  user?: {
    id: string
    tokenJti: string
    tokenVersion: number
    exp?: number
  }
  fileUuid?: string
}

export async function authMiddleware(req: AuthRequest, res: Response, next: NextFunction): Promise<Response | void> {
  const authHeader = req.headers.authorization || ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null

  if (!token) {
    return res.status(401).json({ error: 'Authorization header is missing' })
  }

  try {
    const payload = verifyAccessToken(token)
    if (payload.type !== 'access') {
      return res.status(401).json({ error: 'Invalid token type' })
    }

    const session = await db.query.refreshTokens.findFirst({
      where: eq(schema.refreshTokens.tokenJti, payload.jti),
    })

    if (!session || session.userId !== payload.sub || session.revoked) {
      return res.status(401).json({ error: 'Token was revoked' })
    }

    if (session.tokenVersion !== payload.ver) {
      return res.status(401).json({ error: 'Token version is no longer valid' })
    }

    if (new Date(session.expiresAt) < new Date()) {
      return res.status(401).json({ error: 'Token expired' })
    }

    req.user = {
      id: String(payload.sub),
      tokenJti: payload.jti,
      tokenVersion: payload.ver,
      exp: payload.exp,
    }
    return next()
  } catch (_err) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
}
