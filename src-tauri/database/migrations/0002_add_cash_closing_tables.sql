CREATE TABLE `cash_sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`tenant_id` text NOT NULL,
	`cashier_id` text NOT NULL,
	`cashier_name` text NOT NULL,
	`start_time` text NOT NULL,
	`end_time` text,
	`initial_balances` text NOT NULL,
	`status` text DEFAULT 'open' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `inventory_movements` (
	`id` text PRIMARY KEY NOT NULL,
	`tenant_id` text DEFAULT 'default' NOT NULL,
	`product_id` text NOT NULL,
	`movement_type` text NOT NULL,
	`quantity` integer NOT NULL,
	`previous_stock` integer NOT NULL,
	`new_stock` integer NOT NULL,
	`unit_cost` real,
	`total_cost` real,
	`reason` text NOT NULL,
	`reference_document` text,
	`notes` text,
	`created_by` text DEFAULT 'system' NOT NULL,
	`created_at` text DEFAULT datetime('now') NOT NULL,
	`updated_at` text DEFAULT datetime('now') NOT NULL
);
--> statement-breakpoint
CREATE TABLE `inventory_stats` (
	`id` text PRIMARY KEY NOT NULL,
	`tenant_id` text DEFAULT 'default' NOT NULL,
	`total_products` integer DEFAULT 0 NOT NULL,
	`total_stock` integer DEFAULT 0 NOT NULL,
	`total_value` real DEFAULT 0 NOT NULL,
	`low_stock_count` integer DEFAULT 0 NOT NULL,
	`out_of_stock_count` integer DEFAULT 0 NOT NULL,
	`last_movement_date` text,
	`last_updated` text DEFAULT datetime('now') NOT NULL
);
--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_cash_closings` (
	`id` text PRIMARY KEY NOT NULL,
	`tenant_id` text NOT NULL,
	`session_id` text NOT NULL,
	`cashier_id` text NOT NULL,
	`cashier_name` text NOT NULL,
	`start_time` text NOT NULL,
	`end_time` text NOT NULL,
	`shift_duration` text NOT NULL,
	`initial_balances` text NOT NULL,
	`final_balances` text NOT NULL,
	`balance_differences` text NOT NULL,
	`total_transactions` integer DEFAULT 0 NOT NULL,
	`sales_by_currency` text NOT NULL,
	`sales_by_payment_method` text NOT NULL,
	`total_sales_amount` real DEFAULT 0 NOT NULL,
	`expenses` text DEFAULT '{}' NOT NULL,
	`adjustments` text DEFAULT '{}' NOT NULL,
	`observations` text,
	`status` text DEFAULT 'closed' NOT NULL,
	`audited_by` text,
	`audited_at` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_cash_closings`("id", "tenant_id", "session_id", "cashier_id", "cashier_name", "start_time", "end_time", "shift_duration", "initial_balances", "final_balances", "balance_differences", "total_transactions", "sales_by_currency", "sales_by_payment_method", "total_sales_amount", "expenses", "adjustments", "observations", "status", "audited_by", "audited_at", "created_at", "updated_at") SELECT "id", "tenant_id", "session_id", "cashier_id", "cashier_name", "start_time", "end_time", "shift_duration", "initial_balances", "final_balances", "balance_differences", "total_transactions", "sales_by_currency", "sales_by_payment_method", "total_sales_amount", "expenses", "adjustments", "observations", "status", "audited_by", "audited_at", "created_at", "updated_at" FROM `cash_closings`;--> statement-breakpoint
DROP TABLE `cash_closings`;--> statement-breakpoint
ALTER TABLE `__new_cash_closings` RENAME TO `cash_closings`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
ALTER TABLE `transactions` ADD `cashier_id` text;--> statement-breakpoint
ALTER TABLE `transactions` ADD `sale_id` text;