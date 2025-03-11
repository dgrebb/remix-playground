import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const projects = sqliteTable("projects", {
  id: text("id").notNull(),
  uuid: text("uuid").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  requirements: text("requirements"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

// Types
export type Project = typeof projects.$inferSelect;
export type InsertProject = typeof projects.$inferInsert;
