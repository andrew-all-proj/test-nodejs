import { boolean, bigint, datetime, int, mysqlTable, timestamp, varchar } from 'drizzle-orm/mysql-core'
import { users } from './users'

export const refreshTokens = mysqlTable('refresh_tokens', {
  id: bigint('id', { mode: 'number' }).primaryKey().autoincrement(),
  userId: varchar('user_id', { length: 50 })
    .notNull()
    .references(() => users.userId, { onDelete: 'cascade' }),
  tokenHash: varchar('token_hash', { length: 255 }).notNull(),
  tokenJti: varchar('token_jti', { length: 64 }).notNull().unique(),
  tokenVersion: int('token_version').notNull().default(1),
  expiresAt: datetime('expires_at').notNull(),
  revoked: boolean('revoked').notNull().default(false),
  revokedAt: datetime('revoked_at'),
  createdAt: timestamp('created_at').defaultNow(),
})
