<template>
	<NuxtLayout name="pos">
		<div class="p-6">
			<!-- Header de la página -->
			<div class="mb-10">
				<div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
					<div>
						<div class="flex items-center gap-2 mb-1">
							<div class="w-2 h-6 bg-primary rounded-full" />
							<h1 class="text-3xl font-black tracking-tighter uppercase">
								Inventario
							</h1>
						</div>
						<p class="text-[10px] font-bold opacity-40 uppercase tracking-widest ml-4">
							Catálogo de Productos y Existencias
						</p>
					</div>
					<div class="flex items-center gap-3">
						<UButton
							variant="subtle"
							color="neutral"
							:loading="isLoading"
							class="font-black uppercase tracking-widest text-[10px] h-10 px-4 rounded-xl"
							@click="refreshProducts"
						>
							<UIcon name="i-heroicons-arrow-path" />
							Sincronizar
						</UButton>
						<UButton
							color="primary"
							class="font-black uppercase tracking-widest text-[10px] h-10 px-6 rounded-xl shadow-lg shadow-primary/20"
							@click="showCreateModal = true"
						>
							<UIcon name="i-heroicons-plus" />
							Añadir Producto
						</UButton>
					</div>
				</div>
			</div>

			<!-- Filtros y búsqueda -->
			<div class="bg-gray-50/50 dark:bg-gray-900/50 rounded-2xl p-6 mb-8 border border-gray-100 dark:border-gray-800">
				<div class="grid grid-cols-1 md:grid-cols-4 gap-6">
					<!-- Búsqueda -->
					<div class="md:col-span-2">
						<p class="text-[10px] font-black opacity-30 uppercase tracking-widest mb-2 px-1">
							Búsqueda rápida
						</p>
						<UInput
							v-model="searchQuery"
							placeholder="Nombre, SKU o Código..."
							size="xl"
							variant="subtle"
							icon="i-heroicons-magnifying-glass"
							class="shadow-sm"
							@input="handleSearch"
						/>
					</div>

					<!-- Categoría -->
					<div>
						<p class="text-[10px] font-black opacity-30 uppercase tracking-widest mb-2 px-1">
							Categoría
						</p>
						<USelectMenu
							v-model="selectedCategory"
							:items="categoryOptions"
							size="xl"
							variant="subtle"
						/>
					</div>

					<!-- Estado -->
					<div>
						<p class="text-[10px] font-black opacity-30 uppercase tracking-widest mb-2 px-1">
							Estado
						</p>
						<USelectMenu
							v-model="selectedStatus"
							:items="statusOptions"
							size="xl"
							variant="subtle"
						/>
					</div>
				</div>

				<!-- Filtros adicionales -->
				<div class="flex items-center justify-between mt-6 pt-4 border-t border-gray-200/50 dark:border-gray-800/50">
					<div class="flex items-center gap-8">
						<UCheckbox v-model="showLowStock" label="Alertas de Stock" class="text-xs font-bold uppercase tracking-tight" />
						<UCheckbox v-model="showOutOfStock" label="Sin Existencias" class="text-xs font-bold uppercase tracking-tight" />
					</div>
					<UButton
						v-if="searchQuery || selectedCategory.value || showLowStock || showOutOfStock"
						variant="link"
						size="xs"
						color="neutral"
						class="font-black uppercase tracking-widest text-[10px]"
						@click="clearFilters"
					>
						Limpiar Filtros
					</UButton>
				</div>
			</div>

			<!-- Estadísticas Tácticas -->
			<div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
				<div class="bg-white dark:bg-gray-950 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
					<p class="text-[10px] font-black opacity-30 uppercase tracking-widest mb-1">
						Total
					</p>
					<div class="flex items-end justify-between">
						<span class="text-3xl font-black tracking-tighter">{{ totalItems }}</span>
						<UIcon name="i-heroicons-cube" class="w-5 h-5 opacity-20" />
					</div>
				</div>

				<div class="bg-white dark:bg-gray-950 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
					<p class="text-[10px] font-black opacity-30 uppercase tracking-widest mb-1 text-success">
						Disponibles
					</p>
					<div class="flex items-end justify-between">
						<span class="text-3xl font-black tracking-tighter">{{ productsWithStock }}</span>
						<UIcon name="i-heroicons-check-circle" class="w-5 h-5 text-success opacity-20" />
					</div>
				</div>

				<div class="bg-white dark:bg-gray-950 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
					<p class="text-[10px] font-black opacity-30 uppercase tracking-widest mb-1 text-warning">
						Stock Bajo
					</p>
					<div class="flex items-end justify-between">
						<span class="text-3xl font-black tracking-tighter">{{ lowStockCount }}</span>
						<UIcon name="i-heroicons-exclamation-triangle" class="w-5 h-5 text-warning opacity-20" />
					</div>
				</div>

				<div class="bg-white dark:bg-gray-950 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
					<p class="text-[10px] font-black opacity-30 uppercase tracking-widest mb-1 text-error">
						Agotados
					</p>
					<div class="flex items-end justify-between">
						<span class="text-3xl font-black tracking-tighter">{{ outOfStockCount }}</span>
						<UIcon name="i-heroicons-x-circle" class="w-5 h-5 text-error opacity-20" />
					</div>
				</div>
			</div>

			<!-- Lista de productos Normalizada -->
			<div class="bg-white dark:bg-gray-950 rounded-3xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm">
				<div class="p-6 border-b border-gray-50 dark:border-gray-900 flex items-center justify-between bg-gray-50/30 dark:bg-gray-900/30">
					<h3 class="text-xs font-black uppercase tracking-widest opacity-50">
						Catálogo Maestro
					</h3>
					<div class="flex items-center gap-2">
						<span class="text-[10px] font-bold opacity-30 uppercase tracking-tighter">Filas:</span>
						<USelectMenu
							v-model="itemsPerPage"
							:items="pageSizeOptions"
							size="xs"
							variant="none"
							class="w-16 font-black"
						/>
					</div>
				</div>

				<div v-if="isLoading" class="flex flex-col justify-center items-center py-20 gap-3 opacity-30">
					<UIcon name="i-heroicons-arrow-path" class="w-10 h-10 animate-spin" />
					<span class="text-[10px] font-black uppercase tracking-widest">Cargando datos...</span>
				</div>

				<div v-else-if="products.length === 0" class="text-center py-20">
					<UIcon name="i-heroicons-cube" class="w-16 h-16 opacity-10 mx-auto mb-4" />
					<h3 class="text-lg font-black uppercase tracking-tight opacity-40">
						Sin Resultados
					</h3>
					<p class="text-xs opacity-30 mb-6">
						Ajusta los filtros para encontrar lo que buscas.
					</p>
					<UButton color="primary" variant="subtle" class="font-black uppercase tracking-widest text-[10px]" @click="showCreateModal = true">
						Crear Producto
					</UButton>
				</div>

				<div v-else class="overflow-x-auto">
					<table class="w-full">
						<thead>
							<tr class="bg-gray-50/50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-800">
								<th class="text-left py-4 px-6 text-[10px] font-black uppercase tracking-widest opacity-40">
									Producto
								</th>
								<th class="text-left py-4 px-6 text-[10px] font-black uppercase tracking-widest opacity-40">
									Info Técnica
								</th>
								<th class="text-right py-4 px-6 text-[10px] font-black uppercase tracking-widest opacity-40">
									Precio
								</th>
								<th class="text-right py-4 px-6 text-[10px] font-black uppercase tracking-widest opacity-40">
									Stock
								</th>
								<th class="text-center py-4 px-6 text-[10px] font-black uppercase tracking-widest opacity-40">
									Estado
								</th>
								<th class="text-center py-4 px-6 text-[10px] font-black uppercase tracking-widest opacity-40">
									Acciones
								</th>
							</tr>
						</thead>
						<tbody class="divide-y divide-gray-50 dark:divide-gray-900">
							<tr
								v-for="product in products"
								:key="product.id"
								class="group hover:bg-gray-50/50 dark:hover:bg-gray-900/50 transition-colors"
							>
								<td class="py-4 px-6">
									<div class="flex items-center gap-4">
										<div class="w-14 h-14 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 flex items-center justify-center shrink-0 overflow-hidden group-hover:scale-105 transition-transform duration-300">
											<img
												v-if="product.images && product.images.length > 0"
												:src="product.images[0]"
												:alt="product.name"
												class="w-full h-full object-cover"
											>
											<UIcon v-else name="i-heroicons-photo" class="w-6 h-6 opacity-10" />
										</div>
										<div class="min-w-0">
											<h4 class="font-black text-sm tracking-tight truncate group-hover:text-primary transition-colors">
												{{ product.name }}
											</h4>
											<p class="text-[10px] font-bold opacity-30 uppercase tracking-tighter truncate">
												{{ product.categoryName || 'Sin Categoría' }}
											</p>
										</div>
									</div>
								</td>
								<td class="py-4 px-6">
									<div class="flex flex-col">
										<span class="text-[10px] font-black uppercase tracking-widest opacity-20 mb-1">SKU</span>
										<span class="font-mono text-xs font-bold opacity-70">{{ product.sku }}</span>
									</div>
								</td>
								<td class="py-4 px-6 text-right">
									<div class="flex flex-col items-end">
										<span class="text-[10px] font-black uppercase tracking-widest text-primary opacity-30 mb-0.5">{{ product.currency }}</span>
										<span class="text-lg font-black tracking-tighter">
											{{ formatPrice(product.price, product.currency) }}
										</span>
									</div>
								</td>
								<td class="py-4 px-6 text-right">
									<div class="flex items-center justify-end gap-3">
										<div class="text-right">
											<p class="text-[10px] font-black uppercase tracking-widest opacity-20 mb-0.5">
												Disponibilidad
											</p>
											<p class="text-sm font-black tracking-tight">
												{{ product.stock }} unidades
											</p>
										</div>
										<div class="w-1.5 h-8 rounded-full" :class="getStockColor(product.stock, product.minStock) === 'success' ? 'bg-success/20' : getStockColor(product.stock, product.minStock) === 'warning' ? 'bg-warning/20' : 'bg-error/20'" />
									</div>
								</td>
								<td class="py-4 px-6 text-center">
									<UBadge
										:color="product.isActive ? 'success' : 'neutral'"
										variant="subtle"
										size="xs"
										class="font-black uppercase tracking-widest text-[9px] px-2"
									>
										{{ product.isActive ? 'Activo' : 'Oculto' }}
									</UBadge>
								</td>
								<td class="py-4 px-6 text-center">
									<div class="flex items-center justify-center gap-1">
										<UButton
											variant="ghost"
											size="xs"
											color="neutral"
											icon="i-heroicons-pencil"
											class="hover:bg-primary/10 hover:text-primary rounded-lg"
											@click="editProduct(product)"
										/>
										<UButton
											variant="ghost"
											size="xs"
											color="neutral"
											:icon="product.isActive ? 'i-heroicons-eye-slash' : 'i-heroicons-eye'"
											class="hover:bg-warning/10 hover:text-warning rounded-lg"
											@click="handleToggleStatus(product)"
										/>
										<UButton
											variant="ghost"
											size="xs"
											color="neutral"
											icon="i-heroicons-trash"
											class="hover:bg-error/10 hover:text-error rounded-lg"
											@click="handleDeleteProduct(product)"
										/>
									</div>
								</td>
							</tr>
						</tbody>
					</table>
				</div>

				<!-- Paginación Táctica -->
				<div v-if="totalPages > 1" class="p-6 border-t border-gray-50 dark:border-gray-900 bg-gray-50/30 dark:bg-gray-900/30 flex justify-center">
					<UPagination
						v-model="currentPage"
						:page-count="itemsPerPage.value"
						:total="totalItems"
					/>
				</div>
			</div>
		</div>

		<!-- Modal de crear/editar producto (NORMALIZADO) -->
		<UModal v-model:open="showCreateModal">
			<template #content>
				<UCard>
					<template #header>
						<div class="flex items-center justify-between">
							<h3 class="text-lg font-black uppercase tracking-tighter">
								{{ editingProduct ? 'Editar Producto' : 'Nuevo Ingreso' }}
							</h3>
							<UButton color="neutral" variant="ghost" icon="i-heroicons-x-mark" @click="closeModal" />
						</div>
						<p class="text-[10px] font-bold opacity-40 uppercase tracking-widest mt-1">
							Gestión de Ficha Técnica de Inventario
						</p>
					</template>

					<ProductForm
						:product="editingProduct"
						:categories="[...categories]"
						@submit="handleProductSubmit"
						@cancel="closeModal"
					/>
				</UCard>
			</template>
		</UModal>

		<!-- Modal de confirmación de eliminación (NORMALIZADO) -->
		<UModal v-model:open="showDeleteModal">
			<template #content>
				<UCard>
					<template #header>
						<h3 class="text-lg font-black uppercase tracking-tighter text-error">
							Eliminar Registro
						</h3>
						<p class="text-[10px] font-bold opacity-40 uppercase tracking-widest mt-1">
							Esta acción es irreversible
						</p>
					</template>

					<div class="py-4">
						<div v-if="productToDelete" class="bg-error/5 border border-error/10 rounded-2xl p-6">
							<p class="text-[10px] font-black uppercase tracking-widest text-error opacity-50 mb-1">
								Confirmar purga de:
							</p>
							<h4 class="text-xl font-black tracking-tighter">
								{{ productToDelete.name }}
							</h4>
							<p class="text-xs font-mono opacity-50 mt-1">
								SKU: {{ productToDelete.sku }}
							</p>
						</div>
					</div>

					<template #footer>
						<div class="flex gap-3">
							<UButton
								variant="subtle"
								color="neutral"
								class="flex-1 font-black uppercase tracking-widest text-[10px] h-10"
								@click="showDeleteModal = false; productToDelete = null"
							>
								Abortar
							</UButton>
							<UButton
								color="error"
								class="flex-1 font-black uppercase tracking-widest text-[10px] h-10 shadow-lg shadow-error/20"
								:loading="isDeleting"
								@click="confirmDelete"
							>
								Confirmar Purga
							</UButton>
						</div>
					</template>
				</UCard>
			</template>
		</UModal>

		<!-- Modal de confirmación de cambio de estado (NORMALIZADO) -->
		<UModal v-model:open="showToggleModal">
			<template #content>
				<UCard>
					<template #header>
						<h3 class="text-lg font-black uppercase tracking-tighter">
							{{ productToToggle?.isActive ? 'Ocultar Producto' : 'Publicar Producto' }}
						</h3>
						<p class="text-[10px] font-bold opacity-40 uppercase tracking-widest mt-1">
							Control de visibilidad en el POS
						</p>
					</template>

					<div class="py-4 text-sm font-medium opacity-70">
						¿Estás seguro de que quieres {{ productToToggle?.isActive ? 'desactivar' : 'activar' }} la visibilidad de este producto en el catálogo de ventas?
					</div>

					<template #footer>
						<div class="flex gap-3">
							<UButton
								variant="subtle"
								color="neutral"
								class="flex-1 font-black uppercase tracking-widest text-[10px] h-10"
								@click="showToggleModal = false; productToToggle = null"
							>
								Cancelar
							</UButton>
							<UButton
								:color="productToToggle?.isActive ? 'warning' : 'success'"
								class="flex-1 font-black uppercase tracking-widest text-[10px] h-10"
								:loading="isToggling"
								@click="confirmToggleStatus"
							>
								Confirmar
							</UButton>
						</div>
					</template>
				</UCard>
			</template>
		</UModal>
	</NuxtLayout>
