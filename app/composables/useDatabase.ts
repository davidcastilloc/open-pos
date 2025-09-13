import { computed } from "vue";
import { getDatabase, getSqlite, initDatabase } from "~/database/connection";

export function useDatabase() {
	const isInitialized = useState("database.isInitialized", () => false);
	const isLoading = useState("database.isLoading", () => false);
	const error = useState<string | null>("database.error", () => null);

	// Inicializar base de datos
	const initialize = async () => {
		if (isInitialized.value) {
			console.log("🔍 Base de datos ya inicializada, saltando...");
			return;
		}

		console.log("🔄 Inicializando base de datos...");
		isLoading.value = true;
		error.value = null;

		try {
			console.log("🔧 Llamando a initDatabase...");
			await initDatabase();
			isInitialized.value = true;
			console.log("✅ Base de datos inicializada correctamente");
		} catch (err) {
			error.value = "Error al inicializar la base de datos";
			console.error("❌ Error initializing database:", err);
		} finally {
			isLoading.value = false;
		}
	};

	// Ejecutar consulta
	const query = async <T>(sql: string, params: any[] = []): Promise<{ rows: T[] }> => {
		try {
			console.log("🔍 Ejecutando query:", { sql, params });
			const sqlite = await getSqlite();
			const rows = await sqlite.select(sql, params) as unknown as T[];
			await sqlite.close();
			console.log("✅ Query ejecutado exitosamente, filas:", rows.length);
			return { rows: rows as T[] };
		} catch (err) {
			console.error("❌ Error executing query:", err);
			throw err;
		}
	};

	// Ejecutar comando
	const execute = async (sql: string, params: any[] = []): Promise<{ rows: any[] }> => {
		try {
			console.log("🔧 Ejecutando comando:", { sql, params });
			const sqlite = await getSqlite();
			console.log("🔍 Base de datos cargada:", "sqlite:pos.db");

			// Verificar si es una consulta SELECT
			const isSelect = sql.trim().toLowerCase().startsWith("select");
			let result;

			if (isSelect) {
				const rows = await sqlite.select(sql, params) as any[];
				result = { rows };
			} else {
				await sqlite.execute(sql, params);
				result = { rows: [] };
			}

			await sqlite.close();
			console.log("✅ Comando ejecutado exitosamente");
			return result;
		} catch (err: any) {
			// Suavizar errores comunes en operaciones idempotentes
			const message = String(err?.message || err);
			if (message.includes("already exists") || message.includes("duplicate column name")) {
				console.warn("⚠️ Operación idempotente:", message);
				return { rows: [] };
			}
			console.error("❌ Error executing command:", err);
			throw err;
		}
	};

	// Obtener una fila
	const get = async <T>(sql: string, params: any[] = []): Promise<T | undefined> => {
		try {
			console.log("🔍 Obteniendo fila:", { sql, params });
			const sqlite = await getSqlite();
			const rows = await sqlite.select(sql, params) as unknown as T[];
			await sqlite.close();
			console.log("✅ Fila obtenida exitosamente");
			return (rows as any[])[0] as T | undefined;
		} catch (err) {
			console.error("❌ Error getting row:", err);
			throw err;
		}
	};

	// Transacción
	const transaction = async <T>(callback: (db: any) => Promise<T>): Promise<T> => {
		console.log("🔄 Iniciando transacción");
		const sqlite = await getSqlite();
		try {
			await sqlite.execute("BEGIN TRANSACTION");
			const result = await callback(sqlite);
			await sqlite.execute("COMMIT");
			console.log("✅ Transacción completada exitosamente");
			return result;
		} catch (err) {
			await sqlite.execute("ROLLBACK");
			console.error("❌ Error en transacción, haciendo rollback:", err);
			throw err;
		} finally {
			await sqlite.close();
		}
	};

	// Verificar si la base de datos está lista
	const isReady = computed(() => {
		const ready = isInitialized.value && !isLoading.value;
		console.log("🔍 Estado de la base de datos:", { isInitialized: isInitialized.value, isLoading: isLoading.value, isReady: ready });
		return ready;
	});

	return {
		isInitialized,
		isLoading,
		error,
		isReady,
		initialize,
		query,
		execute,
		get,
		transaction,
		// Instancia tipada de drizzle para usos avanzados
		orm: getDatabase
	};
}
