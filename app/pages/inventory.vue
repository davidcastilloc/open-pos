<template>
	<NuxtLayout name="pos">
		<div class="p-6">
			<!-- Header de la página -->
			<div class="mb-6">
				<div class="flex items-center justify-between">
					<div>
						<h1 class="text-3xl font-bold">
							Control de Inventario
						</h1>
						<p class="text-sm opacity-75 mt-1">
							Sistema avanzado de seguimiento de movimientos de inventario
						</p>
					</div>
					<div class="flex items-center space-x-3">
						<UButton
							variant="outline"
							:loading="isLoadingStats"
							@click="refreshStats"
						>
							<UIcon name="i-heroicons-arrow-path" />
							Actualizar
						</UButton>
						<UButton
							color="primary"
							@click="showMovementModal = true"
						>
							<UIcon name="i-heroicons-plus" />
							Registrar Movimiento
						</UButton>
					</div>
				</div>
			</div>

			<!-- Estadísticas del inventario -->
			<div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
				<UCard>
					<div class="flex items-center justify-between">
						<div>
							<p class="text-sm opacity-75">
								Total Productos
							</p>
							<p class="text-2xl font-bold">
								{{ stats?.totalProducts || 0 }}
							</p>
						</div>
						<UIcon name="i-heroicons-cube" class="w-8 h-8 opacity-50" />
					</div>
				</UCard>

				<UCard>
					<div class="flex items-center justify-between">
						<div>
							<p class="text-sm opacity-75">
								Stock Total
							</p>
							<p class="text-2xl font-bold">
								{{ formatNumber(stats?.totalStock || 0) }}
							</p>
						</div>
						<UIcon name="i-heroicons-archive-box" class="w-8 h-8 opacity-50" />
					</div>
				</UCard>

				<UCard>
					<div class="flex items-center justify-between">
						<div>
							<p class="text-sm opacity-75">
								Valor del Inventario
							</p>
							<p class="text-2xl font-bold">
								{{ formatCurrency(stats?.totalValue || 0, 'BS') }}
							</p>
						</div>
						<UIcon name="i-heroicons-currency-dollar" class="w-8 h-8 opacity-50" />
					</div>
				</UCard>

				<UCard>
					<div class="flex items-center justify-between">
						<div>
							<p class="text-sm opacity-75">
								Stock Bajo
							</p>
							<p class="text-2xl font-bold">
								{{ stats?.lowStockCount || 0 }}
							</p>
						</div>
						<UIcon name="i-heroicons-exclamation-triangle" class="w-8 h-8 opacity-50" />
					</div>
				</UCard>
			</div>

			<!-- Filtros para movimientos -->
			<div class="rounded-lg border p-4 mb-6">
				<div class="grid grid-cols-1 md:grid-cols-4 gap-4">
					<!-- Filtro por tipo de movimiento -->
					<div>
						<USelectMenu
							v-model="selectedMovementType"
							:options="movementTypeOptions"
							placeholder="Todos los tipos"
						/>
					</div>

					<!-- Filtro por fecha desde -->
					<div>
						<UInput
							v-model="dateFrom"
							type="date"
							placeholder="Fecha desde"
						/>
					</div>

					<!-- Filtro por fecha hasta -->
					<div>
						<UInput
							v-model="dateTo"
							type="date"
							placeholder="Fecha hasta"
						/>
					</div>

					<!-- Botón de filtrar -->
					<div>
						<UButton
							color="primary"
							class="w-full"
							:loading="isLoadingMovements"
							@click="loadMovements"
						>
							<UIcon name="i-heroicons-funnel" />
							Filtrar
						</UButton>
					</div>
				</div>

				<!-- Botón limpiar filtros -->
				<div class="mt-4">
					<UButton variant="ghost" size="sm" @click="clearFilters">
						<UIcon name="i-heroicons-x-mark" />
						Limpiar filtros
					</UButton>
				</div>
			</div>

			<!-- Lista de movimientos recientes -->
			<UCard>
				<template #header>
					<div class="flex items-center justify-between">
						<h3 class="text-lg font-semibold">
							Movimientos de Inventario
						</h3>
						<div class="flex items-center space-x-2">
							<span class="text-sm opacity-75">Total:</span>
							<span class="font-semibold">{{ totalItems }}</span>
						</div>
					</div>
				</template>

				<div v-if="isLoadingMovements" class="flex justify-center items-center py-12">
					<UIcon name="i-heroicons-arrow-path" class="w-8 h-8 animate-spin" />
					<span class="ml-2">Cargando movimientos...</span>
				</div>

				<div v-else-if="movements.length === 0" class="text-center py-12">
					<UIcon name="i-heroicons-clipboard-document-list" class="w-16 h-16 opacity-50 mx-auto mb-4" />
					<h3 class="text-lg font-medium mb-2">
						No hay movimientos
					</h3>
					<p class="opacity-75 mb-4">
						Los movimientos de inventario aparecerán aquí
					</p>
					<UButton color="primary" @click="showMovementModal = true">
						<UIcon name="i-heroicons-plus" />
						Registrar primer movimiento
					</UButton>
				</div>

				<div v-else class="overflow-x-auto">
					<table class="w-full">
						<thead>
							<tr class="border-b">
								<th class="text-left py-3 px-4 font-medium">
									Fecha
								</th>
								<th class="text-left py-3 px-4 font-medium">
									Producto
								</th>
								<th class="text-center py-3 px-4 font-medium">
									Tipo
								</th>
								<th class="text-right py-3 px-4 font-medium">
									Cantidad
								</th>
								<th class="text-right py-3 px-4 font-medium">
									Stock Anterior
								</th>
								<th class="text-right py-3 px-4 font-medium">
									Stock Nuevo
								</th>
								<th class="text-left py-3 px-4 font-medium">
									Razón
								</th>
								<th class="text-left py-3 px-4 font-medium">
									Usuario
								</th>
							</tr>
						</thead>
						<tbody>
							<tr
								v-for="movement in movements"
								:key="movement.id"
								class="border-b hover:opacity-75"
							>
								<td class="py-3 px-4">
									<div>
										<div class="font-medium">
											{{ formatDate(movement.createdAt) }}
										</div>
										<div class="text-xs opacity-75">
											{{ formatTime(movement.createdAt) }}
										</div>
									</div>
								</td>
								<td class="py-3 px-4">
									<div>
										<div class="font-medium">
											{{ movement.productName }}
										</div>
										<div class="text-sm opacity-75 font-mono">
											{{ movement.productSku }}
										</div>
									</div>
								</td>
								<td class="py-3 px-4 text-center">
									<UBadge
										:color="getMovementTypeColor(movement.movementType)"
										size="sm"
									>
										{{ getMovementTypeLabel(movement.movementType) }}
									</UBadge>
								</td>
								<td class="py-3 px-4 text-right">
									<span
										class="font-semibold"
										:class="movement.quantity > 0 ? 'text-green-600' : 'text-red-600'"
									>
										{{ formatMovementQuantity(movement.quantity, movement.movementType) }}
									</span>
								</td>
								<td class="py-3 px-4 text-right font-medium">
									{{ movement.previousStock }}
								</td>
								<td class="py-3 px-4 text-right font-medium">
									{{ movement.newStock }}
								</td>
								<td class="py-3 px-4">
									<span class="text-sm">{{ movement.reason }}</span>
									<div v-if="movement.referenceDocument" class="text-xs opacity-75">
										Ref: {{ movement.referenceDocument }}
									</div>
								</td>
								<td class="py-3 px-4">
									<span class="text-sm">{{ movement.createdBy }}</span>
								</td>
							</tr>
						</tbody>
					</table>
				</div>

				<!-- Paginación -->
				<div v-if="totalPages > 1" class="mt-6 flex justify-center">
					<UPagination
						v-model="currentPage"
						:page-count="itemsPerPage"
						:total="totalItems"
						@update:model-value="loadMovements"
					/>
				</div>
			</UCard>

			<!-- Productos con más movimientos (últimos 30 días) -->
			<UCard v-if="stats?.topMovedProducts?.length" class="mt-6">
				<template #header>
					<h3 class="text-lg font-semibold">
						Productos con Más Movimientos (30 días)
					</h3>
				</template>

				<div class="space-y-3">
					<div
						v-for="product in stats.topMovedProducts"
						:key="product.productId"
						class="flex items-center justify-between p-3 border rounded-lg"
					>
						<div>
							<h4 class="font-medium">
								{{ product.productName }}
							</h4>
							<p class="text-sm opacity-75">
								{{ product.totalMovements }} movimientos
							</p>
						</div>
						<div class="text-right">
							<div
								class="font-semibold"
								:class="product.netQuantity > 0 ? 'text-green-600' : product.netQuantity < 0 ? 'text-red-600' : ''"
							>
								{{ product.netQuantity > 0 ? '+' : '' }}{{ product.netQuantity }}
							</div>
							<div class="text-sm opacity-75">
								Cantidad neta
							</div>
						</div>
					</div>
				</div>
			</UCard>
		</div>

		<!-- Modal para registrar movimiento -->
		<UModal
			v-model:open="showMovementModal"
			title="Registrar Movimiento de Inventario"
			description="Registra entradas, salidas o ajustes de inventario"
			@close="closeMovementModal"
		>
			<template #body>
				<InventoryMovementForm
					@submit="handleMovementSubmit"
					@cancel="closeMovementModal"
				/>
			</template>
		</UModal>
	</NuxtLayout>
