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
		console.log("🔄 Inicializando base de datos...");

		// Crear tablas usando SQL directo
		const createTables = [
			// Tabla de categorías
			`CREATE TABLE IF NOT EXISTS categories (
        id TEXT PRIMARY KEY,
        tenant_id TEXT NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        is_active INTEGER NOT NULL DEFAULT 1,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      )`,

			// Tabla de productos
			`CREATE TABLE IF NOT EXISTS products (
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
        is_active INTEGER NOT NULL DEFAULT 1,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now')),
        synced_at TEXT,
        FOREIGN KEY (category_id) REFERENCES categories(id)
      )`,

			// Tabla de clientes
			`CREATE TABLE IF NOT EXISTS customers (
        id TEXT PRIMARY KEY,
        tenant_id TEXT NOT NULL,
        name TEXT NOT NULL,
        email TEXT,
        phone TEXT,
        address TEXT,
        loyalty_points INTEGER NOT NULL DEFAULT 0,
        is_active INTEGER NOT NULL DEFAULT 1,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      )`,

			// Tabla de ventas
			`CREATE TABLE IF NOT EXISTS sales (
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
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        synced_at TEXT,
        FOREIGN KEY (customer_id) REFERENCES customers(id)
      )`,

			// Tabla de items de venta
			`CREATE TABLE IF NOT EXISTS sale_items (
        id TEXT PRIMARY KEY,
        sale_id TEXT NOT NULL,
        product_id TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        price REAL NOT NULL,
        total REAL NOT NULL,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        FOREIGN KEY (sale_id) REFERENCES sales(id),
        FOREIGN KEY (product_id) REFERENCES products(id)
      )`,

			// Tabla de cuentas
			`CREATE TABLE IF NOT EXISTS accounts (
        id TEXT PRIMARY KEY,
        tenant_id TEXT NOT NULL,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        currency TEXT NOT NULL,
        bank_name TEXT,
        account_number TEXT,
        is_active INTEGER NOT NULL DEFAULT 1,
        balance REAL NOT NULL DEFAULT 0,
        min_balance REAL NOT NULL DEFAULT 0,
        max_balance REAL,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      )`,

			// Tabla de transacciones
			`CREATE TABLE IF NOT EXISTS transactions (
        id TEXT PRIMARY KEY,
        tenant_id TEXT NOT NULL,
        account_id TEXT NOT NULL,
        type TEXT NOT NULL,
        amount REAL NOT NULL,
        currency TEXT NOT NULL,
        exchange_rate REAL,
        reference TEXT,
        description TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        FOREIGN KEY (account_id) REFERENCES accounts(id)
      )`,

			// Tabla de cierres de caja
			`CREATE TABLE IF NOT EXISTS cash_closings (
        id TEXT PRIMARY KEY,
        tenant_id TEXT NOT NULL,
        cashier_id TEXT NOT NULL,
        date TEXT NOT NULL,
        account_id TEXT NOT NULL,
        initial_balance TEXT NOT NULL,
        sales TEXT NOT NULL,
        expenses TEXT NOT NULL,
        final_balance TEXT NOT NULL,
        difference TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'open',
        notes TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        closed_at TEXT,
        FOREIGN KEY (account_id) REFERENCES accounts(id)
      )`,

			// Tabla de configuración del sistema
			`CREATE TABLE IF NOT EXISTS system_config (
        id TEXT PRIMARY KEY,
        tenant_id TEXT NOT NULL,
        category TEXT NOT NULL,
        key TEXT NOT NULL,
        value TEXT NOT NULL,
        type TEXT NOT NULL,
        is_editable INTEGER NOT NULL DEFAULT 1,
        is_required INTEGER NOT NULL DEFAULT 0,
        validation TEXT,
        description TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now')),
        UNIQUE(tenant_id, category, key)
      )`,

			// Tabla de tasas de cambio
			`CREATE TABLE IF NOT EXISTS exchange_rates (
        id TEXT PRIMARY KEY,
        from_currency TEXT NOT NULL,
        to_currency TEXT NOT NULL,
        rate REAL NOT NULL,
        source TEXT NOT NULL,
        date TEXT NOT NULL,
        is_valid INTEGER NOT NULL DEFAULT 1,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      )`,

			// Tabla de cola de sincronización
			`CREATE TABLE IF NOT EXISTS sync_queue (
        id TEXT PRIMARY KEY,
        tenant_id TEXT NOT NULL,
        table_name TEXT NOT NULL,
        record_id TEXT NOT NULL,
        operation TEXT NOT NULL,
        data TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        retry_count INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      )`
		];

		// Ejecutar todas las consultas de creación de tablas
		for (const sql of createTables) {
			sqlite.exec(sql);
		}

		// Insertar configuración por defecto
		await insertDefaultConfig();

		// Insertar cuentas por defecto
		await insertDefaultAccounts();

		// Insertar categorías por defecto
		await insertDefaultCategories();

		console.log("✅ Base de datos inicializada correctamente");
	} catch (error) {
		console.error("❌ Error al inicializar la base de datos:", error);
		throw error;
	}
}

