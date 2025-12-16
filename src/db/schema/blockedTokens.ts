import {
  bigint,
  datetime,
  mysqlTable,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";
import { users } from "./users";

export const blockedTokens = mysqlTable("blocked_tokens", {
  id: bigint("id", { mode: "number" }).primaryKey().autoincrement(),
  tokenJti: varchar("token_jti", { length: 64 }).notNull().unique(),
  userId: varchar("user_id", { length: 50 }).references(() => users.userId, {
    onDelete: "cascade",
  }),
  expiresAt: datetime("expires_at"),
  createdAt: timestamp("created_at").defaultNow(),
});
