import { createId } from "@paralleldrive/cuid2";
import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

// Tabla principal de devoluciones
export const returns = sqliteTable("returns", {
	id: text("id").primaryKey().$defaultFn(() => createId()),
	tenantId: text("tenant_id").notNull(),
	originalSaleId: text("original_sale_id").notNull(), // Referencia a la venta original
	customerId: text("customer_id"), // Cliente de la venta original
	returnType: text("return_type").notNull(), // "partial" | "total"
	reason: text("reason").notNull(), // Motivo de la devolución
	status: text("status").notNull().default("pending"), // "pending" | "approved" | "rejected" | "completed"

	// Totales de la devolución
	subtotal: real("subtotal").notNull(),
	tax: real("tax").notNull().default(0),
	discount: real("discount").notNull().default(0),
	total: real("total").notNull(),
	currency: text("currency").notNull(),

	// Información del cajero y autorización
	cashierId: text("cashier_id").notNull(),
	authorizedBy: text("authorized_by"), // ID del supervisor que autorizó
	authorizedAt: text("authorized_at"),

	// Metadatos
	notes: text("notes"), // Notas adicionales
	createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
	updatedAt: text("updated_at").notNull().$defaultFn(() => new Date().toISOString()),
	completedAt: text("completed_at") // Cuando se completó la devolución
});

// Items específicos devueltos
export const returnItems = sqliteTable("return_items", {
	id: text("id").primaryKey().$defaultFn(() => createId()),
	returnId: text("return_id").notNull(),
	originalSaleItemId: text("original_sale_item_id").notNull(), // Referencia al item original
	productId: text("product_id").notNull(),
	quantity: integer("quantity").notNull(), // Cantidad devuelta
	originalQuantity: integer("original_quantity").notNull(), // Cantidad original vendida
	price: real("price").notNull(), // Precio unitario al momento de la devolución
	total: real("total").notNull(), // Total del item devuelto
	reason: text("reason"), // Motivo específico del item
	createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString())
});

// Transacciones contables de devoluciones
export const returnTransactions = sqliteTable("return_transactions", {
	id: text("id").primaryKey().$defaultFn(() => createId()),
	returnId: text("return_id").notNull(),
	transactionId: text("transaction_id").notNull(), // Referencia a la transacción contable
	accountId: text("account_id").notNull(),
	amount: real("amount").notNull(),
	currency: text("currency").notNull(),
	exchangeRate: real("exchange_rate"),
	description: text("description"),
	createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString())
});

// Historial de cambios de estado de devoluciones
export const returnStatusHistory = sqliteTable("return_status_history", {
	id: text("id").primaryKey().$defaultFn(() => createId()),
	returnId: text("return_id").notNull(),
	previousStatus: text("previous_status"),
	newStatus: text("new_status").notNull(),
	changedBy: text("changed_by").notNull(), // ID del usuario que hizo el cambio
	reason: text("reason"), // Motivo del cambio de estado
	notes: text("notes"), // Notas adicionales
	createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString())
});

// Tipos TypeScript
export type Return = typeof returns.$inferSelect;
export type NewReturn = typeof returns.$inferInsert;
export type ReturnItem = typeof returnItems.$inferSelect;
export type NewReturnItem = typeof returnItems.$inferInsert;
export type ReturnTransaction = typeof returnTransactions.$inferSelect;
export type NewReturnTransaction = typeof returnTransactions.$inferInsert;
export type ReturnStatusHistory = typeof returnStatusHistory.$inferSelect;
export type NewReturnStatusHistory = typeof returnStatusHistory.$inferInsert;

// Enums para validación
export const ReturnType = {
	PARTIAL: "partial",
	TOTAL: "total"
} as const;

export const ReturnStatus = {
	PENDING: "pending",
	APPROVED: "approved",
	REJECTED: "rejected",
	COMPLETED: "completed"
} as const;

export type ReturnTypeValue = typeof ReturnType[keyof typeof ReturnType];
export type ReturnStatusValue = typeof ReturnStatus[keyof typeof ReturnStatus];
