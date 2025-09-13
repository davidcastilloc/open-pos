<template>
	<NuxtLayout name="default">
		<div class="max-w-4xl mx-auto py-8">
			<!-- Header -->
			<div class="mb-8">
				<h1 class="text-3xl font-bold mb-2">
					Cierre de Caja
				</h1>
				<p class="opacity-75">
					Finaliza tu turno y genera el reporte de cierre
				</p>
			</div>

			<!-- Información del turno actual -->
			<UCard class="mb-6">
				<template #header>
					<div class="flex items-center space-x-2">
						<UIcon name="i-heroicons-clock" class="w-5 h-5" />
						<h2 class="text-xl font-semibold">
							Información del Turno
						</h2>
					</div>
				</template>

				<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
					<div>
						<label class="block text-sm font-medium mb-1">
							Vendedor
						</label>
						<p class="text-lg font-semibold">
							{{ cashierName }}
						</p>
					</div>
					<div>
						<label class="block text-sm font-medium mb-1">
							Inicio del turno
						</label>
						<p class="text-lg font-semibold">
							{{ shiftStartTime }}
						</p>
					</div>
					<div>
						<label class="block text-sm font-medium mb-1">
							Fin del turno
						</label>
						<p class="text-lg font-semibold">
							{{ currentTime }}
						</p>
					</div>
				</div>
			</UCard>

			<!-- Resumen de ventas por moneda -->
			<UCard class="mb-6">
				<template #header>
					<div class="flex items-center space-x-2">
						<UIcon name="i-heroicons-banknotes" class="w-5 h-5" />
						<h2 class="text-xl font-semibold">
							Resumen de Ventas
						</h2>
					</div>
				</template>

				<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
					<div v-for="(summary, currency) in salesSummary" :key="currency" class="text-center p-4 border rounded-lg">
						<div class="text-2xl font-bold mb-1">
							{{ formatCurrency(summary.total, currency) }}
						</div>
						<div class="text-sm opacity-75 mb-2">
							{{ currency }}
						</div>
						<div class="text-xs opacity-50">
							{{ summary.count }} transacciones
						</div>
					</div>
				</div>
			</UCard>

			<!-- Saldos de cuentas -->
			<UCard class="mb-6">
				<template #header>
					<div class="flex items-center space-x-2">
						<UIcon name="i-heroicons-wallet" class="w-5 h-5" />
						<h2 class="text-xl font-semibold">
							Saldos de Cuentas
						</h2>
					</div>
				</template>

				<div class="space-y-4">
					<div v-for="(balance, currency) in accountBalances" :key="currency" class="flex items-center justify-between p-3 border rounded-lg">
						<div class="flex items-center space-x-3">
							<div class="w-3 h-3 rounded-full opacity-50 border" />
							<span class="font-medium">{{ currency }}</span>
						</div>
						<span class="text-lg font-semibold">
							{{ formatCurrency(balance, currency) }}
						</span>
					</div>
				</div>
			</UCard>

			<!-- Resumen de métodos de pago -->
			<UCard class="mb-6">
				<template #header>
					<div class="flex items-center space-x-2">
						<UIcon name="i-heroicons-credit-card" class="w-5 h-5" />
						<h2 class="text-xl font-semibold">
							Métodos de Pago
						</h2>
					</div>
				</template>

				<div class="space-y-3">
					<div v-for="(amount, method) in paymentMethodsSummary" :key="method" class="flex items-center justify-between p-3 border rounded-lg">
						<div class="flex items-center space-x-3">
							<UIcon :name="getPaymentMethodIcon(method)" class="w-5 h-5" />
							<span class="font-medium">{{ getPaymentMethodName(method) }}</span>
						</div>
						<span class="text-lg font-semibold">
							{{ formatCurrency(amount, 'BS') }}
						</span>
					</div>
				</div>
			</UCard>

			<!-- Estadísticas de Clientes -->
			<UCard class="mb-6">
				<template #header>
					<div class="flex items-center space-x-2">
						<UIcon name="i-heroicons-users" class="w-5 h-5" />
						<h2 class="text-xl font-semibold">
							Estadísticas de Clientes
						</h2>
					</div>
				</template>

				<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
					<div class="text-center p-4 border rounded-lg">
						<div class="text-2xl font-bold mb-1 text-blue-600">
							{{ customerStats.totalCustomers }}
						</div>
						<div class="text-sm opacity-75 mb-2">
							Clientes Atendidos
						</div>
						<div class="text-xs opacity-50">
							{{ customerStats.uniqueCustomers }} únicos
						</div>
					</div>
					<div class="text-center p-4 border rounded-lg">
						<div class="text-2xl font-bold mb-1 text-green-600">
							{{ formatCurrency(customerStats.totalCustomerSales, 'BS') }}
						</div>
						<div class="text-sm opacity-75 mb-2">
							Ventas a Clientes
						</div>
						<div class="text-xs opacity-50">
							{{ customerStats.customerSalesCount }} transacciones
						</div>
					</div>
					<div class="text-center p-4 border rounded-lg">
						<div class="text-2xl font-bold mb-1 text-purple-600">
							{{ formatCurrency(customerStats.averageTicket, 'BS') }}
						</div>
						<div class="text-sm opacity-75 mb-2">
							Ticket Promedio
						</div>
						<div class="text-xs opacity-50">
							Por cliente
						</div>
					</div>
				</div>

				<!-- Top 5 clientes -->
				<div v-if="customerStats.topCustomers.length > 0" class="mt-6">
					<h3 class="text-lg font-medium mb-4">
						Top 5 Clientes del Turno
					</h3>
					<div class="space-y-2">
						<div v-for="(customer, index) in customerStats.topCustomers" :key="customer.id" class="flex items-center justify-between p-3 border rounded-lg">
							<div class="flex items-center space-x-3">
								<div class="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
									<span class="text-sm font-bold text-blue-600">#{{ index + 1 }}</span>
								</div>
								<div>
									<div class="font-medium">
										{{ customer.name }}
									</div>
									<div class="text-sm opacity-75">
										{{ customer.salesCount }} compras
									</div>
								</div>
							</div>
							<span class="text-lg font-semibold">
								{{ formatCurrency(customer.totalAmount, 'BS') }}
							</span>
						</div>
					</div>
				</div>
			</UCard>

			<!-- Observaciones -->
			<UCard class="mb-6">
				<template #header>
					<div class="flex items-center space-x-2">
						<UIcon name="i-heroicons-document-text" class="w-5 h-5" />
						<h2 class="text-xl font-semibold">
							Observaciones
						</h2>
					</div>
				</template>

				<UTextarea
					v-model="observations"
					placeholder="Agrega observaciones sobre el turno (opcional)..."
					:rows="3"
				/>
			</UCard>

			<!-- Mensaje cuando la caja está cerrada -->
			<div v-if="!isCashSessionOpen" class="mb-6">
				<UAlert
					color="warning"
					variant="soft"
					title="Caja Cerrada"
					description="No hay una sesión de caja activa. Abre una sesión desde el POS para poder generar reportes o cerrar caja."
				/>
			</div>

			<!-- Botones de acción -->
			<div class="flex space-x-4">
				<UButton
					variant="outline"
					size="lg"
					@click="goBack"
				>
					<UIcon name="i-heroicons-arrow-left" />
					Volver
				</UButton>

				<UButton
					variant="outline"
					size="lg"
					:loading="isGeneratingReport"
					:disabled="!isCashSessionOpen"
					@click="handleGenerateReport"
				>
					<UIcon name="i-heroicons-document-arrow-down" />
					Generar Reporte
				</UButton>

				<UButton
					color="error"
					size="lg"
					:loading="isProcessingCashClosing"
					:disabled="!isCashSessionOpen"
					@click="confirmCashClosing"
				>
					<UIcon name="i-heroicons-lock-closed" />
					Terminar Turno
				</UButton>
			</div>

			<!-- Modal de confirmación -->
			<UModal v-model:open="showConfirmModal">
				<template #header>
					<h3 class="text-lg font-semibold">
						Confirmar Cierre de Caja
					</h3>
				</template>

				<template #body>
					<div class="space-y-4">
						<p class="opacity-75">
							¿Estás seguro de que deseas terminar el turno? Esta acción no se puede deshacer.
						</p>
						<UAlert color="warning" variant="soft" title="Advertencia" description="Se generará un reporte de cierre y se cerrará la sesión actual." />
					</div>
				</template>

				<template #footer>
					<div class="flex space-x-3">
						<UButton
							variant="outline"
							@click="showConfirmModal = false"
						>
							Cancelar
						</UButton>
						<UButton
							color="error"
							:loading="isProcessingCashClosing"
							@click="handleCashClosing"
						>
							Confirmar Cierre
						</UButton>
					</div>
				</template>
			</UModal>
		</div>
	</NuxtLayout>
