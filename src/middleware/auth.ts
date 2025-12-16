import { Request, Response, NextFunction } from 'express'
import { verifyAccessToken, isTokenBlocked } from '../services/tokenService'

export interface AuthRequest extends Request {
  user?: {
    id: string
    tokenJti: string
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

    const blocked = await isTokenBlocked(payload.jti)
    if (blocked) {
      return res.status(401).json({ error: 'Token was revoked' })
    }

    req.user = {
      id: String(payload.sub),
      tokenJti: payload.jti,
      exp: payload.exp,
    }
    return next()
  } catch (_err) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
}
