CREATE TABLE `accounts` (
	`id` text PRIMARY KEY NOT NULL,
	`tenant_id` text NOT NULL,
	`name` text NOT NULL,
	`type` text NOT NULL,
	`currency` text NOT NULL,
	`bank_name` text,
	`account_number` text,
	`is_active` integer DEFAULT true NOT NULL,
	`balance` real DEFAULT 0 NOT NULL,
	`min_balance` real DEFAULT 0 NOT NULL,
	`max_balance` real,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `cash_closings` (
	`id` text PRIMARY KEY NOT NULL,
	`tenant_id` text NOT NULL,
	`cashier_id` text NOT NULL,
	`date` text NOT NULL,
	`account_id` text NOT NULL,
	`initial_balance` text NOT NULL,
	`sales` text NOT NULL,
	`expenses` text NOT NULL,
	`final_balance` text NOT NULL,
	`difference` text NOT NULL,
	`status` text DEFAULT 'open' NOT NULL,
	`notes` text,
	`created_at` text NOT NULL,
	`closed_at` text
);
--> statement-breakpoint
CREATE TABLE `transactions` (
	`id` text PRIMARY KEY NOT NULL,
	`tenant_id` text NOT NULL,
	`account_id` text NOT NULL,
	`type` text NOT NULL,
	`amount` real NOT NULL,
	`currency` text NOT NULL,
	`exchange_rate` real,
	`reference` text,
	`description` text,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `exchange_rates` (
	`id` text PRIMARY KEY NOT NULL,
	`from_currency` text NOT NULL,
	`to_currency` text NOT NULL,
	`rate` text NOT NULL,
	`source` text NOT NULL,
	`date` text NOT NULL,
	`is_valid` integer DEFAULT true NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `sync_queue` (
	`id` text PRIMARY KEY NOT NULL,
	`tenant_id` text NOT NULL,
	`table_name` text NOT NULL,
	`record_id` text NOT NULL,
	`operation` text NOT NULL,
	`data` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`retry_count` integer DEFAULT 0 NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `system_config` (
	`id` text PRIMARY KEY NOT NULL,
	`tenant_id` text NOT NULL,
	`category` text NOT NULL,
	`key` text NOT NULL,
	`value` text NOT NULL,
	`type` text NOT NULL,
	`is_editable` integer DEFAULT true NOT NULL,
	`is_required` integer DEFAULT false NOT NULL,
	`validation` text,
	`description` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `categories` (
	`id` text PRIMARY KEY NOT NULL,
	`tenant_id` text NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` text PRIMARY KEY NOT NULL,
	`tenant_id` text NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`sku` text NOT NULL,
	`barcode` text,
	`price` real NOT NULL,
	`cost` real NOT NULL,
	`category_id` text,
	`stock` integer DEFAULT 0 NOT NULL,
	`min_stock` integer DEFAULT 0 NOT NULL,
	`images` text,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`synced_at` text
);
--> statement-breakpoint
CREATE TABLE `customers` (
	`id` text PRIMARY KEY NOT NULL,
	`tenant_id` text NOT NULL,
	`name` text NOT NULL,
	`email` text,
	`phone` text,
	`address` text,
	`loyalty_points` integer DEFAULT 0 NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `sale_items` (
	`id` text PRIMARY KEY NOT NULL,
	`sale_id` text NOT NULL,
	`product_id` text NOT NULL,
	`quantity` integer NOT NULL,
	`price` real NOT NULL,
	`total` real NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `sales` (
	`id` text PRIMARY KEY NOT NULL,
	`tenant_id` text NOT NULL,
	`customer_id` text,
	`subtotal` real NOT NULL,
	`tax` real DEFAULT 0 NOT NULL,
	`discount` real DEFAULT 0 NOT NULL,
	`total` real NOT NULL,
	`payment_method` text NOT NULL,
	`status` text DEFAULT 'completed' NOT NULL,
	`cashier_id` text NOT NULL,
	`created_at` text NOT NULL,
	`synced_at` text
);
