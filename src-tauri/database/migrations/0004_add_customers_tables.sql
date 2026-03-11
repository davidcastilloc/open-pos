PRAGMA foreign_keys=OFF;

--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_customers_name` ON `customers`(`name`);

--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_customers_email` ON `customers`(`email`);

--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_customers_phone` ON `customers`(`phone`);

--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_customers_is_active` ON `customers`(`is_active`);

--> statement-breakpoint
PRAGMA foreign_keys=ON;
