import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";

// Crear conexión a SQLite
const sqlite = new Database("./database/pos.db");

// Configurar Drizzle ORM
export const db = drizzle(sqlite, { schema });

// Función para inicializar la base de datos
export async function initDatabase() {
	try {
		// Crear tablas si no existen
		await db.run(`
      CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        tenant_id TEXT NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        sku TEXT NOT NULL,
        barcode TEXT,
        price REAL NOT NULL,
        cost REAL NOT NULL,
        category_id TEXT,
        stock INTEGER NOT NULL DEFAULT 0,
        min_stock INTEGER NOT NULL DEFAULT 0,
        images TEXT,
        is_active BOOLEAN NOT NULL DEFAULT 1,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        synced_at DATETIME
      )
    `);

		await db.run(`
      CREATE TABLE IF NOT EXISTS categories (
        id TEXT PRIMARY KEY,
        tenant_id TEXT NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        is_active BOOLEAN NOT NULL DEFAULT 1,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

		await db.run(`
      CREATE TABLE IF NOT EXISTS customers (
        id TEXT PRIMARY KEY,
        tenant_id TEXT NOT NULL,
        name TEXT NOT NULL,
        email TEXT,
        phone TEXT,
        address TEXT,
        loyalty_points INTEGER NOT NULL DEFAULT 0,
        is_active BOOLEAN NOT NULL DEFAULT 1,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

		await db.run(`
      CREATE TABLE IF NOT EXISTS sales (
        id TEXT PRIMARY KEY,
        tenant_id TEXT NOT NULL,
        customer_id TEXT,
        subtotal REAL NOT NULL,
        tax REAL NOT NULL DEFAULT 0,
        discount REAL NOT NULL DEFAULT 0,
        total REAL NOT NULL,
        payment_method TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'completed',
        cashier_id TEXT NOT NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        synced_at DATETIME
      )
    `);

		await db.run(`
      CREATE TABLE IF NOT EXISTS sale_items (
        id TEXT PRIMARY KEY,
        sale_id TEXT NOT NULL,
        product_id TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        price REAL NOT NULL,
        total REAL NOT NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (sale_id) REFERENCES sales(id),
        FOREIGN KEY (product_id) REFERENCES products(id)
      )
    `);

		await db.run(`
      CREATE TABLE IF NOT EXISTS accounts (
        id TEXT PRIMARY KEY,
        tenant_id TEXT NOT NULL,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        currency TEXT NOT NULL,
        bank_name TEXT,
        account_number TEXT,
        is_active BOOLEAN NOT NULL DEFAULT 1,
        balance REAL NOT NULL DEFAULT 0,
        min_balance REAL NOT NULL DEFAULT 0,
        max_balance REAL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

		await db.run(`
      CREATE TABLE IF NOT EXISTS transactions (
        id TEXT PRIMARY KEY,
        tenant_id TEXT NOT NULL,
        account_id TEXT NOT NULL,
        type TEXT NOT NULL,
        amount REAL NOT NULL,
        currency TEXT NOT NULL,
        exchange_rate REAL,
        reference TEXT,
        description TEXT,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (account_id) REFERENCES accounts(id)
      )
    `);

		await db.run(`
      CREATE TABLE IF NOT EXISTS cash_closings (
        id TEXT PRIMARY KEY,
        tenant_id TEXT NOT NULL,
        cashier_id TEXT NOT NULL,
        date DATE NOT NULL,
        account_id TEXT NOT NULL,
        initial_balance TEXT NOT NULL,
        sales TEXT NOT NULL,
        expenses TEXT NOT NULL,
        final_balance TEXT NOT NULL,
        difference TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'open',
        notes TEXT,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        closed_at DATETIME,
        FOREIGN KEY (account_id) REFERENCES accounts(id)
      )
    `);

		await db.run(`
      CREATE TABLE IF NOT EXISTS system_config (
        id TEXT PRIMARY KEY,
        tenant_id TEXT NOT NULL,
        category TEXT NOT NULL,
        key TEXT NOT NULL,
        value TEXT NOT NULL,
        type TEXT NOT NULL,
        is_editable BOOLEAN NOT NULL DEFAULT 1,
        is_required BOOLEAN NOT NULL DEFAULT 0,
        validation TEXT,
        description TEXT,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(tenant_id, category, key)
      )
    `);

		await db.run(`
      CREATE TABLE IF NOT EXISTS exchange_rates (
        id TEXT PRIMARY KEY,
        from_currency TEXT NOT NULL,
        to_currency TEXT NOT NULL,
        rate REAL NOT NULL,
        source TEXT NOT NULL,
        date DATE NOT NULL,
        is_valid BOOLEAN NOT NULL DEFAULT 1,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

		await db.run(`
      CREATE TABLE IF NOT EXISTS sync_queue (
        id TEXT PRIMARY KEY,
        tenant_id TEXT NOT NULL,
        table_name TEXT NOT NULL,
        record_id TEXT NOT NULL,
        operation TEXT NOT NULL,
        data TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        retry_count INTEGER NOT NULL DEFAULT 0,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

		console.log("✅ Base de datos inicializada correctamente");
	} catch (error) {
		console.error("❌ Error al inicializar la base de datos:", error);
		throw error;
	}
}

// Función para cerrar la conexión
export function closeDatabase() {
	sqlite.close();
}