</template>

<script setup lang="ts">
	import { computed, onMounted, ref } from "vue";
	import { useCashClosing } from "~/composables/useCashClosing";
	import { useCurrency } from "~/composables/useCurrency";
	import { useNotifications } from "~/composables/useNotifications";
	import { getPaymentMethodIcon, getPaymentMethodLabel } from "~/composables/usePaymentMethods";

	// Composables
	const {
		accountBalances,
		getSalesSummary,
		getPaymentMethodsSummary,
		processCashClosing,
		generateReport,
		initializeCashSession,
		isProcessing: isProcessingCashClosing,
		isGeneratingReport,
		isCashSessionOpen
	} = useCashClosing();
	const { formatCurrency } = useCurrency();
	const notifications = useNotifications();
	// const { getCustomerStats } = useCustomers();

	// Estado local
	const currentTime = ref("");
	const shiftStartTime = ref("");
	const cashierName = ref("Administrador");
	const observations = ref("");
	const showConfirmModal = ref(false);

	// Estadísticas de clientes
	const customerStats = ref({
		totalCustomers: 0,
		uniqueCustomers: 0,
		totalCustomerSales: 0,
		customerSalesCount: 0,
		averageTicket: 0,
		topCustomers: [] as Array<{
			id: string
			name: string
			totalAmount: number
			salesCount: number
		}>
	});

	// Computed
	const salesSummary = computed(() => {
		return getSalesSummary();
	});

	const paymentMethodsSummary = computed(() => {
		const methods = getPaymentMethodsSummary();
		const summary: Record<string, number> = {};
		Object.values(methods).forEach((method) => {
			summary[method.method] = method.amount;
		});
		return summary;
	});

	// Métodos
	const updateTime = () => {
		const now = new Date();
		currentTime.value = now.toLocaleTimeString("es-VE", {
			hour: "2-digit",
			minute: "2-digit",
			second: "2-digit"
		});
	};

	// Usar las funciones del helper
	const getPaymentMethodName = getPaymentMethodLabel;

	const goBack = () => {
		navigateTo("/");
	};

	const handleGenerateReport = async () => {
		try {
			await generateReport();

			// Mostrar notificación de éxito
			notifications.success("Reporte generado", "El reporte de cierre de caja se ha generado y descargado exitosamente");
			console.log("✅ Reporte generado y descargado exitosamente");
		} catch (error) {
			console.error("Error generating report:", error);
			notifications.error("Error al generar reporte", "No se pudo generar el reporte de cierre de caja");
			console.error("❌ Error al generar el reporte");
		}
	};

	const confirmCashClosing = () => {
		showConfirmModal.value = true;
	};

	const handleCashClosing = async () => {
		try {
			// Validar que hay observaciones si es requerido
			if (!observations.value.trim()) {
				console.warn("⚠️ Se recomienda agregar observaciones antes del cierre");
			}

			await processCashClosing(observations.value);

			// Mostrar notificación de éxito
			console.log("✅ Cierre de caja procesado exitosamente");

			// Redirigir al inicio
			await navigateTo("/");
		} catch (error) {
			console.error("Error processing cash closing:", error);
			notifications.error("Error en cierre de caja", "No se pudo procesar el cierre de caja correctamente");
			console.error("❌ Error al procesar el cierre de caja");
		} finally {
			showConfirmModal.value = false;
		}
	};

	// Función para cargar estadísticas de clientes
	const loadCustomerStats = async () => {
		try {
			const { useDatabase } = await import("~/composables/useDatabase");
			const { execute } = useDatabase();

			// Obtener estadísticas de clientes del turno actual
			const result = await execute(`
				SELECT 
					COUNT(DISTINCT cs.customer_id) as uniqueCustomers,
					COUNT(cs.id) as totalSales,
					COALESCE(SUM(cs.total_amount), 0) as totalAmount,
					COALESCE(AVG(cs.total_amount), 0) as averageTicket
				FROM customer_sales cs
				INNER JOIN sales s ON cs.sale_id = s.id
				WHERE s.created_at >= datetime('now', '-8 hours')
			`);

			const stats = result.rows[0] as any;

			// Obtener top 5 clientes del turno
			const topCustomersResult = await execute(`
				SELECT 
					c.id,
					c.name,
					COUNT(cs.id) as salesCount,
					SUM(cs.total_amount) as totalAmount
				FROM customer_sales cs
				INNER JOIN customers c ON cs.customer_id = c.id
				INNER JOIN sales s ON cs.sale_id = s.id
				WHERE s.created_at >= datetime('now', '-8 hours')
				GROUP BY c.id, c.name
				ORDER BY totalAmount DESC
				LIMIT 5
			`);

			customerStats.value = {
				totalCustomers: stats.totalSales || 0,
				uniqueCustomers: stats.uniqueCustomers || 0,
				totalCustomerSales: stats.totalAmount || 0,
				customerSalesCount: stats.totalSales || 0,
				averageTicket: stats.averageTicket || 0,
				topCustomers: topCustomersResult.rows.map((row: any) => ({
					id: row.id,
					name: row.name,
					totalAmount: row.totalAmount,
					salesCount: row.salesCount
				}))
			};
		} catch (error) {
			console.error("Error cargando estadísticas de clientes:", error);
		}
	};

	// Lifecycle
	onMounted(async () => {
		updateTime();
		setInterval(updateTime, 1000);

		// Inicializar sesión de caja desde la base de datos
		await initializeCashSession();

		// Cargar estadísticas de clientes
		await loadCustomerStats();

		// Simular inicio de turno (en el futuro esto vendrá de la base de datos)
		shiftStartTime.value = new Date(Date.now() - 8 * 60 * 60 * 1000).toLocaleTimeString("es-VE", {
			hour: "2-digit",
			minute: "2-digit"
		});
	});
</script>
