<template>
	<form class="space-y-6" @submit.prevent="handleSubmit">
		<!-- Selección de producto -->
		<div>
			<UFormGroup label="Producto" required>
				<div class="space-y-2">
					<!-- Producto seleccionado -->
					<div v-if="selectedProduct" class="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
						<div class="flex items-center justify-between">
							<div class="flex-1">
								<h4 class="font-medium text-lg">
									{{ selectedProduct.name }}
								</h4>
								<div class="flex items-center space-x-4 mt-1">
									<span class="text-sm font-mono bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">
										{{ selectedProduct.sku }}
									</span>
									<span v-if="selectedProduct.barcode" class="text-sm font-mono bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">
										{{ selectedProduct.barcode }}
									</span>
									<span v-if="selectedProduct.categoryName" class="text-sm opacity-75">
										{{ selectedProduct.categoryName }}
									</span>
								</div>
								<div class="flex items-center space-x-4 mt-2">
									<span class="text-sm">
										<strong>Stock:</strong> {{ selectedProduct.stock }} unidades
									</span>
									<span class="text-sm">
										<strong>Precio:</strong> {{ formatCurrency(selectedProduct.price, selectedProduct.currency) }}
									</span>
								</div>
							</div>
							<div class="ml-4">
								<UButton
									variant="outline"
									size="sm"
									@click="clearSelectedProduct"
								>
									<UIcon name="i-heroicons-x-mark" />
									Cambiar
								</UButton>
							</div>
						</div>
					</div>

					<!-- Botón para buscar producto -->
					<div v-else>
						<UButton
							variant="outline"
							class="w-full justify-start"
							@click="showProductSearch = true"
						>
							<UIcon name="i-heroicons-magnifying-glass" />
							Buscar producto...
						</UButton>
					</div>
				</div>
			</UFormGroup>
		</div>

		<!-- Tipo de movimiento -->
		<div>
			<UFormGroup label="Tipo de Movimiento" required>
				<USelectMenu
					v-model="selectedMovementType"
					:items="movementTypeOptions"
					placeholder="Seleccionar tipo"
					value-attribute="value"
					option-attribute="label"
				/>
			</UFormGroup>
		</div>

		<!-- Cantidad -->
		<div>
			<UFormGroup label="Cantidad" required>
				<UInput
					v-model.number="form.quantity"
					type="number"
					:min="form.movementType === 'exit' ? `-${selectedProduct?.stock || 0}` : undefined"
					:max="form.movementType === 'entry' ? 99999 : selectedProduct?.stock || 0"
					placeholder="Cantidad del movimiento"
				/>
				<p v-if="form.movementType && form.quantity" class="text-sm mt-1">
					<span class="opacity-75">Resultado:</span>
					<span
						:class="newStock >= 0 ? 'text-green-600' : 'text-red-600'"
						class="font-medium ml-1"
					>
						{{ selectedProduct?.stock || 0 }} → {{ newStock }}
					</span>
				</p>
			</UFormGroup>
		</div>

		<!-- Costo unitario (opcional para entradas) -->
		<div v-if="form.movementType === 'entry' || form.movementType === 'adjustment'">
			<UFormGroup label="Costo Unitario (Opcional)">
				<UInput
					v-model.number="form.unitCost"
					type="number"
					step="0.01"
					min="0"
					placeholder="0.00"
				>
					<template #trailing>
						<span class="text-xs opacity-75">{{ selectedProduct?.currency || 'BS' }}</span>
					</template>
				</UInput>
				<p v-if="form.unitCost && form.quantity" class="text-sm opacity-75 mt-1">
					Costo total: {{ formatCurrency((form.unitCost * Math.abs(form.quantity)), selectedProduct?.currency || 'BS') }}
				</p>
			</UFormGroup>
		</div>

		<!-- Razón del movimiento -->
		<div>
			<UFormGroup label="Razón del Movimiento" required>
				<USelectMenu
					v-model="selectedReason"
					:items="reasonOptions"
					searchable
					placeholder="Seleccionar razón o escribir una personalizada"
					value-attribute="value"
					option-attribute="label"
				/>
				<UTextarea
					v-if="selectedReason?.value === 'custom'"
					v-model="form.reason"
					class="mt-2"
					placeholder="Escribir razón personalizada..."
					:maxlength="500"
				/>
			</UFormGroup>
		</div>

		<!-- Documento de referencia (opcional) -->
		<div>
			<UFormGroup label="Documento de Referencia (Opcional)">
				<UInput
					v-model="form.referenceDocument"
					placeholder="Ej: Factura #12345, Orden #ABC123"
					:maxlength="100"
				/>
			</UFormGroup>
		</div>

		<!-- Notas adicionales (opcional) -->
		<div>
			<UFormGroup label="Notas Adicionales (Opcional)">
				<UTextarea
					v-model="form.notes"
					placeholder="Información adicional sobre el movimiento..."
					:maxlength="1000"
					:rows="3"
				/>
			</UFormGroup>
		</div>

		<!-- Resumen del movimiento -->
		<div v-if="isFormValid" class="rounded-lg border p-4 bg-gray-50 dark:bg-gray-800">
			<h4 class="font-semibold mb-2">
				Resumen del Movimiento
			</h4>
			<div class="space-y-1 text-sm">
				<div class="flex justify-between">
					<span>Producto:</span>
					<span class="font-medium">{{ selectedProduct?.name }}</span>
				</div>
				<div class="flex justify-between">
					<span>Tipo:</span>
					<span class="font-medium">{{ getMovementTypeLabel(form.movementType) }}</span>
				</div>
				<div class="flex justify-between">
					<span>Cantidad:</span>
					<span
						class="font-medium"
						:class="form.quantity > 0 ? 'text-green-600' : 'text-red-600'"
					>
						{{ form.quantity > 0 ? '+' : '' }}{{ form.quantity }}
					</span>
				</div>
				<div class="flex justify-between">
					<span>Stock resultante:</span>
					<span class="font-medium">{{ newStock }} unidades</span>
				</div>
				<div v-if="form.unitCost" class="flex justify-between">
					<span>Valor del movimiento:</span>
					<span class="font-medium">
						{{ formatCurrency((form.unitCost * Math.abs(form.quantity)), selectedProduct?.currency || 'BS') }}
					</span>
				</div>
			</div>
		</div>

		<!-- Botones de acción -->
		<div class="flex space-x-3 pt-4">
			<UButton
				variant="outline"
				class="flex-1"
				@click="$emit('cancel')"
			>
				Cancelar
			</UButton>
			<UButton
				color="primary"
				class="flex-1"
				type="submit"
				:loading="isSubmitting"
				:disabled="!isFormValid"
			>
				Registrar Movimiento
			</UButton>
		</div>
	</form>

	<!-- Modal de búsqueda de productos -->
	<ProductSearchModal
		:open="showProductSearch"
		title="Seleccionar Producto"
		description="Busca y selecciona el producto para el movimiento de inventario"
		@close="showProductSearch = false"
		@select="handleProductSelect"
		@create="handleProductCreate"
	/>
