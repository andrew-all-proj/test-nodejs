"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshTokens = void 0;
const mysql_core_1 = require("drizzle-orm/mysql-core");
const users_1 = require("./users");
exports.refreshTokens = (0, mysql_core_1.mysqlTable)("refresh_tokens", {
    id: (0, mysql_core_1.bigint)("id", { mode: "number" }).primaryKey().autoincrement(),
    userId: (0, mysql_core_1.varchar)("user_id", { length: 50 })
        .notNull()
        .references(() => users_1.users.userId, { onDelete: "cascade" }),
    tokenHash: (0, mysql_core_1.varchar)("token_hash", { length: 255 }).notNull(),
    tokenJti: (0, mysql_core_1.varchar)("token_jti", { length: 64 }).notNull().unique(),
    expiresAt: (0, mysql_core_1.datetime)("expires_at").notNull(),
    revoked: (0, mysql_core_1.boolean)("revoked").notNull().default(false),
    revokedAt: (0, mysql_core_1.datetime)("revoked_at"),
    replacedBy: (0, mysql_core_1.varchar)("replaced_by", { length: 64 }),
    createdAt: (0, mysql_core_1.timestamp)("created_at").defaultNow(),
});
