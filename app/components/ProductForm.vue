<template>
	<UForm :schema="productSchema" :state="form" class="space-y-6" @submit="handleSubmit">
		<!-- Información básica -->
		<div class="space-y-4">
			<h4 class="text-lg font-medium">
				Información Básica
			</h4>

			<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
				<!-- Nombre -->
				<div class="md:col-span-2">
					<UFormField label="Nombre del producto" name="name" required>
						<UInput
							v-model="form.name"
							placeholder="Ej: Coca Cola 350ml"
						/>
					</UFormField>
				</div>

				<!-- SKU -->
				<div>
					<UFormField label="SKU" name="sku" required>
						<div class="flex space-x-2">
							<UInput
								v-model="form.sku"
								placeholder="Ej: COCA-350"
								class="flex-1"
							/>
							<UButton
								variant="outline"
								size="sm"
								title="Generar SKU automáticamente"
								@click="generateSku"
							>
								<UIcon name="i-heroicons-sparkles" />
							</UButton>
						</div>
					</UFormField>
				</div>

				<!-- Código de barras -->
				<div>
					<UFormField label="Código de barras" name="barcode">
						<UInput
							v-model="form.barcode"
							placeholder="Ej: 1234567890123"
						/>
					</UFormField>
				</div>

				<!-- Categoría -->
				<div>
					<UFormField label="Categoría" name="categoryId" required>
						<USelectMenu
							v-model="form.categoryId"
							:items="categoryOptions"
							placeholder="Seleccionar categoría *"
							value-key="value"
							label-key="label"
							:searchable="false"
						/>
					</UFormField>
				</div>

				<!-- Estado -->
				<div>
					<UFormField label="Estado" name="isActive">
						<UCheckbox
							v-model="form.isActive"
							:label="form.isActive ? 'Activo' : 'Inactivo'"
						/>
					</UFormField>
				</div>

				<!-- Descripción -->
				<div class="md:col-span-2">
					<UFormField label="Descripción" name="description">
						<UTextarea
							v-model="form.description"
							placeholder="Descripción del producto..."
							:rows="3"
						/>
					</UFormField>
				</div>
			</div>
		</div>

		<!-- Precios y costos -->
		<div class="space-y-4">
			<h4 class="text-lg font-medium">
				Precios y Costos
			</h4>

			<!-- Moneda -->
			<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
				<div>
					<UFormField label="Moneda" name="currency" required>
						<USelectMenu
							v-model="form.currency"
							:items="currencyOptions"
							placeholder="Seleccionar moneda"
							value-key="value"
							label-key="label"
						/>
					</UFormField>
				</div>
			</div>

			<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
				<!-- Precio de venta -->
				<div>
					<UFormField label="Precio de venta" name="price" required>
						<UInput
							v-model.number="form.price"
							type="number"
							step="0.01"
							min="0"
							placeholder="0.00"
						>
							<template #trailing>
								<span class="text-sm opacity-75">{{ form.currency }}</span>
							</template>
						</UInput>
					</UFormField>
				</div>

				<!-- Costo -->
				<div>
					<UFormField label="Costo" name="cost">
						<UInput
							v-model.number="form.cost"
							type="number"
							step="0.01"
							min="0"
							placeholder="0.00"
						>
							<template #trailing>
								<span class="text-sm opacity-75">{{ form.currency }}</span>
							</template>
						</UInput>
					</UFormField>
				</div>
			</div>

			<!-- Margen de ganancia -->
			<div v-if="form.price && form.cost" class="rounded-lg p-4 border">
				<div class="flex items-center justify-between">
					<span class="text-sm font-medium">Margen de ganancia:</span>
					<span class="text-sm font-semibold">
						{{ calculateMargin() }}%
					</span>
				</div>
			</div>
		</div>

		<!-- Inventario -->
		<div class="space-y-4">
			<h4 class="text-lg font-medium">
				Inventario
			</h4>

			<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
				<!-- Stock actual -->
				<div>
					<UFormField label="Stock actual" name="stock" required>
						<UInput
							v-model.number="form.stock"
							type="number"
							min="0"
							placeholder="0"
						/>
					</UFormField>
				</div>

				<!-- Stock mínimo -->
				<div>
					<UFormField label="Stock mínimo" name="minStock">
						<UInput
							v-model.number="form.minStock"
							type="number"
							min="0"
							placeholder="0"
						/>
					</UFormField>
				</div>
			</div>

			<!-- Estado del stock -->
			<div v-if="form.stock !== undefined && form.minStock !== undefined" class="rounded-lg p-4 border">
				<div class="flex items-center justify-between">
					<span class="text-sm font-medium">Estado del stock:</span>
					<UBadge
						:color="getStockColor(form.stock, form.minStock)"
						size="sm"
					>
						{{ getStockStatus(form.stock, form.minStock) }}
					</UBadge>
				</div>
			</div>
		</div>

		<!-- Imágenes -->
		<div class="space-y-4">
			<h4 class="text-lg font-medium">
				Imágenes
			</h4>

			<div class="space-y-4">
				<!-- Subir imagen -->
				<div class="border-2 border-dashed rounded-lg p-6 text-center">
					<UIcon name="i-heroicons-photo" class="w-12 h-12 mx-auto mb-4 opacity-50" />
					<p class="text-sm opacity-75 mb-4">
						Arrastra y suelta imágenes aquí o haz clic para seleccionar
					</p>
					<UButton variant="outline" @click="selectImages">
						<UIcon name="i-heroicons-camera" />
						Seleccionar imágenes
					</UButton>
					<input
						ref="fileInput"
						type="file"
						multiple
						accept="image/*"
						class="hidden"
						@change="handleImageUpload"
					>
				</div>

				<!-- Vista previa de imágenes -->
				<div v-if="form.images && form.images.length > 0" class="grid grid-cols-2 md:grid-cols-4 gap-4">
					<div
						v-for="(image, index) in form.images"
						:key="index"
						class="relative group"
					>
						<img
							:src="image"
							:alt="`Imagen ${index + 1}`"
							class="w-full h-24 object-cover rounded-lg border"
						>
						<UButton
							variant="ghost"
							size="xs"
							color="error"
							class="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
							@click="removeImage(index)"
						>
							<UIcon name="i-heroicons-x-mark" />
						</UButton>
					</div>
				</div>
			</div>
		</div>

		<!-- Botones de acción -->
		<div class="flex justify-end space-x-3 pt-6 border-t">
			<UButton
				variant="outline"
				@click="emit('cancel')"
			>
				Cancelar
			</UButton>
			<UButton
				type="submit"
				color="primary"
				:loading="isSubmitting"
			>
				{{ product ? 'Actualizar' : 'Crear' }} Producto
			</UButton>
		</div>
	</UForm>
