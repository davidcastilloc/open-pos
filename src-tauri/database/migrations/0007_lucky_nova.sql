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
ALTER TABLE `transactions` ADD `payment_method` text;