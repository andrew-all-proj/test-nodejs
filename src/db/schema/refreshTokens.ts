import {
  boolean,
  bigint,
  datetime,
  mysqlTable,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";
import { users } from "./users";

export const refreshTokens = mysqlTable("refresh_tokens", {
  id: bigint("id", { mode: "number" }).primaryKey().autoincrement(),
  userId: varchar("user_id", { length: 50 })
    .notNull()
    .references(() => users.userId, { onDelete: "cascade" }),
  tokenHash: varchar("token_hash", { length: 255 }).notNull(),
  tokenJti: varchar("token_jti", { length: 64 }).notNull().unique(),
  expiresAt: datetime("expires_at").notNull(),
  revoked: boolean("revoked").notNull().default(false),
  revokedAt: datetime("revoked_at"),
  replacedBy: varchar("replaced_by", { length: 64 }),
  createdAt: timestamp("created_at").defaultNow(),
});
