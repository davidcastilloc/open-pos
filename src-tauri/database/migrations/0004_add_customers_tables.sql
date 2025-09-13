PRAGMA foreign_keys=OFF;

CREATE INDEX IF NOT EXISTS `idx_customers_name` ON `customers`(`name`);

CREATE INDEX IF NOT EXISTS `idx_customers_email` ON `customers`(`email`);

CREATE INDEX IF NOT EXISTS `idx_customers_phone` ON `customers`(`phone`);

CREATE INDEX IF NOT EXISTS `idx_customers_document_number` ON `customers`(`document_number`);

CREATE INDEX IF NOT EXISTS `idx_customers_is_active` ON `customers`(`is_active`);

CREATE INDEX IF NOT EXISTS `idx_customer_sales_customer_id` ON `customer_sales`(`customer_id`);

CREATE INDEX IF NOT EXISTS `idx_customer_sales_sale_id` ON `customer_sales`(`sale_id`);

CREATE INDEX IF NOT EXISTS `idx_customer_sales_created_at` ON `customer_sales`(`created_at`);

PRAGMA foreign_keys=ON;