#!/usr/bin/env node

/**
 * Script para ejecutar la migración de devoluciones
 * Ejecuta la migración 0009_add_returns_tables.sql
 */

const fs = require("node:fs");
const path = require("node:path");
const { Database } = require("bun:sqlite");

const MIGRATION_FILE = path.join(__dirname, "../src-tauri/database/migrations/0009_add_returns_tables.sql");
const DB_PATH = path.join(__dirname, "../src-tauri/database/pos.db");

async function runMigration() {
	try {
		console.log("🔄 Iniciando migración de devoluciones...");

		// Verificar que existe el archivo de migración
		if (!fs.existsSync(MIGRATION_FILE)) {
			throw new Error(`Archivo de migración no encontrado: ${MIGRATION_FILE}`);
		}

		// Leer el archivo de migración
		const migrationSQL = fs.readFileSync(MIGRATION_FILE, "utf8");
		console.log("📄 Archivo de migración leído correctamente");

		// Conectar a la base de datos
		const db = new Database(DB_PATH);
		console.log("🗄️ Conectado a la base de datos");

		// Ejecutar la migración
		console.log("⚡ Ejecutando migración...");
		db.exec(migrationSQL);

		// Verificar que las tablas se crearon correctamente
		const tables = db.prepare(`
            SELECT name FROM sqlite_master 
            WHERE type='table' AND name LIKE 'return%'
        `).all();

		console.log("✅ Tablas de devoluciones creadas:");
		tables.forEach((table) => {
			console.log(`   - ${table.name}`);
		});

		// Verificar índices
		const indexes = db.prepare(`
            SELECT name FROM sqlite_master 
            WHERE type='index' AND name LIKE 'idx_return%'
        `).all();

		console.log("✅ Índices creados:");
		indexes.forEach((index) => {
			console.log(`   - ${index.name}`);
		});

		db.close();
		console.log("🎉 Migración de devoluciones completada exitosamente");
	} catch (error) {
		console.error("❌ Error ejecutando migración:", error.message);
		process.exit(1);
	}
}

// Ejecutar si es llamado directamente
if (require.main === module) {
	runMigration();
}

module.exports = { runMigration };
