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
							<div class="w-3 h-3 rounded-full opacity-50" />
							<span class="text-sm font-medium">Caja Abierta</span>
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
	</div>
</template>

<script setup lang="ts">
	import { computed, onMounted, onUnmounted, ref } from "vue";
	import { useAccounts } from "~/composables/useAccounts";
	import { useConfig } from "~/composables/useConfig";
	import { useCurrency } from "~/composables/useCurrency";

	// Configuración
	const config = useRuntimeConfig();
	const { getCurrencyConfig } = useConfig();
	const { formatCurrency } = useCurrency();
	const { getTotalBalanceByCurrency } = useAccounts();

	// Estado local
	const currentTime = ref("");
	const currentDate = ref("");
	const cashierName = ref("Administrador"); // TODO: Obtener del usuario actual
	const lowStockCount = ref(0);
	const totalProducts = ref(0);
	const todaySales = ref(0);
	const lastSync = ref("Nunca");

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

	// Timer para actualizar tiempo
	let timeInterval: NodeJS.Timeout | null = null;

	onMounted(() => {
		updateTime();
		timeInterval = setInterval(updateTime, 1000);

		// Simular datos (en el futuro esto vendrá de la base de datos)
		lowStockCount.value = 3;
		totalProducts.value = 150;
		todaySales.value = 25;
		lastSync.value = new Date().toLocaleTimeString("es-VE");
	});

	onUnmounted(() => {
		if (timeInterval) {
			clearInterval(timeInterval);
			timeInterval = null;
		}
	});

	// Meta de la página
	useHead({
		title: "POS Venezuela - Punto de Venta"
	});
</script>
