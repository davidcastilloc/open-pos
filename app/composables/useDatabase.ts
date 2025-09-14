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
			const errorMessage = err instanceof Error ? err.message : "Error desconocido";
			error.value = `Error al inicializar la base de datos: ${errorMessage}`;
			console.error("❌ Error initializing database:", err);

			// Intentar una segunda vez después de un breve delay
			console.log("🔄 Reintentando inicialización en 1 segundo...");
			await new Promise((resolve) => setTimeout(resolve, 1000));

			try {
				await initDatabase();
				isInitialized.value = true;
				error.value = null;
				console.log("✅ Base de datos inicializada correctamente en el segundo intento");
			} catch (retryErr) {
				console.error("❌ Error en segundo intento:", retryErr);
				// No lanzar el error, permitir que la aplicación continúe
			}
		} finally {
			isLoading.value = false;
		}
	};

	// Ejecutar consulta
	const query = async <T>(sql: string, params: any[] = []): Promise<{ rows: T[] }> => {
		let sqlite = null;
		try {
			console.log("🔍 Ejecutando query:", { sql, params });
			sqlite = await getSqlite();

			// Validar parámetros antes de ejecutar
			const safeParams = (params || []).map((param) => {
				if (param === null || param === undefined) {
					return null;
				}
				return param;
			});

			const rows = await sqlite.select(sql, safeParams) as unknown as T[];
			console.log("✅ Query ejecutado exitosamente, filas:", rows?.length || 0);
			return { rows: rows as T[] || [] };
		} catch (err) {
			console.error("❌ Error executing query:", err);
			throw err;
		} finally {
			if (sqlite) {
				try {
					await sqlite.close();
				} catch (closeError) {
					console.warn("⚠️ Error cerrando conexión en query:", closeError);
				}
			}
		}
	};

	// Ejecutar comando
	const execute = async (sql: string, params: any[] = []): Promise<{ rows: any[] }> => {
		let sqlite = null;
		try {
			console.log("🔧 Ejecutando comando:", { sql, params });
			sqlite = await getSqlite();
			console.log("🔍 Base de datos cargada:", "sqlite:pos.db");

			// Validar parámetros antes de ejecutar
			const safeParams = (params || []).map((param) => {
				if (param === null || param === undefined) {
					return null;
				}
				return param;
			});

			// Verificar si es una consulta SELECT
			const isSelect = sql.trim().toLowerCase().startsWith("select");
			let result;

			if (isSelect) {
				const rows = await sqlite.select(sql, safeParams) as any[];
				result = { rows: rows || [] };
			} else {
				await sqlite.execute(sql, safeParams);
				result = { rows: [] };
			}

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
		} finally {
			if (sqlite) {
				try {
					await sqlite.close();
				} catch (closeError) {
					console.warn("⚠️ Error cerrando conexión en execute:", closeError);
				}
			}
		}
	};

	// Obtener una fila
	const get = async <T>(sql: string, params: any[] = []): Promise<T | undefined> => {
		let sqlite = null;
		try {
			console.log("🔍 Obteniendo fila:", { sql, params });
			sqlite = await getSqlite();

			// Validar parámetros antes de ejecutar
			const safeParams = (params || []).map((param) => {
				if (param === null || param === undefined) {
					return null;
				}
				return param;
			});

			const rows = await sqlite.select(sql, safeParams) as unknown as T[];
			console.log("✅ Fila obtenida exitosamente");
			return (rows as any[])?.[0] as T | undefined;
		} catch (err) {
			console.error("❌ Error getting row:", err);
			throw err;
		} finally {
			if (sqlite) {
				try {
					await sqlite.close();
				} catch (closeError) {
					console.warn("⚠️ Error cerrando conexión en get:", closeError);
				}
			}
		}
	};

	// Transacción
	const transaction = async <T>(callback: (db: any) => Promise<T>): Promise<T> => {
		let sqlite = null;
		console.log("🔄 Iniciando transacción");
		try {
			sqlite = await getSqlite();
			await sqlite.execute("BEGIN TRANSACTION");
			const result = await callback(sqlite);
			await sqlite.execute("COMMIT");
			console.log("✅ Transacción completada exitosamente");
			return result;
		} catch (err) {
			if (sqlite) {
				try {
					await sqlite.execute("ROLLBACK");
				} catch (rollbackError) {
					console.warn("⚠️ Error durante rollback:", rollbackError);
				}
			}
			console.error("❌ Error en transacción, haciendo rollback:", err);
			throw err;
		} finally {
			if (sqlite) {
				try {
					await sqlite.close();
				} catch (closeError) {
					console.warn("⚠️ Error cerrando conexión en transaction:", closeError);
				}
			}
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
