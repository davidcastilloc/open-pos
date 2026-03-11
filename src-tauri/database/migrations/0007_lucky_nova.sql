CREATE TABLE `customer_sales` (
	`id` text PRIMARY KEY NOT NULL,
	`customer_id` text NOT NULL,
	`sale_id` text NOT NULL,
	`total_amount` real NOT NULL,
	`currency` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON UPDATE no action ON DELETE no action
);

--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_customer_sales_customer_id` ON `customer_sales`(`customer_id`);

--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_customer_sales_sale_id` ON `customer_sales`(`sale_id`);

--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_customer_sales_created_at` ON `customer_sales`(`created_at`);

--> statement-breakpoint
ALTER TABLE `transactions` ADD `payment_method` text;
