import Database from "@tauri-apps/plugin-sql";
import { drizzle } from "drizzle-orm/sqlite-proxy";
import * as schema from "./schema";

export type AppDb = ReturnType<typeof drizzle<typeof schema>>;

let db: AppDb | null = null;

// Obtener una conexión SQLite del plugin (centralizado)
export async function getSqlite() {
	return await Database.load("sqlite:pos.db");
}

// Función para obtener la instancia de la base de datos
export async function getDatabase(): Promise<AppDb> {
	if (!db) {
		await initDatabase();
	}
	return db!;
}

// Función para inicializar la base de datos
export async function initDatabase() {
	try {
		console.log("🔄 Inicializando base de datos...");

		// Crear la instancia de Drizzle con el proxy de SQLite
		db = drizzle<typeof schema>(
			async (sql, params, method) => {
				const sqlite = await Database.load("sqlite:pos.db");
				let rows: any = [];
				let results = [];

				try {
					if (isSelectQuery(sql)) {
						rows = await sqlite.select(sql, params);
					} else {
						rows = await sqlite.execute(sql, params);
						return { rows: [] };
					}

					// Convertir los resultados al formato esperado por Drizzle
					rows = rows.map((row: any) => {
						return Object.values(row);
					});

					results = method === "all" ? rows : rows[0];
					return { rows: results };
				} catch (error) {
					console.error("SQL Error:", error);
					return { rows: [] };
				} finally {
					await sqlite.close();
				}
			},
			{ schema, logger: true }
		);

		// Crear tablas si no existen (ignorar errores idempotentes)
		try {
			await createTables();
		} catch {
			console.log("⚠️ Algunas tablas ya existen, continuando...");
		}

		// Insertar datos por defecto (ignorar errores idempotentes)
		try {
			await insertDefaultData();
		} catch {
			console.log("⚠️ Algunos datos por defecto ya existen, continuando...");
		}

		console.log("✅ Base de datos inicializada correctamente");
	} catch (error) {
		console.error("❌ Error al inicializar la base de datos:", error);
		throw error;
	}
}

// Función para verificar si es una consulta SELECT
function isSelectQuery(sql: string): boolean {
	const trimmed = sql.trim().toLowerCase();
	return trimmed.startsWith("select") || trimmed.startsWith("with");
}

