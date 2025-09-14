<template>
	<NuxtLayout name="default">
		<div class="space-y-6">
			<!-- Header -->
			<div class="flex items-center justify-between">
				<div>
					<h1 class="text-2xl font-bold">
						Gestión de Devoluciones
					</h1>
					<p class="opacity-75">
						Administra devoluciones parciales y totales con trazabilidad completa
					</p>
				</div>
				<div class="flex items-center space-x-3">
					<UButton
						icon="i-heroicons-arrow-path"
						variant="outline"
						:loading="isLoading"
						@click="refreshData"
					>
						Actualizar
					</UButton>
					<UButton
						icon="i-heroicons-plus"
						color="primary"
						@click="showCreateReturnModal = true"
					>
						Nueva Devolución
					</UButton>
				</div>
			</div>

			<!-- Estadísticas -->
			<div class="grid grid-cols-1 md:grid-cols-4 gap-4">
				<div class="rounded-lg border p-4">
					<div class="flex items-center justify-between">
						<div>
							<p class="text-sm opacity-75">
								Total Devoluciones
							</p>
							<p class="text-2xl font-bold">
								{{ stats.total_returns || 0 }}
							</p>
						</div>
						<UIcon name="i-heroicons-arrow-uturn-left" class="w-8 h-8 opacity-50" />
					</div>
				</div>
				<div class="rounded-lg border p-4">
					<div class="flex items-center justify-between">
						<div>
							<p class="text-sm opacity-75">
								Pendientes
							</p>
							<p class="text-2xl font-bold text-warning">
								{{ stats.pending_returns || 0 }}
							</p>
						</div>
						<UIcon name="i-heroicons-clock" class="w-8 h-8 opacity-50" />
					</div>
				</div>
				<div class="rounded-lg border p-4">
					<div class="flex items-center justify-between">
						<div>
							<p class="text-sm opacity-75">
								Completadas
							</p>
							<p class="text-2xl font-bold text-success">
								{{ stats.completed_returns || 0 }}
							</p>
						</div>
						<UIcon name="i-heroicons-check-circle" class="w-8 h-8 opacity-50" />
					</div>
				</div>
				<div class="rounded-lg border p-4">
					<div class="flex items-center justify-between">
						<div>
							<p class="text-sm opacity-75">
								Total Reembolsado
							</p>
							<p class="text-2xl font-bold">
								{{ formatPrice(stats.total_refunded || 0, 'BS') }}
							</p>
						</div>
						<UIcon name="i-heroicons-banknotes" class="w-8 h-8 opacity-50" />
					</div>
				</div>
			</div>

			<!-- Filtros -->
			<div class="rounded-lg border p-4">
				<div class="grid grid-cols-1 md:grid-cols-4 gap-4">
					<div>
						<label class="block text-sm font-medium mb-2">Estado</label>
						<USelectMenu
							v-model="selectedStatus"
							:items="statusOptions"
							placeholder="Todos los estados"
							@change="applyFilters"
						/>
					</div>
					<div>
						<label class="block text-sm font-medium mb-2">Desde</label>
						<UInput
							v-model="filters.from"
							type="date"
							@change="applyFilters"
						/>
					</div>
					<div>
						<label class="block text-sm font-medium mb-2">Hasta</label>
						<UInput
							v-model="filters.to"
							type="date"
							@change="applyFilters"
						/>
					</div>
					<div class="flex items-end">
						<UButton
							variant="outline"
							class="w-full"
							@click="clearFilters"
						>
							<UIcon name="i-heroicons-x-mark" />
							Limpiar Filtros
						</UButton>
					</div>
				</div>
			</div>

			<!-- Lista de devoluciones -->
			<div class="rounded-lg border">
				<div v-if="isLoading" class="flex justify-center items-center h-32">
					<UIcon name="i-heroicons-arrow-path" class="w-8 h-8 animate-spin" />
					<span class="ml-2">Cargando devoluciones...</span>
				</div>

				<div v-else-if="returns.length === 0" class="text-center py-12">
					<UIcon name="i-heroicons-arrow-uturn-left" class="w-16 h-16 opacity-50 mx-auto mb-4" />
					<h3 class="text-lg font-medium mb-2">
						No hay devoluciones
					</h3>
					<p class="opacity-75">
						No se encontraron devoluciones con los filtros aplicados
					</p>
				</div>

				<div v-else class="divide-y">
					<div
						v-for="returnItem in returns"
						:key="returnItem.id"
						class="p-4 hover:opacity-75 transition-opacity cursor-pointer"
						@click="viewReturnDetails(returnItem.id)"
					>
						<div class="flex items-center justify-between">
							<div class="flex-1">
								<div class="flex items-center space-x-3 mb-2">
									<h3 class="font-medium">
										{{ returnItem.id }}
									</h3>
									<UBadge
										:color="getStatusColor(returnItem.status)"
										size="sm"
									>
										{{ getStatusLabel(returnItem.status) }}
									</UBadge>
									<UBadge
										:color="returnItem.return_type === 'total' ? 'primary' : 'secondary'"
										size="sm"
									>
										{{ returnItem.return_type === 'total' ? 'Total' : 'Parcial' }}
									</UBadge>
								</div>
								<div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
									<div>
										<span class="opacity-75">Venta Original:</span>
										<p class="font-mono text-xs">
											{{ returnItem.original_sale_id }}
										</p>
									</div>
									<div>
										<span class="opacity-75">Cliente:</span>
										<p>{{ returnItem.customer_name || 'Cliente general' }}</p>
									</div>
									<div>
										<span class="opacity-75">Cajero:</span>
										<p>{{ returnItem.cashier_name || 'N/A' }}</p>
									</div>
									<div>
										<span class="opacity-75">Total:</span>
										<p class="font-semibold">
											{{ formatPrice(returnItem.total, returnItem.currency) }}
										</p>
									</div>
								</div>
								<div class="mt-2 text-xs opacity-75">
									<span>Motivo: {{ returnItem.reason }}</span>
									<span class="ml-4">Creado: {{ formatDate(returnItem.created_at) }}</span>
								</div>
							</div>
							<div class="flex items-center space-x-2">
								<UButton
									v-if="returnItem.status === 'pending'"
									icon="i-heroicons-check"
									color="success"
									size="sm"
									@click.stop="approveReturn(returnItem.id)"
								>
									Aprobar
								</UButton>
								<UButton
									v-if="returnItem.status === 'pending'"
									icon="i-heroicons-x-mark"
									color="error"
									size="sm"
									@click.stop="rejectReturn(returnItem.id)"
								>
									Rechazar
								</UButton>
								<UButton
									v-if="returnItem.status === 'approved'"
									icon="i-heroicons-banknotes"
									color="primary"
									size="sm"
									@click.stop="completeReturn(returnItem.id)"
								>
									Completar
								</UButton>
								<UButton
									icon="i-heroicons-eye"
									variant="outline"
									size="sm"
									@click.stop="viewReturnDetails(returnItem.id)"
								>
									Ver Detalles
								</UButton>
							</div>
						</div>
					</div>
				</div>
			</div>

			<!-- Paginación -->
			<div v-if="totalPages > 1" class="flex justify-center">
				<UPagination
					v-model="currentPage"
					:page-count="itemsPerPage"
					:total="totalItems"
				/>
			</div>
		</div>

		<!-- Modal de detalles de devolución -->
		<UModal v-model:open="showDetailsModal">
			<template #content>
				<UCard>
					<template #header>
						<div class="flex items-center justify-between">
							<h3 class="text-lg font-semibold">
								Detalles de la Devolución
							</h3>
							<UButton
								icon="i-heroicons-x-mark"
								variant="ghost"
								color="neutral"
								@click="showDetailsModal = false"
							/>
						</div>
					</template>

					<div v-if="selectedReturn" class="space-y-6">
						<!-- Información general -->
						<div class="grid grid-cols-2 gap-4 text-sm">
							<div>
								<span class="opacity-75">ID de Devolución:</span>
								<p class="font-mono">
									{{ selectedReturn.id }}
								</p>
							</div>
							<div>
								<span class="opacity-75">Estado:</span>
								<UBadge :color="getStatusColor(selectedReturn.status)" class="ml-2">
									{{ getStatusLabel(selectedReturn.status) }}
								</UBadge>
							</div>
							<div>
								<span class="opacity-75">Tipo:</span>
								<p>{{ selectedReturn.return_type === 'total' ? 'Devolución Total' : 'Devolución Parcial' }}</p>
							</div>
							<div>
								<span class="opacity-75">Motivo:</span>
								<p>{{ selectedReturn.reason }}</p>
							</div>
							<div>
								<span class="opacity-75">Total:</span>
								<p class="font-semibold">
									{{ formatPrice(selectedReturn.total, selectedReturn.currency) }}
								</p>
							</div>
							<div>
								<span class="opacity-75">Creado:</span>
								<p>{{ formatDate(selectedReturn.created_at) }}</p>
							</div>
						</div>

						<!-- Items devueltos -->
						<div v-if="selectedReturn.items && selectedReturn.items.length > 0">
							<h4 class="font-medium mb-3">
								Productos Devueltos
							</h4>
							<div class="space-y-2">
								<div
									v-for="item in selectedReturn.items"
									:key="item.id"
									class="rounded-lg border p-3"
								>
									<div class="flex justify-between items-start">
										<div>
											<h5 class="font-medium">
												{{ item.product_name }}
											</h5>
											<p class="text-sm opacity-75">
												SKU: {{ item.product_sku }}
											</p>
											<p class="text-sm opacity-75">
												Cantidad devuelta: {{ item.quantity }} de {{ item.original_quantity }}
											</p>
											<p v-if="item.reason" class="text-sm opacity-75">
												Motivo: {{ item.reason }}
											</p>
										</div>
										<div class="text-right">
											<p class="font-semibold">
												{{ formatPrice(item.total, selectedReturn.currency) }}
											</p>
											<p class="text-sm opacity-75">
												{{ formatPrice(item.price, selectedReturn.currency) }} c/u
											</p>
										</div>
									</div>
								</div>
							</div>
						</div>

						<!-- Historial de estados -->
						<div v-if="selectedReturn.statusHistory && selectedReturn.statusHistory.length > 0">
							<h4 class="font-medium mb-3">
								Historial de Estados
							</h4>
							<div class="space-y-2">
								<div
									v-for="history in selectedReturn.statusHistory"
									:key="history.id"
									class="flex items-center space-x-3 p-2 rounded-lg border"
								>
									<UBadge :color="getStatusColor(history.new_status)" size="sm">
										{{ getStatusLabel(history.new_status) }}
									</UBadge>
									<div class="flex-1">
										<p class="text-sm">
											{{ history.reason || 'Sin motivo especificado' }}
										</p>
										<p class="text-xs opacity-75">
											{{ formatDate(history.created_at) }}
											<span v-if="history.changed_by_name"> - {{ history.changed_by_name }}</span>
										</p>
									</div>
								</div>
							</div>
						</div>
					</div>
				</UCard>
			</template>
		</UModal>

		<!-- Modal de búsqueda de venta para nueva devolución -->
		<UModal v-model:open="showCreateReturnModal">
			<template #content>
				<UCard>
					<template #header>
						<h3 class="text-lg font-semibold">
							Nueva Devolución
						</h3>
						<p class="text-sm opacity-75">
							Busca la venta para crear una devolución
						</p>
					</template>

					<div class="space-y-4">
						<div>
							<UFormGroup label="ID de Venta" name="saleId">
								<UInput
									v-model="newReturnForm.saleId"
									placeholder="sale_1234567890_abcdef"
									@keyup.enter="searchSaleForReturn"
								/>
							</UFormGroup>
						</div>

						<div v-if="foundSaleForReturn" class="rounded-lg border p-4">
							<h4 class="font-medium mb-2">
								Venta Encontrada
							</h4>
							<div class="grid grid-cols-2 gap-4 text-sm">
								<div>
									<span class="opacity-75">ID:</span>
									<p class="font-mono">
										{{ foundSaleForReturn.id }}
									</p>
								</div>
								<div>
									<span class="opacity-75">Total:</span>
									<p class="font-semibold">
										{{ formatPrice(foundSaleForReturn.total, foundSaleForReturn.currency) }}
									</p>
								</div>
								<div>
									<span class="opacity-75">Cliente:</span>
									<p>{{ foundSaleForReturn.customer_name || 'Cliente general' }}</p>
								</div>
								<div>
									<span class="opacity-75">Fecha:</span>
									<p>{{ formatDate(foundSaleForReturn.created_at) }}</p>
								</div>
							</div>
						</div>
					</div>

					<template #footer>
						<div class="flex space-x-3">
							<UButton
								variant="outline"
								class="flex-1"
								@click="closeCreateReturnModal"
							>
								Cancelar
							</UButton>
							<UButton
								:loading="isSearchingSale"
								:disabled="!foundSaleForReturn"
								color="primary"
								class="flex-1"
								@click="createReturnFromSale"
							>
								Crear Devolución
							</UButton>
						</div>
					</template>
				</UCard>
			</template>
		</UModal>

		<!-- Modal de devolución -->
		<ReturnModal
			:open="showReturnModal"
			:sale-id="selectedSaleForReturn"
			@update:open="showReturnModal = false"
			@success="handleReturnCreated"
		/>
	</NuxtLayout>
