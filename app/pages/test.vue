<template>
	<div class="p-6">
		<h1 class="text-2xl font-bold mb-6">
			🧪 Página de Prueba - Sistema POS
		</h1>

		<!-- Estado de la Base de Datos -->
		<UCard class="mb-6">
			<template #header>
				<h2 class="text-lg font-semibold">
					🗄️ Estado de la Base de Datos
				</h2>
			</template>

			<div class="space-y-4">
				<div class="flex items-center gap-2">
					<UIcon
						:name="isReady ? 'i-heroicons-check-circle' : 'i-heroicons-x-circle'"
						:class="isReady ? 'text-green-500' : 'text-red-500'"
					/>
					<span>Base de datos: {{ isReady ? 'Lista' : 'No inicializada' }}</span>
				</div>

				<div class="flex items-center gap-2">
					<UIcon
						:name="isLoading ? 'i-heroicons-arrow-path' : 'i-heroicons-check-circle'"
						:class="isLoading ? 'text-blue-500 animate-spin' : 'text-green-500'"
					/>
					<span>Cargando: {{ isLoading ? 'Sí' : 'No' }}</span>
				</div>

				<div v-if="error" class="text-red-500">
					Error: {{ error }}
				</div>

				<!-- Botones de prueba de base de datos -->
				<div class="flex gap-2">
					<UButton :loading="dbTestLoading" size="sm" @click="testDatabaseConnection">
						<UIcon name="i-heroicons-database" />
						Probar Conexión
					</UButton>

					<UButton :loading="tableTestLoading" size="sm" @click="testTableCount">
						<UIcon name="i-heroicons-table-cells" />
						Contar Tablas
					</UButton>

					<UButton :loading="insertTestLoading" size="sm" @click="testInsertData">
						<UIcon name="i-heroicons-plus-circle" />
						Insertar Datos
					</UButton>
				</div>

				<!-- Resultados de las pruebas -->
				<div v-if="dbTestResults" class="mt-4 p-4  rounded-lg">
					<h3 class="font-medium mb-2">
						Resultados de las Pruebas:
					</h3>
					<pre class="text-sm">{{ dbTestResults }}</pre>
				</div>
			</div>
		</UCard>

		<!-- Información de la Base de Datos -->
		<UCard class="mb-6">
			<template #header>
				<h2 class="text-lg font-semibold">
					📋 Información de la Base de Datos
				</h2>
			</template>

			<div class="space-y-4">
				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<h3 class="font-medium mb-2">
							Tablas del Sistema:
						</h3>
						<div class="space-y-1">
							<div v-for="table in systemTables" :key="table" class="flex items-center gap-2">
								<UIcon name="i-heroicons-table-cells" class="text-blue-500" />
								<span class="text-sm">{{ table }}</span>
							</div>
						</div>
					</div>

					<div>
						<h3 class="font-medium mb-2">
							Configuración por Defecto:
						</h3>
						<div class="space-y-1">
							<div v-for="config in defaultConfigs" :key="config.key" class="flex items-center gap-2">
								<UIcon name="i-heroicons-cog-6-tooth" class="text-green-500" />
								<span class="text-sm">{{ config.key }}: {{ config.value }}</span>
							</div>
						</div>
					</div>
				</div>
			</div>
		</UCard>

		<!-- Configuración -->
		<UCard class="mb-6">
			<template #header>
				<h2 class="text-lg font-semibold">
					⚙️ Configuración del Sistema
				</h2>
			</template>

			<div class="space-y-4">
				<div>
					<h3 class="font-medium mb-2">
						Monedas Soportadas:
					</h3>
					<div class="flex gap-2">
						<UBadge
							v-for="currency in getCurrencyConfig.supportedCurrencies"
							:key="currency"
							:color="currency === getCurrencyConfig.defaultCurrency ? 'primary' : 'gray'"
						>
							{{ currency }}
						</UBadge>
					</div>
				</div>

				<div>
					<h3 class="font-medium mb-2">
						Moneda por Defecto:
					</h3>
					<UBadge color="primary">
						{{ getCurrencyConfig.defaultCurrency }}
					</UBadge>
				</div>

				<div>
					<h3 class="font-medium mb-2">
						Fuentes de Tasas de Cambio:
					</h3>
					<div class="space-y-1">
						<div
							v-for="source in getCurrencyConfig.exchangeRateSources"
							:key="source.name"
							class="flex items-center gap-2"
						>
							<UIcon
								:name="source.isActive ? 'i-heroicons-check-circle' : 'i-heroicons-x-circle'"
								:class="source.isActive ? 'text-green-500' : 'text-red-500'"
							/>
							<span>{{ source.name }} (Prioridad: {{ source.priority }})</span>
						</div>
					</div>
				</div>
			</div>
		</UCard>

		<!-- Tasas de Cambio -->
		<UCard class="mb-6">
			<template #header>
				<h2 class="text-lg font-semibold">
					💱 Tasas de Cambio
				</h2>
			</template>

			<div class="space-y-4">
				<div class="flex items-center gap-4">
					<UButton :loading="currencyLoading" @click="refreshRates">
						<UIcon name="i-heroicons-arrow-path" />
						Actualizar Tasas
					</UButton>

					<span class="text-sm text-gray-500">
						Última actualización: {{ lastUpdateFormatted }}
					</span>
				</div>

				<div v-if="currencyError" class="text-red-500">
					Error: {{ currencyError }}
				</div>

				<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
					<div v-for="rate in currentRates" :key="rate.id" class="p-4 border rounded-lg">
						<div class="font-medium">
							{{ rate.fromCurrency }} → {{ rate.toCurrency }}
						</div>
						<div class="text-2xl font-bold text-primary">
							{{ rate.rate.toFixed(4) }}
						</div>
						<div class="text-sm text-gray-500">
							{{ rate.source }}
						</div>
					</div>
				</div>
			</div>
		</UCard>

		<!-- Prueba de Conversión -->
		<UCard class="mb-6">
			<template #header>
				<h2 class="text-lg font-semibold">
					🔄 Prueba de Conversión
				</h2>
			</template>

			<div class="space-y-4">
				<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
					<UFormGroup label="Cantidad">
						<UInput v-model="testAmount" type="number" placeholder="100" />
					</UFormGroup>

					<UFormGroup label="De">
						<USelect v-model="testFrom" :options="currencyOptions" />
					</UFormGroup>

					<UFormGroup label="A">
						<USelect v-model="testTo" :options="currencyOptions" />
					</UFormGroup>
				</div>

				<div v-if="convertedAmount !== null" class="p-4 bg-gray-50 rounded-lg">
					<div class="text-lg">
						{{ formatCurrency(testAmount, testFrom) }} =
						<span class="font-bold text-primary">{{ formatCurrency(convertedAmount, testTo) }}</span>
					</div>
				</div>
			</div>
		</UCard>

		<!-- Impuestos -->
		<UCard>
			<template #header>
				<h2 class="text-lg font-semibold">
					📊 Configuración de Impuestos
				</h2>
			</template>

			<div class="space-y-4">
				<div>
					<h3 class="font-medium mb-2">
						IVA:
					</h3>
					<div class="flex items-center gap-2">
						<UBadge :color="getTaxConfig.iva.isActive ? 'green' : 'red'">
							{{ (getTaxConfig.iva.rate * 100).toFixed(1) }}%
						</UBadge>
						<span class="text-sm text-gray-500">{{ getTaxConfig.iva.description }}</span>
					</div>
				</div>

				<div>
					<h3 class="font-medium mb-2">
						ISLR:
					</h3>
					<div class="flex items-center gap-2">
						<UBadge :color="getTaxConfig.islr.isActive ? 'green' : 'red'">
							{{ (getTaxConfig.islr.rate * 100).toFixed(1) }}%
						</UBadge>
						<span class="text-sm text-gray-500">{{ getTaxConfig.islr.description }}</span>
					</div>
				</div>
			</div>
		</UCard>
	</div>
