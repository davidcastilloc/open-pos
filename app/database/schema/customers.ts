import { sql } from "drizzle-orm";
import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

// Tabla de clientes
export const customers = sqliteTable("customers", {
	id: text("id").primaryKey(),
	tenantId: text("tenant_id").notNull().default("default"),
	name: text("name").notNull(),
	email: text("email"),
	phone: text("phone"),
	address: text("address"),
	loyaltyPoints: integer("loyalty_points").notNull().default(0),
	isActive: integer("is_active", { mode: "boolean" }).default(true),
	createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
	updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
	documentType: text("document_type"), // 'cedula', 'rif', 'passport'
	documentNumber: text("document_number"),
	birthDate: text("birth_date"), // ISO date string
	notes: text("notes")
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
