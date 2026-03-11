<template>
	<UModal
		v-model:open="isOpen"
		:title="title"
		:description="description"
		@close="handleClose"
	>
		<template #body>
			<div class="space-y-6">
				<!-- Barra de búsqueda y filtros -->
				<div class="space-y-4">
					<!-- Búsqueda principal -->
					<div class="flex space-x-3">
						<div class="flex-1">
							<UInput
								v-model="searchQuery"
								placeholder="Buscar por nombre, SKU o código de barras..."
								:loading="isSearching"
								@input="handleSearch"
							>
								<template #leading>
									<UIcon name="i-heroicons-magnifying-glass" />
								</template>
								<template #trailing>
									<UButton
										v-if="searchQuery"
										variant="ghost"
										size="xs"
										@click="clearSearch"
									>
										<UIcon name="i-heroicons-x-mark" />
									</UButton>
								</template>
							</UInput>
						</div>
						<UButton
							variant="outline"
							@click="toggleFilters"
						>
							<UIcon name="i-heroicons-funnel" />
							Filtros
						</UButton>
					</div>

					<!-- Filtros expandibles -->
					<div v-if="showFilters" class="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
						<div>
							<UFormGroup label="Categoría">
								<USelectMenu
									v-model="selectedCategory"
									:items="categoryOptions"
									placeholder="Todas las categorías"
									@change="applyFilters"
								/>
							</UFormGroup>
						</div>
						<div>
							<UFormGroup label="Stock">
								<USelectMenu
									v-model="stockFilter"
									:items="stockOptions"
									placeholder="Todos"
									@change="applyFilters"
								/>
							</UFormGroup>
						</div>
						<div>
							<UFormGroup label="Precio máximo">
								<UInput
									v-model.number="maxPrice"
									type="number"
									step="0.01"
									min="0"
									placeholder="Sin límite"
									@input="applyFilters"
								/>
							</UFormGroup>
						</div>
					</div>
				</div>

				<!-- Resultados de búsqueda -->
				<div class="space-y-4">
					<!-- Header de resultados -->
					<div class="flex items-center justify-between">
						<div>
							<h3 class="text-lg font-semibold">
								Productos encontrados
							</h3>
							<p class="text-sm opacity-75">
								{{ filteredProducts.length }} de {{ totalProducts }} productos
							</p>
						</div>
						<div class="flex items-center space-x-2">
							<UButton
								variant="outline"
								size="sm"
								:loading="isLoading"
								@click="refreshProducts"
							>
								<UIcon name="i-heroicons-arrow-path" />
								Actualizar
							</UButton>
						</div>
					</div>

					<!-- Lista de productos -->
					<div v-if="isLoading" class="flex justify-center items-center py-12">
						<UIcon name="i-heroicons-arrow-path" class="w-8 h-8 animate-spin" />
						<span class="ml-2">Cargando productos...</span>
					</div>

					<div v-else-if="filteredProducts.length === 0" class="text-center py-12">
						<UIcon name="i-heroicons-cube" class="w-16 h-16 opacity-50 mx-auto mb-4" />
						<h3 class="text-lg font-medium mb-2">
							{{ searchQuery ? 'No se encontraron productos' : 'No hay productos disponibles' }}
						</h3>
						<p class="opacity-75 mb-4">
							{{ searchQuery ? 'Intenta con otros términos de búsqueda' : 'Agrega algunos productos para comenzar' }}
						</p>
						<UButton
							v-if="!searchQuery"
							color="primary"
							@click="showCreateProduct = true"
						>
							<UIcon name="i-heroicons-plus" />
							Crear primer producto
						</UButton>
					</div>

					<div v-else class="space-y-2 max-h-96 overflow-y-auto">
						<div
							v-for="product in filteredProducts"
							:key="product.id"
							class="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
							@click="selectProduct(product)"
						>
							<div class="flex-1">
								<div class="flex items-start justify-between">
									<div class="flex-1">
										<h4 class="font-medium text-lg">
											{{ product.name }}
										</h4>
										<div class="flex items-center space-x-4 mt-1">
											<span class="text-sm font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
												{{ product.sku }}
											</span>
											<span v-if="product.barcode" class="text-sm font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
												{{ product.barcode }}
											</span>
											<span v-if="product.categoryName" class="text-sm opacity-75">
												{{ product.categoryName }}
											</span>
										</div>
										<p v-if="product.description" class="text-sm opacity-75 mt-1 line-clamp-2">
											{{ product.description }}
										</p>
									</div>
									<div class="text-right ml-4">
										<div class="font-semibold text-lg">
											{{ formatCurrency(product.price, product.currency) }}
										</div>
										<div class="flex items-center space-x-2 mt-1">
											<span
												class="text-sm font-medium px-2 py-1 rounded"
												:class="getStockStatusClass(product.stock, product.minStock)"
											>
												Stock: {{ product.stock }}
											</span>
											<span v-if="product.stock <= product.minStock" class="text-xs text-orange-600">
												Stock bajo
											</span>
										</div>
									</div>
								</div>
							</div>
							<div class="ml-4">
								<UButton
									color="primary"
									variant="outline"
									size="sm"
									@click.stop="selectProduct(product)"
								>
									Seleccionar
								</UButton>
							</div>
						</div>
					</div>
				</div>

				<!-- Botón para crear producto si no existe -->
				<div v-if="searchQuery && filteredProducts.length === 0" class="text-center py-6 border-t">
					<p class="text-sm opacity-75 mb-4">
						¿No encuentras el producto que buscas?
					</p>
					<UButton
						color="primary"
						variant="outline"
						@click="createProductFromSearch"
					>
						<UIcon name="i-heroicons-plus" />
						Crear "{{ searchQuery }}"
					</UButton>
				</div>
			</div>
		</template>

		<template #footer>
			<div class="flex justify-between">
				<UButton
					variant="ghost"
					@click="handleClose"
				>
					Cancelar
				</UButton>
				<UButton
					v-if="showCreateProduct"
					color="primary"
					@click="showCreateProduct = true"
				>
					<UIcon name="i-heroicons-plus" />
					Crear Producto
				</UButton>
			</div>
		</template>
	</UModal>

	<!-- Modal para crear producto rápidamente -->
	<UModal
		v-model:open="showCreateProduct"
		title="Crear Producto Rápido"
		description="Crea un nuevo producto para continuar con el movimiento de inventario"
		@close="showCreateProduct = false"
	>
		<template #body>
			<ProductForm
				:initial-data="quickCreateData"
				:categories="categories"
				:is-quick-create="true"
				@submit="handleProductCreated"
				@cancel="showCreateProduct = false"
			/>
		</template>
	</UModal>
