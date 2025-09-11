import { computed, ref } from "vue";
import { z } from "zod";

// Schema para tasas de cambio
export const ExchangeRateSchema = z.object({
	id: z.string(),
	fromCurrency: z.enum(["BS", "USD", "EUR"]),
	toCurrency: z.enum(["BS", "USD", "EUR"]),
	rate: z.number().positive(),
	source: z.enum(["BCV", "DOLAR_TODAY", "MANUAL"]),
	date: z.string(),
	isValid: z.boolean().default(true),
	createdAt: z.string()
});

export type ExchangeRate = z.infer<typeof ExchangeRateSchema>;

// Tasas de cambio por defecto (fallback)
const defaultRates: Record<string, number> = {
	USD_BS: 36.5,
	EUR_BS: 40.2,
	EUR_USD: 1.1,
	BS_USD: 1 / 36.5,
	BS_EUR: 1 / 40.2,
	USD_EUR: 1 / 1.1
};

export function useCurrency() {
	const exchangeRates = ref<Record<string, ExchangeRate>>({});
	const isLoading = ref(false);
	const error = ref<string | null>(null);
	const lastUpdate = ref<Date | null>(null);

	// Obtener tasa de cambio
	const getExchangeRate = (from: string, to: string, date?: Date): number => {
		const key = `${from}_${to}`;

		// Si es la misma moneda, retornar 1
		if (from === to) return 1;

		// Buscar en las tasas cargadas
		const rate = exchangeRates.value[key];
		if (rate && rate.isValid) {
			return rate.rate;
		}

		// Fallback a tasas por defecto
		return defaultRates[key] || 1;
	};

	// Convertir cantidad entre monedas
	const convertAmount = (amount: number, from: string, to: string, date?: Date): number => {
		const rate = getExchangeRate(from, to, date);
		return amount * rate;
	};

	// Formatear moneda
	const formatCurrency = (amount: number, currency: string): string => {
		const formatters: Record<string, Intl.NumberFormat> = {
			BS: new Intl.NumberFormat("es-VE", {
				style: "currency",
				currency: "VES",
				minimumFractionDigits: 2,
				maximumFractionDigits: 2
			}),
			USD: new Intl.NumberFormat("en-US", {
				style: "currency",
				currency: "USD",
				minimumFractionDigits: 2,
				maximumFractionDigits: 2
			}),
			EUR: new Intl.NumberFormat("de-DE", {
				style: "currency",
				currency: "EUR",
				minimumFractionDigits: 2,
				maximumFractionDigits: 2
			})
		};

		const formatter = formatters[currency];
		if (formatter) {
			return formatter.format(amount);
		}

		// Fallback simple
		const symbols: Record<string, string> = {
			BS: "Bs",
			USD: "$",
			EUR: "€"
		};

		return `${symbols[currency] || currency} ${amount.toFixed(2)}`;
	};

	// Obtener tasas actuales desde APIs
	const fetchCurrentRates = async () => {
		isLoading.value = true;
		error.value = null;

		try {
			// Por ahora usamos tasas por defecto
			// En el futuro esto vendrá de las APIs del BCV y DolarToday
			const rates: ExchangeRate[] = [
				{
					id: "1",
					fromCurrency: "USD",
					toCurrency: "BS",
					rate: 36.5,
					source: "BCV",
					date: new Date().toISOString().split("T")[0],
					isValid: true,
					createdAt: new Date().toISOString()
				},
				{
					id: "2",
					fromCurrency: "EUR",
					toCurrency: "BS",
					rate: 40.2,
					source: "BCV",
					date: new Date().toISOString().split("T")[0],
					isValid: true,
					createdAt: new Date().toISOString()
				},
				{
					id: "3",
					fromCurrency: "EUR",
					toCurrency: "USD",
					rate: 1.1,
					source: "BCV",
					date: new Date().toISOString().split("T")[0],
					isValid: true,
					createdAt: new Date().toISOString()
				}
			];

			// Actualizar tasas
			rates.forEach((rate) => {
				const key = `${rate.fromCurrency}_${rate.toCurrency}`;
				exchangeRates.value[key] = rate;
			});

			lastUpdate.value = new Date();
		} catch (err) {
			error.value = "Error al obtener tasas de cambio";
			console.error("Error fetching exchange rates:", err);
		} finally {
			isLoading.value = false;
		}
	};

	// Obtener tasas desde BCV
	const fetchBCVRates = async () => {
		try {
			// TODO: Implementar llamada real a la API del BCV
			console.log("Fetching BCV rates...");
		} catch (err) {
			console.error("Error fetching BCV rates:", err);
		}
	};

	// Obtener tasas desde DolarToday
	const fetchDolarTodayRates = async () => {
		try {
			// TODO: Implementar llamada real a la API de DolarToday
			console.log("Fetching DolarToday rates...");
		} catch (err) {
			console.error("Error fetching DolarToday rates:", err);
		}
	};

	// Actualizar tasas manualmente
	const updateManualRate = (from: string, to: string, rate: number) => {
		const key = `${from}_${to}`;
		exchangeRates.value[key] = {
			id: `manual_${key}`,
			fromCurrency: from as any,
			toCurrency: to as any,
			rate,
			source: "MANUAL",
			date: new Date().toISOString().split("T")[0],
			isValid: true,
			createdAt: new Date().toISOString()
		};
	};

	// Obtener historial de tasas
	const getRateHistory = (from: string, to: string, days: number = 30) => {
		// TODO: Implementar obtención de historial desde la base de datos
		return [];
	};

	// Computed para tasas actuales
	const currentRates = computed(() => {
		return Object.values(exchangeRates.value).filter((rate) => rate.isValid);
	});

	// Computed para última actualización
	const lastUpdateFormatted = computed(() => {
		if (!lastUpdate.value) return "Nunca";
		return lastUpdate.value.toLocaleString("es-VE");
	});

	return {
		exchangeRates: readonly(exchangeRates),
		isLoading: readonly(isLoading),
		error: readonly(error),
		lastUpdate: readonly(lastUpdate),
		currentRates,
		lastUpdateFormatted,
		getExchangeRate,
		convertAmount,
		formatCurrency,
		fetchCurrentRates,
		fetchBCVRates,
		fetchDolarTodayRates,
		updateManualRate,
		getRateHistory
	};
}
