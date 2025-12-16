import { mysqlTable, timestamp, varchar, bigint } from "drizzle-orm/mysql-core";

export const files = mysqlTable("files", {
  id: varchar("id", { length: 36 }).primaryKey(),
  originalName: varchar("original_name", { length: 255 }).notNull(),
  extension: varchar("extension", { length: 50 }),
  mimeType: varchar("mime_type", { length: 100 }),
  size: bigint("size", { mode: "number" }),
  uploadedAt: timestamp("uploaded_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});
