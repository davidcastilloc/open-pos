-- Add columns for better traceability
ALTER TABLE `transactions` ADD COLUMN `cashier_id` text;
ALTER TABLE `transactions` ADD COLUMN `sale_id` text;

-- Indexes to speed up queries used in cash closing and reporting
CREATE INDEX IF NOT EXISTS `idx_transactions_account_id` ON `transactions` (`account_id`);
CREATE INDEX IF NOT EXISTS `idx_transactions_created_at` ON `transactions` (`created_at`);
CREATE INDEX IF NOT EXISTS `idx_transactions_type` ON `transactions` (`type`);
CREATE INDEX IF NOT EXISTS `idx_transactions_sale_id` ON `transactions` (`sale_id`);

