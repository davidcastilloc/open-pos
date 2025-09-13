CREATE TABLE IF NOT EXISTS `cash_sessions` (
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
CREATE TABLE IF NOT EXISTS `inventory_movements` (
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
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `inventory_stats` (
	`id` text PRIMARY KEY NOT NULL,
	`tenant_id` text DEFAULT 'default' NOT NULL,
	`total_products` integer DEFAULT 0 NOT NULL,
	`total_stock` integer DEFAULT 0 NOT NULL,
	`total_value` real DEFAULT 0 NOT NULL,
	`low_stock_count` integer DEFAULT 0 NOT NULL,
	`out_of_stock_count` integer DEFAULT 0 NOT NULL,
	`last_movement_date` text,
	`last_updated` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);