// Función para crear las tablas
async function createTables() {
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
			currency TEXT NOT NULL DEFAULT 'BS',
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
			updated_at TEXT NOT NULL DEFAULT (datetime('now')),
			document_type TEXT,
			document_number TEXT,
			birth_date TEXT,
			notes TEXT
		)`,

		// Tabla de ventas de clientes (para historial)
		`CREATE TABLE IF NOT EXISTS customer_sales (
			id TEXT PRIMARY KEY,
			customer_id TEXT NOT NULL,
			sale_id TEXT NOT NULL,
			total_amount REAL NOT NULL,
			currency TEXT NOT NULL,
			created_at TEXT DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY (customer_id) REFERENCES customers(id),
			FOREIGN KEY (sale_id) REFERENCES sales(id)
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

		// Tabla de sesiones de caja
		`CREATE TABLE IF NOT EXISTS cash_sessions (
			id TEXT PRIMARY KEY,
			tenant_id TEXT NOT NULL,
			cashier_id TEXT NOT NULL,
			cashier_name TEXT NOT NULL,
			start_time TEXT NOT NULL,
			end_time TEXT,
			initial_balances TEXT NOT NULL,
			status TEXT NOT NULL DEFAULT 'open',
			created_at TEXT NOT NULL DEFAULT (datetime('now')),
			updated_at TEXT NOT NULL DEFAULT (datetime('now'))
		)`,

		// Tabla de cierres de caja
		`CREATE TABLE IF NOT EXISTS cash_closings (
			id TEXT PRIMARY KEY,
			tenant_id TEXT NOT NULL,
			session_id TEXT NOT NULL,
			cashier_id TEXT NOT NULL,
			cashier_name TEXT NOT NULL,
			start_time TEXT NOT NULL,
			end_time TEXT NOT NULL,
			shift_duration TEXT NOT NULL,
			initial_balances TEXT NOT NULL,
			final_balances TEXT NOT NULL,
			balance_differences TEXT NOT NULL,
			total_transactions INTEGER NOT NULL DEFAULT 0,
			sales_by_currency TEXT NOT NULL,
			sales_by_payment_method TEXT NOT NULL,
			total_sales_amount REAL NOT NULL DEFAULT 0,
			expenses TEXT NOT NULL DEFAULT '{}',
			adjustments TEXT NOT NULL DEFAULT '{}',
			observations TEXT,
			status TEXT NOT NULL DEFAULT 'closed',
			audited_by TEXT,
			audited_at TEXT,
			created_at TEXT NOT NULL DEFAULT (datetime('now')),
			updated_at TEXT NOT NULL DEFAULT (datetime('now')),
			FOREIGN KEY (session_id) REFERENCES cash_sessions(id)
		)`,

		// Tabla de reportes generados
		`CREATE TABLE IF NOT EXISTS cash_reports (
			id TEXT PRIMARY KEY,
			tenant_id TEXT NOT NULL,
			session_id TEXT NOT NULL,
			cashier_id TEXT NOT NULL,
			cashier_name TEXT NOT NULL,
			report_type TEXT NOT NULL DEFAULT 'closing_report',
			report_data TEXT NOT NULL,
			file_name TEXT,
			file_path TEXT,
			generated_at TEXT NOT NULL DEFAULT (datetime('now')),
			created_at TEXT NOT NULL DEFAULT (datetime('now')),
			FOREIGN KEY (session_id) REFERENCES cash_sessions(id)
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
		)`,

		// Tabla de movimientos de inventario
		`CREATE TABLE IF NOT EXISTS inventory_movements (
			id TEXT PRIMARY KEY,
			tenant_id TEXT NOT NULL DEFAULT 'default',
			product_id TEXT NOT NULL,
			movement_type TEXT NOT NULL,
			quantity INTEGER NOT NULL,
			previous_stock INTEGER NOT NULL,
			new_stock INTEGER NOT NULL,
			unit_cost REAL,
			total_cost REAL,
			reason TEXT NOT NULL,
			reference_document TEXT,
			notes TEXT,
			created_by TEXT NOT NULL DEFAULT 'system',
			created_at TEXT NOT NULL DEFAULT (datetime('now')),
			updated_at TEXT NOT NULL DEFAULT (datetime('now')),
			FOREIGN KEY (product_id) REFERENCES products(id)
		)`,

		// Tabla de estadísticas de inventario (cache)
		`CREATE TABLE IF NOT EXISTS inventory_stats (
			id TEXT PRIMARY KEY,
			tenant_id TEXT NOT NULL DEFAULT 'default',
			total_products INTEGER NOT NULL DEFAULT 0,
			total_stock INTEGER NOT NULL DEFAULT 0,
			total_value REAL NOT NULL DEFAULT 0,
			low_stock_count INTEGER NOT NULL DEFAULT 0,
			out_of_stock_count INTEGER NOT NULL DEFAULT 0,
			last_movement_date TEXT,
			last_updated TEXT NOT NULL DEFAULT (datetime('now'))
		)`
	];

	// Ejecutar todas las consultas de creación de tablas
	for (const sql of createTables) {
		await executeSQL(sql);
	}

	// Crear índices para las tablas de inventario
	await createInventoryIndexes();

	// Verificar y agregar columna currency si no existe
	await ensureCurrencyColumn();

	// Verificar columnas e índices de transactions
	await ensureTransactionsColumns();

	// Verificar columnas adicionales de customers
	await ensureCustomersColumns();

	console.log("✅ Tablas creadas correctamente");
}

// Función para crear índices de inventario
async function createInventoryIndexes() {
	const indexes = [
		"CREATE INDEX IF NOT EXISTS idx_inventory_movements_product_id ON inventory_movements(product_id)",
		"CREATE INDEX IF NOT EXISTS idx_inventory_movements_tenant_id ON inventory_movements(tenant_id)",
		"CREATE INDEX IF NOT EXISTS idx_inventory_movements_created_at ON inventory_movements(created_at)",
		"CREATE INDEX IF NOT EXISTS idx_inventory_movements_movement_type ON inventory_movements(movement_type)",
		"CREATE INDEX IF NOT EXISTS idx_inventory_stats_tenant_id ON inventory_stats(tenant_id)"
	];

	for (const indexSQL of indexes) {
		await executeSQL(indexSQL);
	}

	console.log("✅ Índices de inventario creados correctamente");
}

// Función para ejecutar SQL directamente
async function executeSQL(sql: string, params: any[] = []) {
	const sqlite = await Database.load("sqlite:pos.db");
	try {
		await sqlite.execute(sql, params);
	} catch (error) {
		// Ignorar errores de tablas ya existentes
		if (error instanceof Error && error.message.includes("already exists")) {
			console.log(`⚠️ Tabla ya existe, ignorando: ${sql.substring(0, 50)}...`);
			return;
		}
		throw error;
	} finally {
		await sqlite.close();
	}
}

// Función para asegurar que la columna currency existe en la tabla products
async function ensureCurrencyColumn() {
	try {
		const sqlite = await Database.load("sqlite:pos.db");

		// Verificar si la columna currency existe
		const columns = await sqlite.select("PRAGMA table_info(products)") as any[];
		const hasCurrencyColumn = columns.some((col: any) => col.name === "currency");

		if (!hasCurrencyColumn) {
			console.log("🔄 Agregando columna currency a la tabla products...");
			await sqlite.execute("ALTER TABLE products ADD COLUMN currency TEXT DEFAULT 'BS' NOT NULL");
			console.log("✅ Columna currency agregada correctamente");
		} else {
			console.log("✅ Columna currency ya existe en la tabla products");
		}

		await sqlite.close();
	} catch (error) {
		console.error("❌ Error verificando columna currency:", error);
		// No lanzar el error para no interrumpir la inicialización
	}
}

