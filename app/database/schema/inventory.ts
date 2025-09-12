import { sql } from "drizzle-orm";
import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

// Tabla de movimientos de inventario
export const inventoryMovements = sqliteTable("inventory_movements", {
	id: text("id").primaryKey(),
	tenantId: text("tenant_id").notNull().default("default"),
	productId: text("product_id").notNull(),
	movementType: text("movement_type", { 
		enum: ["entry", "exit", "adjustment", "transfer", "sale", "return"] 
	}).notNull(),
	quantity: integer("quantity").notNull(),
	previousStock: integer("previous_stock").notNull(),
	newStock: integer("new_stock").notNull(),
	unitCost: real("unit_cost"),
	totalCost: real("total_cost"),
	reason: text("reason").notNull(),
	referenceDocument: text("reference_document"),
	notes: text("notes"),
	createdBy: text("created_by").notNull().default("system"),
	createdAt: text("created_at").notNull().default(sql`datetime('now')`),
	updatedAt: text("updated_at").notNull().default(sql`datetime('now')`)
});

// Tabla de estadísticas de inventario (cache)
export const inventoryStats = sqliteTable("inventory_stats", {
	id: text("id").primaryKey(),
	tenantId: text("tenant_id").notNull().default("default"),
	totalProducts: integer("total_products").notNull().default(0),
	totalStock: integer("total_stock").notNull().default(0),
	totalValue: real("total_value").notNull().default(0),
	lowStockCount: integer("low_stock_count").notNull().default(0),
	outOfStockCount: integer("out_of_stock_count").notNull().default(0),
	lastMovementDate: text("last_movement_date"),
	lastUpdated: text("last_updated").notNull().default(sql`datetime('now')`)
});

// Tipos TypeScript
export type InventoryMovement = typeof inventoryMovements.$inferSelect;
export type NewInventoryMovement = typeof inventoryMovements.$inferInsert;
export type InventoryStats = typeof inventoryStats.$inferSelect;
export type NewInventoryStats = typeof inventoryStats.$inferInsert;
