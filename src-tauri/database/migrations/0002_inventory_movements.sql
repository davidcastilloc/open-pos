-- CreateTable
CREATE TABLE IF NOT EXISTS `inventory_movements` (
	`id` TEXT PRIMARY KEY NOT NULL,
	`tenant_id` TEXT NOT NULL DEFAULT 'default',
	`product_id` TEXT NOT NULL,
	`movement_type` TEXT NOT NULL,
	`quantity` INTEGER NOT NULL,
	`previous_stock` INTEGER NOT NULL,
	`new_stock` INTEGER NOT NULL,
	`unit_cost` REAL,
	`total_cost` REAL,
	`reason` TEXT NOT NULL,
	`reference_document` TEXT,
	`notes` TEXT,
	`created_by` TEXT NOT NULL DEFAULT 'system',
	`created_at` TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE IF NOT EXISTS `inventory_stats` (
	`id` TEXT PRIMARY KEY NOT NULL,
	`tenant_id` TEXT NOT NULL DEFAULT 'default',
	`total_products` INTEGER NOT NULL DEFAULT 0,
	`total_stock` INTEGER NOT NULL DEFAULT 0,
	`total_value` REAL NOT NULL DEFAULT 0,
	`low_stock_count` INTEGER NOT NULL DEFAULT 0,
	`out_of_stock_count` INTEGER NOT NULL DEFAULT 0,
	`last_movement_date` TEXT,
	`last_updated` TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX `idx_inventory_movements_product_id` ON `inventory_movements`(`product_id`);

-- CreateIndex
CREATE INDEX `idx_inventory_movements_tenant_id` ON `inventory_movements`(`tenant_id`);

-- CreateIndex
CREATE INDEX `idx_inventory_movements_created_at` ON `inventory_movements`(`created_at`);

-- CreateIndex
CREATE INDEX `idx_inventory_movements_movement_type` ON `inventory_movements`(`movement_type`);

-- CreateIndex
CREATE INDEX `idx_inventory_stats_tenant_id` ON `inventory_stats`(`tenant_id`);
