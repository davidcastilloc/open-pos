<template>
	<form @submit.prevent="handleSubmit" class="space-y-6">
		<!-- Selección de producto -->
		<div>
			<UFormGroup label="Producto" required>
				<USelectMenu
					v-model="selectedProduct"
					:options="productOptions"
					:loading="isLoadingProducts"
					searchable
					placeholder="Buscar producto..."
					option-attribute="label"
					value-attribute="value"
				>
					<template #option="{ option }">
						<div class="flex items-center justify-between w-full">
							<div>
								<div class="font-medium">{{ option.name }}</div>
								<div class="text-sm opacity-75 font-mono">{{ option.sku }}</div>
							</div>
							<div class="text-right text-sm">
								<div>Stock: {{ option.stock }}</div>
								<div class="opacity-75">{{ formatCurrency(option.price, option.currency) }}</div>
							</div>
						</div>
					</template>
				</USelectMenu>
				<p v-if="selectedProduct?.stock !== undefined" class="text-sm opacity-75 mt-1">
					Stock actual: {{ selectedProduct.stock }} unidades
				</p>
			</UFormGroup>
		</div>

		<!-- Tipo de movimiento -->
		<div>
			<UFormGroup label="Tipo de Movimiento" required>
				<USelectMenu
					v-model="form.movementType"
					:options="movementTypeOptions"
					placeholder="Seleccionar tipo"
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
					:options="reasonOptions"
					searchable
					placeholder="Seleccionar razón o escribir una personalizada"
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
			<h4 class="font-semibold mb-2">Resumen del Movimiento</h4>
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
</template>

<script setup lang="ts">
	import { computed, onMounted, ref, watch } from "vue";
	import { useProducts } from "~/composables/useProducts";
	import { useCurrency } from "~/composables/useCurrency";
	import { 
		MOVEMENT_TYPE_LABELS, 
		COMMON_MOVEMENT_REASONS,
		validateInventoryMovement,
		type InventoryMovement
	} from "~/schemas/inventory";

	// Props y emits
	const emit = defineEmits<{
		submit: [data: Omit<InventoryMovement, "newStock" | "previousStock">];
		cancel: [];
	}>();

	// Composables
	const { products, loadProducts, formatPrice } = useProducts();
	const { formatCurrency } = useCurrency();

	// Estado
	const isLoadingProducts = ref(false);
	const isSubmitting = ref(false);
	const selectedProduct = ref<any>(null);
	const selectedReason = ref<any>(null);

	// Formulario
	const form = ref({
		movementType: "",
		quantity: 0,
		unitCost: undefined as number | undefined,
		reason: "",
		referenceDocument: "",
		notes: "",
		createdBy: "user"
	});

	// Opciones para el formulario
	const productOptions = computed(() => 
		products.value.map(product => ({
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
			...commonReasons.map(reason => ({ label: reason, value: reason })),
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
			selectedProduct.value &&
			form.value.movementType &&
			form.value.quantity !== 0 &&
			(selectedReason.value?.value !== "custom" ? selectedReason.value?.value : form.value.reason) &&
			newStock.value >= 0 // No permitir stock negativo
		);
	});

	// Watchers
	watch(() => form.value.movementType, (newType) => {
		// Limpiar cantidad al cambiar tipo
		form.value.quantity = 0;
		selectedReason.value = null;
		form.value.reason = "";

		// Ajustar signo de cantidad según el tipo
		if (newType === 'exit' && form.value.quantity > 0) {
			form.value.quantity = -Math.abs(form.value.quantity);
		} else if (newType === 'entry' && form.value.quantity < 0) {
			form.value.quantity = Math.abs(form.value.quantity);
		}
	});

	watch(() => form.value.quantity, (newQuantity) => {
		// Ajustar signo según el tipo de movimiento
		if (form.value.movementType === 'exit' && newQuantity > 0) {
			form.value.quantity = -Math.abs(newQuantity);
		} else if (form.value.movementType === 'entry' && newQuantity < 0) {
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

	// Cargar productos al montar
	onMounted(async () => {
		isLoadingProducts.value = true;
		try {
			await loadProducts(1, {});
		} finally {
			isLoadingProducts.value = false;
		}
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
				movementType: form.value.movementType,
				quantity: form.value.quantity,
				unitCost: form.value.unitCost,
				totalCost: form.value.unitCost ? form.value.unitCost * Math.abs(form.value.quantity) : undefined,
				reason: form.value.reason,
				referenceDocument: form.value.referenceDocument || undefined,
				notes: form.value.notes || undefined,
				createdBy: form.value.createdBy
			};

			emit('submit', movementData);
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
</script>