</template>

<script setup lang="ts">
	import type { InventoryMovement } from "~/schemas/inventory";
	import { computed, onMounted, ref, watch } from "vue";
	import { useCurrency } from "~/composables/useCurrency";
	import { useProducts } from "~/composables/useProducts";
	import {
		COMMON_MOVEMENT_REASONS,
		MOVEMENT_TYPE_LABELS,
		validateInventoryMovement
	} from "~/schemas/inventory";

	// Props y emits
	const emit = defineEmits<{
		submit: [data: Omit<InventoryMovement, "newStock" | "previousStock">]
		cancel: []
	}>();

	// Composables
	const { products, loadProducts, createProduct } = useProducts();
	const { formatCurrency } = useCurrency();

	// Estado
	const isSubmitting = ref(false);
	const selectedProduct = ref<any>(null);
	const selectedReason = ref<any>(null);
	const selectedMovementType = ref<any>(null);
	const showProductSearch = ref(false);

	// Formulario
	const form = ref({
		movementType: "" as "entry" | "exit" | "adjustment" | "transfer" | "sale" | "return" | "",
		quantity: 0,
		unitCost: undefined as number | undefined,
		reason: "",
		referenceDocument: "",
		notes: "",
		createdBy: "user"
	});

	// Opciones para el formulario (ya no se usa, pero mantenemos para compatibilidad)
	const _productOptions = computed(() =>
		products.value.map((product) => ({
			label: `${product.name} (${product.sku})`,
			value: product.id,
			name: product.name,
			sku: product.sku,
			stock: product.stock,
			price: product.price,
			currency: product.currency
		}))
	);

	const movementTypeOptions = computed(() =>
		Object.entries(MOVEMENT_TYPE_LABELS).map(([key, label]) => ({
			label,
			value: key
		}))
	);

	const reasonOptions = computed(() => {
		if (!form.value.movementType) return [];

		const commonReasons = COMMON_MOVEMENT_REASONS[form.value.movementType as keyof typeof COMMON_MOVEMENT_REASONS] || [];

		return [
			...commonReasons.map((reason) => ({ label: reason, value: reason })),
			{ label: "Razón personalizada...", value: "custom" }
		];
	});

	// Stock resultante calculado
	const newStock = computed(() => {
		if (!selectedProduct.value || !form.value.quantity) return selectedProduct.value?.stock || 0;
		return (selectedProduct.value.stock || 0) + form.value.quantity;
	});

	// Validación del formulario
	const isFormValid = computed(() => {
		return !!(
			selectedProduct.value
			&& form.value.movementType
			&& form.value.quantity !== 0
			&& (selectedReason.value?.value !== "custom" ? selectedReason.value?.value : form.value.reason)
			&& newStock.value >= 0 // No permitir stock negativo
		);
	});

	// Watchers
	watch(selectedMovementType, (newType) => {
		if (newType) {
			form.value.movementType = newType.value;
		}
	});

	watch(() => form.value.movementType, (newType) => {
		// Limpiar cantidad al cambiar tipo
		form.value.quantity = 0;
		selectedReason.value = null;
		form.value.reason = "";

		// Ajustar signo de cantidad según el tipo
		if (newType === "exit" && form.value.quantity > 0) {
			form.value.quantity = -Math.abs(form.value.quantity);
		} else if (newType === "entry" && form.value.quantity < 0) {
			form.value.quantity = Math.abs(form.value.quantity);
		}
	});

	watch(() => form.value.quantity, (newQuantity) => {
		// Ajustar signo según el tipo de movimiento
		if (form.value.movementType === "exit" && newQuantity > 0) {
			form.value.quantity = -Math.abs(newQuantity);
		} else if (form.value.movementType === "entry" && newQuantity < 0) {
			form.value.quantity = Math.abs(newQuantity);
		}
	});

	watch(selectedReason, (newReason) => {
		if (newReason && newReason.value !== "custom") {
			form.value.reason = newReason.value;
		} else if (newReason?.value === "custom") {
			form.value.reason = "";
		}
	});

	// Cargar productos al montar (ya no es necesario cargar todos los productos)
	onMounted(async () => {
		// Los productos se cargarán cuando se abra el modal de búsqueda
	});

	// Manejar envío del formulario
	const handleSubmit = async () => {
		if (!isFormValid.value) return;

		const validation = validateInventoryMovement({
			productId: selectedProduct.value.id,
			movementType: form.value.movementType,
			quantity: form.value.quantity,
			previousStock: selectedProduct.value.stock,
			newStock: newStock.value,
			unitCost: form.value.unitCost,
			totalCost: form.value.unitCost ? form.value.unitCost * Math.abs(form.value.quantity) : undefined,
			reason: form.value.reason,
			referenceDocument: form.value.referenceDocument || undefined,
			notes: form.value.notes || undefined,
			createdBy: form.value.createdBy
		});

		if (!validation.success) {
			console.error("Errores de validación:", validation.errors);
			return;
		}

		isSubmitting.value = true;
		try {
			const movementData = {
				productId: selectedProduct.value.id,
				movementType: form.value.movementType as "entry" | "exit" | "adjustment" | "transfer" | "sale" | "return",
				quantity: form.value.quantity,
				unitCost: form.value.unitCost,
				totalCost: form.value.unitCost ? form.value.unitCost * Math.abs(form.value.quantity) : undefined,
				reason: form.value.reason,
				referenceDocument: form.value.referenceDocument || undefined,
				notes: form.value.notes || undefined,
				createdBy: form.value.createdBy
			};

			emit("submit", movementData);
		} catch (error) {
			console.error("Error en envío:", error);
		} finally {
			isSubmitting.value = false;
		}
	};

	// Helper para obtener etiqueta del tipo de movimiento
	const getMovementTypeLabel = (type: string) => {
		return MOVEMENT_TYPE_LABELS[type as keyof typeof MOVEMENT_TYPE_LABELS] || type;
	};

	// Manejar selección de producto desde el modal
	const handleProductSelect = (product: any) => {
		selectedProduct.value = product;
		showProductSearch.value = false;
	};

	// Manejar creación de producto desde el modal
	const handleProductCreate = async (productData: any) => {
		try {
			const productId = await createProduct(productData);
			// Recargar productos para obtener el nuevo producto
			await loadProducts(1, {});
			// Buscar el producto recién creado
			const newProduct = products.value.find((p) => p.id === productId);
			if (newProduct) {
				selectedProduct.value = newProduct;
			}
			showProductSearch.value = false;
		} catch (error) {
			console.error("Error creando producto:", error);
		}
	};

	// Limpiar producto seleccionado
	const clearSelectedProduct = () => {
		selectedProduct.value = null;
		showProductSearch.value = true;
	};
</script>
