<template>
	<div class="min-h-screen p-8">
		<div class="max-w-4xl mx-auto">
			<h1 class="text-3xl font-bold mb-8">
				🧪 Prueba de Base de Datos
			</h1>

			<!-- Estado de la base de datos -->
			<UCard class="mb-6">
				<template #header>
					<h2 class="text-xl font-semibold">
						Estado de la Base de Datos
					</h2>
				</template>

				<div class="space-y-4">
					<div class="flex items-center justify-between">
						<span>Inicializada:</span>
						<UBadge :color="isReady ? 'success' : 'error'">
							{{ isReady ? "Sí" : "No" }}
						</UBadge>
					</div>

					<div class="flex items-center justify-between">
						<span>Cargando:</span>
						<UBadge :color="isLoading ? 'warning' : 'success'">
							{{ isLoading ? "Sí" : "No" }}
						</UBadge>
					</div>

					<div v-if="error" class="text-red-500">
						Error: {{ error }}
					</div>
				</div>
			</UCard>

			<!-- Botones de prueba -->
			<div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
				<UButton
					color="primary"
					size="lg"
					:loading="isLoading"
					@click="testDatabase"
				>
					<UIcon name="i-heroicons-database" />
					Probar Base de Datos
				</UButton>

				<UButton
					color="success"
					size="lg"
					:loading="isLoading"
					@click="testConfig"
				>
					<UIcon name="i-heroicons-cog-6-tooth" />
					Probar Configuración
				</UButton>

				<UButton
					color="secondary"
					size="lg"
					:loading="isLoading"
					@click="testAccounts"
				>
					<UIcon name="i-heroicons-banknotes" />
					Probar Cuentas
				</UButton>

				<UButton
					color="warning"
					size="lg"
					:loading="isLoading"
					@click="testCategories"
				>
					<UIcon name="i-heroicons-tag" />
					Probar Categorías
				</UButton>
			</div>

			<!-- Resultados -->
			<UCard v-if="results.length > 0">
				<template #header>
					<h2 class="text-xl font-semibold">
						Resultados de las Pruebas
					</h2>
				</template>

				<div class="space-y-4">
					<div
						v-for="(result, index) in results"
						:key="index"
						class="p-4 border rounded-lg"
					>
						<div class="flex items-center justify-between mb-2">
							<h3 class="font-medium">
								{{ result.test }}
							</h3>
							<UBadge :color="result.success ? 'success' : 'error'">
								{{ result.success ? "Éxito" : "Error" }}
							</UBadge>
						</div>
						<p class="text-sm">
							{{ result.message }}
						</p>
						<pre
							v-if="result.data"
							class="mt-2 text-xs p-2 rounded overflow-x-auto"
						>{{ JSON.stringify(result.data, null, 2) }}</pre>
					</div>
				</div>
			</UCard>

			<!-- Logs -->
			<UCard v-if="logs.length > 0" class="mt-6">
				<template #header>
					<h2 class="text-xl font-semibold">
						Logs del Sistema
					</h2>
				</template>

				<div class="space-y-2">
					<div
						v-for="(log, index) in logs"
						:key="index"
						class="text-sm font-mono"
					>
						<span>[{{ log.time }}]</span>
						<span
							:class="log.type === 'error' ? 'text-red-500' : 'text-green-500'"
						>
							{{ log.message }}
						</span>
					</div>
				</div>
			</UCard>
		</div>
	</div>
</template>

<script setup lang="ts">
	import { ref } from "vue";

	// Composables
	const { isReady, isLoading, error, initialize, query } = useDatabase();
	const { loadConfigFromDatabase } = useDatabaseConfig();
	const { loadAccounts } = useAccounts();

	// Estado local
	const results = ref<Array<{ test: string, success: boolean, message: string, data?: any }>>([]);
	const logs = ref<Array<{ time: string, type: string, message: string }>>([]);

	// Función para agregar log
	const addLog = (type: "info" | "error", message: string) => {
		logs.value.unshift({
			time: new Date().toLocaleTimeString(),
			type,
			message
		});
	};

	// Función para agregar resultado
	const addResult = (test: string, success: boolean, message: string, data?: any) => {
		results.value.unshift({ test, success, message, data });
	};

	// Probar base de datos
	const testDatabase = async () => {
		addLog("info", "Iniciando prueba de base de datos...");

		try {
			// Inicializar base de datos
			await initialize();
			addResult("Inicialización", true, "Base de datos inicializada correctamente");

			// Probar consulta simple
			const tables = await query("SELECT name FROM sqlite_master WHERE type=\"table\"");
			addResult("Consulta de tablas", true, `Se encontraron ${tables.length} tablas`, tables);

			addLog("info", "Prueba de base de datos completada exitosamente");
		} catch (err) {
			addResult("Inicialización", false, `Error: ${err}`);
			addLog("error", `Error en prueba de base de datos: ${err}`);
		}
	};

	// Probar configuración
	const testConfig = async () => {
		addLog("info", "Iniciando prueba de configuración...");

		try {
			await loadConfigFromDatabase();
			addResult("Configuración", true, "Configuración cargada desde la base de datos");
			addLog("info", "Prueba de configuración completada exitosamente");
		} catch (err) {
			addResult("Configuración", false, `Error: ${err}`);
			addLog("error", `Error en prueba de configuración: ${err}`);
		}
	};

	// Probar cuentas
	const testAccounts = async () => {
		addLog("info", "Iniciando prueba de cuentas...");

		try {
			await loadAccounts();
			addResult("Cuentas", true, "Cuentas cargadas desde la base de datos");
			addLog("info", "Prueba de cuentas completada exitosamente");
		} catch (err) {
			addResult("Cuentas", false, `Error: ${err}`);
			addLog("error", `Error en prueba de cuentas: ${err}`);
		}
	};

	// Probar categorías
	const testCategories = async () => {
		addLog("info", "Iniciando prueba de categorías...");

		try {
			const categories = await query("SELECT * FROM categories WHERE tenant_id = ?", ["default"]);
			addResult("Categorías", true, `Se encontraron ${categories.length} categorías`, categories);
			addLog("info", "Prueba de categorías completada exitosamente");
		} catch (err) {
			addResult("Categorías", false, `Error: ${err}`);
			addLog("error", `Error en prueba de categorías: ${err}`);
		}
	};

	// Meta de la página
	useHead({
		title: "Prueba de Base de Datos - POS Venezuela"
	});
</script>
