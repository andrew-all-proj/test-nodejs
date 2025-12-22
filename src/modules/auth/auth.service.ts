import bcrypt from 'bcryptjs'
import { eq } from 'drizzle-orm'
import { db, schema } from '../../db/index'
import {
  findRefreshTokenByJti,
  hashToken,
  issueNewTokenPair,
  reissueTokenPair,
  revokeRefreshToken,
  verifyRefreshToken,
} from '../../services/tokenService'
import { TokenPair } from '../../types/auth'

export async function signup(id: string, password: string): Promise<TokenPair> {
  const existing = await db.query.users.findFirst({
    where: eq(schema.users.userId, id),
  })
  if (existing) {
    throw Object.assign(new Error('User already exists'), { status: 400 })
  }

  const passwordHash = await bcrypt.hash(password, 10)
  await db.insert(schema.users).values({
    userId: id,
    passwordHash,
  })

  return issueNewTokenPair(id)
}

export async function signin(id: string, password: string): Promise<TokenPair> {
  const user = await db.query.users.findFirst({
    where: eq(schema.users.userId, id),
  })
  if (!user) {
    throw Object.assign(new Error('Invalid credentials'), { status: 401 })
  }

  const valid = await bcrypt.compare(password, user.passwordHash)
  if (!valid) {
    throw Object.assign(new Error('Invalid credentials'), { status: 401 })
  }

  return issueNewTokenPair(user.userId)
}

export async function refreshToken(refreshToken: string): Promise<TokenPair> {
  let payload
  try {
    payload = verifyRefreshToken(refreshToken)
  } catch (_err) {
    throw Object.assign(new Error('Invalid refresh token'), { status: 401 })
  }

  if (payload.type !== 'refresh') {
    throw Object.assign(new Error('Invalid token type'), { status: 401 })
  }

  const stored = await findRefreshTokenByJti(payload.jti)
  const hashed = hashToken(refreshToken)
  if (!stored || stored.tokenHash !== hashed || stored.userId !== payload.sub) {
    throw Object.assign(new Error('Refresh token not found or revoked'), {
      status: 401,
    })
  }

  if (stored.revoked) {
    throw Object.assign(new Error('Refresh token revoked'), { status: 401 })
  }

  if (stored.tokenVersion !== payload.ver) {
    throw Object.assign(new Error('Refresh token version is no longer valid'), { status: 401 })
  }

  if (new Date(stored.expiresAt) < new Date()) {
    throw Object.assign(new Error('Refresh token expired'), { status: 401 })
  }

  const newTokens = await reissueTokenPair(stored)

  return newTokens
}

export async function logout(userId: string, accessJti: string | undefined): Promise<void> {
  if (accessJti) {
    const stored = await findRefreshTokenByJti(accessJti)
    if (stored && stored.userId === userId && !stored.revoked) {
      await revokeRefreshToken(accessJti)
    }
  }
}
