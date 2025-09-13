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
	paymentMethod: text("payment_method"),
	cashierId: text("cashier_id"),
	saleId: text("sale_id"),
	createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString())
});

// Tabla para sesiones de caja activas
export const cashSessions = sqliteTable("cash_sessions", {
	id: text("id").primaryKey().$defaultFn(() => createId()),
	tenantId: text("tenant_id").notNull(),
	cashierId: text("cashier_id").notNull(),
	cashierName: text("cashier_name").notNull(),
	startTime: text("start_time").notNull(),
	endTime: text("end_time"),
	initialBalances: text("initial_balances").notNull(), // JSON string
	status: text("status").notNull().default("open"), // 'open', 'closed'
	createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
	updatedAt: text("updated_at").notNull().$defaultFn(() => new Date().toISOString())
});

// Tabla para cierres de caja
export const cashClosings = sqliteTable("cash_closings", {
	id: text("id").primaryKey().$defaultFn(() => createId()),
	tenantId: text("tenant_id").notNull(),
	sessionId: text("session_id").notNull(), // Referencia a cash_sessions
	cashierId: text("cashier_id").notNull(),
	cashierName: text("cashier_name").notNull(),
	startTime: text("start_time").notNull(),
	endTime: text("end_time").notNull(),
	shiftDuration: text("shift_duration").notNull(), // HH:MM:SS

	// Balances
	initialBalances: text("initial_balances").notNull(), // JSON string
	finalBalances: text("final_balances").notNull(), // JSON string
	balanceDifferences: text("balance_differences").notNull(), // JSON string

	// Resumen de ventas
	totalTransactions: integer("total_transactions").notNull().default(0),
	salesByCurrency: text("sales_by_currency").notNull(), // JSON string
	salesByPaymentMethod: text("sales_by_payment_method").notNull(), // JSON string
	totalSalesAmount: real("total_sales_amount").notNull().default(0),

	// Gastos y movimientos
	expenses: text("expenses").notNull().default("{}"), // JSON string
	adjustments: text("adjustments").notNull().default("{}"), // JSON string

	// Observaciones y estado
	observations: text("observations"),
	status: text("status").notNull().default("closed"), // 'closed', 'audited', 'approved'
	auditedBy: text("audited_by"),
	auditedAt: text("audited_at"),

	// Metadatos
	createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
	updatedAt: text("updated_at").notNull().$defaultFn(() => new Date().toISOString())
});

export type Account = typeof accounts.$inferSelect;
export type NewAccount = typeof accounts.$inferInsert;
export type Transaction = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;
export type CashSession = typeof cashSessions.$inferSelect;
export type NewCashSession = typeof cashSessions.$inferInsert;
export type CashClosing = typeof cashClosings.$inferSelect;
export type NewCashClosing = typeof cashClosings.$inferInsert;
