import crypto from 'crypto'
import jwt from 'jsonwebtoken'
import { v4 as uuidv4 } from 'uuid'
import { config } from '../config'
import { db, schema } from '../db/index'
import { eq } from 'drizzle-orm'

export type JwtPayload = jwt.JwtPayload & { sub: string; jti: string; ver: number; type: 'access' | 'refresh' }

function sha256(value: string) {
  return crypto.createHash('sha256').update(value).digest('hex')
}

export function hashToken(token: string): string {
  return sha256(token)
}

function decodeExpiryMs(token: string) {
  const payload = jwt.decode(token) as jwt.JwtPayload | null
  if (!payload || !payload.exp) return null
  return payload.exp * 1000
}

export function generateAccessToken(userId: string, jti: string, tokenVersion: number) {
  const token = jwt.sign({ sub: userId, jti, ver: tokenVersion, type: 'access' } satisfies JwtPayload, config.security.accessSecret, {
    expiresIn: config.security.accessExpiresIn,
  })
  return { token, jti, expiresAt: decodeExpiryMs(token) }
}

export function generateRefreshToken(userId: string, jti: string, tokenVersion: number) {
  const token = jwt.sign({ sub: userId, jti, ver: tokenVersion, type: 'refresh' } satisfies JwtPayload, config.security.refreshSecret, {
    expiresIn: config.security.refreshExpiresIn,
  })
  return { token, jti, expiresAt: decodeExpiryMs(token) }
}

function buildTokenPair({
  userId,
  tokenJti,
  tokenVersion,
}: {
  userId: string
  tokenJti: string
  tokenVersion: number
}) {
  const access = generateAccessToken(userId, tokenJti, tokenVersion)
  const refresh = generateRefreshToken(userId, tokenJti, tokenVersion)

  return {
    token: access.token,
    refreshToken: refresh.token,
    accessJti: access.jti,
    refreshJti: refresh.jti,
    accessExpiresAt: access.expiresAt,
    refreshExpiresAt: refresh.expiresAt,
    tokenVersion,
  }
}

export async function storeRefreshToken({
  userId,
  token,
  jti,
  tokenVersion,
  expiresAt,
}: {
  userId: string
  token: string
  jti: string
  tokenVersion: number
  expiresAt: number | null
}) {
  const tokenHash = hashToken(token)
  await db.insert(schema.refreshTokens).values({
    userId,
    tokenHash,
    tokenJti: jti,
    tokenVersion,
    expiresAt: expiresAt ? new Date(expiresAt) : new Date(),
    revoked: false,
  })
}

export async function updateRefreshToken({
  jti,
  token,
  tokenVersion,
  expiresAt,
}: {
  jti: string
  token: string
  tokenVersion: number
  expiresAt: number | null
}) {
  const tokenHash = hashToken(token)
  await db
    .update(schema.refreshTokens)
    .set({
      tokenHash,
      tokenVersion,
      expiresAt: expiresAt ? new Date(expiresAt) : new Date(),
      revoked: false,
      revokedAt: null,
    })
    .where(eq(schema.refreshTokens.tokenJti, jti))
}

export async function findRefreshTokenByJti(jti: string): Promise<typeof schema.refreshTokens.$inferSelect | null> {
  const row = await db.query.refreshTokens.findFirst({
    where: eq(schema.refreshTokens.tokenJti, jti),
  })
  return row || null
}

export async function revokeRefreshToken(jti: string) {
  await db
    .update(schema.refreshTokens)
    .set({ revoked: true, revokedAt: new Date() })
    .where(eq(schema.refreshTokens.tokenJti, jti))
}

export function verifyRefreshToken(token: string): JwtPayload {
  return jwt.verify(token, config.security.refreshSecret) as JwtPayload
}

export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, config.security.accessSecret) as JwtPayload
}

export async function issueNewTokenPair(userId: string) {
  const sharedJti = uuidv4()
  const tokenVersion = 1
  const pair = buildTokenPair({ userId, tokenJti: sharedJti, tokenVersion })

  await storeRefreshToken({
    userId,
    token: pair.refreshToken,
    jti: pair.refreshJti,
    tokenVersion,
    expiresAt: pair.refreshExpiresAt,
  })

  return pair
}

export async function reissueTokenPair(existing: typeof schema.refreshTokens.$inferSelect) {
  const nextVersion = (existing.tokenVersion ?? 1) + 1
  const pair = buildTokenPair({
    userId: existing.userId,
    tokenJti: existing.tokenJti,
    tokenVersion: nextVersion,
  })

  await updateRefreshToken({
    jti: existing.tokenJti,
    token: pair.refreshToken,
    tokenVersion: nextVersion,
    expiresAt: pair.refreshExpiresAt,
  })

  return pair
}
