<template>
	<div class="min-h-screen bg-gray-50">
		<!-- Header -->
		<header class="bg-white shadow-sm border-b">
			<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div class="flex justify-between items-center h-16">
					<div class="flex items-center">
						<h1 class="text-2xl font-bold text-gray-900">
							POS Venezuela
						</h1>
						<span class="ml-2 text-sm text-gray-500">v{{ appVersion }}</span>
					</div>
					<div class="flex items-center space-x-4">
						<UBadge color="green">
							Sistema Activo
						</UBadge>
						<UButton to="/test" variant="outline" size="sm">
							<UIcon name="i-heroicons-cog-6-tooth" />
							Configuración
						</UButton>
					</div>
				</div>
			</div>
		</header>

		<!-- Main Content -->
		<main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
			<!-- Status Cards -->
			<div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
				<!-- Database Status -->
				<UCard>
					<div class="flex items-center justify-between">
						<div>
							<h3 class="text-lg font-medium text-gray-900">
								Base de Datos
							</h3>
							<p class="text-sm text-gray-500">
								Estado del sistema
							</p>
						</div>
						<div class="flex items-center">
							<UIcon
								:name="isReady ? 'i-heroicons-check-circle' : 'i-heroicons-x-circle'"
								:class="isReady ? 'text-green-500' : 'text-red-500'"
								class="w-8 h-8"
							/>
						</div>
					</div>
					<div class="mt-4">
						<p class="text-sm" :class="isReady ? 'text-green-600' : 'text-red-600'">
							{{ isReady ? 'Conectada y lista' : 'Inicializando...' }}
						</p>
					</div>
				</UCard>

				<!-- Currency Status -->
				<UCard>
					<div class="flex items-center justify-between">
						<div>
							<h3 class="text-lg font-medium text-gray-900">
								Monedas
							</h3>
							<p class="text-sm text-gray-500">
								Tasas de cambio
							</p>
						</div>
						<div class="flex items-center">
							<UIcon
								:name="currentRates.length > 0 ? 'i-heroicons-check-circle' : 'i-heroicons-clock'"
								:class="currentRates.length > 0 ? 'text-green-500' : 'text-yellow-500'"
								class="w-8 h-8"
							/>
						</div>
					</div>
					<div class="mt-4">
						<p class="text-sm" :class="currentRates.length > 0 ? 'text-green-600' : 'text-yellow-600'">
							{{ currentRates.length > 0 ? `${currentRates.length} tasas cargadas` : 'Cargando tasas...' }}
						</p>
					</div>
				</UCard>

				<!-- Configuration Status -->
				<UCard>
					<div class="flex items-center justify-between">
						<div>
							<h3 class="text-lg font-medium text-gray-900">
								Configuración
							</h3>
							<p class="text-sm text-gray-500">
								Sistema configurado
							</p>
						</div>
						<div class="flex items-center">
							<UIcon
								name="i-heroicons-check-circle"
								class="w-8 h-8 text-green-500"
							/>
						</div>
					</div>
					<div class="mt-4">
						<p class="text-sm text-green-600">
							Moneda: {{ getCurrencyConfig.defaultCurrency }}
						</p>
					</div>
				</UCard>
			</div>

			<!-- Quick Actions -->
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
				<UCard class="cursor-pointer hover:shadow-md transition-shadow" @click="navigateTo('/pos')">
					<div class="text-center">
						<UIcon name="i-heroicons-shopping-cart" class="w-12 h-12 text-blue-500 mx-auto mb-4" />
						<h3 class="text-lg font-medium text-gray-900">
							Punto de Venta
						</h3>
						<p class="text-sm text-gray-500">
							Iniciar venta
						</p>
					</div>
				</UCard>

				<UCard class="cursor-pointer hover:shadow-md transition-shadow" @click="navigateTo('/products')">
					<div class="text-center">
						<UIcon name="i-heroicons-cube" class="w-12 h-12 text-green-500 mx-auto mb-4" />
						<h3 class="text-lg font-medium text-gray-900">
							Productos
						</h3>
						<p class="text-sm text-gray-500">
							Gestionar inventario
						</p>
					</div>
				</UCard>

				<UCard class="cursor-pointer hover:shadow-md transition-shadow" @click="navigateTo('/reports')">
					<div class="text-center">
						<UIcon name="i-heroicons-chart-bar" class="w-12 h-12 text-purple-500 mx-auto mb-4" />
						<h3 class="text-lg font-medium text-gray-900">
							Reportes
						</h3>
						<p class="text-sm text-gray-500">
							Ver estadísticas
						</p>
					</div>
				</UCard>

				<UCard class="cursor-pointer hover:shadow-md transition-shadow" @click="navigateTo('/cash-closing')">
					<div class="text-center">
						<UIcon name="i-heroicons-banknotes" class="w-12 h-12 text-orange-500 mx-auto mb-4" />
						<h3 class="text-lg font-medium text-gray-900">
							Cierre de Caja
						</h3>
						<p class="text-sm text-gray-500">
							Finalizar turno
						</p>
					</div>
				</UCard>
			</div>

			<!-- Exchange Rates -->
			<UCard>
				<template #header>
					<div class="flex items-center justify-between">
						<h2 class="text-lg font-semibold">
							💱 Tasas de Cambio Actuales
						</h2>
						<UButton :loading="currencyLoading" size="sm" @click="refreshRates">
							<UIcon name="i-heroicons-arrow-path" />
							Actualizar
						</UButton>
					</div>
				</template>

				<div v-if="currencyError" class="text-red-500 mb-4">
					Error: {{ currencyError }}
				</div>

				<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
					<div v-for="rate in currentRates" :key="rate.id" class="p-4 border rounded-lg">
						<div class="flex items-center justify-between">
							<div>
								<div class="font-medium">
									{{ rate.fromCurrency }} → {{ rate.toCurrency }}
								</div>
								<div class="text-sm text-gray-500">
									{{ rate.source }}
								</div>
							</div>
							<div class="text-2xl font-bold text-primary">
								{{ rate.rate.toFixed(4) }}
							</div>
						</div>
					</div>
				</div>

				<div v-if="currentRates.length === 0" class="text-center py-8 text-gray-500">
					<UIcon name="i-heroicons-clock" class="w-12 h-12 mx-auto mb-4" />
					<p>Cargando tasas de cambio...</p>
				</div>
			</UCard>
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

	// Meta de la página
	useHead({
		title: "POS Venezuela - Inicio"
	});
</script>
