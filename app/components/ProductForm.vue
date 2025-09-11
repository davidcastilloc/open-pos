<template>
	<div class="space-y-6">
		<!-- Información básica -->
		<div class="space-y-4">
			<h4 class="text-lg font-medium">Información Básica</h4>
			
			<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
				<!-- Nombre -->
				<div class="md:col-span-2">
					<UFormGroup label="Nombre del producto" required>
						<UInput
							v-model="form.name"
							placeholder="Ej: Coca Cola 350ml"
							:error="errors.name"
						/>
					</UFormGroup>
				</div>

				<!-- SKU -->
				<div>
					<UFormGroup label="SKU" required>
						<UInput
							v-model="form.sku"
							placeholder="Ej: COCA-350"
							:error="errors.sku"
						/>
					</UFormGroup>
				</div>

				<!-- Código de barras -->
				<div>
					<UFormGroup label="Código de barras">
						<UInput
							v-model="form.barcode"
							placeholder="Ej: 1234567890123"
						/>
					</UFormGroup>
				</div>

				<!-- Categoría -->
				<div>
					<UFormGroup label="Categoría">
						<USelectMenu
							v-model="form.categoryId"
							:items="categoryOptions"
							placeholder="Seleccionar categoría"
						/>
					</UFormGroup>
				</div>

				<!-- Estado -->
				<div>
					<UFormGroup label="Estado">
						<UToggle
							v-model="form.isActive"
							:label="form.isActive ? 'Activo' : 'Inactivo'"
						/>
					</UFormGroup>
				</div>

				<!-- Descripción -->
				<div class="md:col-span-2">
					<UFormGroup label="Descripción">
						<UTextarea
							v-model="form.description"
							placeholder="Descripción del producto..."
							:rows="3"
						/>
					</UFormGroup>
				</div>
			</div>
		</div>

		<!-- Precios y costos -->
		<div class="space-y-4">
			<h4 class="text-lg font-medium">Precios y Costos</h4>
			
			<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
				<!-- Precio de venta -->
				<div>
					<UFormGroup label="Precio de venta" required>
						<UInput
							v-model.number="form.price"
							type="number"
							step="0.01"
							min="0"
							placeholder="0.00"
							:error="errors.price"
						>
							<template #trailing>
								<span class="text-sm opacity-75">BS</span>
							</template>
						</UInput>
					</UFormGroup>
				</div>

				<!-- Costo -->
				<div>
					<UFormGroup label="Costo">
						<UInput
							v-model.number="form.cost"
							type="number"
							step="0.01"
							min="0"
							placeholder="0.00"
						>
							<template #trailing>
								<span class="text-sm opacity-75">BS</span>
							</template>
						</UInput>
					</UFormGroup>
				</div>
			</div>

			<!-- Margen de ganancia -->
			<div v-if="form.price && form.cost" class="bg-gray-50 rounded-lg p-4">
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
			<h4 class="text-lg font-medium">Inventario</h4>
			
			<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
				<!-- Stock actual -->
				<div>
					<UFormGroup label="Stock actual" required>
						<UInput
							v-model.number="form.stock"
							type="number"
							min="0"
							placeholder="0"
							:error="errors.stock"
						/>
					</UFormGroup>
				</div>

				<!-- Stock mínimo -->
				<div>
					<UFormGroup label="Stock mínimo">
						<UInput
							v-model.number="form.minStock"
							type="number"
							min="0"
							placeholder="0"
						/>
					</UFormGroup>
				</div>
			</div>

			<!-- Estado del stock -->
			<div v-if="form.stock !== undefined && form.minStock !== undefined" class="bg-gray-50 rounded-lg p-4">
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
			<h4 class="text-lg font-medium">Imágenes</h4>
			
			<div class="space-y-4">
				<!-- Subir imagen -->
				<div class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
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
					/>
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
						/>
						<UButton
							variant="ghost"
							size="xs"
							color="red"
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
				@click="$emit('cancel')"
			>
				Cancelar
			</UButton>
			<UButton
				color="primary"
				:loading="isSubmitting"
				@click="handleSubmit"
			>
				{{ product ? 'Actualizar' : 'Crear' }} Producto
			</UButton>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";

// Props
interface Props {
	product?: any;
	categories: Array<{ id: string; name: string }>;
}

const props = defineProps<Props>();

// Emits
const emit = defineEmits<{
	submit: [data: any];
	cancel: [];
}>();

// Estado local
const form = ref({
	name: "",
	description: "",
	sku: "",
	barcode: "",
	price: 0,
	cost: 0,
	categoryId: "",
	stock: 0,
	minStock: 0,
	images: [] as string[],
	isActive: true
});

const errors = ref<Record<string, string>>({});
const isSubmitting = ref(false);
const fileInput = ref<HTMLInputElement>();

// Opciones de categorías
const categoryOptions = computed(() => [
	{ label: "Sin categoría", value: "" },
	...props.categories.map((cat) => ({ label: cat.name, value: cat.id }))
]);

// Inicializar formulario
const initializeForm = () => {
	if (props.product) {
		form.value = {
			name: props.product.name || "",
			description: props.product.description || "",
			sku: props.product.sku || "",
			barcode: props.product.barcode || "",
			price: props.product.price || 0,
			cost: props.product.cost || 0,
			categoryId: props.product.categoryId || "",
			stock: props.product.stock || 0,
			minStock: props.product.minStock || 0,
			images: props.product.images || [],
			isActive: props.product.isActive !== false
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
	if (stock === 0) return "red";
	if (stock <= minStock) return "orange";
	return "green";
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

// Validar formulario
const validateForm = () => {
	errors.value = {};

	if (!form.value.name.trim()) {
		errors.value.name = "El nombre es requerido";
	}

	if (!form.value.sku.trim()) {
		errors.value.sku = "El SKU es requerido";
	}

	if (!form.value.price || form.value.price <= 0) {
		errors.value.price = "El precio debe ser mayor a 0";
	}

	if (form.value.stock < 0) {
		errors.value.stock = "El stock no puede ser negativo";
	}

	return Object.keys(errors.value).length === 0;
};

// Manejar envío
const handleSubmit = async () => {
	if (!validateForm()) {
		return;
	}

	isSubmitting.value = true;
	try {
		emit("submit", { ...form.value });
	} catch (error) {
		console.error("Error submitting form:", error);
	} finally {
		isSubmitting.value = false;
	}
};

// Watchers
watch(() => props.product, initializeForm, { immediate: true });
</script>
