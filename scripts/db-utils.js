import Database from 'better-sqlite3';
import { readFileSync } from 'fs';

// Conectar a la base de datos
const db = new Database('./database/pos.db');

// Colores para la consola
const colors = {
	reset: '\x1b[0m',
	bright: '\x1b[1m',
	red: '\x1b[31m',
	green: '\x1b[32m',
	yellow: '\x1b[33m',
	blue: '\x1b[34m',
	magenta: '\x1b[35m',
	cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
	console.log(`${colors[color]}${message}${colors.reset}`);
}

// Función para ejecutar SQL
function executeSQL(sql, params = []) {
	try {
		const stmt = db.prepare(sql);
		if (sql.trim().toUpperCase().startsWith('SELECT') || sql.trim().toUpperCase().startsWith('WITH')) {
			return stmt.all(...params);
		} else {
			return stmt.run(...params);
		}
	} catch (error) {
		log(`❌ Error ejecutando SQL: ${error.message}`, 'red');
		throw error;
	}
}

// Función para mostrar tablas
function showTables() {
	log('\n📋 Tablas disponibles:', 'cyan');
	const tables = executeSQL("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE '__%'");
	tables.forEach((table, index) => {
		const count = executeSQL(`SELECT COUNT(*) as count FROM ${table.name}`)[0];
		log(`  ${index + 1}. ${table.name} (${count.count} registros)`, 'blue');
	});
}

// Función para mostrar contenido de una tabla
function showTable(tableName, limit = 10) {
	try {
		log(`\n📊 Contenido de la tabla "${tableName}":`, 'cyan');
		const data = executeSQL(`SELECT * FROM ${tableName} LIMIT ${limit}`);
		
		if (data.length === 0) {
			log('  (Tabla vacía)', 'yellow');
			return;
		}

		// Mostrar encabezados
		const headers = Object.keys(data[0]);
		log(`  ${headers.join(' | ')}`, 'bright');
		log('  ' + '-'.repeat(headers.join(' | ').length), 'bright');

		// Mostrar datos
		data.forEach(row => {
			const values = headers.map(header => {
				const value = row[header];
				return value === null ? 'NULL' : String(value);
			});
			log(`  ${values.join(' | ')}`);
		});

		// Mostrar total
		const total = executeSQL(`SELECT COUNT(*) as count FROM ${tableName}`)[0];
		if (total.count > limit) {
			log(`  ... y ${total.count - limit} registros más`, 'yellow');
		}
	} catch (error) {
		log(`❌ Error mostrando tabla ${tableName}: ${error.message}`, 'red');
	}
}

// Función para insertar datos de prueba
function insertTestData() {
	log('\n🧪 Insertando datos de prueba...', 'yellow');

	// Productos de prueba
	const testProducts = [
		{ name: "Hamburguesa Clásica", sku: "HAMB001", price: 8.50, cost: 4.00, category: "category_alimentos", stock: 25 },
		{ name: "Pizza Margarita", sku: "PIZZA001", price: 15.00, cost: 7.50, category: "category_alimentos", stock: 12 },
		{ name: "Cerveza Polar", sku: "CERVEZA001", price: 3.50, cost: 2.00, category: "category_bebidas", stock: 48 },
		{ name: "Agua Mineral", sku: "AGUA001", price: 1.50, cost: 0.80, category: "category_bebidas", stock: 100 },
		{ name: "Papel Higiénico", sku: "PAPEL001", price: 4.00, cost: 2.50, category: "category_higiene", stock: 20 }
	];

	for (const product of testProducts) {
		executeSQL(`
			INSERT OR REPLACE INTO products 
			(id, tenant_id, name, sku, price, cost, category_id, stock, created_at, updated_at)
			VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
		`, [
			`product_${product.sku.toLowerCase()}`,
			"default",
			product.name,
			product.sku,
			product.price,
			product.cost,
			product.category,
			product.stock
		]);
	}

	// Clientes de prueba
	const testCustomers = [
		{ name: "Juan Pérez", email: "juan@email.com", phone: "+584121234567" },
		{ name: "María González", email: "maria@email.com", phone: "+584129876543" },
		{ name: "Carlos Rodríguez", email: "carlos@email.com", phone: "+584123456789" }
	];

	for (const customer of testCustomers) {
		executeSQL(`
			INSERT OR REPLACE INTO customers 
			(id, tenant_id, name, email, phone, created_at, updated_at)
			VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))
		`, [
			`customer_${customer.name.toLowerCase().replace(/\s+/g, '_')}`,
			"default",
			customer.name,
			customer.email,
			customer.phone
		]);
	}

	log('✅ Datos de prueba insertados correctamente', 'green');
}

