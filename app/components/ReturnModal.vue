<template>
	<UModal v-model:open="isOpen">
		<template #content>
			<UCard>
				<template #header>
					<div class="flex items-center justify-between">
						<div>
							<h3 class="text-lg font-semibold">
								{{ isEditMode ? 'Editar Devolución' : 'Nueva Devolución' }}
							</h3>
							<p class="text-sm opacity-75">
								{{ isEditMode ? 'Modifica los detalles de la devolución' : 'Selecciona los productos a devolver' }}
							</p>
						</div>
						<UButton
							icon="i-heroicons-x-mark"
							variant="ghost"
							color="neutral"
							@click="closeModal"
						/>
					</div>
				</template>

				<div class="space-y-6">
					<!-- Información de la venta original -->
					<div v-if="originalSale" class="rounded-lg border p-4">
						<h4 class="font-medium mb-3">
							Venta Original
						</h4>
						<div class="grid grid-cols-2 gap-4 text-sm">
							<div>
								<span class="opacity-75">ID de Venta:</span>
								<span class="font-mono">{{ originalSale.id }}</span>
							</div>
							<div>
								<span class="opacity-75">Fecha:</span>
								<span>{{ formatDate(originalSale.createdAt) }}</span>
							</div>
							<div>
								<span class="opacity-75">Total:</span>
								<span class="font-semibold">{{ formatPrice(originalSale.total, originalSale.currency) }}</span>
							</div>
							<div v-if="originalSale.customerName">
								<span class="opacity-75">Cliente:</span>
								<span>{{ originalSale.customerName }}</span>
							</div>
						</div>
					</div>

					<!-- Tipo de devolución -->
					<div>
						<label class="block text-sm font-medium mb-2">Tipo de Devolución *</label>
						<URadioGroup v-model="form.returnType" :options="returnTypeOptions" />
					</div>

					<!-- Motivo de la devolución -->
					<div>
						<UFormGroup label="Motivo de la Devolución *" name="reason">
							<USelectMenu
								v-model="selectedReason"
								:items="reasonOptions"
								placeholder="Selecciona un motivo"
								searchable
							/>
						</UFormGroup>
					</div>

					<!-- Items de la venta para devolver -->
					<div v-if="saleItems.length > 0">
						<h4 class="font-medium mb-3">
							Productos de la Venta
						</h4>
						<div class="space-y-3 max-h-64 overflow-y-auto">
							<div
								v-for="item in saleItems"
								:key="item.id"
								class="rounded-lg border p-3"
								:class="{ 'border-primary': selectedItems.includes(item.id) }"
							>
								<div class="flex items-start justify-between">
									<div class="flex-1">
										<h5 class="font-medium text-sm">
											{{ item.product_name }}
										</h5>
										<p class="text-xs opacity-75">
											SKU: {{ item.product_sku }}
										</p>
										<p class="text-xs opacity-75">
											Cantidad vendida: {{ item.quantity }} × {{ formatPrice(item.price, originalSale?.currency || 'BS') }}
										</p>
									</div>
									<div class="flex items-center space-x-2">
										<UCheckbox
											:model-value="selectedItems.includes(item.id)"
											@update:model-value="toggleItemSelection(item.id)"
										/>
									</div>
								</div>

								<!-- Cantidad a devolver -->
								<div v-if="selectedItems.includes(item.id)" class="mt-3 pt-3 border-t">
									<div class="flex items-center justify-between">
										<label class="text-sm font-medium">Cantidad a devolver:</label>
										<div class="flex items-center space-x-2">
											<UButton
												variant="outline"
												size="xs"
												:disabled="getReturnQuantity(item.id) <= 0"
												@click="updateReturnQuantity(item.id, getReturnQuantity(item.id) - 1)"
											>
												<UIcon name="i-heroicons-minus" />
											</UButton>
											<span class="text-sm font-medium w-8 text-center">
												{{ getReturnQuantity(item.id) }}
											</span>
											<UButton
												variant="outline"
												size="xs"
												:disabled="getReturnQuantity(item.id) >= item.quantity"
												@click="updateReturnQuantity(item.id, getReturnQuantity(item.id) + 1)"
											>
												<UIcon name="i-heroicons-plus" />
											</UButton>
										</div>
									</div>

									<!-- Motivo específico del item -->
									<div class="mt-2">
										<UInput
											:model-value="getItemReason(item.id)"
											placeholder="Motivo específico (opcional)"
											size="sm"
											@update:model-value="(value) => setItemReason(item.id, value)"
										/>
									</div>
								</div>
							</div>
						</div>
					</div>

					<!-- Resumen de la devolución -->
					<div v-if="selectedItems.length > 0" class="rounded-lg border p-4">
						<h4 class="font-medium mb-3">
							Resumen de la Devolución
						</h4>
						<div class="space-y-2 text-sm">
							<div class="flex justify-between">
								<span class="opacity-75">Items seleccionados:</span>
								<span>{{ selectedItems.length }}</span>
							</div>
							<div class="flex justify-between">
								<span class="opacity-75">Subtotal:</span>
								<span>{{ formatPrice(returnSubtotal, originalSale?.currency || 'BS') }}</span>
							</div>
							<div class="flex justify-between">
								<span class="opacity-75">Impuestos:</span>
								<span>{{ formatPrice(returnTax, originalSale?.currency || 'BS') }}</span>
							</div>
							<div class="flex justify-between text-lg font-bold border-t pt-2">
								<span>Total a devolver:</span>
								<span class="font-bold">{{ formatPrice(returnTotal, originalSale?.currency || 'BS') }}</span>
							</div>
						</div>
					</div>

					<!-- Notas adicionales -->
					<div>
						<UFormGroup label="Notas Adicionales" name="notes">
							<UTextarea
								v-model="form.notes"
								placeholder="Información adicional sobre la devolución..."
								:rows="3"
							/>
						</UFormGroup>
					</div>
				</div>

				<template #footer>
					<div class="flex justify-end gap-3">
						<UButton
							variant="outline"
							@click="closeModal"
						>
							Cancelar
						</UButton>
						<UButton
							:loading="isProcessing"
							:disabled="!canSubmit"
							color="primary"
							@click="handleSubmit"
						>
							{{ isEditMode ? 'Actualizar' : 'Crear Devolución' }}
						</UButton>
					</div>
				</template>
			</UCard>
		</template>
	</UModal>
