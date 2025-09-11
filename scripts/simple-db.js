import Database from "better-sqlite3";

const db = new Database("./database/pos.db");

console.log("🗄️ Utilidades de Base de Datos POS");
console.log("=====================================\n");

const command = process.argv[2];
const param = process.argv[3];

switch (command) {
	case "tables":
	case "ls":
		console.log("📋 Tablas disponibles:");
		const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE '__%'").all();
		tables.forEach((table, index) => {
			const count = db.prepare(`SELECT COUNT(*) as count FROM ${table.name}`).get();
			console.log(`  ${index + 1}. ${table.name} (${count.count} registros)`);
		});
		break;

	case "show":
		if (!param) {
			console.log("❌ Especifica el nombre de la tabla: node scripts/simple-db.js show <tabla>");
			break;
		}
		console.log(`📊 Contenido de la tabla "${param}":`);
		try {
			const data = db.prepare(`SELECT * FROM ${param} LIMIT 10`).all();
			if (data.length === 0) {
				console.log("  (Tabla vacía)");
			} else {
				console.table(data);
			}
		} catch (error) {
			console.log(`❌ Error: ${error.message}`);
		}
		break;

	case "test":
		console.log("🧪 Insertando datos de prueba...");

		// Productos de prueba
		const testProducts = [
			{ name: "Hamburguesa Clásica", sku: "HAMB001", price: 8.50, cost: 4.00, category: "category_alimentos", stock: 25 },
			{ name: "Pizza Margarita", sku: "PIZZA001", price: 15.00, cost: 7.50, category: "category_alimentos", stock: 12 },
			{ name: "Cerveza Polar", sku: "CERVEZA001", price: 3.50, cost: 2.00, category: "category_bebidas", stock: 48 }
		];

		for (const product of testProducts) {
			db.prepare(`
				INSERT OR REPLACE INTO products 
				(id, tenant_id, name, sku, price, cost, category_id, stock, created_at, updated_at)
				VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
			`).run(
				`product_${product.sku.toLowerCase()}`,
				"default",
				product.name,
				product.sku,
				product.price,
				product.cost,
				product.category,
				product.stock
			);
		}
		console.log("✅ Datos de prueba insertados");
		break;

	case "clear":
		if (!param) {
			console.log("❌ Especifica el nombre de la tabla: node scripts/simple-db.js clear <tabla>");
			break;
		}
		console.log(`🗑️ Limpiando tabla "${param}"...`);
		const result = db.prepare(`DELETE FROM ${param}`).run();
		console.log(`✅ ${result.changes} registros eliminados`);
		break;

	case "sql":
		if (!param) {
			console.log("❌ Especifica el SQL: node scripts/simple-db.js sql \"SELECT * FROM products\"");
			break;
		}
		console.log(`🔧 Ejecutando: ${param}`);
		try {
			const result = db.prepare(param).all();
			console.table(result);
		} catch (error) {
			console.log(`❌ Error: ${error.message}`);
		}
		break;

	default:
		console.log("\n📖 Comandos disponibles:");
		console.log("  tables, ls          - Mostrar todas las tablas");
		console.log("  show <tabla>        - Mostrar contenido de una tabla");
		console.log("  test                - Insertar datos de prueba");
		console.log("  clear <tabla>       - Limpiar datos de una tabla");
		console.log("  sql \"consulta\"      - Ejecutar SQL personalizado");
		console.log("\n💡 Ejemplos:");
		console.log("  node scripts/simple-db.js tables");
		console.log("  node scripts/simple-db.js show products");
		console.log("  node scripts/simple-db.js sql \"SELECT name, price FROM products WHERE stock > 10\"");
		console.log("  node scripts/simple-db.js test");
		console.log("  node scripts/simple-db.js clear products");
		break;
}

db.close();
