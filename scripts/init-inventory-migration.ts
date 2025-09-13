#!/usr/bin/env node

// Script para inicializar las tablas de inventario usando el sistema del proyecto
import Database from "@tauri-apps/plugin-sql";

const createInventoryTables = async () => {
	console.log("🔄 Inicializando tablas de inventario...");

	try {
		// Conectar a la base de datos usando el plugin de Tauri
		const db = await Database.load("sqlite:pos.db");

		// Crear tabla de movimientos de inventario
		console.log("📝 Creando tabla inventory_movements...");

		await db.execute(`
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
				updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
				
				FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
			)
		`);

		// Crear índices para optimizar las consultas
		console.log("🔍 Creando índices...");

		const indices = [
			"CREATE INDEX IF NOT EXISTS idx_inventory_movements_product_id ON inventory_movements(product_id)",
			"CREATE INDEX IF NOT EXISTS idx_inventory_movements_type ON inventory_movements(movement_type)",
			"CREATE INDEX IF NOT EXISTS idx_inventory_movements_date ON inventory_movements(created_at)",
			"CREATE INDEX IF NOT EXISTS idx_inventory_movements_tenant ON inventory_movements(tenant_id)",
			"CREATE INDEX IF NOT EXISTS idx_inventory_movements_reference ON inventory_movements(reference_document)"
		];

		for (const index of indices) {
			await db.execute(index);
		}

		// Crear tabla de configuración de inventario
		console.log("📝 Creando tabla inventory_config...");

		await db.execute(`
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
		console.log("⚙️ Insertando configuración por defecto...");

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
			await db.execute(`
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
		}

		// Verificar la estructura creada
		console.log("🔍 Verificando estructura de base de datos...");

		const movementsCount = await db.select("SELECT COUNT(*) as count FROM inventory_movements");
		const configCount = await db.select("SELECT COUNT(*) as count FROM inventory_config");

		console.log("📊 Resumen:");
		console.log(`  - Movimientos existentes: ${movementsCount[0]?.count || 0}`);
		console.log(`  - Configuraciones: ${configCount[0]?.count || 0}`);

		console.log("✅ Tablas de inventario creadas exitosamente");

		// Cerrar conexión
		await db.close();
	} catch (error) {
		console.error("❌ Error creando tablas de inventario:", error);
		throw error;
	}
};

// Ejecutar solo si es el módulo principal
if (import.meta.url === `file://${process.argv[1]}`) {
	createInventoryTables()
		.then(() => {
			console.log("🎉 Proceso completado");
			process.exit(0);
		})
		.catch((error) => {
			console.error("💥 Error en el proceso:", error);
			process.exit(1);
		});
}

export { createInventoryTables };
