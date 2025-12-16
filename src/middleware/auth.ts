import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, isTokenBlocked } from '../services/tokenService';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    tokenJti: string;
    exp?: number;
  };
  fileUuid?: string;
}

export async function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<Response | void> {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: 'Authorization header is missing' });
  }

  try {
    const payload = verifyAccessToken(token);
    if ((payload as any).type !== 'access') {
      return res.status(401).json({ error: 'Invalid token type' });
    }

    const isBlocked = await isTokenBlocked((payload as any).jti);
    if (isBlocked) {
      return res.status(401).json({ error: 'Token was revoked' });
    }

    req.user = {
      id: String((payload as any).sub),
      tokenJti: (payload as any).jti,
      exp: (payload as any).exp
    };
    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
}