// Función para limpiar datos
function clearData(tableName = null) {
	if (tableName) {
		log(`\n🗑️ Limpiando tabla "${tableName}"...`, 'yellow');
		executeSQL(`DELETE FROM ${tableName}`);
		log(`✅ Tabla "${tableName}" limpiada`, 'green');
	} else {
		log('\n🗑️ Limpiando todas las tablas...', 'yellow');
		const tables = ['products', 'customers', 'sales', 'sale_items', 'transactions', 'cash_closings'];
		for (const table of tables) {
			executeSQL(`DELETE FROM ${table}`);
		}
		log('✅ Todas las tablas limpiadas', 'green');
	}
}

// Función para ejecutar SQL personalizado
function executeCustomSQL(sql) {
	try {
		log(`\n🔧 Ejecutando SQL personalizado:`, 'cyan');
		log(`  ${sql}`, 'blue');
		
		const result = executeSQL(sql);
		
		if (Array.isArray(result)) {
			log(`✅ Consulta ejecutada. Resultados: ${result.length} registros`, 'green');
			if (result.length > 0) {
				console.table(result);
			}
		} else {
			log(`✅ Comando ejecutado. Filas afectadas: ${result.changes || 0}`, 'green');
		}
	} catch (error) {
		log(`❌ Error: ${error.message}`, 'red');
	}
}

// Función para mostrar estadísticas
function showStats() {
	log('\n📈 Estadísticas de la base de datos:', 'cyan');
	
	const stats = [
		{ table: 'products', label: 'Productos' },
		{ table: 'customers', label: 'Clientes' },
		{ table: 'sales', label: 'Ventas' },
		{ table: 'accounts', label: 'Cuentas' },
		{ table: 'categories', label: 'Categorías' }
	];

	stats.forEach(stat => {
		try {
			const count = executeSQL(`SELECT COUNT(*) as count FROM ${stat.table}`)[0];
			log(`  ${stat.label}: ${count.count}`, 'blue');
		} catch (error) {
			log(`  ${stat.label}: Error`, 'red');
		}
	});
}

// Función principal
function main() {
	const command = process.argv[2];
	const param = process.argv[3];

	log('🗄️  Utilidades de Base de Datos POS', 'bright');
	log('=====================================', 'bright');

	switch (command) {
		case 'tables':
		case 'ls':
			showTables();
			break;

		case 'show':
		case 'view':
			if (!param) {
				log('❌ Especifica el nombre de la tabla: node scripts/db-utils.js show <tabla>', 'red');
				return;
			}
			showTable(param);
			break;

		case 'test-data':
		case 'test':
			insertTestData();
			break;

		case 'clear':
			clearData(param);
			break;

		case 'stats':
			showStats();
			break;

		case 'sql':
			if (!param) {
				log('❌ Especifica el SQL: node scripts/db-utils.js sql "SELECT * FROM products"', 'red');
				return;
			}
			executeCustomSQL(param);
			break;

		default:
			log('\n📖 Comandos disponibles:', 'cyan');
			log('  tables, ls          - Mostrar todas las tablas', 'blue');
			log('  show <tabla>        - Mostrar contenido de una tabla', 'blue');
			log('  test-data, test     - Insertar datos de prueba', 'blue');
			log('  clear [tabla]       - Limpiar datos (tabla específica o todas)', 'blue');
			log('  stats               - Mostrar estadísticas', 'blue');
			log('  sql "consulta"      - Ejecutar SQL personalizado', 'blue');
			log('\n💡 Ejemplos:', 'yellow');
			log('  node scripts/db-utils.js tables', 'green');
			log('  node scripts/db-utils.js show products', 'green');
			log('  node scripts/db-utils.js sql "SELECT name, price FROM products WHERE stock > 10"', 'green');
			log('  node scripts/db-utils.js test-data', 'green');
			log('  node scripts/db-utils.js clear products', 'green');
			break;
	}

	db.close();
}

// Ejecutar si es llamado directamente
if (import.meta.url === `file://${process.argv[1]}`) {
	main();
}

export { db, executeSQL, showTables, showTable, insertTestData, clearData, executeCustomSQL, showStats };
