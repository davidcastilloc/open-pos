<template>
	<UModal
		v-model:open="isOpen"
		title="Abrir Sesión de Caja"
		description="Configura los balances iniciales para iniciar la jornada de ventas"
		size="lg"
	>
		<template #body>
			<div class="space-y-6">
				<!-- Información del cajero -->
				<div class="rounded-lg p-4 border">
					<h3 class="font-medium mb-2">
						Información del Cajero
					</h3>
					<div class="grid grid-cols-2 gap-4 text-sm">
						<div>
							<span class="opacity-75">Cajero:</span>
							<span class="font-medium ml-2">{{ cashierName }}</span>
						</div>
						<div>
							<span class="opacity-75">Fecha:</span>
							<span class="font-medium ml-2">{{ currentDate }}</span>
						</div>
					</div>
				</div>

				<!-- Balances iniciales -->
				<div>
					<h3 class="font-medium mb-4">
						Balances Iniciales por Moneda
					</h3>
					<div class="space-y-4">
						<div
							v-for="(balance, currency) in initialBalances"
							:key="currency"
							class="flex items-center justify-between p-3 border rounded-lg"
						>
							<div class="flex items-center space-x-3">
								<UIcon
									:name="getCurrencyIcon(currency)"
									class="w-5 h-5 opacity-50"
								/>
								<span class="font-medium">{{ getCurrencyName(currency) }}</span>
								<span class="text-sm opacity-50">({{ currency }})</span>
							</div>
							<div class="flex items-center space-x-2">
								<UInput
									v-model.number="initialBalances[currency]"
									type="number"
									step="0.01"
									min="0"
									placeholder="0.00"
									class="w-32"
									:disabled="isProcessing"
								/>
								<span class="text-sm opacity-50">{{ currency }}</span>
							</div>
						</div>
					</div>
				</div>

				<!-- Resumen -->
				<div class="rounded-lg p-4 border">
					<h4 class="font-medium mb-2">
						Resumen de Apertura
					</h4>
					<div class="space-y-1 text-sm">
						<div class="flex justify-between">
							<span class="opacity-75">Total de monedas:</span>
							<span class="font-medium">{{ Object.keys(initialBalances).length }}</span>
						</div>
						<div class="flex justify-between">
							<span class="opacity-75">Balance total estimado:</span>
							<span class="font-medium">{{ formatTotalBalance() }}</span>
						</div>
					</div>
				</div>

				<!-- Observaciones -->
				<div>
					<label class="block text-sm font-medium mb-2">
						Observaciones (opcional)
					</label>
					<UTextarea
						v-model="observations"
						placeholder="Notas sobre la apertura de caja..."
						:rows="3"
						:disabled="isProcessing"
					/>
				</div>
			</div>
		</template>

		<template #footer>
			<div class="flex space-x-3">
				<UButton
					variant="outline"
					class="flex-1"
					:disabled="isProcessing"
					@click="closeModal"
				>
					Cancelar
				</UButton>
				<UButton
					color="primary"
					class="flex-1"
					:loading="isProcessing"
					:disabled="!hasValidBalances"
					@click="handleOpenSession"
				>
					<UIcon name="i-heroicons-lock-open" />
					Abrir Caja
				</UButton>
			</div>
		</template>
	</UModal>
</template>

<script setup lang="ts">
	import { computed, ref, watch } from "vue";
	import { useAccounts } from "~/composables/useAccounts";
	import { useCashClosing } from "~/composables/useCashClosing";
	import { useCurrency } from "~/composables/useCurrency";

	// Props
	interface Props {
		open: boolean
	}

	const props = defineProps<Props>();

	// Emits
	const emit = defineEmits<{
		"update:open": [value: boolean]
		success: []
	}>();

	// Composables
	const { getTotalBalanceByCurrency } = useAccounts();
	const { openCashSession } = useCashClosing();
	const { formatCurrency } = useCurrency();

	// Estado local
	const isProcessing = ref(false);
	const observations = ref("");
	const initialBalances = ref<Record<string, number>>({});

	// Computed
	const isOpen = computed({
		get: () => props.open,
		set: (value) => emit("update:open", value)
	});

	const cashierName = computed(() => "Administrador"); // TODO: Obtener del usuario actual

	const currentDate = computed(() => {
		return new Date().toLocaleDateString("es-VE", {
			year: "numeric",
			month: "long",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit"
		});
	});

	const hasValidBalances = computed(() => {
		return Object.values(initialBalances.value).some((balance) => balance > 0);
	});

	// Métodos
	const getCurrencyIcon = (currency: string) => {
		const icons: Record<string, string> = {
			BS: "i-heroicons-banknotes",
			USD: "i-heroicons-currency-dollar",
			EUR: "i-heroicons-currency-euro"
		};
		return icons[currency] || "i-heroicons-currency-dollar";
	};

	const getCurrencyName = (currency: string) => {
		const names: Record<string, string> = {
			BS: "Bolívares",
			USD: "Dólares",
			EUR: "Euros"
		};
		return names[currency] || currency;
	};

	const formatTotalBalance = () => {
		const total = Object.entries(initialBalances.value)
			.reduce((sum, [, amount]) => sum + amount, 0);
		return formatCurrency(total, "BS"); // Mostrar en BS como referencia
	};

	const loadCurrentBalances = () => {
		// Cargar balances actuales como valores iniciales
		const currentBalances = getTotalBalanceByCurrency.value;
		initialBalances.value = { ...currentBalances };

		// Asegurar que al menos BS tenga un valor
		if (!initialBalances.value.BS) {
			initialBalances.value.BS = 0;
		}
	};

	const closeModal = () => {
		isOpen.value = false;
		observations.value = "";
		loadCurrentBalances();
	};

	const handleOpenSession = async () => {
		try {
			isProcessing.value = true;

			// Filtrar balances que tengan valores válidos
			const validBalances = Object.fromEntries(
				Object.entries(initialBalances.value)
					.filter(([_, amount]) => amount > 0)
			);

			// Abrir sesión de caja
			await openCashSession(validBalances);

			// Pequeño delay para asegurar que la base de datos se actualice
			await new Promise((resolve) => setTimeout(resolve, 100));

			// Emitir éxito
			emit("success");

			// Cerrar modal
			closeModal();
		} catch (error) {
			console.error("Error abriendo sesión de caja:", error);
		// TODO: Mostrar error al usuario
		} finally {
			isProcessing.value = false;
		}
	};

	// Watchers
	watch(() => props.open, (newValue) => {
		if (newValue) {
			loadCurrentBalances();
		}
	});
</script>