</template>

<script setup lang="ts">
	import type { Product } from "~/composables/useProducts";
	import { computed, ref, watch } from "vue";
	import { useCategories } from "~/composables/useCategories";
	import { useCurrency } from "~/composables/useCurrency";
	import { useProducts } from "~/composables/useProducts";

	// Props
	interface Props {
		open: boolean
		title?: string
		description?: string
		excludeIds?: string[]
	}

	const props = withDefaults(defineProps<Props>(), {
		title: "Buscar Producto",
		description: "Selecciona un producto para el movimiento de inventario",
		excludeIds: () => []
	});

	// Emits
	const emit = defineEmits<{
		close: []
		select: [product: Product]
		create: [productData: any]
	}>();

	// Composables
	const { products, loadProducts, isLoading } = useProducts();
	const { categories, loadCategories } = useCategories();
	const { formatCurrency } = useCurrency();

	// Estado local
	const isOpen = ref(false);
	const searchQuery = ref("");
	const isSearching = ref(false);
	const showFilters = ref(false);
	const showCreateProduct = ref(false);
	const selectedCategory = ref<{ label: string; value: string | null }>({ label: "Todas las categorías", value: null });
	const stockFilter = ref<{ label: string; value: string | null }>({ label: "Todos", value: null });
	const maxPrice = ref<number | null>(null);

	// Opciones para filtros
	const categoryOptions = computed(() => [
		{ label: "Todas las categorías", value: null },
		...categories.value.map((cat) => ({
			label: cat.name,
			value: cat.id
		}))
	]);

	const stockOptions = [
		{ label: "Todos", value: null },
		{ label: "Con stock", value: "in_stock" },
		{ label: "Sin stock", value: "out_of_stock" },
		{ label: "Stock bajo", value: "low_stock" }
	];

	const loadData = async () => {
		await Promise.all([
			loadProducts(1, {}),
			loadCategories()
		]);
	};

	// Productos filtrados
	const filteredProducts = computed(() => {
		let filtered = products.value.filter((product) =>
			!props.excludeIds.includes(product.id)
		);

		// Filtro por búsqueda
		if (searchQuery.value) {
			const query = searchQuery.value.toLowerCase();
			filtered = filtered.filter((product) =>
				product.name.toLowerCase().includes(query)
				|| product.sku.toLowerCase().includes(query)
				|| (product.barcode && product.barcode.toLowerCase().includes(query))
				|| (product.description && product.description.toLowerCase().includes(query))
			);
		}

		// Filtro por categoría
		if (selectedCategory.value.value) {
			filtered = filtered.filter((product) => product.categoryId === selectedCategory.value.value);
		}

		// Filtro por stock
		if (stockFilter.value.value) {
			switch (stockFilter.value.value) {
			case "in_stock":
				filtered = filtered.filter((product) => product.stock > 0);
				break;
			case "out_of_stock":
				filtered = filtered.filter((product) => product.stock === 0);
				break;
			case "low_stock":
				filtered = filtered.filter((product) => product.stock <= product.minStock);
				break;
			}
		}

		// Filtro por precio máximo
		if (maxPrice.value !== null) {
			filtered = filtered.filter((product) => product.price <= maxPrice.value!);
		}

		return filtered;
	});

	const totalProducts = computed(() => products.value.length);

	// Datos para creación rápida
	const quickCreateData = computed(() => ({
		name: searchQuery.value || "",
		sku: "",
		barcode: "",
		price: 0,
		cost: 0,
		stock: 0,
		minStock: 0,
		currency: "BS",
		categoryId: selectedCategory.value.value || null
	}));

	// Watchers
	watch(() => props.open, (newValue) => {
		isOpen.value = newValue;
		if (newValue) {
			loadData();
		}
	});

	watch(isOpen, (newValue) => {
		if (!newValue) {
			emit("close");
		}
	});

	// Métodos

	const handleSearch = () => {
		isSearching.value = true;
		// Debounce search
		setTimeout(() => {
			isSearching.value = false;
		}, 300);
	};

	const clearSearch = () => {
		searchQuery.value = "";
	};

	const toggleFilters = () => {
		showFilters.value = !showFilters.value;
	};

	const applyFilters = () => {
		// Los filtros se aplican automáticamente via computed
	};

	const refreshProducts = async () => {
		await loadData();
	};

	const handleClose = () => {
		isOpen.value = false;
		// Limpiar estado
		searchQuery.value = "";
		selectedCategory.value = { label: "Todas las categorías", value: null };
		stockFilter.value = { label: "Todos", value: null };
		maxPrice.value = null;
		showFilters.value = false;
	};

	const selectProduct = (product: Product) => {
		emit("select", product);
		handleClose();
	};

	const createProductFromSearch = () => {
		showCreateProduct.value = true;
	};

	const handleProductCreated = (productData: any) => {
		emit("create", productData);
		showCreateProduct.value = false;
		// Recargar productos para mostrar el nuevo
		loadData();
	};

	const getStockStatusClass = (stock: number, minStock: number) => {
		if (stock === 0) return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
		if (stock <= minStock) return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
		return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
	};
</script>
