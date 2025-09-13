<template>
	<NuxtLayout name="pos">
		<div>
			<div class="flex h-screen">
				<!-- Área de productos (izquierda) -->
				<div class="flex-1 p-6">
					<!-- Aviso cuando la caja esté cerrada -->
					<div v-if="!isCashSessionOpen" class="mb-6">
						<UAlert
							color="warning"
							title="Caja Cerrada"
							description="No se pueden realizar ventas mientras la caja esté cerrada. Usa el botón 'Abrir Caja' en el header para iniciar la jornada de ventas."
							icon="i-heroicons-lock-closed"
						/>
					</div>

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
								:items="categoryOptions"
								placeholder="Todas las categorías"
								size="lg"
							/>

							<!-- Moneda -->
							<USelectMenu
								v-model="selectedCurrency"
								:items="currencyOptions"
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

					<div v-else class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4" :class="{ 'opacity-50': !isCashSessionOpen }">
						<div
							v-for="product in products"
							:key="product.id"
							class="rounded-lg shadow-sm border p-4 hover:shadow-md transition-shadow cursor-pointer"
							:class="{ 'cursor-not-allowed opacity-50': !isCashSessionOpen }"
							@click="isCashSessionOpen ? addToCart(product.id) : null"
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
										{{ formatPrice(product.price, typeof selectedCurrency === "string" ? selectedCurrency : selectedCurrency.value) }}
									</span>
									<span class="text-xs opacity-75">
										{{ selectedCurrency.value || selectedCurrency }}
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
						/>
					</div>
				</div>

				<!-- Carrito de ventas (derecha) -->
				<div class="w-96 border-l flex flex-col" :class="{ 'opacity-50': !isCashSessionOpen }">
					<!-- Header del carrito -->
					<div class="p-4 border-b">
						<div class="flex items-center justify-between">
							<h2 class="text-lg font-semibold">
								Carrito de Ventas
							</h2>
							<UButton
								variant="outline"
								size="sm"
								color="error"
								:disabled="cart.length === 0"
								@click="clearCart"
							>
								<UIcon name="i-heroicons-trash" />
								Limpiar
							</UButton>
							<UButton
								variant="outline"
								size="sm"
								class="ml-2"
								:disabled="!isCashSessionOpen"
								@click="isCashSessionOpen ? showExpenseModal = true : null"
							>
								<UIcon name="i-heroicons-banknotes" />
								Registrar egreso
							</UButton>
						</div>
					</div>

					<!-- Lista de items -->
					<div class="flex-1 overflow-y-auto p-4">
						<div v-if="!isCashSessionOpen" class="text-center py-8">
							<UIcon name="i-heroicons-lock-closed" class="w-16 h-16 opacity-50 mx-auto mb-4" />
							<p class="opacity-75">
								Caja cerrada
							</p>
							<p class="text-sm opacity-50">
								Abre la caja para realizar ventas
							</p>
						</div>
						<div v-else-if="cart.length === 0" class="text-center py-8">
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
										color="error"
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
							:disabled="cart.length === 0 || isProcessing || !isCashSessionOpen"
							:loading="isProcessing"
							size="lg"
							color="primary"
							class="w-full"
							@click="isCashSessionOpen ? showPaymentModal = true : null"
						>
							<UIcon name="i-heroicons-credit-card" />
							{{ isCashSessionOpen ? 'Procesar Pago' : 'Caja Cerrada' }}
						</UButton>
					</div>
				</div>
			</div>

			<!-- Modal de pago -->
			<UModal
				v-model:open="showPaymentModal"
				title="Procesar Pago"
				description="Confirma los detalles de la venta y selecciona el método de pago"
			>
				<template #body>
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
								:items="paymentMethods"
								placeholder="Seleccionar método"
							/>
						</div>
						<!-- Cuenta de pago -->
						<div class="mt-4">
							<label class="block text-sm font-medium mb-2">
								Cuenta de pago
							</label>
							<USelectMenu
								v-model="selectedPaymentAccount"
								:items="paymentAccounts"
								placeholder="Seleccionar cuenta"
							/>
						</div>
					</div>
				</template>

				<template #footer>
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
							:disabled="!selectedPaymentAccount?.value"
							color="primary"
							class="flex-1"
							@click="processPayment"
						>
							Confirmar Pago
						</UButton>
					</div>
				</template>
			</UModal>
			<!-- Modal de egreso -->
			<UModal
				v-model:open="showExpenseModal"
				title="Registrar egreso"
				description="Registra un gasto desde una cuenta de caja"
			>
				<template #body>
					<div class="space-y-4">
						<div>
							<label class="block text-sm font-medium mb-2">Cuenta</label>
							<USelectMenu
								v-model="expenseForm.accountId"
								:items="paymentAccounts"
								placeholder="Seleccionar cuenta"
							/>
						</div>
						<div>
							<label class="block text-sm font-medium mb-2">Monto</label>
							<UInput v-model="expenseForm.amount" type="number" step="0.01" min="0" placeholder="0.00" />
						</div>
						<div>
							<label class="block text-sm font-medium mb-2">Moneda</label>
							<USelectMenu
								v-model="expenseForm.currency"
								:items="currencyOptions"
							/>
						</div>
						<div>
							<label class="block text-sm font-medium mb-2">Descripción</label>
							<UTextarea v-model="expenseForm.description" placeholder="Motivo del egreso" />
						</div>
					</div>
				</template>
				<template #footer>
					<div class="flex space-x-3">
						<UButton variant="outline" class="flex-1" @click="showExpenseModal = false">
							Cancelar
						</UButton>
						<UButton color="primary" class="flex-1" @click="saveExpense">
							Guardar egreso
						</UButton>
					</div>
				</template>
			</UModal>
		</div>
	</NuxtLayout>