</template>

<script setup lang="ts">
	import type { ReturnStatusValue } from "~/database/schema/returns";
	import { computed, onMounted, ref, watch } from "vue";
	import { useCurrency } from "~/composables/useCurrency";
	import { useNotifications } from "~/composables/useNotifications";
	import { useReturns } from "~/composables/useReturns";

	definePageMeta({
		name: "Devoluciones",
		description: "Gestión de devoluciones parciales y totales con trazabilidad completa",
		icon: "i-heroicons-arrow-uturn-left",
		category: "sales"
	});

	// Composables
	const {
		listReturns,
		getReturnWithDetails,
		getReturnStats,
		approveReturn: approveReturnAction
	} = useReturns();
	const { formatCurrency } = useCurrency();
	const notifications = useNotifications();

	// Estado
	const isLoading = ref(false);
	const returns = ref<any[]>([]);
	const stats = ref<any>({});
	const selectedReturn = ref<any>(null);
	const showDetailsModal = ref(false);
	const showCreateReturnModal = ref(false);
	const showReturnModal = ref(false);
	const selectedSaleForReturn = ref<string | undefined>(undefined);
	const foundSaleForReturn = ref<any>(null);
	const isSearchingSale = ref(false);

	// Filtros
	const filters = ref({
		status: undefined as ReturnStatusValue | undefined,
		from: "",
		to: ""
	});

	const selectedStatus = ref<{ label: string, value: string } | undefined>(undefined);

	// Paginación
	const currentPage = ref(1);
	const itemsPerPage = 20;
	const totalItems = ref(0);
	const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage));

	// Formulario para nueva devolución
	const newReturnForm = ref({
		saleId: ""
	});

	// Opciones
	const statusOptions = [
		{ label: "Todos los estados", value: "" },
		{ label: "Pendiente", value: "pending" },
		{ label: "Aprobada", value: "approved" },
		{ label: "Completada", value: "completed" },
		{ label: "Rechazada", value: "rejected" }
	];

	// Computed
	const getStatusColor = (status: string) => {
		switch (status) {
		case "pending": return "warning";
		case "approved": return "info";
		case "completed": return "success";
		case "rejected": return "error";
		default: return "neutral";
		}
	};

	const getStatusLabel = (status: string) => {
		switch (status) {
		case "pending": return "Pendiente";
		case "approved": return "Aprobada";
		case "completed": return "Completada";
		case "rejected": return "Rechazada";
		default: return status;
		}
	};

	// Métodos
	const formatPrice = (amount: number, currency: string) => {
		return formatCurrency(amount, currency);
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString("es-ES", {
			year: "numeric",
			month: "short",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit"
		});
	};

	const loadReturns = async () => {
		isLoading.value = true;
		try {
			const [returnsData, statsData] = await Promise.all([
				listReturns({
					...filters.value,
					limit: itemsPerPage,
					offset: (currentPage.value - 1) * itemsPerPage
				}),
				getReturnStats(filters.value)
			]);

			returns.value = returnsData;
			stats.value = statsData;
			totalItems.value = statsData.total_returns || 0;
		} catch (error) {
			console.error("Error cargando devoluciones:", error);
			notifications.error("Error", "No se pudieron cargar las devoluciones");
		} finally {
			isLoading.value = false;
		}
	};

	const refreshData = () => {
		loadReturns();
	};

	const applyFilters = () => {
		filters.value.status = (selectedStatus.value?.value as ReturnStatusValue) || undefined;
		currentPage.value = 1;
		loadReturns();
	};

	const clearFilters = () => {
		filters.value = {
			status: undefined,
			from: "",
			to: ""
		};
		selectedStatus.value = undefined;
		applyFilters();
	};

	const viewReturnDetails = async (returnId: string) => {
		try {
			const returnData = await getReturnWithDetails(returnId);
			selectedReturn.value = returnData;
			showDetailsModal.value = true;
		} catch (error) {
			console.error("Error cargando detalles de devolución:", error);
			notifications.error("Error", "No se pudieron cargar los detalles de la devolución");
		}
	};

	const approveReturn = async (returnId: string) => {
		try {
			await approveReturnAction(returnId, "Devolución aprobada por el supervisor");
			await loadReturns();
			notifications.success("Devolución aprobada", "La devolución ha sido aprobada y el stock restaurado");
		} catch (error) {
			console.error("Error aprobando devolución:", error);
			notifications.error("Error", "No se pudo aprobar la devolución");
		}
	};

	const rejectReturn = async (_returnId: string) => {
		// TODO: Implementar modal para motivo del rechazo
		notifications.info("Funcionalidad pendiente", "La funcionalidad de rechazo estará disponible próximamente");
	};

	const completeReturn = async (_returnId: string) => {
		// TODO: Implementar modal para selección de cuenta de pago para el reembolso
		notifications.info("Funcionalidad pendiente", "La funcionalidad de completar devolución estará disponible próximamente");
	};

	const searchSaleForReturn = async () => {
		if (!newReturnForm.value.saleId.trim()) return;

		isSearchingSale.value = true;
		try {
			const { useDatabase } = await import("~/composables/useDatabase");
			const { query } = useDatabase();

			const sales = await query<any>(
				`SELECT s.*, c.name as customer_name
			 FROM sales s
			 LEFT JOIN customers c ON s.customer_id = c.id
			 WHERE s.id = ?
			 LIMIT 1`,
				[newReturnForm.value.saleId.trim()]
			);

			foundSaleForReturn.value = sales.rows?.[0] || null;
		} catch (error) {
			console.error("Error buscando venta:", error);
			notifications.error("Error", "No se pudo buscar la venta");
		} finally {
			isSearchingSale.value = false;
		}
	};

	const createReturnFromSale = () => {
		if (foundSaleForReturn.value) {
			selectedSaleForReturn.value = foundSaleForReturn.value.id;
			showCreateReturnModal.value = false;
			showReturnModal.value = true;
		}
	};

	const closeCreateReturnModal = () => {
		showCreateReturnModal.value = false;
		newReturnForm.value.saleId = "";
		foundSaleForReturn.value = null;
	};

	const handleReturnCreated = (returnId: string) => {
		notifications.success("Devolución creada", `Devolución ${returnId} creada exitosamente`);
		showReturnModal.value = false;
		selectedSaleForReturn.value = undefined;
		loadReturns();
	};

	// Watchers
	watch(currentPage, () => {
		loadReturns();
	});

	// Cargar datos iniciales
	onMounted(() => {
		loadReturns();
	});
</script>