</template>

<script setup lang="ts">
// Composables
	const { isReady, isLoading, error, query, execute } = useDatabase();
	const { getCurrencyConfig, getTaxConfig } = useConfig();
	const {
		currentRates,
		isLoading: currencyLoading,
		error: currencyError,
		lastUpdateFormatted,
		fetchCurrentRates,
		convertAmount,
		formatCurrency
	} = useCurrency();

	// Estado para pruebas de base de datos
	const dbTestLoading = ref(false);
	const tableTestLoading = ref(false);
	const insertTestLoading = ref(false);
	const dbTestResults = ref("");

	// Información de la base de datos
	const systemTables = ref([
		"accounts",
		"cash_closings",
		"transactions",
		"exchange_rates",
		"sync_queue",
		"system_config",
		"categories",
		"products",
		"customers",
		"sale_items",
		"sales"
	]);

	const defaultConfigs = ref([
		{ key: "appName", value: "POS Venezuela" },
		{ key: "defaultCurrency", value: "BS" },
		{ key: "supportedCurrencies", value: "BS, USD, EUR" },
		{ key: "timezone", value: "America/Caracas" }
	]);

	// Estado para prueba de conversión
	const testAmount = ref(100);
	const testFrom = ref("USD");
	const testTo = ref("BS");

	// Opciones de monedas
	const currencyOptions = [
		{ label: "Bolívares (BS)", value: "BS" },
		{ label: "Dólares (USD)", value: "USD" },
		{ label: "Euros (EUR)", value: "EUR" }
	];

	// Conversión calculada
	const convertedAmount = computed(() => {
		if (!testAmount.value || !testFrom.value || !testTo.value) return null;
		return convertAmount(testAmount.value, testFrom.value, testTo.value);
	});

	// Función para probar la conexión a la base de datos
	const testDatabaseConnection = async () => {
		dbTestLoading.value = true;
		dbTestResults.value = "";

		try {
			const result = await query("SELECT 1 as test");
			dbTestResults.value = `✅ Conexión exitosa: ${JSON.stringify(result, null, 2)}`;
		} catch (err) {
			dbTestResults.value = `❌ Error de conexión: ${err}`;
		} finally {
			dbTestLoading.value = false;
		}
	};

	// Función para contar las tablas
	const testTableCount = async () => {
		tableTestLoading.value = true;
		dbTestResults.value = "";

		try {
			const tables = await query(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name NOT LIKE 'sqlite_%'
      ORDER BY name
    `);

			const tableCounts = [];
			for (const table of tables) {
				const count = await query(`SELECT COUNT(*) as count FROM ${table.name}`);
				tableCounts.push(`${table.name}: ${count[0].count} registros`);
			}

			dbTestResults.value = `📊 Tablas encontradas (${tables.length}):\n${tableCounts.join("\n")}`;
		} catch (err) {
			dbTestResults.value = `❌ Error al contar tablas: ${err}`;
		} finally {
			tableTestLoading.value = false;
		}
	};

	// Función para insertar datos de prueba
	const testInsertData = async () => {
		insertTestLoading.value = true;
		dbTestResults.value = "";

		try {
			// Insertar un producto de prueba
			const productId = `test_product_${Date.now()}`;
			await execute(`
      INSERT INTO products (id, tenant_id, name, description, sku, price, cost, stock, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `, [productId, "default", "Producto de Prueba", "Descripción del producto de prueba", "TEST-001", 10.50, 8.00, 100]);

			// Verificar que se insertó
			const inserted = await query("SELECT * FROM products WHERE id = ?", [productId]);

			dbTestResults.value = `✅ Producto insertado exitosamente:\n${JSON.stringify(inserted[0], null, 2)}`;
		} catch (err) {
			dbTestResults.value = `❌ Error al insertar datos: ${err}`;
		} finally {
			insertTestLoading.value = false;
		}
	};

	// Función para cargar información de la base de datos
	const loadDatabaseInfo = async () => {
		if (!isReady.value) return;

		try {
			// Cargar tablas reales
			const tables = await query(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name NOT LIKE 'sqlite_%'
      ORDER BY name
    `);
			systemTables.value = tables.map((t) => t.name);

			// Cargar configuración real
			const configs = await query(`
      SELECT key, value FROM system_config 
      WHERE tenant_id = 'default' AND category = 'general'
      ORDER BY key
    `);
			defaultConfigs.value = configs.map((c) => ({ key: c.key, value: c.value }));
		} catch (err) {
			console.error("Error cargando información de la base de datos:", err);
		}
	};

	// Función para actualizar tasas
	const refreshRates = async () => {
		await fetchCurrentRates();
	};

	// Cargar información cuando la base de datos esté lista
	watch(isReady, (ready) => {
		if (ready) {
			loadDatabaseInfo();
		}
	});

	// Meta de la página
	useHead({
		title: "Prueba del Sistema POS"
	});
</script>
