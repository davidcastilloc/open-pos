import { useDatabase } from "~/composables/useDatabase";

export async function runMigrations() {
	const { execute, query } = useDatabase();

	try {
		console.log("🔄 Ejecutando migraciones de Drizzle...");

		// Ejecutar la migración generada por Drizzle
		await execute(`
			CREATE TABLE IF NOT EXISTS cash_sessions (
				id TEXT PRIMARY KEY NOT NULL,
				tenant_id TEXT NOT NULL,
				cashier_id TEXT NOT NULL,
				cashier_name TEXT NOT NULL,
				start_time TEXT NOT NULL,
				end_time TEXT,
				initial_balances TEXT NOT NULL,
				status TEXT DEFAULT 'open' NOT NULL,
				created_at TEXT NOT NULL,
				updated_at TEXT NOT NULL
			)
		`);

		// Verificar si cash_closings existe y tiene la estructura antigua
		const tableInfo = await query<any>("PRAGMA table_info(cash_closings)");

		if (tableInfo.length > 0) {
			// Verificar si tiene session_id
			const hasSessionId = tableInfo.some((col: any) => col.name === "session_id");

			if (!hasSessionId) {
				console.log("🔄 Migrando tabla cash_closings...");

				// Crear tabla temporal con nueva estructura
				await execute(`
					CREATE TABLE __new_cash_closings (
						id TEXT PRIMARY KEY NOT NULL,
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
						total_transactions INTEGER DEFAULT 0 NOT NULL,
						sales_by_currency TEXT NOT NULL,
						sales_by_payment_method TEXT NOT NULL,
						total_sales_amount REAL DEFAULT 0 NOT NULL,
						expenses TEXT DEFAULT '{}' NOT NULL,
						adjustments TEXT DEFAULT '{}' NOT NULL,
						observations TEXT,
						status TEXT DEFAULT 'closed' NOT NULL,
						audited_by TEXT,
						audited_at TEXT,
						created_at TEXT NOT NULL,
						updated_at TEXT NOT NULL
					)
				`);

				// Migrar datos existentes
				await execute(`
					INSERT INTO __new_cash_closings (
						id, tenant_id, session_id, cashier_id, cashier_name,
						start_time, end_time, shift_duration,
						initial_balances, final_balances, balance_differences,
						total_transactions, sales_by_currency, sales_by_payment_method,
						total_sales_amount, expenses, adjustments, observations,
						status, audited_by, audited_at, created_at, updated_at
					)
					SELECT 
						id, 
						COALESCE(tenant_id, 'default') as tenant_id,
						'legacy-' || id as session_id,
						COALESCE(cashier_id, 'admin') as cashier_id,
						COALESCE(cashier_name, 'Administrador') as cashier_name,
						COALESCE(start_time, created_at, datetime('now')) as start_time,
						COALESCE(end_time, closed_at, datetime('now')) as end_time,
						COALESCE(shift_duration, '00:00:00') as shift_duration,
						COALESCE(initial_balances, initial_balance, '{}') as initial_balances,
						COALESCE(final_balances, final_balance, '{}') as final_balances,
						COALESCE(balance_differences, difference, '{}') as balance_differences,
						COALESCE(total_transactions, 0) as total_transactions,
						COALESCE(sales_by_currency, sales, '{}') as sales_by_currency,
						'{}' as sales_by_payment_method,
						COALESCE(total_sales_amount, 0) as total_sales_amount,
						COALESCE(expenses, '{}') as expenses,
						COALESCE(adjustments, '{}') as adjustments,
						COALESCE(observations, notes, '') as observations,
						COALESCE(status, 'closed') as status,
						NULL as audited_by,
						NULL as audited_at,
						COALESCE(created_at, datetime('now')) as created_at,
						COALESCE(updated_at, closed_at, datetime('now')) as updated_at
					FROM cash_closings
				`);

				// Reemplazar tabla antigua
				await execute("DROP TABLE cash_closings");
				await execute("ALTER TABLE __new_cash_closings RENAME TO cash_closings");

				console.log("✅ Tabla cash_closings migrada exitosamente");
			} else {
				console.log("✅ Tabla cash_closings ya tiene la estructura correcta");
			}
		} else {
			// Crear tabla nueva si no existe
			await execute(`
				CREATE TABLE cash_closings (
					id TEXT PRIMARY KEY NOT NULL,
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
					total_transactions INTEGER DEFAULT 0 NOT NULL,
					sales_by_currency TEXT NOT NULL,
					sales_by_payment_method TEXT NOT NULL,
					total_sales_amount REAL DEFAULT 0 NOT NULL,
					expenses TEXT DEFAULT '{}' NOT NULL,
					adjustments TEXT DEFAULT '{}' NOT NULL,
					observations TEXT,
					status TEXT DEFAULT 'closed' NOT NULL,
					audited_by TEXT,
					audited_at TEXT,
					created_at TEXT NOT NULL,
					updated_at TEXT NOT NULL
				)
			`);

			console.log("✅ Tabla cash_closings creada exitosamente");
		}

		// Crear tabla cash_reports si no existe
		await execute(`
			CREATE TABLE IF NOT EXISTS cash_reports (
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
			)
		`);

		console.log("✅ Migraciones ejecutadas exitosamente");
	} catch (error) {
		console.error("❌ Error ejecutando migraciones:", error);
		// No lanzar el error para evitar que falle la inicialización
		console.log("⚠️ Continuando con la inicialización a pesar de los errores de migración...");
	}
}
