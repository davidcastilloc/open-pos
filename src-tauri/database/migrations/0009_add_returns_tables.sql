-- Migration: Add returns tables
-- Created: 2024-12-19

-- Tabla principal de devoluciones
CREATE TABLE IF NOT EXISTS "returns" (
	"id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"original_sale_id" text NOT NULL,
	"customer_id" text,
	"return_type" text NOT NULL,
	"reason" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"subtotal" real NOT NULL,
	"tax" real DEFAULT 0 NOT NULL,
	"discount" real DEFAULT 0 NOT NULL,
	"total" real NOT NULL,
	"currency" text NOT NULL,
	"cashier_id" text NOT NULL,
	"authorized_by" text,
	"authorized_at" text,
	"notes" text,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL,
	"completed_at" text
);

-- Items específicos devueltos
CREATE TABLE IF NOT EXISTS "return_items" (
	"id" text PRIMARY KEY NOT NULL,
	"return_id" text NOT NULL,
	"original_sale_item_id" text NOT NULL,
	"product_id" text NOT NULL,
	"quantity" integer NOT NULL,
	"original_quantity" integer NOT NULL,
	"price" real NOT NULL,
	"total" real NOT NULL,
	"reason" text,
	"created_at" text NOT NULL
);

-- Transacciones contables de devoluciones
CREATE TABLE IF NOT EXISTS "return_transactions" (
	"id" text PRIMARY KEY NOT NULL,
	"return_id" text NOT NULL,
	"transaction_id" text NOT NULL,
	"account_id" text NOT NULL,
	"amount" real NOT NULL,
	"currency" text NOT NULL,
	"exchange_rate" real,
	"description" text,
	"created_at" text NOT NULL
);

-- Historial de cambios de estado de devoluciones
CREATE TABLE IF NOT EXISTS "return_status_history" (
	"id" text PRIMARY KEY NOT NULL,
	"return_id" text NOT NULL,
	"previous_status" text,
	"new_status" text NOT NULL,
	"changed_by" text NOT NULL,
	"reason" text,
	"notes" text,
	"created_at" text NOT NULL
);

-- Índices para optimizar consultas
CREATE INDEX IF NOT EXISTS "idx_returns_original_sale_id" ON "returns" ("original_sale_id");
CREATE INDEX IF NOT EXISTS "idx_returns_customer_id" ON "returns" ("customer_id");
CREATE INDEX IF NOT EXISTS "idx_returns_status" ON "returns" ("status");
CREATE INDEX IF NOT EXISTS "idx_returns_created_at" ON "returns" ("created_at");
CREATE INDEX IF NOT EXISTS "idx_return_items_return_id" ON "return_items" ("return_id");
CREATE INDEX IF NOT EXISTS "idx_return_items_product_id" ON "return_items" ("product_id");
CREATE INDEX IF NOT EXISTS "idx_return_transactions_return_id" ON "return_transactions" ("return_id");
CREATE INDEX IF NOT EXISTS "idx_return_status_history_return_id" ON "return_status_history" ("return_id");
