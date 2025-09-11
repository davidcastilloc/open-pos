<template>
	<NuxtLayout name="pos">
		<div class="flex h-screen">
			<!-- Área de productos (izquierda) -->
			<div class="flex-1 p-6">
				<!-- Barra de búsqueda y filtros -->
				<div class="mb-6">
					<div class="flex items-center space-x-4 mb-4">
						<!-- Búsqueda -->
						<div class="flex-1">
							<UInput
								v-model="searchQuery"
								placeholder="Buscar productos por nombre, SKU o código de barras..."
								size="lg"
								icon="i-heroicons-magnifying-glass"
								@input="handleSearch"
							/>
						</div>

						<!-- Filtros -->
						<USelectMenu
							v-model="selectedCategory"
							:options="categoryOptions"
							placeholder="Todas las categorías"
							size="lg"
						/>

						<!-- Moneda -->
						<USelectMenu
							v-model="selectedCurrency"
							:options="currencyOptions"
							placeholder="Moneda"
							size="lg"
						/>
					</div>

					<!-- Filtros adicionales -->
					<div class="flex items-center space-x-4">
						<UCheckbox v-model="showOnlyInStock" label="Solo con stock" />
						<UCheckbox v-model="showLowStock" label="Stock bajo" />
						<UButton variant="outline" size="sm" @click="clearFilters">
							<UIcon name="i-heroicons-x-mark" />
							Limpiar filtros
						</UButton>
					</div>
				</div>

				<!-- Grid de productos -->
				<div v-if="isLoading" class="flex justify-center items-center h-64">
					<UIcon name="i-heroicons-arrow-path" class="w-8 h-8 animate-spin" />
					<span class="ml-2">Cargando productos...</span>
				</div>

				<div v-else-if="products.length === 0" class="text-center py-12">
					<UIcon name="i-heroicons-cube" class="w-16 h-16 opacity-50 mx-auto mb-4" />
					<h3 class="text-lg font-medium mb-2">
						No se encontraron productos
					</h3>
					<p class="opacity-75">
						Intenta ajustar los filtros de búsqueda
					</p>
				</div>

				<div v-else class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
					<div
						v-for="product in products"
						:key="product.id"
						class="rounded-lg shadow-sm border p-4 hover:shadow-md transition-shadow cursor-pointer"
						@click="addToCart(product)"
					>
						<!-- Imagen del producto -->
						<div class="aspect-square rounded-lg mb-3 flex items-center justify-center border">
							<img
								v-if="product.images && product.images.length > 0"
								:src="product.images[0]"
								:alt="product.name"
								class="w-full h-full object-cover rounded-lg"
							>
							<UIcon v-else name="i-heroicons-photo" class="w-12 h-12 opacity-50" />
						</div>

						<!-- Información del producto -->
						<div class="space-y-2">
							<h3 class="font-medium text-sm line-clamp-2">
								{{ product.name }}
							</h3>

							<p class="text-xs opacity-75">
								SKU: {{ product.sku }}
							</p>

							<!-- Precio -->
							<div class="flex items-center justify-between">
								<span class="text-lg font-bold">
									{{ formatPrice(product.price, selectedCurrency) }}
								</span>
								<span class="text-xs opacity-75">
									{{ selectedCurrency }}
								</span>
							</div>

							<!-- Stock -->
							<div class="flex items-center justify-between">
								<span class="text-xs opacity-75">Stock:</span>
								<UBadge
									:color="getStockColor(product.stock, product.minStock)"
									size="xs"
								>
									{{ product.stock }}
								</UBadge>
							</div>

							<!-- Categoría -->
							<div v-if="product.categoryName" class="text-xs opacity-75">
								{{ product.categoryName }}
							</div>
						</div>
					</div>
				</div>

				<!-- Paginación -->
				<div v-if="totalPages > 1" class="mt-6 flex justify-center">
					<UPagination
						v-model="currentPage"
						:page-count="itemsPerPage"
						:total="totalItems"
						:ui="{
							wrapper: 'flex items-center gap-1',
							rounded: '!rounded-full min-w-[32px] justify-center',
							default: {
								size: 'sm'
							}
						}"
					/>
				</div>
			</div>

			<!-- Carrito de ventas (derecha) -->
			<div class="w-96 border-l flex flex-col">
				<!-- Header del carrito -->
				<div class="p-4 border-b">
					<div class="flex items-center justify-between">
						<h2 class="text-lg font-semibold">
							Carrito de Ventas
						</h2>
						<UButton
							variant="outline"
							size="sm"
							color="red"
							:disabled="cart.length === 0"
							@click="clearCart"
						>
							<UIcon name="i-heroicons-trash" />
							Limpiar
						</UButton>
					</div>
				</div>

				<!-- Lista de items -->
				<div class="flex-1 overflow-y-auto p-4">
					<div v-if="cart.length === 0" class="text-center py-8">
						<UIcon name="i-heroicons-shopping-cart" class="w-16 h-16 opacity-50 mx-auto mb-4" />
						<p class="opacity-75">
							El carrito está vacío
						</p>
						<p class="text-sm opacity-50">
							Agrega productos para comenzar
						</p>
					</div>

					<div v-else class="space-y-3">
						<div
							v-for="item in cart"
							:key="item.id"
							class="rounded-lg p-3 border"
						>
							<div class="flex items-start justify-between mb-2">
								<div class="flex-1">
									<h4 class="font-medium text-sm">
										{{ item.name }}
									</h4>
									<p class="text-xs opacity-75">
										{{ formatPrice(item.price, item.currency) }} c/u
									</p>
								</div>
								<UButton
									variant="ghost"
									size="xs"
									color="red"
									@click="removeFromCart(item.id)"
								>
									<UIcon name="i-heroicons-x-mark" />
								</UButton>
							</div>

							<!-- Cantidad -->
							<div class="flex items-center justify-between">
								<div class="flex items-center space-x-2">
									<UButton
										variant="outline"
										size="xs"
										:disabled="item.quantity <= 1"
										@click="updateQuantity(item.id, item.quantity - 1)"
									>
										<UIcon name="i-heroicons-minus" />
									</UButton>
									<span class="text-sm font-medium w-8 text-center">
										{{ item.quantity }}
									</span>
									<UButton
										variant="outline"
										size="xs"
										@click="updateQuantity(item.id, item.quantity + 1)"
									>
										<UIcon name="i-heroicons-plus" />
									</UButton>
								</div>
								<span class="text-sm font-bold">
									{{ formatPrice(item.total, item.currency) }}
								</span>
							</div>
						</div>
					</div>
				</div>

				<!-- Resumen de la venta -->
				<div class="border-t p-4 space-y-4">
					<!-- Descuento -->
					<div class="flex items-center justify-between">
						<span class="text-sm opacity-75">Descuento:</span>
						<UInput
							v-model="discountInput"
							placeholder="0"
							size="sm"
							class="w-20"
							@blur="applyDiscountFromInput"
						/>
					</div>

					<!-- Totales -->
					<div class="space-y-2 text-sm">
						<div class="flex justify-between">
							<span class="opacity-75">Subtotal:</span>
							<span>{{ formatPrice(subtotal, currentCurrency) }}</span>
						</div>
						<div class="flex justify-between">
							<span class="opacity-75">Descuento:</span>
							<span>-{{ formatPrice(discountAmount, currentCurrency) }}</span>
						</div>
						<div class="flex justify-between">
							<span class="opacity-75">Impuestos:</span>
							<span>{{ formatPrice(tax, currentCurrency) }}</span>
						</div>
						<div class="flex justify-between text-lg font-bold border-t pt-2">
							<span>Total:</span>
							<span class="font-bold">{{ formatPrice(total, currentCurrency) }}</span>
						</div>
					</div>

					<!-- Botón de pago -->
					<UButton
						:disabled="cart.length === 0 || isProcessing"
						:loading="isProcessing"
						size="lg"
						color="primary"
						class="w-full"
						@click="showPaymentModal = true"
					>
						<UIcon name="i-heroicons-credit-card" />
						Procesar Pago
					</UButton>
				</div>
			</div>
		</div>

		<!-- Modal de pago -->
		<UModal v-model="showPaymentModal">
			<UCard>
				<template #header>
					<h3 class="text-lg font-semibold">
						Procesar Pago
					</h3>
				</template>

				<div class="space-y-4">
					<!-- Resumen de la venta -->
					<div class="rounded-lg p-4 border">
						<h4 class="font-medium mb-2">
							Resumen de la venta
						</h4>
						<div class="space-y-1 text-sm">
							<div class="flex justify-between">
								<span>Items:</span>
								<span>{{ cart.length }}</span>
							</div>
							<div class="flex justify-between">
								<span>Subtotal:</span>
								<span>{{ formatPrice(subtotal, currentCurrency) }}</span>
							</div>
							<div class="flex justify-between">
								<span>Total:</span>
								<span class="font-bold">{{ formatPrice(total, currentCurrency) }}</span>
							</div>
						</div>
					</div>

					<!-- Método de pago -->
					<div>
						<label class="block text-sm font-medium mb-2">
							Método de pago
						</label>
						<USelectMenu
							v-model="selectedPaymentMethod"
							:options="paymentMethods"
							placeholder="Seleccionar método"
						/>
					</div>

					<!-- Botones -->
					<div class="flex space-x-3">
						<UButton
							variant="outline"
							class="flex-1"
							@click="showPaymentModal = false"
						>
							Cancelar
						</UButton>
						<UButton
							:loading="isProcessing"
							color="primary"
							class="flex-1"
							@click="processPayment"
						>
							Confirmar Pago
						</UButton>
					</div>
				</div>
			</UCard>
		</UModal>
	</NuxtLayout>
