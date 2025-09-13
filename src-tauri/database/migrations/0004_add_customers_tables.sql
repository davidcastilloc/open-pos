PRAGMA foreign_keys=OFF;

-- Crear tabla customers
CREATE TABLE IF NOT EXISTS `customers` (
	`id` text PRIMARY KEY NOT NULL,
	`tenant_id` text DEFAULT 'default' NOT NULL,
	`name` text NOT NULL,
	`email` text,
	`phone` text,
	`address` text,
	`document_type` text,
	`document_number` text,
	`birth_date` text,
	`notes` text,
	`is_active` integer DEFAULT 1,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla customer_sales
CREATE TABLE IF NOT EXISTS `customer_sales` (
	`id` text PRIMARY KEY NOT NULL,
	`customer_id` text NOT NULL,
	`sale_id` text NOT NULL,
	`total_amount` real NOT NULL,
	`currency` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`sale_id`) REFERENCES `sales`(`id`) ON UPDATE no action ON DELETE cascade
);

-- Crear índices para optimizar búsquedas
CREATE INDEX IF NOT EXISTS `idx_customers_tenant_id` ON `customers`(`tenant_id`);
CREATE INDEX IF NOT EXISTS `idx_customers_name` ON `customers`(`name`);
CREATE INDEX IF NOT EXISTS `idx_customers_email` ON `customers`(`email`);
CREATE INDEX IF NOT EXISTS `idx_customers_phone` ON `customers`(`phone`);
CREATE INDEX IF NOT EXISTS `idx_customers_document_number` ON `customers`(`document_number`);
CREATE INDEX IF NOT EXISTS `idx_customers_is_active` ON `customers`(`is_active`);

CREATE INDEX IF NOT EXISTS `idx_customer_sales_customer_id` ON `customer_sales`(`customer_id`);
CREATE INDEX IF NOT EXISTS `idx_customer_sales_sale_id` ON `customer_sales`(`sale_id`);
CREATE INDEX IF NOT EXISTS `idx_customer_sales_created_at` ON `customer_sales`(`created_at`);

PRAGMA foreign_keys=ON;
