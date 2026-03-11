ALTER TABLE `transactions` ADD COLUMN `sale_id` text;

--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_transactions_created_at` ON `transactions` (`created_at`);

--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_transactions_type` ON `transactions` (`type`);

--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_transactions_sale_id` ON `transactions` (`sale_id`);
