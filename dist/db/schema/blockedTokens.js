"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.blockedTokens = void 0;
const mysql_core_1 = require("drizzle-orm/mysql-core");
const users_1 = require("./users");
exports.blockedTokens = (0, mysql_core_1.mysqlTable)('blocked_tokens', {
    id: (0, mysql_core_1.bigint)('id', { mode: 'number' }).primaryKey().autoincrement(),
    tokenJti: (0, mysql_core_1.varchar)('token_jti', { length: 64 }).notNull().unique(),
    userId: (0, mysql_core_1.varchar)('user_id', { length: 191 }).references(() => users_1.users.userId, {
        onDelete: 'cascade'
    }),
    expiresAt: (0, mysql_core_1.datetime)('expires_at'),
    createdAt: (0, mysql_core_1.timestamp)('created_at').defaultNow()
});
