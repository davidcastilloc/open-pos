<template>
	<div class="min-h-screen flex flex-col">
		<!-- Header del POS -->
		<header class="shadow-sm border-b">
			<div class="px-6 py-4">
				<div class="flex items-center justify-between">
					<!-- Logo y nombre -->
					<div class="flex items-center space-x-4">
						<div class="flex items-center space-x-3">
							<UIcon name="i-heroicons-shopping-cart" class="w-8 h-8" />
							<div>
								<h1 class="text-2xl font-bold">
									POS Venezuela
								</h1>
								<p class="text-sm opacity-75">
									Sistema de Punto de Venta
								</p>
							</div>
						</div>
					</div>

					<!-- Estado de caja y saldos -->
					<div class="flex items-center space-x-6">
						<!-- Estado de caja -->
						<div class="flex items-center space-x-2">
							<UBadge :color="isCashSessionOpen ? 'success' : 'error'" variant="soft">
								{{ isCashSessionOpen ? 'Caja Abierta' : 'Caja Cerrada' }}
							</UBadge>
						</div>

						<!-- Vendedor -->
						<div class="text-sm opacity-75">
							<span class="font-medium">Vendedor:</span> {{ cashierName }}
						</div>

						<!-- Hora actual -->
						<div class="text-sm opacity-75">
							<UIcon name="i-heroicons-clock" class="w-4 h-4 inline mr-1" />
							{{ currentTime }}
						</div>

						<!-- Saldos por moneda -->
						<div class="flex items-center space-x-4">
							<div v-for="(balance, currency) in accountBalances" :key="currency" class="text-sm">
								<span class="font-medium">{{ currency }}:</span>
								<span class="font-semibold">{{ formatCurrency(balance, currency) }}</span>
							</div>
						</div>

						<!-- Botón Terminar Turno (solo visible si hay sesión abierta) -->
						<UButton
							v-if="isCashSessionOpen"
							color="error"
							variant="outline"
							size="sm"
							@click="navigateTo('/cash-closing')"
						>
							<UIcon name="i-heroicons-lock-closed" />
							Terminar Turno
						</UButton>

						<!-- Botón Abrir Caja (solo visible si hay sesión cerrada) -->
						<UButton
							v-else
							color="success"
							variant="outline"
							size="sm"
							@click="showOpenCashModal = true"
						>
							<UIcon name="i-heroicons-lock-open" />
							Abrir Caja
						</UButton>
					</div>
				</div>
			</div>
		</header>

		<!-- Barra de estado -->
		<div class="border-b">
			<div class="px-6 py-2">
				<div class="flex items-center justify-between text-sm">
					<!-- Estado de conexión -->
					<div class="flex items-center space-x-4">
						<div class="flex items-center space-x-2">
							<div class="w-2 h-2 rounded-full opacity-50" />
							<span class="opacity-75">Online</span>
						</div>
						<div class="opacity-50">
							Última sincronización: {{ lastSync }}
						</div>
					</div>

					<!-- Notificaciones -->
					<div class="flex items-center space-x-4">
						<div v-if="lowStockCount > 0" class="flex items-center space-x-2">
							<UIcon name="i-heroicons-exclamation-triangle" class="w-4 h-4" />
							<span>{{ lowStockCount }} productos con stock bajo</span>
						</div>
						<div class="opacity-50">
							{{ totalProducts }} productos disponibles
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Contenido principal -->
		<main class="flex-1 overflow-hidden">
			<slot />
		</main>

		<!-- Footer con información del sistema -->
		<footer class="border-t">
			<div class="px-6 py-3">
				<div class="flex items-center justify-between text-sm opacity-50">
					<div>
						POS Venezuela v{{ appVersion }} | {{ currentDate }}
					</div>
					<div class="flex items-center space-x-4">
						<span>Moneda actual: {{ currentCurrency }}</span>
						<span>Ventas hoy: {{ todaySales }}</span>
					</div>
				</div>
			</div>
		</footer>

		<!-- Modal para abrir sesión de caja -->
		<OpenCashSessionModal
			v-model:open="showOpenCashModal"
			@success="handleCashSessionOpened"
		/>
	</div>