</template>

<script setup lang="ts">
	import { computed, onMounted, ref, watch } from "vue";
	import { usePOS } from "~/composables/usePOS";
	import { useProducts } from "~/composables/useProducts";

	// Composables
	const {
		cart,
		currentCurrency,
		subtotal,
		discountAmount,
		tax,
		total,
		isProcessing,
		addToCart,
		removeFromCart,
		updateQuantity,
		clearCart,
		applyDiscount,
		processSale,
		formatPrice
	} = usePOS();

	const {
		products,
		categories,
		isLoading,
		currentPage,
		totalPages,
		totalItems,
		loadProducts,
		loadCategories,
		changeCurrency
	} = useProducts();

	// Estado local
	const searchQuery = ref("");
	const selectedCategory = ref("");
	const selectedCurrency = ref("BS");
	const showOnlyInStock = ref(false);
	const showLowStock = ref(false);
	const discountInput = ref("");
	const showPaymentModal = ref(false);
	const selectedPaymentMethod = ref("");

	// Opciones para selects
	const categoryOptions = computed(() => [
		{ label: "Todas las categorías", value: "" },
		...categories.value.map((cat) => ({ label: cat.name, value: cat.id }))
	]);

	const currencyOptions = [
		{ label: "Bolívares (BS)", value: "BS" },
		{ label: "Dólares (USD)", value: "USD" },
		{ label: "Euros (EUR)", value: "EUR" }
	];

	const paymentMethods = [
		{ label: "Efectivo", value: "cash" },
		{ label: "Tarjeta de Débito", value: "debit_card" },
		{ label: "Tarjeta de Crédito", value: "credit_card" },
		{ label: "Transferencia", value: "transfer" },
		{ label: "Pago Móvil", value: "mobile_payment" }
	];

	// Configuración de paginación
	const itemsPerPage = 20;

	// Cargar datos iniciales
	onMounted(async () => {
		await loadCategories();
		await loadProducts(1, {});
	});

	// Manejar búsqueda
	const handleSearch = () => {
		loadProducts(1, {
			search: searchQuery.value,
			category: selectedCategory.value,
			inStock: showOnlyInStock.value
		});
	};

	// Limpiar filtros
	const clearFilters = () => {
		searchQuery.value = "";
		selectedCategory.value = "";
		showOnlyInStock.value = false;
		showLowStock.value = false;
		loadProducts(1, {});
	};

	// Aplicar descuento desde input
	const applyDiscountFromInput = () => {
		const value = Number.parseFloat(discountInput.value) || 0;
		if (value > 0) {
			applyDiscount(value, "amount");
		}
	};

	// Procesar pago
	const processPayment = async () => {
		if (!selectedPaymentMethod.value) {
			// TODO: Mostrar error
			return;
		}

		try {
			await processSale(selectedPaymentMethod.value);
			showPaymentModal.value = false;
			selectedPaymentMethod.value = "";
		// TODO: Mostrar mensaje de éxito
		} catch (error) {
			// TODO: Mostrar error
			console.error("Error processing payment:", error);
		}
	};

	// Obtener color del stock
	const getStockColor = (stock: number, minStock: number) => {
		if (stock === 0) return "error";
		if (stock <= minStock) return "warning";
		return "success";
	};

	// Watchers
	watch(selectedCategory, () => {
		handleSearch();
	});

	watch(showOnlyInStock, () => {
		handleSearch();
	});

	watch(selectedCurrency, async (newCurrency) => {
		await changeCurrency(newCurrency);
	});

	// Meta de la página
	useHead({
		title: "POS - Punto de Venta"
	});
</script>
