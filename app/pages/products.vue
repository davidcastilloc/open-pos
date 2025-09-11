<template>
	<NuxtLayout name="pos">
		<div class="p-6">
			<!-- Header de la página -->
			<div class="mb-6">
				<div class="flex items-center justify-between">
					<div>
						<h1 class="text-3xl font-bold">Gestión de Productos</h1>
						<p class="text-sm opacity-75 mt-1">Administra tu catálogo de productos</p>
					</div>
					<div class="flex items-center space-x-3">
						<UButton
							variant="outline"
							@click="refreshProducts"
							:loading="isLoading"
						>
							<UIcon name="i-heroicons-arrow-path" />
							Actualizar
						</UButton>
						<UButton
							color="primary"
							@click="showCreateModal = true"
						>
							<UIcon name="i-heroicons-plus" />
							Nuevo Producto
						</UButton>
					</div>
				</div>
			</div>

			<!-- Filtros y búsqueda -->
			<div class="bg-white rounded-lg border p-4 mb-6">
				<div class="grid grid-cols-1 md:grid-cols-4 gap-4">
					<!-- Búsqueda -->
					<div class="md:col-span-2">
						<UInput
							v-model="searchQuery"
							placeholder="Buscar por nombre, SKU o código de barras..."
							icon="i-heroicons-magnifying-glass"
							@input="handleSearch"
						/>
					</div>

					<!-- Categoría -->
					<div>
						<USelectMenu
							v-model="selectedCategory"
							:items="categoryOptions"
							placeholder="Todas las categorías"
						/>
					</div>

					<!-- Estado -->
					<div>
						<USelectMenu
							v-model="selectedStatus"
							:items="statusOptions"
							placeholder="Todos los estados"
						/>
					</div>
				</div>

				<!-- Filtros adicionales -->
				<div class="flex items-center space-x-4 mt-4">
					<UCheckbox v-model="showLowStock" label="Solo stock bajo" />
					<UCheckbox v-model="showOutOfStock" label="Solo sin stock" />
					<UButton variant="ghost" size="sm" @click="clearFilters">
						<UIcon name="i-heroicons-x-mark" />
						Limpiar filtros
					</UButton>
				</div>
			</div>

			<!-- Estadísticas -->
			<div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
				<UCard>
					<div class="flex items-center justify-between">
						<div>
							<p class="text-sm opacity-75">Total Productos</p>
							<p class="text-2xl font-bold">{{ totalItems }}</p>
						</div>
						<UIcon name="i-heroicons-cube" class="w-8 h-8 opacity-50" />
					</div>
				</UCard>

				<UCard>
					<div class="flex items-center justify-between">
						<div>
							<p class="text-sm opacity-75">Con Stock</p>
							<p class="text-2xl font-bold text-green-600">{{ productsWithStock }}</p>
						</div>
						<UIcon name="i-heroicons-check-circle" class="w-8 h-8 text-green-500" />
					</div>
				</UCard>

				<UCard>
					<div class="flex items-center justify-between">
						<div>
							<p class="text-sm opacity-75">Stock Bajo</p>
							<p class="text-2xl font-bold text-orange-600">{{ lowStockCount }}</p>
						</div>
						<UIcon name="i-heroicons-exclamation-triangle" class="w-8 h-8 text-orange-500" />
					</div>
				</UCard>

				<UCard>
					<div class="flex items-center justify-between">
						<div>
							<p class="text-sm opacity-75">Sin Stock</p>
							<p class="text-2xl font-bold text-red-600">{{ outOfStockCount }}</p>
						</div>
						<UIcon name="i-heroicons-x-circle" class="w-8 h-8 text-red-500" />
					</div>
				</UCard>
			</div>

			<!-- Tabla de productos -->
			<UCard>
				<template #header>
					<div class="flex items-center justify-between">
						<h3 class="text-lg font-semibold">Lista de Productos</h3>
						<div class="flex items-center space-x-2">
							<span class="text-sm opacity-75">Mostrar:</span>
							<USelectMenu
								v-model="itemsPerPage"
								:items="pageSizeOptions"
								size="sm"
							/>
						</div>
					</div>
				</template>

				<div v-if="isLoading" class="flex justify-center items-center py-12">
					<UIcon name="i-heroicons-arrow-path" class="w-8 h-8 animate-spin" />
					<span class="ml-2">Cargando productos...</span>
				</div>

				<div v-else-if="products.length === 0" class="text-center py-12">
					<UIcon name="i-heroicons-cube" class="w-16 h-16 opacity-50 mx-auto mb-4" />
					<h3 class="text-lg font-medium mb-2">No se encontraron productos</h3>
					<p class="opacity-75 mb-4">Intenta ajustar los filtros de búsqueda</p>
					<UButton @click="showCreateModal = true" color="primary">
						<UIcon name="i-heroicons-plus" />
						Crear primer producto
					</UButton>
				</div>

				<div v-else class="overflow-x-auto">
					<table class="w-full">
						<thead>
							<tr class="border-b">
								<th class="text-left py-3 px-4 font-medium">Producto</th>
								<th class="text-left py-3 px-4 font-medium">SKU</th>
								<th class="text-left py-3 px-4 font-medium">Categoría</th>
								<th class="text-right py-3 px-4 font-medium">Precio</th>
								<th class="text-right py-3 px-4 font-medium">Stock</th>
								<th class="text-center py-3 px-4 font-medium">Estado</th>
								<th class="text-center py-3 px-4 font-medium">Acciones</th>
							</tr>
						</thead>
						<tbody>
							<tr
								v-for="product in products"
								:key="product.id"
								class="border-b hover:bg-gray-50"
							>
								<td class="py-3 px-4">
									<div class="flex items-center space-x-3">
										<div class="w-12 h-12 rounded-lg border flex items-center justify-center">
											<img
												v-if="product.images && product.images.length > 0"
												:src="product.images[0]"
												:alt="product.name"
												class="w-full h-full object-cover rounded-lg"
											/>
											<UIcon v-else name="i-heroicons-photo" class="w-6 h-6 opacity-50" />
										</div>
										<div>
											<h4 class="font-medium">{{ product.name }}</h4>
											<p v-if="product.description" class="text-sm opacity-75 line-clamp-1">
												{{ product.description }}
											</p>
										</div>
									</div>
								</td>
								<td class="py-3 px-4">
									<span class="font-mono text-sm">{{ product.sku }}</span>
								</td>
								<td class="py-3 px-4">
									<span v-if="product.categoryName" class="text-sm">
										{{ product.categoryName }}
									</span>
									<span v-else class="text-sm opacity-50">Sin categoría</span>
								</td>
								<td class="py-3 px-4 text-right">
									<span class="font-semibold">
										{{ formatPrice(product.price, currentCurrency) }}
									</span>
								</td>
								<td class="py-3 px-4 text-right">
									<div class="flex items-center justify-end space-x-2">
										<span class="font-medium">{{ product.stock }}</span>
										<UBadge
											:color="getStockColor(product.stock, product.minStock)"
											size="xs"
										>
											{{ getStockStatus(product.stock, product.minStock) }}
										</UBadge>
									</div>
								</td>
								<td class="py-3 px-4 text-center">
									<UBadge
										:color="product.isActive ? 'green' : 'red'"
										size="sm"
									>
										{{ product.isActive ? 'Activo' : 'Inactivo' }}
									</UBadge>
								</td>
								<td class="py-3 px-4 text-center">
									<div class="flex items-center justify-center space-x-2">
										<UButton
											variant="ghost"
											size="sm"
											@click="editProduct(product)"
										>
											<UIcon name="i-heroicons-pencil" />
										</UButton>
										<UButton
											variant="ghost"
											size="sm"
											color="red"
											@click="deleteProduct(product)"
										>
											<UIcon name="i-heroicons-trash" />
										</UButton>
									</div>
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
					/>
				</div>
			</UCard>
		</div>

		<!-- Modal de crear/editar producto -->
		<UModal v-model:open="showCreateModal">
			<UCard>
				<template #header>
					<h3 class="text-lg font-semibold">
						{{ editingProduct ? 'Editar Producto' : 'Nuevo Producto' }}
					</h3>
				</template>

				<template #body>
					<ProductForm
						:product="editingProduct"
						:categories="categories"
						@submit="handleProductSubmit"
						@cancel="closeModal"
					/>
				</template>
			</UCard>
		</UModal>

		<!-- Modal de confirmación de eliminación -->
		<UModal v-model:open="showDeleteModal">
			<UCard>
				<template #header>
					<h3 class="text-lg font-semibold text-red-600">Confirmar Eliminación</h3>
				</template>

				<template #body>
					<div class="space-y-4">
						<p>¿Estás seguro de que quieres eliminar este producto?</p>
						<div v-if="productToDelete" class="bg-gray-50 rounded-lg p-4">
							<h4 class="font-medium">{{ productToDelete.name }}</h4>
							<p class="text-sm opacity-75">SKU: {{ productToDelete.sku }}</p>
						</div>
						<p class="text-sm text-red-600">
							Esta acción no se puede deshacer.
						</p>
					</div>
				</template>

				<template #footer>
					<div class="flex space-x-3">
						<UButton
							variant="outline"
							class="flex-1"
							@click="showDeleteModal = false"
						>
							Cancelar
						</UButton>
						<UButton
							color="red"
							class="flex-1"
							:loading="isDeleting"
							@click="confirmDelete"
						>
							Eliminar
						</UButton>
					</div>
				</template>
			</UCard>
		</UModal>
	</NuxtLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useProducts } from "~/composables/useProducts";