</template>

<script setup lang="ts">
	import { computed, nextTick, onMounted, ref, watch } from "vue";
	import { useAccounts } from "~/composables/useAccounts";
	import { useCashClosing } from "~/composables/useCashClosing";
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
		isCashSessionOpen,
		initializeCashSession
	} = useCashClosing();

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
	const selectedCategory = ref({ label: "Todas las categorías", value: "" });
	const selectedCurrency = ref({ label: "Bolívares (BS)", value: "BS" });
	const showOnlyInStock = ref(false);
	const showLowStock = ref(false);
	const discountInput = ref("");
	const showPaymentModal = ref(false);
	const showExpenseModal = ref(false);
	const selectedPaymentMethod = ref({ label: "Efectivo", value: "cash" });
	const selectedPaymentAccount = ref<{ label: string, value: string } | undefined>(undefined);

	// Cargar cuentas de pago usando el composable useAccounts
	const { loadAccounts, getCashAccounts } = useAccounts();

	// Cuentas de pago reactivas - se recalculan cuando cambia la moneda
	const paymentAccounts = computed(() => {
		return getCashAccounts.value
			.filter((account) => account.currency === (currentCurrency.value || "BS"))
			.map((account) => ({ label: account.name, value: account.id }));
	});

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

	// Cargar datos iniciales - unificado
	onMounted(async () => {
		try {
			// Cargar cuentas y categorías en paralelo
			await Promise.all([
				loadAccounts(),
				loadCategories()
			]);

			// Inicializar sesión de caja
			await initializeCashSession();

			// Cargar productos iniciales
			await loadProducts(1, {});
		} catch (e) {
			console.error("Error cargando datos iniciales:", e);
		}
	});

	// Egreso (MVP)
	const expenseForm = ref({ accountId: { label: "", value: "" }, amount: 0, currency: { label: "BS", value: "BS" }, description: "" });
	const saveExpense = async () => {
		try {
			if (!expenseForm.value.accountId?.value || !expenseForm.value.amount || expenseForm.value.amount <= 0) return;
			const { useTransactions } = await import("~/composables/useTransactions");
			const { createExpenseTx } = useTransactions();
			await createExpenseTx({
				type: "expense",
				accountId: expenseForm.value.accountId.value,
				amount: Number(expenseForm.value.amount),
				currency: expenseForm.value.currency.value as any,
				description: expenseForm.value.description
			} as any);
			showExpenseModal.value = false;
			expenseForm.value = { accountId: { label: "", value: "" }, amount: 0, currency: { label: "BS", value: "BS" }, description: "" };
		} catch (e) {
			console.error("Error guardando egreso:", e);
		}
	};

	// Construir filtros para la búsqueda
	const buildFilters = () => {
		const filters: any = {};

		// Solo agregar filtros que tengan valores válidos
		if (searchQuery.value.trim()) {
			filters.search = searchQuery.value.trim();
		}

		if (selectedCategory.value && selectedCategory.value.value && selectedCategory.value.value !== "") {
			filters.category = selectedCategory.value.value;
		}

		if (showOnlyInStock.value) {
			filters.inStock = true;
		}

		// Nota: showLowStock no se implementa en el backend aún, pero se mantiene para futuras mejoras
		// if (showLowStock.value) {
		//   filters.lowStock = true;
		// }

		return filters;
	};

	// Manejar búsqueda
	const handleSearch = () => {
		const filters = buildFilters();
		loadProducts(1, filters);
	};

	// Limpiar filtros
	const clearFilters = () => {
		searchQuery.value = "";
		selectedCategory.value = { label: "Todas las categorías", value: "" };
		showOnlyInStock.value = false;
		showLowStock.value = false;
		// Cargar todos los productos sin filtros
		loadProducts(1, {});
	};

	// Aplicar descuento desde input
	const applyDiscountFromInput = () => {
		const value = Number.parseFloat(discountInput.value) || 0;
		if (value >= 0) {
			applyDiscount(value, "amount");
		}
	};

	// Procesar pago
	const processPayment = async () => {
		// Verificar que la caja esté abierta
		if (!isCashSessionOpen.value) {
			console.error("No se puede procesar pago: la caja está cerrada");
			// TODO: Mostrar error al usuario
			return;
		}

		if (!selectedPaymentMethod.value) {
			console.error("Debe seleccionar un método de pago");
			// TODO: Mostrar error
			return;
		}

		if (!selectedPaymentAccount.value?.value) {
			console.error("Debe seleccionar una cuenta de pago");
			// TODO: Mostrar error
			return;
		}

		try {
			// selectedPaymentMethod.value ahora es un objeto con { label, value }
			const paymentMethodValue = typeof selectedPaymentMethod.value === "string" ? selectedPaymentMethod.value : selectedPaymentMethod.value.value;
			await processSale(paymentMethodValue, selectedPaymentAccount.value.value);

			// Refrescar la lista de productos para mostrar los nuevos valores de stock
			const filters = buildFilters();
			await loadProducts(currentPage.value, filters);

			showPaymentModal.value = false;
			selectedPaymentMethod.value = { label: "Efectivo", value: "cash" };
			selectedPaymentAccount.value = undefined;
			discountInput.value = ""; // Limpiar descuento después de la venta
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
	watch(selectedCategory, (newCategory, oldCategory) => {
		// Solo ejecutar si realmente cambió el valor
		if (newCategory?.value !== oldCategory?.value) {
			handleSearch();
		}
	});

	watch(showOnlyInStock, (newValue, oldValue) => {
		// Solo ejecutar si realmente cambió el valor
		if (newValue !== oldValue) {
			handleSearch();
		}
	});

	watch(showLowStock, (newValue, oldValue) => {
		// Solo ejecutar si realmente cambió el valor
		if (newValue !== oldValue) {
			handleSearch();
		}
	});

	watch(selectedCurrency, async (newCurrency, oldCurrency) => {
		// Solo ejecutar si realmente cambió el valor
		const newValue = typeof newCurrency === "string" ? newCurrency : newCurrency.value;
		const oldValue = typeof oldCurrency === "string" ? oldCurrency : oldCurrency?.value;
		if (newValue !== oldValue) {
			await changeCurrency(newValue);
			// Limpiar cuenta de pago seleccionada si ya no existe en la nueva moneda
			if (selectedPaymentAccount.value) {
				const accountExists = paymentAccounts.value.some(
					(account) => account.value === selectedPaymentAccount.value?.value
				);
				if (!accountExists) {
					selectedPaymentAccount.value = undefined;
				}
			}
		}
	});

	// Watcher para paginación - recargar productos con filtros actuales
	watch(currentPage, (newPage) => {
		if (newPage > 1) {
			const filters = buildFilters();
			loadProducts(newPage, filters);
		}
	});

	// Watcher para forzar reactividad cuando cambie el estado de la caja
	watch(isCashSessionOpen, (newValue, oldValue) => {
		console.log("🔄 Estado de caja cambió:", { oldValue, newValue });
		// Forzar re-renderizado del componente
		nextTick(() => {
			console.log("✅ UI actualizada después del cambio de estado de caja");
		});
	}, { immediate: true });
</script>