</template>

<script setup lang="ts">
	import type { Product } from "~/schemas/product";

	import { computed, ref, watch } from "vue";
	import { productSchema } from "~/schemas/product";

	// Props
	interface Props {
		product?: any
		categories?: ReadonlyArray<{ id: string, name: string }>
		initialData?: any
		isQuickCreate?: boolean
	}

	const props = withDefaults(defineProps<Props>(), {
		categories: () => [],
		isQuickCreate: false
	});

	// Emits
	const emit = defineEmits<{
		submit: [data: Product]
		cancel: []
	}>();

	// Estado local
	const form = ref({
		name: "",
		description: "",
		sku: "",
		barcode: "",
		price: 0,
		cost: 0,
		currency: "BS" as const, // Moneda por defecto
		categoryId: "",
		stock: 0,
		minStock: 0,
		images: [] as string[],
		isActive: true
	});

	const isSubmitting = ref(false);
	const fileInput = ref<HTMLInputElement>();

	// Opciones de categorías
	const categoryOptions = computed(() => props.categories
		.filter((cat) => cat.id && cat.id.trim() !== "" && cat.name && cat.name.trim() !== "")
		.map((cat) => ({ label: cat.name, value: cat.id }))
	);

	// Opciones de monedas
	const currencyOptions = [
		{ label: "Bolívares (BS)", value: "BS" },
		{ label: "Dólares (USD)", value: "USD" },
		{ label: "Euros (EUR)", value: "EUR" }
	];

	// Inicializar formulario
	const initializeForm = () => {
		const sourceData = props.product || props.initialData;

		if (sourceData) {
			// Asegurar que currency sea un string
			let currency = sourceData.currency || "BS";
			if (typeof currency === "object" && currency?.value) {
				currency = currency.value;
			}

			form.value = {
				name: sourceData.name || "",
				description: sourceData.description || "",
				sku: sourceData.sku || "",
				barcode: sourceData.barcode || "",
				price: Number(sourceData.price) || 0,
				cost: Number(sourceData.cost) || 0,
				currency,
				categoryId: sourceData.categoryId || "",
				stock: Number(sourceData.stock) || 0,
				minStock: Number(sourceData.minStock) || 0,
				images: sourceData.images || [],
				isActive: sourceData.isActive !== false
			};
		}
	};

	// Calcular margen de ganancia
	const calculateMargin = () => {
		if (!form.value.price || !form.value.cost) return 0;
		const margin = ((form.value.price - form.value.cost) / form.value.price) * 100;
		return margin.toFixed(1);
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
		if (stock <= minStock) return "Stock bajo";
		return "Stock normal";
	};

	// Seleccionar imágenes
	const selectImages = () => {
		fileInput.value?.click();
	};

	// Manejar subida de imágenes
	const handleImageUpload = (event: Event) => {
		const target = event.target as HTMLInputElement;
		const files = target.files;

		if (files) {
			Array.from(files).forEach((file) => {
				if (file.type.startsWith("image/")) {
					const reader = new FileReader();
					reader.onload = (e) => {
						const result = e.target?.result as string;
						if (result) {
							form.value.images.push(result);
						}
					};
					reader.readAsDataURL(file);
				}
			});
		}

		// Limpiar input
		target.value = "";
	};

	// Remover imagen
	const removeImage = (index: number) => {
		form.value.images.splice(index, 1);
	};

	// Generar SKU automáticamente
	const generateSku = () => {
		if (!form.value.name) return;

		// Tomar las primeras letras de cada palabra del nombre
		const words = form.value.name.toUpperCase().split(" ").filter((word) => word.length > 0);
		let sku = "";

		// Tomar hasta 3 palabras para el SKU
		for (let i = 0; i < Math.min(3, words.length); i++) {
			const word = words[i];
			if (word) {
				sku += word.substring(0, 3);
			}
		}

		// Agregar un número aleatorio de 3 dígitos
		sku += `-${Math.floor(Math.random() * 900 + 100)}`;

		form.value.sku = sku;
	};

	// Función de validación adicional (opcional - la validación principal se hace con el schema)
	const validateForm = (state: any) => {
		const errors: any = {};

		// Validación adicional: verificar que el precio sea mayor que el costo si ambos están presentes
		if (state.price && state.cost && state.price < state.cost) {
			errors.price = ["El precio de venta debe ser mayor que el costo"];
		}

		// Validación adicional: verificar que el stock mínimo no sea mayor que el stock actual
		if (state.stock !== undefined && state.minStock !== undefined && state.minStock > state.stock) {
			errors.minStock = ["El stock mínimo no puede ser mayor que el stock actual"];
		}

		// Validación adicional: verificar que el SKU sea único (esto se podría hacer con una consulta a la BD)
		if (state.sku && state.sku.length < 3) {
			errors.sku = ["El SKU debe tener al menos 3 caracteres"];
		}

		return errors;
	};

	// Manejar envío
	const handleSubmit = async (event: any) => {
		isSubmitting.value = true;
		try {
			// Los datos ya están validados por el schema
			const formData = event.data || form.value;

			// Validaciones adicionales
			const additionalErrors = validateForm(formData);
			if (Object.keys(additionalErrors).length > 0) {
				console.error("Errores de validación:", additionalErrors);
				// Aquí podrías mostrar los errores al usuario
				return;
			}

			emit("submit", formData as Product);
		} catch (error) {
			console.error("Error submitting form:", error);
		} finally {
			isSubmitting.value = false;
		}
	};

	// Watchers
	watch(() => [props.product, props.initialData], initializeForm, { immediate: true });

	// Watcher para asegurar que currency sea siempre un string
	watch(() => form.value.currency, (newCurrency: any) => {
		if (typeof newCurrency === "object" && newCurrency?.value) {
			form.value.currency = newCurrency.value;
		}
	});
</script>
