#!/usr/bin/env node

// Script para crear las tablas de inventario
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function createInventoryTables() {
  console.log('🔄 Creando tablas de inventario...');

  // Conectar a la base de datos
  const dbPath = path.join(__dirname, '../src-tauri/pos.db');
  const db = new Database(dbPath);

  try {
    // Crear tabla de movimientos de inventario
    console.log('📝 Creando tabla inventory_movements...');
    
    db.exec(`
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
    console.log('🔍 Creando índices...');
    
    db.exec(`
      CREATE INDEX IF NOT EXISTS idx_inventory_movements_product_id ON inventory_movements(product_id);
      CREATE INDEX IF NOT EXISTS idx_inventory_movements_type ON inventory_movements(movement_type);
      CREATE INDEX IF NOT EXISTS idx_inventory_movements_date ON inventory_movements(created_at);
      CREATE INDEX IF NOT EXISTS idx_inventory_movements_tenant ON inventory_movements(tenant_id);
      CREATE INDEX IF NOT EXISTS idx_inventory_movements_reference ON inventory_movements(reference_document);
    `);

    // Crear tabla de configuración de inventario (para futuros features)
    console.log('📝 Creando tabla inventory_config...');
    
    db.exec(`
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
    console.log('⚙️ Insertando configuración por defecto...');
    
    const defaultConfigs = [
      {
        id: 'inv_auto_record_sales',
        key: 'auto_record_sales',
        value: 'true',
        type: 'boolean',
        description: 'Registrar automáticamente movimientos de inventario en ventas'
      },
      {
        id: 'inv_require_reason',
        key: 'require_movement_reason',
        value: 'true',
        type: 'boolean',
        description: 'Requerir razón para todos los movimientos de inventario'
      },
      {
        id: 'inv_low_stock_threshold',
        key: 'low_stock_global_threshold',
        value: '10',
        type: 'number',
        description: 'Umbral global para stock bajo (si el producto no tiene min_stock definido)'
      },
      {
        id: 'inv_enable_cost_tracking',
        key: 'enable_cost_tracking',
        value: 'true',
        type: 'boolean',
        description: 'Habilitar seguimiento de costos en movimientos'
      },
      {
        id: 'inv_movement_retention_days',
        key: 'movement_retention_days',
        value: '365',
        type: 'number',
        description: 'Días de retención de movimientos de inventario (0 = sin límite)'
      }
    ];

    const insertConfig = db.prepare(`
      INSERT OR IGNORE INTO inventory_config 
      (id, tenant_id, config_key, config_value, config_type, description)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    for (const config of defaultConfigs) {
      insertConfig.run(
        config.id,
        'default',
        config.key,
        config.value,
        config.type,
        config.description
      );
    }

    // Crear algunos movimientos de ejemplo (solo si no existen)
    console.log('📦 Creando datos de ejemplo...');
    
    const existingMovements = db.prepare('SELECT COUNT(*) as count FROM inventory_movements').get();
    
    if (existingMovements.count === 0) {
      // Obtener algunos productos para crear movimientos de ejemplo
      const products = db.prepare('SELECT id, name, stock FROM products LIMIT 5').all();
      
      if (products.length > 0) {
        const insertMovement = db.prepare(`
          INSERT INTO inventory_movements 
          (id, tenant_id, product_id, movement_type, quantity, previous_stock, new_stock, reason, created_by, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        for (let i = 0; i < products.length; i++) {
          const product = products[i];
          const movementId = `mov_example_${Date.now()}_${i}`;
          const entryQuantity = 50;
          const previousStock = Math.max(0, product.stock - entryQuantity);
          
          // Movimiento de entrada inicial
          insertMovement.run(
            movementId,
            'default',
            product.id,
            'entry',
            entryQuantity,
            previousStock,
            product.stock,
            'Stock inicial del sistema',
            'system',
            new Date(Date.now() - (i * 86400000)).toISOString() // Días anteriores
          );
        }
        
        console.log(`✅ Creados ${products.length} movimientos de ejemplo`);
      }
    }

    // Verificar la estructura creada
    console.log('🔍 Verificando estructura de base de datos...');
    
    const movementsTableInfo = db.prepare("PRAGMA table_info(inventory_movements)").all();
    const configTableInfo = db.prepare("PRAGMA table_info(inventory_config)").all();
    const movementsCount = db.prepare("SELECT COUNT(*) as count FROM inventory_movements").get();
    const configCount = db.prepare("SELECT COUNT(*) as count FROM inventory_config").get();

    console.log('📊 Resumen:');
    console.log(`  - Tabla inventory_movements: ${movementsTableInfo.length} columnas`);
    console.log(`  - Tabla inventory_config: ${configTableInfo.length} columnas`);
    console.log(`  - Movimientos existentes: ${movementsCount.count}`);
    console.log(`  - Configuraciones: ${configCount.count}`);

    console.log('✅ Tablas de inventario creadas exitosamente');

  } catch (error) {
    console.error('❌ Error creando tablas de inventario:', error);
    throw error;
  } finally {
    db.close();
  }
}

// Ejecutar si es llamado directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  createInventoryTables()
    .then(() => {
      console.log('🎉 Proceso completado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Error en el proceso:', error);
      process.exit(1);
    });
}

export { createInventoryTables };