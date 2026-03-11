<template>
	<div class="min-h-screen flex flex-col">
		<!-- Header del POS -->
		<header class="bg-white dark:bg-gray-950 border-b border-gray-100 dark:border-gray-800 z-10 shadow-sm">
			<div class="px-6 py-3">
				<div class="flex items-center justify-between gap-8">
					<!-- Logo y nombre -->
					<div class="flex items-center gap-4 shrink-0">
						<div class="bg-primary/10 p-2 rounded-xl">
							<UIcon name="i-heroicons-shopping-cart" class="w-6 h-6 text-primary" />
						</div>
						<div>
							<h1 class="text-lg font-black tracking-tighter uppercase leading-none">
								Open POS
							</h1>
							<p class="text-[10px] font-bold opacity-40 uppercase tracking-widest mt-0.5">
								Venezuela Edition
							</p>
						</div>
					</div>

					<!-- Saldos y Estado de Caja -->
					<div class="flex-1 flex items-center justify-center gap-6 overflow-hidden">
						<div class="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 dark:bg-gray-900 rounded-full border border-gray-100 dark:border-gray-800">
							<div class="w-2 h-2 rounded-full" :class="isCashSessionOpen ? 'bg-success animate-pulse' : 'bg-error'" />
							<span class="text-[10px] font-black uppercase tracking-widest opacity-70">
								{{ isCashSessionOpen ? 'Caja Abierta' : 'Caja Cerrada' }}
							</span>
						</div>

						<div class="h-8 w-px bg-gray-100 dark:bg-gray-800" />

						<!-- Saldos simplificados -->
						<div class="flex items-center gap-8 overflow-x-auto no-scrollbar py-1">
							<div v-for="(balance, currency) in accountBalances" :key="currency" class="flex flex-col items-center">
								<span class="text-[10px] font-bold opacity-30 uppercase tracking-tighter">{{ currency }}</span>
								<span class="text-sm font-black tracking-tight">{{ formatCurrency(balance, currency) }}</span>
							</div>
						</div>
					</div>

					<!-- Acciones de Usuario -->
					<div class="flex items-center gap-4 shrink-0">
						<div class="text-right hidden md:block">
							<p class="text-sm font-black leading-none">
								{{ cashierName }}
							</p>
							<p class="text-[10px] font-medium opacity-40 uppercase tracking-widest mt-1">
								{{ currentTime }}
							</p>
						</div>

						<div class="h-8 w-px bg-gray-100 dark:bg-gray-800" />

						<UButton
							v-if="isCashSessionOpen"
							color="error"
							variant="subtle"
							size="sm"
							class="font-black uppercase tracking-widest text-[10px] h-9 px-4 rounded-xl"
							@click="navigateTo('/cash-closing')"
						>
							<UIcon name="i-heroicons-lock-closed" />
							Cerrar Caja
						</UButton>

						<UButton
							v-else
							color="success"
							variant="solid"
							size="sm"
							class="font-black uppercase tracking-widest text-[10px] h-9 px-4 rounded-xl shadow-lg shadow-success/20"
							@click="showOpenCashModal = true"
						>
							<UIcon name="i-heroicons-lock-open" />
							Abrir Caja
						</UButton>
					</div>
				</div>
			</div>
		</header>

		<!-- Barra de estado discreta -->
		<div class="bg-gray-50/50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-800 px-6 py-1.5">
			<div class="flex items-center justify-between">
				<div class="flex items-center gap-6">
					<div class="flex items-center gap-2">
						<div class="w-1.5 h-1.5 rounded-full bg-success opacity-50" />
						<span class="text-[10px] font-bold opacity-40 uppercase tracking-widest">Sistema Online</span>
					</div>
					<div class="text-[10px] font-bold opacity-30 uppercase tracking-widest">
						Sinc: {{ lastSync }}
					</div>
				</div>

				<div class="flex items-center gap-6">
					<div v-if="lowStockCount > 0" class="flex items-center gap-1.5 text-warning">
						<UIcon name="i-heroicons-exclamation-triangle" class="w-3 h-3" />
						<span class="text-[10px] font-black uppercase tracking-widest">{{ lowStockCount }} ALERTAS DE STOCK</span>
					</div>
					<div class="text-[10px] font-bold opacity-40 uppercase tracking-widest">
						{{ totalProducts }} PRODUCTOS
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

		<!-- Contenedor de notificaciones -->
		<NotificationContainer />
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
	const { fullName } = useUser();
	const cashierName = computed(() => fullName.value);
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
