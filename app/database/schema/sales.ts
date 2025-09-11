import { createId } from "@paralleldrive/cuid2";
import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const sales = sqliteTable("sales", {
	id: text("id").primaryKey().$defaultFn(() => createId()),
	tenantId: text("tenant_id").notNull(),
	customerId: text("customer_id"),
	subtotal: real("subtotal").notNull(),
	tax: real("tax").notNull().default(0),
	discount: real("discount").notNull().default(0),
	total: real("total").notNull(),
	paymentMethod: text("payment_method").notNull(),
	status: text("status").notNull().default("completed"),
	cashierId: text("cashier_id").notNull(),
	createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
	syncedAt: text("synced_at")
});

export const saleItems = sqliteTable("sale_items", {
	id: text("id").primaryKey().$defaultFn(() => createId()),
	saleId: text("sale_id").notNull(),
	productId: text("product_id").notNull(),
	quantity: integer("quantity").notNull(),
	price: real("price").notNull(),
	total: real("total").notNull(),
	createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString())
});

export const customers = sqliteTable("customers", {
	id: text("id").primaryKey().$defaultFn(() => createId()),
	tenantId: text("tenant_id").notNull(),
	name: text("name").notNull(),
	email: text("email"),
	phone: text("phone"),
	address: text("address"),
	loyaltyPoints: integer("loyalty_points").notNull().default(0),
	isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
	createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
	updatedAt: text("updated_at").notNull().$defaultFn(() => new Date().toISOString())
});

export type Sale = typeof sales.$inferSelect;
export type NewSale = typeof sales.$inferInsert;
export type SaleItem = typeof saleItems.$inferSelect;
export type NewSaleItem = typeof saleItems.$inferInsert;
export type Customer = typeof customers.$inferSelect;
export type NewCustomer = typeof customers.$inferInsert;