</template>

<script setup lang="ts">
	import { computed, nextTick, onMounted, onUnmounted, ref, watch } from "vue";
	import { useAccounts } from "~/composables/useAccounts";
	import { useCashClosing } from "~/composables/useCashClosing";
	import { useConfig } from "~/composables/useConfig";
	import { useCurrency } from "~/composables/useCurrency";

	// Configuración
	const config = useRuntimeConfig();
	const { getCurrencyConfig } = useConfig();
	const { formatCurrency } = useCurrency();
	const { getTotalBalanceByCurrency } = useAccounts();
	const { isCashSessionOpen, openCashSession, initializeCashSession } = useCashClosing();

	// Estado local
	const currentTime = ref("");
	const currentDate = ref("");
	const cashierName = ref("Administrador"); // TODO: Obtener del usuario actual
	const lowStockCount = ref(0);
	const totalProducts = ref(0);
	const todaySales = ref(0);
	const lastSync = ref("Nunca");
	const showOpenCashModal = ref(false);

	// Configuración de la aplicación
	const appVersion = config.public.appVersion;
	const currentCurrency = computed(() => {
		try {
			return getCurrencyConfig.value?.defaultCurrency || "BS";
		} catch (error) {
			console.error("Error getting currency config:", error);
			return "BS";
		}
	});

	// Saldos de cuentas
	const accountBalances = computed(() => {
		try {
			return getTotalBalanceByCurrency.value || {};
		} catch (error) {
			console.error("Error getting account balances:", error);
			return {};
		}
	});

	// Actualizar tiempo
	const updateTime = () => {
		try {
			const now = new Date();
			currentTime.value = now.toLocaleTimeString("es-VE", {
				hour: "2-digit",
				minute: "2-digit",
				second: "2-digit"
			});
			currentDate.value = now.toLocaleDateString("es-VE", {
				year: "numeric",
				month: "long",
				day: "numeric"
			});
		} catch (error) {
			console.error("Error updating time:", error);
		}
	};

	// Manejar apertura de caja (función legacy, no se usa actualmente)
	const _handleOpenCashSession = async () => {
		try {
			await openCashSession();
		} catch (error) {
			console.error("Error opening cash session:", error);
		}
	};

	// Manejar cuando se abre exitosamente la sesión de caja
	const handleCashSessionOpened = async () => {
		try {
			console.log("✅ Sesión de caja abierta exitosamente");

			// Recargar la sesión de caja para asegurar que el estado esté actualizado
			await initializeCashSession();

			// Forzar actualización del estado
			await nextTick();

			// Verificar que el estado se haya actualizado correctamente
			if (isCashSessionOpen.value) {
				console.log("✅ Estado de caja actualizado correctamente - Caja abierta");
			} else {
				console.warn("⚠️ Estado de caja no se actualizó correctamente");
			}
		} catch (error) {
			console.error("❌ Error actualizando estado de caja:", error);
		}
	};

	// Timer para actualizar tiempo
	let timeInterval: NodeJS.Timeout | null = null;

	onMounted(async () => {
		updateTime();
		timeInterval = setInterval(updateTime, 1000);

		// Inicializar sesión de caja desde la base de datos
		await initializeCashSession();

		// Simular datos (en el futuro esto vendrá de la base de datos)
		lowStockCount.value = 3;
		totalProducts.value = 150;
		todaySales.value = 25;
		lastSync.value = new Date().toLocaleTimeString("es-VE");
	});

	// Watcher para detectar cambios en el estado de la caja
	watch(isCashSessionOpen, (newValue, oldValue) => {
		console.log("🔄 [Layout] Estado de caja cambió:", { oldValue, newValue });
	}, { immediate: true });

	onUnmounted(() => {
		if (timeInterval) {
			clearInterval(timeInterval);
			timeInterval = null;
		}
	});
</script>
