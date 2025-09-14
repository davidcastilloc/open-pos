<template>
	<UModal
		v-model:open="isOpen"
		@close="handleClose"
	>
		<template #content>
			<UCard>
				<template #header>
					<div class="flex items-center justify-between">
						<h3 class="text-lg font-semibold">
							{{ title }}
						</h3>
						<p class="text-sm opacity-75">
							{{ description }}
						</p>
					</div>
				</template>
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
						<div v-if="showFilters" class="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg">
							<div>
								<UFormGroup label="Categoría">
									<USelectMenu
										v-model="selectedCategory"
										:items="categoryOptions"
										value-key="value"
										label-key="label"
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
										value-key="value"
										label-key="label"
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
												<span class="text-sm font-mono px-2 py-1 rounded border">
													{{ product.sku }}
												</span>
												<span v-if="product.barcode" class="text-sm font-mono px-2 py-1 rounded border">
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
												<UBadge :color="(getStockColor(product.stock, product.minStock) as unknown as 'success' | 'warning' | 'error')" size="sm">
													Stock: {{ product.stock }}
												</UBadge>
												<span v-if="product.stock <= product.minStock" class="text-xs text-warning">
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
			</UCard>
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
	<UModal v-model:open="showCreateProduct" @close="showCreateProduct = false">
		<template #content>
			<UCard>
				<template #header>
					<h3 class="text-lg font-semibold">
						Crear Producto Rápido
					</h3>
					<p class="text-sm opacity-75">
						Crea un nuevo producto para continuar con el movimiento de inventario
					</p>
				</template>
				<ProductForm
					:initial-data="quickCreateData"
					:categories="categoryOptionsForForm"
					:is-quick-create="true"
					@submit="handleProductCreated"
					@cancel="showCreateProduct = false"
				/>
				<template #footer>
					<div class="flex justify-end">
						<UButton variant="outline" @click="showCreateProduct = false">
							Cerrar
						</UButton>
					</div>
				</template>
			</UCard>
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
	const selectedCategory = ref(null);
	const stockFilter = ref(null);
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
		if (selectedCategory.value) {
			filtered = filtered.filter((product) => product.categoryId === selectedCategory.value);
		}

		// Filtro por stock
		if (stockFilter.value) {
			switch (stockFilter.value) {
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
		categoryId: selectedCategory.value || null
	}));

	const categoryOptionsForForm = computed(() => categories.value.map((c) => ({ id: c.id, name: c.name })));

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
		selectedCategory.value = null;
		stockFilter.value = null;
		maxPrice.value = null;
		showFilters.value = false;
	};

	const selectProduct = (product: unknown) => {
		const p = product as Product & { images?: readonly string[] };
		const mutableProduct: Product = {
			...p,
			images: p.images ? [...p.images] : undefined
		};
		emit("select", mutableProduct);
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

	const getStockColor = (stock: number, minStock: number) => {
		if (stock === 0) return "error" as const;
		if (stock <= minStock) return "warning" as const;
		return "success" as const;
	};
</script>
