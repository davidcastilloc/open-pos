import { createId } from "@paralleldrive/cuid2";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const systemConfig = sqliteTable("system_config", {
	id: text("id").primaryKey().$defaultFn(() => createId()),
	tenantId: text("tenant_id").notNull(),
	category: text("category").notNull(), // 'general', 'currency', 'accounts', 'taxes', 'reports', 'integrations'
	key: text("key").notNull(),
	value: text("value").notNull(), // JSON string
	type: text("type").notNull(), // 'string', 'number', 'boolean', 'object', 'array'
	isEditable: integer("is_editable", { mode: "boolean" }).notNull().default(true),
	isRequired: integer("is_required", { mode: "boolean" }).notNull().default(false),
	validation: text("validation"), // JSON string
	description: text("description"),
	createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
	updatedAt: text("updated_at").notNull().$defaultFn(() => new Date().toISOString())
});

export const exchangeRates = sqliteTable("exchange_rates", {
	id: text("id").primaryKey().$defaultFn(() => createId()),
	fromCurrency: text("from_currency").notNull(),
	toCurrency: text("to_currency").notNull(),
	rate: text("rate").notNull(),
	source: text("source").notNull(), // 'BCV', 'DOLAR_API', 'MANUAL'
	date: text("date").notNull(),
	isValid: integer("is_valid", { mode: "boolean" }).notNull().default(true),
	createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString())
});

export const syncQueue = sqliteTable("sync_queue", {
	id: text("id").primaryKey().$defaultFn(() => createId()),
	tenantId: text("tenant_id").notNull(),
	tableName: text("table_name").notNull(),
	recordId: text("record_id").notNull(),
	operation: text("operation").notNull(), // 'insert', 'update', 'delete'
	data: text("data").notNull(), // JSON string
	status: text("status").notNull().default("pending"), // 'pending', 'synced', 'failed'
	retryCount: integer("retry_count").notNull().default(0),
	createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
	updatedAt: text("updated_at").notNull().$defaultFn(() => new Date().toISOString())
});

export type SystemConfig = typeof systemConfig.$inferSelect;
export type NewSystemConfig = typeof systemConfig.$inferInsert;
export type ExchangeRate = typeof exchangeRates.$inferSelect;
export type NewExchangeRate = typeof exchangeRates.$inferInsert;
export type SyncQueue = typeof syncQueue.$inferSelect;
export type NewSyncQueue = typeof syncQueue.$inferInsert;
