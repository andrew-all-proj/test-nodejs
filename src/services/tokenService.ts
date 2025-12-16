import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config';
import { db, schema } from '../db/index';
import { eq } from 'drizzle-orm';

type JwtPayload = jwt.JwtPayload & { sub: string; jti: string; type: 'access' | 'refresh' };

function sha256(value: string) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

export function hashToken(token: string): string {
  return sha256(token);
}

function decodeExpiryMs(token: string) {
  const payload = jwt.decode(token) as jwt.JwtPayload | null;
  if (!payload || !payload.exp) return null;
  return payload.exp * 1000;
}

export function generateAccessToken(userId: string, jti: string = uuidv4()) {
  const token = jwt.sign({ sub: userId, jti, type: 'access' } satisfies JwtPayload, config.security.accessSecret, {
    expiresIn: config.security.accessExpiresIn
  });
  return { token, jti, expiresAt: decodeExpiryMs(token) };
}

export function generateRefreshToken(userId: string, jti: string = uuidv4()) {
  const token = jwt.sign({ sub: userId, jti, type: 'refresh' } satisfies JwtPayload, config.security.refreshSecret, {
    expiresIn: config.security.refreshExpiresIn
  });
  return { token, jti, expiresAt: decodeExpiryMs(token) };
}

export async function storeRefreshToken({
  userId,
  token,
  jti,
  expiresAt
}: {
  userId: string;
  token: string;
  jti: string;
  expiresAt: number | null;
}) {
  const tokenHash = hashToken(token);
  await db.insert(schema.refreshTokens).values({
    userId,
    tokenHash,
    tokenJti: jti,
    expiresAt: expiresAt ? new Date(expiresAt) : new Date(),
    revoked: false
  });
}

export async function findRefreshTokenByJti(jti: string): Promise<typeof schema.refreshTokens.$inferSelect | null> {
  const row = await db.query.refreshTokens.findFirst({
    where: eq(schema.refreshTokens.tokenJti, jti)
  });
  return row || null;
}

export async function revokeRefreshToken(jti: string, replacedBy: string | null = null) {
  await db
    .update(schema.refreshTokens)
    .set({ revoked: true, replacedBy, revokedAt: new Date() })
    .where(eq(schema.refreshTokens.tokenJti, jti));
}

export async function blockToken(jti: string, userId: string, expiresAtMs: number | null): Promise<void> {
  if (!jti) return;
  const expiresAt = expiresAtMs ? new Date(expiresAtMs) : null;
  await db
    .insert(schema.blockedTokens)
    .values({ tokenJti: jti, userId, expiresAt })
    .onDuplicateKeyUpdate({ set: { expiresAt } });
}

export async function isTokenBlocked(jti: string): Promise<boolean> {
  if (!jti) return false;
  const row = await db.query.blockedTokens.findFirst({
    where: eq(schema.blockedTokens.tokenJti, jti)
  });
  return !!row;
}

export function verifyRefreshToken(token: string): JwtPayload {
  return jwt.verify(token, config.security.refreshSecret) as JwtPayload;
}

export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, config.security.accessSecret) as JwtPayload;
}

export async function issueTokenPair(userId: string): Promise<{
  token: string;
  refreshToken: string;
  accessJti: string;
  refreshJti: string;
  accessExpiresAt: number | null;
  refreshExpiresAt: number | null;
}> {
  const sharedJti = uuidv4();
  const access = generateAccessToken(userId, sharedJti);
  const refresh = generateRefreshToken(userId, sharedJti);
  await storeRefreshToken({
    userId,
    token: refresh.token,
    jti: refresh.jti,
    expiresAt: refresh.expiresAt
  });
  return {
    token: access.token,
    refreshToken: refresh.token,
    accessJti: access.jti,
    refreshJti: refresh.jti,
    accessExpiresAt: access.expiresAt,
    refreshExpiresAt: refresh.expiresAt
  };
}
