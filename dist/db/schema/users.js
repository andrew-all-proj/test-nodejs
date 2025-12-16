"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.users = void 0;
const mysql_core_1 = require("drizzle-orm/mysql-core");
exports.users = (0, mysql_core_1.mysqlTable)('users', {
    userId: (0, mysql_core_1.varchar)('user_id', { length: 50 }).primaryKey(),
    passwordHash: (0, mysql_core_1.varchar)('password_hash', { length: 255 }).notNull(),
    createdAt: (0, mysql_core_1.timestamp)('created_at').defaultNow()
});
