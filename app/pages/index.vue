<template>
	<div class="min-h-screen bg-gray-50 dark:bg-gray-950">
		<!-- Header -->
		<header class="bg-white dark:bg-gray-950 border-b border-gray-100 dark:border-gray-800 z-10 shadow-sm">
			<div class="max-w-7xl mx-auto px-6">
				<div class="flex items-center justify-between h-20">
					<div class="flex items-center gap-3 shrink-0">
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
						<span class="text-[10px] font-bold opacity-20 uppercase tracking-widest ml-2">v{{ appVersion }}</span>
					</div>
					<div class="flex items-center gap-4">
						<UBadge
							color="success"
							variant="subtle"
							class="font-black uppercase tracking-widest text-[10px] px-3 h-8"
						>
							Sistema Activo
						</UBadge>
						<UButton
							to="/test"
							variant="subtle"
							color="neutral"
							size="sm"
							class="font-black uppercase tracking-widest text-[10px] h-10 px-4 rounded-xl"
						>
							<UIcon name="i-heroicons-cog-6-tooth" />
							Configuración
						</UButton>
					</div>
				</div>
			</div>
		</header>

		<!-- Main Content -->
		<main class="max-w-7xl mx-auto px-6 py-10">
			<!-- Status Cards -->
			<div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
				<!-- Database Status -->
				<div class="bg-white dark:bg-gray-950 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
					<div class="flex items-center justify-between">
						<div>
							<p class="text-[10px] font-black opacity-30 uppercase tracking-widest mb-1">
								Servicio
							</p>
							<h3 class="text-xl font-black tracking-tighter">
								Base de Datos
							</h3>
						</div>
						<UIcon
							:name="isReady ? 'i-heroicons-check-circle' : 'i-heroicons-clock'"
							:class="isReady ? 'text-success' : 'text-warning'"
							class="w-8 h-8"
						/>
					</div>
					<p class="mt-3 text-sm font-medium" :class="isReady ? 'text-success' : 'text-warning'">
						{{ isReady ? 'Conectada y lista' : 'Inicializando...' }}
					</p>
				</div>

				<!-- Currency Status -->
				<div class="bg-white dark:bg-gray-950 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
					<div class="flex items-center justify-between">
						<div>
							<p class="text-[10px] font-black opacity-30 uppercase tracking-widest mb-1">
								Moneda
							</p>
							<h3 class="text-xl font-black tracking-tighter">
								Tasas de Cambio
							</h3>
						</div>
						<UIcon
							:name="currentRates.length > 0 ? 'i-heroicons-check-circle' : 'i-heroicons-clock'"
							:class="currentRates.length > 0 ? 'text-success' : 'text-warning'"
							class="w-8 h-8"
						/>
					</div>
					<p class="mt-3 text-sm font-medium" :class="currentRates.length > 0 ? 'text-success' : 'text-warning'">
						{{ currentRates.length > 0 ? `${currentRates.length} tasas cargadas` : 'Cargando tasas...' }}
					</p>
				</div>

				<!-- Configuration Status -->
				<div class="bg-white dark:bg-gray-950 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
					<div class="flex items-center justify-between">
						<div>
							<p class="text-[10px] font-black opacity-30 uppercase tracking-widest mb-1">
								Sistema
							</p>
							<h3 class="text-xl font-black tracking-tighter">
								Configuración
							</h3>
						</div>
						<UIcon
							name="i-heroicons-check-circle"
							class="w-8 h-8 text-success"
						/>
					</div>
					<p class="mt-3 text-sm font-medium text-success">
						Moneda Principal: {{ getCurrencyConfig.defaultCurrency }}
					</p>
				</div>
			</div>

			<!-- Quick Actions -->
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
				<div class="card-action" @click="navigateTo('/pos')">
					<UIcon name="i-heroicons-shopping-cart" class="w-10 h-10 opacity-20 mb-3" />
					<h3 class="text-lg font-black tracking-tight uppercase">
						Punto de Venta
					</h3>
					<p class="text-[10px] font-bold opacity-40 uppercase tracking-widest">
						Iniciar Venta
					</p>
				</div>

				<div class="card-action" @click="navigateTo('/products')">
					<UIcon name="i-heroicons-cube" class="w-10 h-10 text-success opacity-20 mb-3" />
					<h3 class="text-lg font-black tracking-tight uppercase">
						Inventario
					</h3>
					<p class="text-[10px] font-bold opacity-40 uppercase tracking-widest">
						Gestionar Stock
					</p>
				</div>

				<div class="card-action" @click="navigateTo('/categories')">
					<UIcon name="i-heroicons-tag" class="w-10 h-10 opacity-20 mb-3" />
					<h3 class="text-lg font-black tracking-tight uppercase">
						Categorías
					</h3>
					<p class="text-[10px] font-bold opacity-40 uppercase tracking-widest">
						Organizar
					</p>
				</div>

				<div class="card-action" @click="navigateTo('/reports')">
					<UIcon name="i-heroicons-chart-bar" class="w-10 h-10 opacity-20 mb-3" />
					<h3 class="text-lg font-black tracking-tight uppercase">
						Reportes
					</h3>
					<p class="text-[10px] font-bold opacity-40 uppercase tracking-widest">
						Analizar Ventas
					</p>
				</div>

				<div class="card-action" @click="navigateTo('/cash-closing')">
					<UIcon name="i-heroicons-banknotes" class="w-10 h-10 text-warning opacity-20 mb-3" />
					<h3 class="text-lg font-black tracking-tight uppercase">
						Caja
					</h3>
					<p class="text-[10px] font-bold opacity-40 uppercase tracking-widest">
						Finalizar Turno
					</p>
				</div>
			</div>

			<!-- Exchange Rates -->
			<div class="bg-white dark:bg-gray-950 rounded-3xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm">
				<div class="px-6 py-5 border-b border-gray-50 dark:border-gray-900 flex items-center justify-between bg-gray-50/30 dark:bg-gray-900/30">
					<div class="flex items-center gap-3">
						<h2 class="text-xs font-black uppercase tracking-widest opacity-50">
							💱 Tasas de Cambio
						</h2>
						<span v-if="currentRates.length > 0" class="text-[10px] font-bold opacity-20 uppercase tracking-widest">
							({{ currentRates.length }} cargadas)
						</span>
					</div>
					<UButton :loading="currencyLoading" size="xs" variant="subtle" color="neutral" class="font-black uppercase tracking-widest text-[9px] px-2" @click="refreshRates">
						<UIcon name="i-heroicons-arrow-path" />
						Actualizar
					</UButton>
				</div>

				<div v-if="currencyError" class="p-6 text-error text-center">
					Error al cargar tasas: {{ currencyError }}
				</div>

				<div v-else-if="currentRates.length === 0 && !currencyLoading" class="text-center py-12 opacity-50">
					<UIcon name="i-heroicons-clock" class="w-12 h-12 mx-auto mb-4" />
					<p>No hay tasas de cambio disponibles.</p>
				</div>

				<div v-else class="grid grid-cols-1 md:grid-cols-3 gap-4 p-6">
					<div v-for="rate in currentRates" :key="rate.id" class="bg-gray-50/50 dark:bg-gray-900/50 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 flex flex-col justify-between">
						<div class="flex items-center justify-between mb-2">
							<div class="flex flex-col">
								<span class="text-[10px] font-black uppercase tracking-widest text-primary opacity-30 mb-0.5">Divisa</span>
								<span class="text-lg font-black tracking-tighter leading-none">
									{{ rate.fromCurrency }} <span class="text-xs font-bold opacity-30">/</span> {{ rate.toCurrency }}
								</span>
							</div>
							<span class="text-xl font-black tracking-tighter">
								{{ rate.rate.toFixed(4) }}
							</span>
						</div>
						<p class="text-[10px] font-bold opacity-30 uppercase tracking-widest text-right">
							Fuente: {{ rate.source }}
						</p>
					</div>
				</div>

				<div v-if="currencyLoading" class="p-6 text-center opacity-50 animate-pulse">
					<UIcon name="i-heroicons-arrow-path" class="w-8 h-8 animate-spin inline mr-2" />
					Cargando tasas...
				</div>
			</div>
		</main>
	</div>
</template>

<script setup lang="ts">
	// Configuración de la aplicación
	const config = useRuntimeConfig();
	const appVersion = config.public.appVersion;

	// Composables
	const { isReady } = useDatabase();
	const { getCurrencyConfig } = useConfig();
	const {
		currentRates,
		isLoading: currencyLoading,
		error: currencyError,
		fetchCurrentRates
	} = useCurrency();

	// Función para actualizar tasas
	const refreshRates = async () => {
		await fetchCurrentRates();
	};
</script>

<style>
@reference "tailwindcss";
/* Tailwind classes for custom cards */
.card-action {
	@apply bg-white dark:bg-gray-950 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col items-center justify-center text-center cursor-pointer;
}
.card-action h3 {
	@apply text-lg font-black tracking-tight uppercase;
}
.card-action p {
	@apply text-[10px] font-bold opacity-40 uppercase tracking-widest;
}
</style>