// Función para insertar configuración por defecto
async function insertDefaultConfig() {
	const defaultConfig = [
		// Configuración general
		{ tenant_id: "default", category: "general", key: "appName", value: "POS Venezuela", type: "string", description: "Nombre de la aplicación" },
		{ tenant_id: "default", category: "general", key: "appVersion", value: "1.0.0", type: "string", description: "Versión de la aplicación" },
		{ tenant_id: "default", category: "general", key: "defaultLanguage", value: "es", type: "string", description: "Idioma por defecto" },
		{ tenant_id: "default", category: "general", key: "timezone", value: "America/Caracas", type: "string", description: "Zona horaria" },

		// Configuración de monedas
		{ tenant_id: "default", category: "currency", key: "defaultCurrency", value: "BS", type: "string", description: "Moneda por defecto" },
		{ tenant_id: "default", category: "currency", key: "supportedCurrencies", value: "[\"BS\",\"USD\",\"EUR\"]", type: "array", description: "Monedas soportadas" },
		{ tenant_id: "default", category: "currency", key: "updateInterval", value: "15", type: "number", description: "Intervalo de actualización en minutos" },
		{ tenant_id: "default", category: "currency", key: "autoUpdate", value: "true", type: "boolean", description: "Actualización automática" },

		// Configuración de impuestos
		{ tenant_id: "default", category: "taxes", key: "iva", value: "{\"rate\":0.16,\"isActive\":true,\"description\":\"Impuesto al Valor Agregado\"}", type: "object", description: "Configuración del IVA" },
		{ tenant_id: "default", category: "taxes", key: "islr", value: "{\"rate\":0.02,\"isActive\":true,\"description\":\"Impuesto Sobre la Renta\"}", type: "object", description: "Configuración del ISLR" },

		// Configuración de reportes
		{ tenant_id: "default", category: "reports", key: "dateFormat", value: "DD/MM/YYYY", type: "string", description: "Formato de fecha" },
		{ tenant_id: "default", category: "reports", key: "timeFormat", value: "HH:mm:ss", type: "string", description: "Formato de hora" },
		{ tenant_id: "default", category: "reports", key: "defaultFormat", value: "PDF", type: "string", description: "Formato de exportación por defecto" }
	];

	for (const config of defaultConfig) {
		const stmt = sqlite.prepare(`
      INSERT OR IGNORE INTO system_config 
      (id, tenant_id, category, key, value, type, description, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `);
		stmt.run(
			`config_${config.category}_${config.key}`,
			config.tenant_id,
			config.category,
			config.key,
			config.value,
			config.type,
			config.description
		);
	}

	console.log("✅ Configuración por defecto insertada");
}

// Función para insertar cuentas por defecto
async function insertDefaultAccounts() {
	const defaultAccounts = [
		{ name: "Caja Principal BS", type: "cash", currency: "BS", balance: 0 },
		{ name: "Caja Principal USD", type: "cash", currency: "USD", balance: 0 },
		{ name: "Caja Principal EUR", type: "cash", currency: "EUR", balance: 0 },
		{ name: "Banco BS", type: "bank", currency: "BS", balance: 0 },
		{ name: "Banco USD", type: "bank", currency: "USD", balance: 0 },
		{ name: "Caja Chica", type: "cash", currency: "BS", balance: 0 }
	];

	for (const account of defaultAccounts) {
		const stmt = sqlite.prepare(`
      INSERT OR IGNORE INTO accounts 
      (id, tenant_id, name, type, currency, balance, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `);
		stmt.run(
			`account_${account.type}_${account.currency.toLowerCase()}`,
			"default",
			account.name,
			account.type,
			account.currency,
			account.balance
		);
	}

	console.log("✅ Cuentas por defecto insertadas");
}

// Función para insertar categorías por defecto
async function insertDefaultCategories() {
	const defaultCategories = [
		{ name: "General", description: "Productos generales" },
		{ name: "Alimentos", description: "Productos alimenticios" },
		{ name: "Bebidas", description: "Bebidas y líquidos" },
		{ name: "Limpieza", description: "Productos de limpieza" },
		{ name: "Higiene", description: "Productos de higiene personal" },
		{ name: "Electrónicos", description: "Dispositivos electrónicos" },
		{ name: "Ropa", description: "Vestimenta y accesorios" },
		{ name: "Hogar", description: "Artículos para el hogar" }
	];

	for (const category of defaultCategories) {
		const stmt = sqlite.prepare(`
      INSERT OR IGNORE INTO categories 
      (id, tenant_id, name, description, created_at, updated_at)
      VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))
    `);
		stmt.run(
			`category_${category.name.toLowerCase().replace(/\s+/g, "_")}`,
			"default",
			category.name,
			category.description
		);
	}

	console.log("✅ Categorías por defecto insertadas");
}

// Función para cerrar la conexión
export function closeDatabase() {
	sqlite.close();
	console.log("✅ Base de datos cerrada");
}
