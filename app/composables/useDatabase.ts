import Database from "@tauri-apps/plugin-sql";
import { computed } from "vue";
import { initDatabase } from "~/database/connection";

export function useDatabase() {
	const isInitialized = useState("database.isInitialized", () => false);
	const isLoading = useState("database.isLoading", () => false);
	const error = useState<string | null>("database.error", () => null);

	// Inicializar base de datos
	const initialize = async () => {
		if (isInitialized.value) return;

		isLoading.value = true;
		error.value = null;

		try {
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
	const query = async <T>(sql: string, params: any[] = []): Promise<T[]> => {
		try {
			const sqlite = await Database.load("sqlite:pos.db");
			const rows = await sqlite.select(sql, params);
			await sqlite.close();
			return rows as T[];
		} catch (err) {
			console.error("Error executing query:", err);
			throw err;
		}
	};

	// Ejecutar comando
	const execute = async (sql: string, params: any[] = []): Promise<any> => {
		try {
			const sqlite = await Database.load("sqlite:pos.db");
			const result = await sqlite.execute(sql, params);
			await sqlite.close();
			return result;
		} catch (err) {
			console.error("Error executing command:", err);
			throw err;
		}
	};

	// Obtener una fila
	const get = async <T>(sql: string, params: any[] = []): Promise<T | undefined> => {
		try {
			const sqlite = await Database.load("sqlite:pos.db");
			const rows = await sqlite.select(sql, params);
			await sqlite.close();
			return (rows as any[])[0] as T | undefined;
		} catch (err) {
			console.error("Error getting row:", err);
			throw err;
		}
	};

	// Transacción
	const transaction = async <T>(callback: (db: any) => Promise<T>): Promise<T> => {
		const sqlite = await Database.load("sqlite:pos.db");
		try {
			await sqlite.execute("BEGIN TRANSACTION");
			const result = await callback(sqlite);
			await sqlite.execute("COMMIT");
			return result;
		} catch (err) {
			await sqlite.execute("ROLLBACK");
			throw err;
		} finally {
			await sqlite.close();
		}
	};

	// Verificar si la base de datos está lista
	const isReady = computed(() => isInitialized.value && !isLoading.value);

	return {
		isInitialized,
		isLoading,
		error,
		isReady,
		initialize,
		query,
		execute,
		get,
		transaction
	};
}