import { useCurrency } from "~/composables/useCurrency";

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
	formatPrice
} = useProducts();

const { formatCurrency } = useCurrency();

// Estado local
const searchQuery = ref("");
const selectedCategory = ref({ label: "Todas las categorías", value: "" });
const selectedStatus = ref({ label: "Todos los estados", value: "" });
const showLowStock = ref(false);
const showOutOfStock = ref(false);
const itemsPerPage = ref(20);
const showCreateModal = ref(false);
const showDeleteModal = ref(false);
const editingProduct = ref(null);
const productToDelete = ref(null);
const isDeleting = ref(false);

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
const currentCurrency = ref("BS");

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
		filters.isActive = selectedStatus.value.value === "active";
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
const deleteProduct = (product: any) => {
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

// Cerrar modal
const closeModal = () => {
	showCreateModal.value = false;
	editingProduct.value = null;
};

// Obtener color del stock
const getStockColor = (stock: number, minStock: number) => {
	if (stock === 0) return "red";
	if (stock <= minStock) return "orange";
	return "green";
};

// Obtener estado del stock
const getStockStatus = (stock: number, minStock: number) => {
	if (stock === 0) return "Sin stock";
	if (stock <= minStock) return "Bajo";
	return "Normal";
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

// Meta de la página
useHead({
	title: "Gestión de Productos - POS Venezuela"
});
</script>
