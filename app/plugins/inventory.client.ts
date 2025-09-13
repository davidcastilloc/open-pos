// Plugin para inicializar el sistema de inventario
export default defineNuxtPlugin(async () => {
	// Solo ejecutar en el cliente (Tauri)
	if (import.meta.server) return;

	try {
		console.log("🔄 Inicializando sistema de inventario...");

		const { execute, isReady } = useDatabase();

		// Esperar a que la base de datos esté conectada
		const maxRetries = 10;
		let retries = 0;

		while (!isReady.value && retries < maxRetries) {
			await new Promise((resolve) => setTimeout(resolve, 500));
			retries++;
		}

		if (!isReady.value) {
			console.warn("⚠️ Base de datos no disponible, saltando inicialización de inventario");
			return;
		}

		// Crear tabla de movimientos de inventario
		await execute(`
			CREATE TABLE IF NOT EXISTS inventory_movements (
				id TEXT PRIMARY KEY,
				tenant_id TEXT NOT NULL DEFAULT 'default',
				product_id TEXT NOT NULL,
				movement_type TEXT NOT NULL CHECK(movement_type IN ('entry', 'exit', 'adjustment', 'transfer', 'sale', 'return')),
				quantity INTEGER NOT NULL CHECK(quantity != 0),
				previous_stock INTEGER NOT NULL CHECK(previous_stock >= 0),
				new_stock INTEGER NOT NULL CHECK(new_stock >= 0),
				unit_cost DECIMAL(10,2) CHECK(unit_cost >= 0),
				total_cost DECIMAL(10,2) CHECK(total_cost >= 0),
				reason TEXT NOT NULL,
				reference_document TEXT,
				notes TEXT,
				created_by TEXT NOT NULL DEFAULT 'system',
				created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
				updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
			)
		`);

		// Crear índices para optimizar las consultas
		const indices = [
			"CREATE INDEX IF NOT EXISTS idx_inventory_movements_product_id ON inventory_movements(product_id)",
			"CREATE INDEX IF NOT EXISTS idx_inventory_movements_type ON inventory_movements(movement_type)",
			"CREATE INDEX IF NOT EXISTS idx_inventory_movements_date ON inventory_movements(created_at)",
			"CREATE INDEX IF NOT EXISTS idx_inventory_movements_tenant ON inventory_movements(tenant_id)",
			"CREATE INDEX IF NOT EXISTS idx_inventory_movements_reference ON inventory_movements(reference_document)"
		];

		for (const index of indices) {
			await execute(index);
		}

		// Crear tabla de configuración de inventario
		await execute(`
			CREATE TABLE IF NOT EXISTS inventory_config (
				id TEXT PRIMARY KEY,
				tenant_id TEXT NOT NULL DEFAULT 'default',
				config_key TEXT NOT NULL,
				config_value TEXT NOT NULL,
				config_type TEXT NOT NULL DEFAULT 'string',
				description TEXT,
				created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
				updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
				
				UNIQUE(tenant_id, config_key)
			)
		`);

		// Insertar configuración por defecto
		const defaultConfigs = [
			{
				id: "inv_auto_record_sales",
				key: "auto_record_sales",
				value: "true",
				type: "boolean",
				description: "Registrar automáticamente movimientos de inventario en ventas"
			},
			{
				id: "inv_require_reason",
				key: "require_movement_reason",
				value: "true",
				type: "boolean",
				description: "Requerir razón para todos los movimientos de inventario"
			},
			{
				id: "inv_low_stock_threshold",
				key: "low_stock_global_threshold",
				value: "10",
				type: "number",
				description: "Umbral global para stock bajo (si el producto no tiene min_stock definido)"
			},
			{
				id: "inv_enable_cost_tracking",
				key: "enable_cost_tracking",
				value: "true",
				type: "boolean",
				description: "Habilitar seguimiento de costos en movimientos"
			},
			{
				id: "inv_movement_retention_days",
				key: "movement_retention_days",
				value: "365",
				type: "number",
				description: "Días de retención de movimientos de inventario (0 = sin límite)"
			}
		];

		for (const config of defaultConfigs) {
			try {
				await execute(`
					INSERT OR IGNORE INTO inventory_config 
					(id, tenant_id, config_key, config_value, config_type, description)
					VALUES (?, ?, ?, ?, ?, ?)
				`, [
					config.id,
					"default",
					config.key,
					config.value,
					config.type,
					config.description
				]);
			} catch (error) {
				console.warn(`⚠️ Error insertando configuración ${config.key}:`, error);
			}
		}

		console.log("✅ Sistema de inventario inicializado correctamente");
	} catch (error) {
		console.error("❌ Error inicializando sistema de inventario:", error);
	}
});