</template>

<script setup lang="ts">
	import type { MovementFilters } from "~/schemas/inventory";
	import { computed, onMounted, ref } from "vue";
	import { useCurrency } from "~/composables/useCurrency";
	import { useInventoryMovements } from "~/composables/useInventoryMovements";
	import { MOVEMENT_TYPE_COLORS, MOVEMENT_TYPE_LABELS } from "~/schemas/inventory";

	// Composables
	const {
		movements,
		stats,
		isLoading: isLoadingMovements,
		totalItems,
		totalPages,
		currentPage,
		itemsPerPage,
		loadMovements: loadMovementsData,
		loadInventoryStats,
		recordMovement,
		getMovementTypeLabel,
		formatMovementQuantity
	} = useInventoryMovements();

	const { formatCurrency } = useCurrency();

	// Estado local
	const isLoadingStats = ref(false);
	const showMovementModal = ref(false);
	const selectedMovementType = ref({ label: "Todos los tipos", value: "" });
	const dateFrom = ref("");
	const dateTo = ref("");

	// Opciones para filtros
	const movementTypeOptions = computed(() => [
		{ label: "Todos los tipos", value: "" },
		...Object.entries(MOVEMENT_TYPE_LABELS).map(([key, label]) => ({
			label,
			value: key
		}))
	]);

	// Cargar datos iniciales
	onMounted(async () => {
		await loadMovements();
		await refreshStats();
	});

	// Cargar movimientos con filtros
	const loadMovements = async () => {
		const filters: Partial<MovementFilters> = {
			page: currentPage.value
		};

		if (selectedMovementType.value?.value) {
			filters.movementType = selectedMovementType.value.value as any;
		}

		if (dateFrom.value) {
			filters.dateFrom = dateFrom.value;
		}

		if (dateTo.value) {
			filters.dateTo = dateTo.value;
		}

		await loadMovementsData(filters);
	};

	// Refrescar estadísticas
	const refreshStats = async () => {
		isLoadingStats.value = true;
		try {
			await loadInventoryStats();
		} finally {
			isLoadingStats.value = false;
		}
	};

	// Limpiar filtros
	const clearFilters = () => {
		selectedMovementType.value = { label: "Todos los tipos", value: "" };
		dateFrom.value = "";
		dateTo.value = "";
		loadMovementsData({ page: 1 });
	};

	// Cerrar modal de movimiento
	const closeMovementModal = () => {
		showMovementModal.value = false;
	};

	// Manejar envío de movimiento
	const handleMovementSubmit = async (movementData: any) => {
		try {
			await recordMovement(movementData);
			closeMovementModal();
			await loadMovements();
			await refreshStats();
		} catch (error) {
			console.error("Error registrando movimiento:", error);
		}
	};

	// Obtener color del tipo de movimiento
	const getMovementTypeColor = (type: string): "primary" | "secondary" | "success" | "info" | "warning" | "error" | "neutral" => {
		const color = MOVEMENT_TYPE_COLORS[type as keyof typeof MOVEMENT_TYPE_COLORS] || "neutral";
		return color as "primary" | "secondary" | "success" | "info" | "warning" | "error" | "neutral";
	};

	// Formatear números
	const formatNumber = (number: number) => {
		return new Intl.NumberFormat("es-VE").format(number);
	};

	// Formatear fecha
	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		return date.toLocaleDateString("es-VE", {
			day: "2-digit",
			month: "2-digit",
			year: "numeric"
		});
	};

	// Formatear hora
	const formatTime = (dateString: string) => {
		const date = new Date(dateString);
		return date.toLocaleTimeString("es-VE", {
			hour: "2-digit",
			minute: "2-digit"
		});
	};

	// Metadata para navegación
	definePageMeta({
		name: "Control de Inventario",
		description: "Sistema avanzado de gestión de inventario",
		icon: "i-heroicons-clipboard-document-list",
		category: "storage"
	});
</script>
