<template>
	<UForm :schema="categorySchema" :state="form" class="space-y-6" @submit="handleSubmit">
		<!-- Información básica -->
		<div class="space-y-4">
			<h4 class="text-lg font-medium">
				Información de la Categoría
			</h4>

			<div class="space-y-4">
				<!-- Nombre -->
				<div>
					<UFormField label="Nombre de la categoría" name="name" required>
						<UInput
							v-model="form.name"
							placeholder="Ej: Bebidas, Alimentos, Electrónicos"
						/>
					</UFormField>
				</div>

				<!-- Descripción -->
				<div>
					<UFormField label="Descripción" name="description">
						<UTextarea
							v-model="form.description"
							placeholder="Descripción de la categoría..."
							:rows="3"
						/>
					</UFormField>
				</div>

				<!-- Estado -->
				<div>
					<UFormField label="Estado" name="isActive">
						<UCheckbox
							v-model="form.isActive"
							:label="form.isActive ? 'Activa' : 'Inactiva'"
						/>
						<template #help>
							Las categorías inactivas no aparecerán en el POS
						</template>
					</UFormField>
				</div>
			</div>
		</div>

		<!-- Vista previa -->
		<div v-if="form.name" class="space-y-4">
			<h4 class="text-lg font-medium">
				Vista Previa
			</h4>

			<div class="rounded-lg p-4 border">
				<div class="flex items-center space-x-3">
					<div class="w-10 h-10 rounded-lg border flex items-center justify-center">
						<UIcon name="i-heroicons-tag" class="w-5 h-5 opacity-50" />
					</div>
					<div>
						<h5 class="font-medium">
							{{ form.name }}
						</h5>
						<p v-if="form.description" class="text-sm opacity-75">
							{{ form.description }}
						</p>
						<p v-else class="text-sm opacity-50">
							Sin descripción
						</p>
					</div>
					<div class="ml-auto">
						<UBadge
							:color="form.isActive ? 'success' : 'error'"
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
				@click="emit('cancel')"
			>
				Cancelar
			</UButton>
			<UButton
				type="submit"
				color="primary"
				:loading="isSubmitting"
			>
				{{ category ? 'Actualizar' : 'Crear' }} Categoría
			</UButton>
		</div>
	</UForm>
</template>

<script setup lang="ts">
	import type { Category } from "~/schemas/category";

	import { ref, watch } from "vue";
	import { categorySchema } from "~/schemas/category";

	// Props
	interface Props {
		category?: any
	}

	const props = defineProps<Props>();

	// Emits
	const emit = defineEmits<{
		submit: [data: Category]
		cancel: []
	}>();

	// Estado local
	const form = ref({
		name: "",
		description: "",
		isActive: true
	});

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

	// Función de validación adicional (opcional - la validación principal se hace con el schema)
	const _validate = (state: any) => {
		const errors = [];

		// Validación adicional: verificar que el nombre no sea solo espacios
		if (state.name && state.name.trim() !== state.name) {
			errors.push({
				name: "name",
				message: "El nombre no puede comenzar o terminar con espacios"
			});
		}

		return errors;
	};

	// Manejar envío
	const handleSubmit = async (event: any) => {
		isSubmitting.value = true;
		try {
			// Los datos ya están validados por el schema
			const formData = event.data || form.value;
			emit("submit", formData as Category);
		} catch (error) {
			console.error("Error submitting form:", error);
		} finally {
			isSubmitting.value = false;
		}
	};

	// Watchers
	watch(() => props.category, initializeForm, { immediate: true });
</script>
