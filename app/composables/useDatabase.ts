import { computed, readonly, ref } from "vue";
import { db, initDatabase } from "~/database/connection";

export function useDatabase() {
	const isInitialized = ref(false);
	const isLoading = ref(false);
	const error = ref<string | null>(null);

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
			// Por ahora usamos una implementación simple
			// En el futuro esto se integrará con Drizzle ORM
			console.log("Query:", sql, params);
			return [] as T[];
		} catch (err) {
			console.error("Error executing query:", err);
			throw err;
		}
	};

	// Ejecutar comando
	const execute = async (sql: string, params: any[] = []): Promise<any> => {
		try {
			// Por ahora usamos una implementación simple
			// En el futuro esto se integrará con Drizzle ORM
			console.log("Execute:", sql, params);
			return { changes: 0, lastInsertRowid: 0 };
		} catch (err) {
			console.error("Error executing command:", err);
			throw err;
		}
	};

	// Obtener una fila
	const get = async <T>(sql: string, params: any[] = []): Promise<T | undefined> => {
		try {
			// Por ahora usamos una implementación simple
			// En el futuro esto se integrará con Drizzle ORM
			console.log("Get:", sql, params);
			return undefined;
		} catch (err) {
			console.error("Error getting row:", err);
			throw err;
		}
	};

	// Transacción
	const transaction = async <T>(callback: () => T): Promise<T> => {
		try {
			// Por ahora usamos una implementación simple
			// En el futuro esto se integrará con Drizzle ORM
			console.log("Transaction started");
			const result = callback();
			console.log("Transaction completed");
			return result;
		} catch (err) {
			console.error("Error in transaction:", err);
			throw err;
		}
	};

	// Verificar si la base de datos está lista
	const isReady = computed(() => isInitialized.value && !isLoading.value);

	return {
		db,
		isInitialized: readonly(isInitialized),
		isLoading: readonly(isLoading),
		error: readonly(error),
		isReady,
		initialize,
		query,
		execute,
		get,
		transaction
	};
}
