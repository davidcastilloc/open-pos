import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

// Tabla de clientes
export const customers = sqliteTable("customers", {
	id: text("id").primaryKey(),
	tenantId: text("tenant_id").notNull().default("default"),
	name: text("name").notNull(),
	email: text("email"),
	phone: text("phone"),
	address: text("address"),
	documentType: text("document_type"), // 'cedula', 'rif', 'passport'
	documentNumber: text("document_number"),
	birthDate: text("birth_date"), // ISO date string
	notes: text("notes"),
	isActive: integer("is_active", { mode: "boolean" }).default(true),
	createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
	updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`)
});

// Tabla de ventas de clientes (para historial)
export const customerSales = sqliteTable("customer_sales", {
	id: text("id").primaryKey(),
	customerId: text("customer_id").notNull().references(() => customers.id),
	saleId: text("sale_id").notNull(),
	totalAmount: real("total_amount").notNull(),
	currency: text("currency").notNull(),
	createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`)
});

// Tipos TypeScript
export type Customer = typeof customers.$inferSelect;
export type NewCustomer = typeof customers.$inferInsert;

export type CustomerSale = typeof customerSales.$inferSelect;
export type NewCustomerSale = typeof customerSales.$inferInsert;
