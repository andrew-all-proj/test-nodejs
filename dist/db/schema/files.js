"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.files = void 0;
const mysql_core_1 = require("drizzle-orm/mysql-core");
exports.files = (0, mysql_core_1.mysqlTable)("files", {
    id: (0, mysql_core_1.varchar)("id", { length: 36 }).primaryKey(),
    originalName: (0, mysql_core_1.varchar)("original_name", { length: 255 }).notNull(),
    extension: (0, mysql_core_1.varchar)("extension", { length: 50 }),
    mimeType: (0, mysql_core_1.varchar)("mime_type", { length: 100 }),
    size: (0, mysql_core_1.bigint)("size", { mode: "number" }),
    uploadedAt: (0, mysql_core_1.timestamp)("uploaded_at").defaultNow(),
    updatedAt: (0, mysql_core_1.timestamp)("updated_at").defaultNow().onUpdateNow(),
});
