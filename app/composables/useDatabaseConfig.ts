import { computed, ref } from "vue";
import { useDatabase } from "./useDatabase";

export function useDatabaseConfig() {
	const { query, get, execute } = useDatabase();
	const config = ref<Record<string, any>>({});
	const isLoading = ref(false);
	const error = ref<string | null>(null);

	// Cargar configuración desde la base de datos
	const loadConfigFromDatabase = async (category?: string) => {
		isLoading.value = true;
		error.value = null;

		try {
			let sql = "SELECT * FROM system_config WHERE tenant_id = ?";
			const params = ["default"];

			if (category) {
				sql += " AND category = ?";
				params.push(category);
			}

			const configs = await query<any>(sql, params);

			// Organizar configuración por categoría
			const organizedConfig: Record<string, any> = {};

			configs.forEach((item: any) => {
				if (!organizedConfig[item.category]) {
					organizedConfig[item.category] = {};
				}

				// Parsear valor según el tipo
				let value = item.value;
				if (item.type === "object" || item.type === "array") {
					try {
						value = JSON.parse(item.value);
					} catch (e) {
						console.warn(`Error parsing config value for ${item.key}:`, e);
					}
				} else if (item.type === "number") {
					value = Number.parseFloat(item.value);
				} else if (item.type === "boolean") {
					value = item.value === "true";
				}

				organizedConfig[item.category][item.key] = value;
			});

			config.value = organizedConfig;
			console.log("✅ Configuración cargada desde la base de datos:", organizedConfig);
		} catch (err) {
			error.value = "Error al cargar configuración desde la base de datos";
			console.error("Error loading config from database:", err);
		} finally {
			isLoading.value = false;
		}
	};

	// Actualizar configuración en la base de datos
	const updateConfigInDatabase = async (category: string, key: string, value: any) => {
		try {
			// Determinar el tipo de valor
			let type = "string";
			let stringValue = String(value);

			if (typeof value === "object") {
				type = "object";
				stringValue = JSON.stringify(value);
			} else if (typeof value === "number") {
				type = "number";
				stringValue = String(value);
			} else if (typeof value === "boolean") {
				type = "boolean";
				stringValue = String(value);
			}

			const sql = `
        INSERT OR REPLACE INTO system_config 
        (id, tenant_id, category, key, value, type, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
      `;

			await execute(sql, [
				`config_${category}_${key}`,
				"default",
				category,
				key,
				stringValue,
				type
			]);

			// Actualizar cache local
			if (!config.value[category]) {
				config.value[category] = {};
			}
			config.value[category][key] = value;

			console.log(`✅ Configuración actualizada: ${category}.${key} = ${value}`);
		} catch (err) {
			error.value = "Error al actualizar configuración en la base de datos";
			console.error("Error updating config in database:", err);
		}
	};

	// Obtener configuración específica
	const getConfig = (category: string, key: string) => {
		return config.value[category]?.[key];
	};

	// Obtener configuración de moneda
	const getCurrencyConfig = computed(() => {
		return config.value.currency || {};
	});

	// Obtener configuración de impuestos
	const getTaxConfig = computed(() => {
		return config.value.taxes || {};
	});

	// Obtener configuración de cuentas
	const getAccountConfig = computed(() => {
		return config.value.accounts || {};
	});

	// Obtener configuración de reportes
	const getReportConfig = computed(() => {
		return config.value.reports || {};
	});

	return {
		config: readonly(config),
		isLoading: readonly(isLoading),
		error: readonly(error),
		loadConfigFromDatabase,
		updateConfigInDatabase,
		getConfig,
		getCurrencyConfig,
		getTaxConfig,
		getAccountConfig,
		getReportConfig
	};
}