</template>

<script setup lang="ts">
	import { computed, onMounted, ref, watch } from "vue";
	import { useProducts } from "~/composables/useProducts";

	// Composables
	const {
		products,
		categories,
		isLoading,
		currentPage,
		totalPages,
		totalItems,
		loadProducts,
		loadCategories,
		createProduct,
		updateProduct,
		deleteProduct,
		toggleProductStatus,
		formatPrice
	} = useProducts();

	// const { formatCurrency } = useCurrency();

	// Estado local
	const searchQuery = ref("");
	const selectedCategory = ref({ label: "Todas las categorías", value: "" });
	const selectedStatus = ref({ label: "Todos los estados", value: "" });
	const showLowStock = ref(false);
	const showOutOfStock = ref(false);
	const itemsPerPage = ref({ label: "20", value: 20 });
	const showCreateModal = ref(false);
	const showDeleteModal = ref(false);
	const showToggleModal = ref(false);
	const editingProduct = ref<any>(null);
	const productToDelete = ref<any>(null);
	const productToToggle = ref<any>(null);
	const isDeleting = ref(false);
	const isToggling = ref(false);

	// Opciones para selects
	const categoryOptions = computed(() => [
		{ label: "Todas las categorías", value: "" },
		...categories.value.map((cat) => ({ label: cat.name, value: cat.id }))
	]);

	const statusOptions = [
		{ label: "Todos los estados", value: "" },
		{ label: "Activos", value: "active" },
		{ label: "Inactivos", value: "inactive" }
	];

	const pageSizeOptions = [
		{ label: "10", value: 10 },
		{ label: "20", value: 20 },
		{ label: "50", value: 50 },
		{ label: "100", value: 100 }
	];

	// Computed properties
	// const currentCurrency = ref("BS");

	const productsWithStock = computed(() => {
		return products.value.filter((p) => p.stock > 0).length;
	});

	const lowStockCount = computed(() => {
		return products.value.filter((p) => p.stock > 0 && p.stock <= p.minStock).length;
	});

	const outOfStockCount = computed(() => {
		return products.value.filter((p) => p.stock === 0).length;
	});

	// Cargar datos iniciales
	onMounted(async () => {
		await loadCategories();
		await loadProducts(1, {});
	});

	// Manejar búsqueda
	const handleSearch = () => {
		const filters: any = {};

		if (searchQuery.value.trim()) {
			filters.search = searchQuery.value.trim();
		}

		if (selectedCategory.value?.value) {
			filters.category = selectedCategory.value.value;
		}

		if (selectedStatus.value?.value) {
			if (selectedStatus.value.value === "active") {
				filters.isActive = true;
			} else if (selectedStatus.value.value === "inactive") {
				filters.isActive = false;
			}
			// Si es "all" o vacío, no aplicamos filtro de estado
		}

		if (showLowStock.value) {
			filters.lowStock = true;
		}

		if (showOutOfStock.value) {
			filters.outOfStock = true;
		}

		loadProducts(1, filters);
	};

	// Limpiar filtros
	const clearFilters = () => {
		searchQuery.value = "";
		selectedCategory.value = { label: "Todas las categorías", value: "" };
		selectedStatus.value = { label: "Todos los estados", value: "" };
		showLowStock.value = false;
		showOutOfStock.value = false;
		loadProducts(1, {});
	};

	// Refrescar productos
	const refreshProducts = async () => {
		await loadProducts(currentPage.value, {});
	};

	// Editar producto
	const editProduct = (product: any) => {
		editingProduct.value = product;
		showCreateModal.value = true;
	};

	// Eliminar producto
	const handleDeleteProduct = (product: any) => {
		productToDelete.value = product;
		showDeleteModal.value = true;
	};

	// Confirmar eliminación
	const confirmDelete = async () => {
		if (!productToDelete.value) return;

		isDeleting.value = true;
		try {
			await deleteProduct(productToDelete.value.id);
			showDeleteModal.value = false;
			productToDelete.value = null;
		} catch (error) {
			console.error("Error eliminando producto:", error);
		} finally {
			isDeleting.value = false;
		}
	};

	// Activar/desactivar producto
	const handleToggleStatus = (product: any) => {
		productToToggle.value = product;
		showToggleModal.value = true;
	};

	// Confirmar cambio de estado
	const confirmToggleStatus = async () => {
		if (!productToToggle.value) return;

		isToggling.value = true;
		try {
			await toggleProductStatus(productToToggle.value.id, !productToToggle.value.isActive);
			showToggleModal.value = false;
			productToToggle.value = null;
		} catch (error) {
			console.error("Error cambiando estado del producto:", error);
		} finally {
			isToggling.value = false;
		}
	};

	// Cerrar modal
	const closeModal = () => {
		showCreateModal.value = false;
		editingProduct.value = null;
	};

	// Manejar envío del formulario
	const handleProductSubmit = async (productData: any) => {
		try {
			if (editingProduct.value) {
				await updateProduct(editingProduct.value.id, productData);
			} else {
				await createProduct(productData);
			}
			closeModal();
			await refreshProducts();
		} catch (error) {
			console.error("Error guardando producto:", error);
		}
	};

	// Obtener color del stock
	const getStockColor = (stock: number, minStock: number) => {
		if (stock === 0) return "error";
		if (stock <= minStock) return "warning";
		return "success";
	};

	// Obtener estado del stock
	const getStockStatus = (stock: number, minStock: number) => {
		if (stock === 0) return "Sin stock";
		if (stock <= minStock) return "Bajo";
		return "Normal";
	};

	// Obtener color de la moneda
	const getCurrencyColor = (currency: string) => {
		switch (currency) {
		case "BS": return "primary";
		case "USD": return "success";
		case "EUR": return "info";
		default: return "neutral";
		}
	};

	// Watchers
	watch(selectedCategory, () => {
		handleSearch();
	});

	watch(selectedStatus, () => {
		handleSearch();
	});

	watch(showLowStock, () => {
		handleSearch();
	});

	watch(showOutOfStock, () => {
		handleSearch();
	});

	watch(itemsPerPage, () => {
		loadProducts(1, {});
	});
</script>
