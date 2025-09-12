import { createId } from "@paralleldrive/cuid2";
import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const accounts = sqliteTable("accounts", {
	id: text("id").primaryKey().$defaultFn(() => createId()),
	tenantId: text("tenant_id").notNull(),
	name: text("name").notNull(),
	type: text("type").notNull(), // 'cash', 'bank', 'credit', 'other'
	currency: text("currency").notNull(), // 'BS', 'USD', 'EUR'
	bankName: text("bank_name"),
	accountNumber: text("account_number"),
	isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
	balance: real("balance").notNull().default(0),
	minBalance: real("min_balance").notNull().default(0),
	maxBalance: real("max_balance"),
	createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
	updatedAt: text("updated_at").notNull().$defaultFn(() => new Date().toISOString())
});

export const transactions = sqliteTable("transactions", {
	id: text("id").primaryKey().$defaultFn(() => createId()),
	tenantId: text("tenant_id").notNull(),
	accountId: text("account_id").notNull(),
	type: text("type").notNull(), // 'sale', 'expense', 'transfer', 'adjustment'
	amount: real("amount").notNull(),
	currency: text("currency").notNull(),
	exchangeRate: real("exchange_rate"),
	reference: text("reference"),
	description: text("description"),
	cashierId: text("cashier_id"),
	saleId: text("sale_id"),
	createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString())
});

export const cashClosings = sqliteTable("cash_closings", {
	id: text("id").primaryKey().$defaultFn(() => createId()),
	tenantId: text("tenant_id").notNull(),
	cashierId: text("cashier_id").notNull(),
	date: text("date").notNull(),
	accountId: text("account_id").notNull(),
	initialBalance: text("initial_balance").notNull(), // JSON string
	sales: text("sales").notNull(), // JSON string
	expenses: text("expenses").notNull(), // JSON string
	finalBalance: text("final_balance").notNull(), // JSON string
	difference: text("difference").notNull(), // JSON string
	status: text("status").notNull().default("open"), // 'open', 'closed', 'audited'
	notes: text("notes"),
	createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
	closedAt: text("closed_at")
});

export type Account = typeof accounts.$inferSelect;
export type NewAccount = typeof accounts.$inferInsert;
export type Transaction = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;
export type CashClosing = typeof cashClosings.$inferSelect;
export type NewCashClosing = typeof cashClosings.$inferInsert;
