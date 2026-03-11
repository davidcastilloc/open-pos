<template>
	<div class="space-y-3">
		<label class="block text-sm font-medium">Logo del Negocio</label>

		<div class="flex items-center gap-4">
			<!-- Preview del logo actual -->
			<div
				v-if="logoUrl"
				class="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center"
			>
				<img :src="logoUrl" alt="Logo del negocio" class="w-full h-full object-contain">
			</div>
			<div v-else class="w-20 h-20 rounded-lg bg-gray-100 flex items-center justify-center">
				<span class="text-gray-400 text-2xl">🏢</span>
			</div>

			<!-- Botón y estadísticas -->
			<div class="flex-1">
				<UButton
					type="button"
					variant="outline"
					:disabled="isUploading"
					:loading="isUploading"
					@click="triggerFileInput"
				>
					{{ logoUrl ? "Cambiar logo" : "Subir logo" }}
				</UButton>
				<p class="text-xs text-gray-500 mt-1">
					PNG, JPG hasta 5MB
				</p>
			</div>
		</div>

		<!-- Input oculto -->
		<input
			ref="fileInput"
			type="file"
			accept="image/png,image/jpeg,image/jpg"
			class="hidden"
			@change="handleFileSelect"
		>
	</div>
</template>

<script setup lang="ts">
	import { computed, ref } from "vue";
	import { useBusiness } from "~/composables/useBusiness";

	const { uploadLogo, getLogoUrl } = useBusiness();

	const fileInput = ref<HTMLInputElement | null>(null);
	const isUploading = ref(false);
	const errorMessage = ref<string | null>(null);

	const logoUrl = computed(() => getLogoUrl.value);

	const triggerFileInput = () => {
		fileInput.value?.click();
	};

	const handleFileSelect = async (event: Event) => {
		const input = event.target as HTMLInputElement;
		const file = input.files?.[0];

		if (!file) return;

		// Validar tipo de archivo
		const validTypes = ["image/png", "image/jpeg", "image/jpg"];
		if (!validTypes.includes(file.type)) {
			errorMessage.value = "Solo se permiten imágenes PNG o JPG";
			return;
		}

		// Validar tamaño (máx 5MB)
		if (file.size > 5 * 1024 * 1024) {
			errorMessage.value = "La imagen no debe superar los 5MB";
			return;
		}

		isUploading.value = true;
		errorMessage.value = null;

		try {
			const tempUrl = URL.createObjectURL(file);
			await uploadLogo(tempUrl);
			URL.revokeObjectURL(tempUrl);
		} catch (err) {
			console.error("Error uploading logo:", err);
		} finally {
			isUploading.value = false;
			input.value = ""; // Reset input
		}
	};
</script>
