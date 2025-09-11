<template>
	<div class="space-y-6">
		<!-- Información básica -->
		<div class="space-y-4">
			<h4 class="text-lg font-medium">Información de la Categoría</h4>
			
			<div class="space-y-4">
				<!-- Nombre -->
				<div>
					<UFormGroup label="Nombre de la categoría" required>
						<UInput
							v-model="form.name"
							placeholder="Ej: Bebidas, Alimentos, Electrónicos"
							:error="errors.name"
						/>
					</UFormGroup>
				</div>

				<!-- Descripción -->
				<div>
					<UFormGroup label="Descripción">
						<UTextarea
							v-model="form.description"
							placeholder="Descripción de la categoría..."
							:rows="3"
						/>
					</UFormGroup>
				</div>

				<!-- Estado -->
				<div>
					<UFormGroup label="Estado">
						<UToggle
							v-model="form.isActive"
							:label="form.isActive ? 'Activa' : 'Inactiva'"
						/>
						<p class="text-sm opacity-75 mt-1">
							Las categorías inactivas no aparecerán en el POS
						</p>
					</UFormGroup>
				</div>
			</div>
		</div>

		<!-- Vista previa -->
		<div v-if="form.name" class="space-y-4">
			<h4 class="text-lg font-medium">Vista Previa</h4>
			
			<div class="bg-gray-50 rounded-lg p-4">
				<div class="flex items-center space-x-3">
					<div class="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
						<UIcon name="i-heroicons-tag" class="w-5 h-5 text-primary" />
					</div>
					<div>
						<h5 class="font-medium">{{ form.name }}</h5>
						<p v-if="form.description" class="text-sm opacity-75">
							{{ form.description }}
						</p>
						<p v-else class="text-sm opacity-50">
							Sin descripción
						</p>
					</div>
					<div class="ml-auto">
						<UBadge
							:color="form.isActive ? 'green' : 'red'"
							size="sm"
						>
							{{ form.isActive ? 'Activa' : 'Inactiva' }}
						</UBadge>
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
				{{ category ? 'Actualizar' : 'Crear' }} Categoría
			</UButton>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";

// Props
interface Props {
	category?: any;
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
	isActive: true
});

const errors = ref<Record<string, string>>({});
const isSubmitting = ref(false);

// Inicializar formulario
const initializeForm = () => {
	if (props.category) {
		form.value = {
			name: props.category.name || "",
			description: props.category.description || "",
			isActive: props.category.isActive !== false
		};
	}
};

// Validar formulario
const validateForm = () => {
	errors.value = {};

	if (!form.value.name.trim()) {
		errors.value.name = "El nombre es requerido";
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
watch(() => props.category, initializeForm, { immediate: true });
</script>
