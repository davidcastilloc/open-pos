import Database from "better-sqlite3";

function run() {
	const dbPath = "./src-tauri/pos.db";
	const db = new Database(dbPath);
	try {
		console.log("🔄 Ejecutando migración 0003 en", dbPath);
		db.pragma("foreign_keys = OFF");
		try {
			db.prepare("ALTER TABLE transactions ADD COLUMN payment_method TEXT").run();
			console.log("✅ Columna payment_method agregada");
		} catch (err) {
			const msg = String(err?.message || "");
			if (msg.includes("duplicate column name") || msg.includes("already exists")) {
				console.log("ℹ️  payment_method ya existe, continuando...");
			} else {
				throw err;
			}
		}
		db.prepare("CREATE INDEX IF NOT EXISTS idx_transactions_payment_method ON transactions(payment_method)").run();
		console.log("✅ Índice idx_transactions_payment_method creado (si no existía)");
	} finally {
		try { db.pragma("foreign_keys = ON"); } catch {}
		db.close();
	}
}

if (import.meta.url === `file://${process.argv[1]}`) {
	run();
}

export { run };
