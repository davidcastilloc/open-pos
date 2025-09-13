PRAGMA foreign_keys=OFF;

-- Agregar columna payment_method a transactions
ALTER TABLE `transactions` ADD COLUMN `payment_method` text;

-- Crear índice para payment_method
CREATE INDEX IF NOT EXISTS `idx_transactions_payment_method` ON `transactions`(`payment_method`);

PRAGMA foreign_keys=ON;
