<template>
	<UForm
		:schema="BusinessSchema"
		:state="state"
		class="space-y-4"
		@submit.prevent="handleSubmit"
	>
		<UFormGroup label="Nombre del Negocio" name="name" required>
			<UInput
				v-model="state.name"
				placeholder="Ej: Tienda Mi Negocio"
				:disabled="isLoading"
			/>
		</UFormGroup>

		<UFormGroup label="Dirección" name="address">
			<UTextarea
				v-model="state.address"
				placeholder="Dirección completa del negocio"
				:disabled="isLoading"
				:rows="2"
			/>
		</UFormGroup>

		<UFormGroup
			label="RIF"
			name="rif"
			:hint="rifFeedback.valid ? 'Formato: J-12345678' : rifFeedback.message"
			:error="!rifFeedback.valid"
		>
			<UInput
				v-model="state.rif"
				placeholder="J-12345678"
				:disabled="isLoading"
				@change="onRifChange"
			/>
		</UFormGroup>

		<UFormGroup label="Teléfono" name="phone">
			<UInput
				v-model="state.phone"
				placeholder="0212-555-1234"
				:disabled="isLoading"
			/>
		</UFormGroup>

		<LogoUpload />

		<div class="flex gap-3 pt-4">
			<UButton
				type="submit"
				color="primary"
				:disabled="!isValid() || isLoading"
				:loading="isLoading"
			>
				Guardar
			</UButton>
			<UButton type="button" variant="outline" @click="loadBusinessData">
				Cancelar
			</UButton>
		</div>

		<UAlert
			v-if="error"
			color="error"
			icon="i-heroicons-exclamation-circle"
			title="Error"
			:description="error"
		/>
	</UForm>
</template>

<script setup lang="ts">
	import type { BusinessData } from "~/composables/useBusiness";
	import { onMounted, ref } from "vue";
	import LogoUpload from "~/components/settings/LogoUpload.vue";
	import { BusinessSchema, useBusiness } from "~/composables/useBusiness";

	const emit = defineEmits<{
		(e: "update:modelValue", value: BusinessData): void
		(e: "submit", value: BusinessData): void
	}>();

	const { businessData, updateBusiness, validateRIFWithFeedback, isLoading, error } = useBusiness();

	const state = ref<BusinessData>({
		name: "",
		address: "",
		rif: "",
		phone: "",
		logoPath: ""
	});

	const rifFeedback = ref<{ valid: boolean, message: string }>({ valid: true, message: "" });

	// Cargar datos existentes al montar
	onMounted(async () => {
		await loadBusinessData();
	});

	async function loadBusinessData() {
		try {
			await updateBusiness(businessData.value);
			state.value = { ...businessData.value };
		} catch (err) {
			console.error("Error loading business data:", err);
		}
	}

	// Validar RIF en tiempo real
	const onRifChange = () => {
		rifFeedback.value = validateRIFWithFeedback(state.value.rif || "");
	};

	// Enviar formulario
	const handleSubmit = async () => {
		try {
			await updateBusiness(state.value);
			emit("update:modelValue", state.value);
			emit("submit", state.value);
		} catch (err) {
			console.error("Error saving business data:", err);
		}
	};

	// Validar formulario completo
	const isValid = () => {
		return state.value.name.length > 0 && rifFeedback.value.valid;
	};
</script>