</template>

<script setup lang="ts">
	import { computed, ref, watch } from "vue";
	import { useCurrency } from "~/composables/useCurrency";
	import { useNotifications } from "~/composables/useNotifications";
	import { useReturns } from "~/composables/useReturns";

	// Props
	interface Props {
		open?: boolean
		saleId?: string
		returnId?: string
	}

	const props = withDefaults(defineProps<Props>(), {
		open: false,
		saleId: undefined,
		returnId: undefined
	});

	// Emits
	const emit = defineEmits<{
		"update:open": [value: boolean]
		success: [returnId: string]
	}>();

	// Composables
	const { createReturn, getReturnWithDetails, getSaleItemsForReturn } = useReturns();
	const { formatCurrency } = useCurrency();
	const notifications = useNotifications();

	// Estado local
	const isProcessing = ref(false);
	const originalSale = ref<any>(null);
	const saleItems = ref<any[]>([]);
	const selectedItems = ref<string[]>([]);
	const returnQuantities = ref<Record<string, number>>({});
	const itemReasons = ref<Record<string, string>>({});
	const selectedReason = ref<{ label: string, value: string } | undefined>(undefined);

	// Formulario
	const form = ref({
		returnType: "partial" as "partial" | "total",
		reason: "",
		notes: ""
	});

	// Opciones
	const returnTypeOptions = [
		{ label: "Devolución Parcial", value: "partial" },
		{ label: "Devolución Total", value: "total" }
	];

	const reasonOptions = [
		{ label: "Producto defectuoso", value: "defective" },
		{ label: "Producto incorrecto", value: "wrong_item" },
		{ label: "Producto dañado en transporte", value: "damaged_shipping" },
		{ label: "Cliente cambió de opinión", value: "customer_change" },
		{ label: "Error en el pedido", value: "order_error" },
		{ label: "Producto vencido", value: "expired" },
		{ label: "Otro", value: "other" }
	];

	// Métodos
	const getReturnQuantity = (itemId: string) => {
		return returnQuantities.value[itemId] || 0;
	};

	const updateReturnQuantity = (itemId: string, quantity: number) => {
		const item = saleItems.value.find((i) => i.id === itemId);
		if (item && quantity >= 0 && quantity <= item.quantity) {
			returnQuantities.value[itemId] = quantity;
		}
	};

	const getItemReason = (itemId: string) => {
		return itemReasons.value[itemId] || "";
	};

	const setItemReason = (itemId: string, value: string) => {
		itemReasons.value[itemId] = value;
	};

	const resetForm = () => {
		form.value = {
			returnType: "partial",
			reason: "",
			notes: ""
		};
		selectedItems.value = [];
		returnQuantities.value = {};
		itemReasons.value = {};
		selectedReason.value = undefined;
		originalSale.value = null;
		saleItems.value = [];
	};

	const closeModal = () => {
		emit("update:open", false);
		resetForm();
	};

	// Computed
	const isEditMode = computed(() => !!props.returnId);
	const isOpen = computed({
		get: () => props.open,
		set: (value) => emit("update:open", value)
	});

	const canSubmit = computed(() => {
		if (!form.value.reason) return false;
		if (selectedItems.value.length === 0) return false;

		// Verificar que al menos un item tenga cantidad > 0
		return selectedItems.value.some((itemId) => getReturnQuantity(itemId) > 0);
	});

	const returnSubtotal = computed(() => {
		return selectedItems.value.reduce((total, itemId) => {
			const item = saleItems.value.find((i) => i.id === itemId);
			const quantity = getReturnQuantity(itemId);
			return total + (item ? item.price * quantity : 0);
		}, 0);
	});

	const returnTax = computed(() => {
		return returnSubtotal.value * 0.18; // IVA 16% + ISLR 2%
	});

	const returnTotal = computed(() => {
		return returnSubtotal.value + returnTax.value;
	});

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

	const toggleItemSelection = (itemId: string) => {
		const index = selectedItems.value.indexOf(itemId);
		if (index > -1) {
			selectedItems.value.splice(index, 1);
			delete returnQuantities.value[itemId];
			delete itemReasons.value[itemId];
		} else {
			selectedItems.value.push(itemId);
			returnQuantities.value[itemId] = 1; // Cantidad por defecto
			itemReasons.value[itemId] = "";
		}
	};

	const loadSaleData = async () => {
		if (!props.saleId) return;

		try {
			// Cargar items de la venta
			const items = await getSaleItemsForReturn(props.saleId);
			saleItems.value = items;

			// Si es devolución total, seleccionar todos los items
			if (form.value.returnType === "total") {
				selectedItems.value = items.map((item) => item.id);
				items.forEach((item) => {
					returnQuantities.value[item.id] = item.quantity;
					itemReasons.value[item.id] = "";
				});
			}
		} catch (error) {
			console.error("Error cargando datos de la venta:", error);
			notifications.error("Error", "No se pudieron cargar los datos de la venta");
		}
	};

	const loadReturnData = async () => {
		if (!props.returnId) return;

		try {
			const returnData = await getReturnWithDetails(props.returnId);
			if (returnData) {
				form.value.returnType = returnData.returnType as "partial" | "total";
				form.value.reason = returnData.reason;
				form.value.notes = returnData.notes || "";

				// Actualizar selectedReason
				selectedReason.value = reasonOptions.find((option) => option.value === returnData.reason);

				originalSale.value = returnData.originalSale;

				// Cargar items de la devolución
				selectedItems.value = returnData.items.map((item) => item.originalSaleItemId);
				returnData.items.forEach((item) => {
					returnQuantities.value[item.originalSaleItemId] = item.quantity;
					itemReasons.value[item.originalSaleItemId] = item.reason || "";
				});
			}
		} catch (error) {
			console.error("Error cargando datos de la devolución:", error);
			notifications.error("Error", "No se pudieron cargar los datos de la devolución");
		}
	};

	const handleSubmit = async () => {
		if (!canSubmit.value) return;

		isProcessing.value = true;

		try {
			if (isEditMode.value) {
				// TODO: Implementar edición de devoluciones
				notifications.info("Funcionalidad pendiente", "La edición de devoluciones estará disponible próximamente");
			} else {
				// Crear nueva devolución
				const returnItems = selectedItems.value
					.filter((itemId) => getReturnQuantity(itemId) > 0)
					.map((itemId) => {
						const item = saleItems.value.find((i) => i.id === itemId);
						return {
							originalSaleItemId: itemId,
							productId: item!.product_id,
							quantity: getReturnQuantity(itemId),
							originalQuantity: item!.quantity,
							price: item!.price,
							reason: getItemReason(itemId) || undefined
						};
					});

				const returnId = await createReturn({
					originalSaleId: props.saleId!,
					customerId: originalSale.value?.customerId,
					returnType: form.value.returnType,
					reason: form.value.reason,
					items: returnItems,
					notes: form.value.notes || undefined
				});

				emit("success", returnId);
				closeModal();
			}
		} catch (error) {
			console.error("Error procesando devolución:", error);
			notifications.error("Error", "No se pudo procesar la devolución");
		} finally {
			isProcessing.value = false;
		}
	};

	// Watchers
	watch(() => props.open, (isOpen) => {
		if (isOpen) {
			if (props.returnId) {
				loadReturnData();
			} else if (props.saleId) {
				loadSaleData();
			}
		} else {
			resetForm();
		}
	});

	watch(selectedReason, (newReason) => {
		if (newReason) {
			form.value.reason = newReason.value;
		}
	});

	watch(() => form.value.returnType, (newType) => {
		if (newType === "total" && saleItems.value.length > 0) {
			// Seleccionar todos los items para devolución total
			selectedItems.value = saleItems.value.map((item) => item.id);
			saleItems.value.forEach((item) => {
				returnQuantities.value[item.id] = item.quantity;
				itemReasons.value[item.id] = "";
			});
		} else if (newType === "partial") {
			// Limpiar selección para devolución parcial
			selectedItems.value = [];
			returnQuantities.value = {};
			itemReasons.value = {};
		}
	});
</script>