// Asegurar columnas e índices de transactions (cashier_id, sale_id, payment_method, índices)
async function ensureTransactionsColumns() {
	try {
		const sqlite = await Database.load("sqlite:pos.db");

		// Columnas
		const txCols = await sqlite.select("PRAGMA table_info(transactions)") as any[];
		const hasCashier = txCols.some((c: any) => c.name === "cashier_id");
		const hasSaleId = txCols.some((c: any) => c.name === "sale_id");
		const hasPaymentMethod = txCols.some((c: any) => c.name === "payment_method");
		if (!hasCashier) {
			await sqlite.execute("ALTER TABLE transactions ADD COLUMN cashier_id TEXT");
		}
		if (!hasSaleId) {
			await sqlite.execute("ALTER TABLE transactions ADD COLUMN sale_id TEXT");
		}
		if (!hasPaymentMethod) {
			await sqlite.execute("ALTER TABLE transactions ADD COLUMN payment_method TEXT");
		}

		// Índices
		await sqlite.execute("CREATE INDEX IF NOT EXISTS idx_transactions_account_id ON transactions(account_id)");
		await sqlite.execute("CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at)");
		await sqlite.execute("CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type)");
		await sqlite.execute("CREATE INDEX IF NOT EXISTS idx_transactions_sale_id ON transactions(sale_id)");
		await sqlite.execute("CREATE INDEX IF NOT EXISTS idx_transactions_payment_method ON transactions(payment_method)");

		await sqlite.close();
	} catch (error) {
		console.error("❌ Error asegurando columnas/índices de transactions:", error);
	}
}

// Función para insertar datos por defecto
async function insertDefaultData() {
	// Insertar configuración por defecto
	await insertDefaultConfig();

	// Insertar cuentas por defecto
	await insertDefaultAccounts();

	// Insertar categorías por defecto
	await insertDefaultCategories();
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
		await executeSQL(`
			INSERT OR IGNORE INTO system_config 
			(id, tenant_id, category, key, value, type, description, created_at, updated_at)
			VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
		`, [
			`config_${config.category}_${config.key}`,
			config.tenant_id,
			config.category,
			config.key,
			config.value,
			config.type,
			config.description
		]);
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
		await executeSQL(`
			INSERT OR IGNORE INTO accounts 
			(id, tenant_id, name, type, currency, balance, created_at, updated_at)
			VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
		`, [
			`account_${account.type}_${account.currency.toLowerCase()}`,
			"default",
			account.name,
			account.type,
			account.currency,
			account.balance
		]);
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
		await executeSQL(`
			INSERT OR IGNORE INTO categories 
			(id, tenant_id, name, description, created_at, updated_at)
			VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))
		`, [
			`category_${category.name.toLowerCase().replace(/\s+/g, "_")}`,
			"default",
			category.name,
			category.description
		]);
	}

	console.log("✅ Categorías por defecto insertadas");
}

// Función para asegurar columnas adicionales de customers
async function ensureCustomersColumns() {
	try {
		const sqlite = await Database.load("sqlite:pos.db");

		// Verificar columnas adicionales
		const customerCols = await sqlite.select("PRAGMA table_info(customers)") as any[];
		const hasDocumentType = customerCols.some((c: any) => c.name === "document_type");
		const hasDocumentNumber = customerCols.some((c: any) => c.name === "document_number");
		const hasBirthDate = customerCols.some((c: any) => c.name === "birth_date");
		const hasNotes = customerCols.some((c: any) => c.name === "notes");

		if (!hasDocumentType) {
			await sqlite.execute("ALTER TABLE customers ADD COLUMN document_type TEXT");
		}
		if (!hasDocumentNumber) {
			await sqlite.execute("ALTER TABLE customers ADD COLUMN document_number TEXT");
		}
		if (!hasBirthDate) {
			await sqlite.execute("ALTER TABLE customers ADD COLUMN birth_date TEXT");
		}
		if (!hasNotes) {
			await sqlite.execute("ALTER TABLE customers ADD COLUMN notes TEXT");
		}

		// Crear índices si no existen
		await sqlite.execute("CREATE INDEX IF NOT EXISTS idx_customers_name ON customers(name)");
		await sqlite.execute("CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email)");
		await sqlite.execute("CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone)");
		await sqlite.execute("CREATE INDEX IF NOT EXISTS idx_customers_document_number ON customers(document_number)");

		await sqlite.close();
		console.log("✅ Columnas adicionales de customers verificadas");
	} catch (error) {
		console.error("❌ Error verificando columnas de customers:", error);
	}
}

// Función para cerrar la base de datos
export function closeDatabase() {
	db = null;
	console.log("✅ Base de datos cerrada");
}
