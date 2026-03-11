<template>
	<div class="space-y-6">
		<div class="flex items-center justify-between">
			<div>
				<h1 class="text-2xl font-bold">
					Configuración del Negocio
				</h1>
				<p class="text-gray-500">
					Administra la información de tu negocio
				</p>
			</div>
		</div>

		<UAlert
			v-if="showSuccess"
			color="success"
			icon="i-heroicons-check-circle"
			title="¡Guardado!"
			description="Los datos del negocio se han actualizado correctamente."
			class="mb-4"
		/>

		<UAlert
			v-if="error"
			color="error"
			icon="i-heroicons-exclamation-circle"
			title="Error"
			:description="error"
			class="mb-4"
		/>

		<UCard class="max-w-2xl">
			<template #header>
				<div class="flex items-center gap-2">
					<span class="text-xl">🏢</span>
					<h2 class="text-lg font-semibold">
						Datos del Negocio
					</h2>
				</div>
			</template>

			<BusinessForm
				@submit="handleSubmit"
			/>
		</UCard>

		<div class="text-sm text-gray-500">
			<p>
				<strong>RIF formato:</strong> J-12345678 (J, V o E seguido de 8 dígitos)
			</p>
		</div>
	</div>
</template>

<script setup lang="ts">
	import { onMounted, ref } from "vue";
	import BusinessForm from "~/components/settings/BusinessForm.vue";
	import { useBusiness } from "~/composables/useBusiness";

	const { loadBusiness, error } = useBusiness();

	const showSuccess = ref(false);

	onMounted(async () => {
		await loadBusiness();
	});

	const handleSubmit = () => {
		showSuccess.value = true;
		setTimeout(() => {
			showSuccess.value = false;
		}, 3000);
	};
</script>
