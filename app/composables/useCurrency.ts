import { computed, readonly, ref } from "vue";
import { z } from "zod";
import { useDatabase } from "./useDatabase";

// Schema para tasas de cambio
export const ExchangeRateSchema = z.object({
	id: z.string(),
	fromCurrency: z.enum(["BS", "USD", "EUR"]),
	toCurrency: z.enum(["BS", "USD", "EUR"]),
	rate: z.number().positive(),
	source: z.enum(["BCV", "DOLAR_TODAY", "MANUAL", "FALLBACK"]),
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
	const getExchangeRate = (from: string, to: string, _date?: Date): number => {
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
	const convertAmount = (amount: number, from: string, to: string, _date?: Date): number => {
		const rate = getExchangeRate(from, to, _date);
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
					date: new Date().toISOString().split("T")[0] || new Date().toISOString(),
					isValid: true,
					createdAt: new Date().toISOString()
				},
				{
					id: "2",
					fromCurrency: "EUR",
					toCurrency: "BS",
					rate: 40.2,
					source: "BCV",
					date: new Date().toISOString().split("T")[0] || new Date().toISOString(),
					isValid: true,
					createdAt: new Date().toISOString()
				},
				{
					id: "3",
					fromCurrency: "EUR",
					toCurrency: "USD",
					rate: 1.1,
					source: "BCV",
					date: new Date().toISOString().split("T")[0] || new Date().toISOString(),
					isValid: true,
					createdAt: new Date().toISOString()
				}
			];

			// Actualizar tasas
			rates.forEach((rate) => {
				const key = `${rate.fromCurrency}_${rate.toCurrency}`;
				exchangeRates.value[key] = rate as ExchangeRate;
			});

			lastUpdate.value = new Date();
		} catch (err) {
			error.value = "Error al obtener tasas de cambio";
			console.error("Error fetching exchange rates:", err);
		} finally {
			isLoading.value = false;
		}
	};

	// Guardar tasa de cambio en base de datos
	const saveExchangeRate = async (from: string, to: string, rate: number, source: string) => {
		try {
			const { execute } = useDatabase();

			await execute(`
				INSERT OR REPLACE INTO exchange_rates (
					id, from_currency, to_currency, rate, source, date, is_valid, created_at
				) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
			`, [
				`rate_${from}_${to}_${Date.now()}`,
				from,
				to,
				rate,
				source,
				new Date().toISOString().split("T")[0],
				1,
				new Date().toISOString()
			]);
		} catch (error) {
			console.error("Error saving exchange rate:", error);
		}
	};

	// Obtener tasas desde BCV
	const fetchBCVRates = async () => {
		try {
			console.log("Fetching BCV rates...");

			// API del BCV - usando endpoint público
			const response = await $fetch<any>("https://bcv.org.ve/api/exchange", {
				method: "GET",
				headers: {
					Accept: "application/json",
					"User-Agent": "POS-Venezuela/1.0"
				},
				timeout: 10000 // 10 segundos timeout
			});

			if (response && (response as any).USD) {
				const usdRate = Number.parseFloat((response as any).USD.replace(",", "."));

				// Actualizar tasas en el estado
				exchangeRates.value.USD = {
					id: `bcv_usd_${Date.now()}`,
					fromCurrency: "BS",
					toCurrency: "USD",
					rate: usdRate,
					source: "BCV",
					date: new Date().toISOString().split("T")[0] || new Date().toISOString(),
					isValid: true,
					createdAt: new Date().toISOString()
				};
				exchangeRates.value.EUR = {
					id: `bcv_eur_${Date.now()}`,
					fromCurrency: "BS",
					toCurrency: "EUR",
					rate: usdRate * 0.85,
					source: "BCV",
					date: new Date().toISOString().split("T")[0] || new Date().toISOString(),
					isValid: true,
					createdAt: new Date().toISOString()
				};

				// Guardar en base de datos
				await saveExchangeRate("BS", "USD", usdRate, "BCV");
				await saveExchangeRate("BS", "EUR", usdRate * 0.85, "BCV");

				console.log("✅ BCV rates updated:", { USD: usdRate, EUR: usdRate * 0.85 });
			}
		} catch (err) {
			console.error("Error fetching BCV rates:", err);
			// Fallback a tasas por defecto si falla la API
			exchangeRates.value.USD = {
				id: `fallback_usd_${Date.now()}`,
				fromCurrency: "BS" as any,
				toCurrency: "USD" as any,
				rate: 36.5,
				source: "FALLBACK",
				date: new Date().toISOString().split("T")[0] || new Date().toISOString(),
				isValid: true,
				createdAt: new Date().toISOString()
			};
			exchangeRates.value.EUR = {
				id: `fallback_eur_${Date.now()}`,
				fromCurrency: "BS" as any,
				toCurrency: "EUR" as any,
				rate: 31.0,
				source: "FALLBACK",
				date: new Date().toISOString().split("T")[0] || new Date().toISOString(),
				isValid: true,
				createdAt: new Date().toISOString()
			};
		}
	};

	// Obtener tasas desde DolarToday
	const fetchDolarTodayRates = async () => {
		try {
			console.log("Fetching DolarToday rates...");

			// API de DolarToday - usando endpoint público
			const response = await $fetch<any>("https://s3.amazonaws.com/dolartoday/data.json", {
				method: "GET",
				headers: {
					Accept: "application/json",
					"User-Agent": "POS-Venezuela/1.0"
				},
				timeout: 10000 // 10 segundos timeout
			});

			if (response && (response as any).USD) {
				const usdRate = Number.parseFloat((response as any).USD.dolartoday);
				const eurRate = Number.parseFloat((response as any).EUR.dolartoday);

				// Actualizar tasas en el estado
				exchangeRates.value.USD = {
					id: `dolartoday_usd_${Date.now()}`,
					fromCurrency: "BS",
					toCurrency: "USD",
					rate: usdRate,
					source: "DOLAR_TODAY",
					date: new Date().toISOString().split("T")[0] || new Date().toISOString(),
					isValid: true,
					createdAt: new Date().toISOString()
				};
				exchangeRates.value.EUR = {
					id: `dolartoday_eur_${Date.now()}`,
					fromCurrency: "BS",
					toCurrency: "EUR",
					rate: eurRate,
					source: "DOLAR_TODAY",
					date: new Date().toISOString().split("T")[0] || new Date().toISOString(),
					isValid: true,
					createdAt: new Date().toISOString()
				};

				// Guardar en base de datos
				await saveExchangeRate("BS", "USD", usdRate, "DolarToday");
				await saveExchangeRate("BS", "EUR", eurRate, "DolarToday");

				console.log("✅ DolarToday rates updated:", { USD: usdRate, EUR: eurRate });
			}
		} catch (err) {
			console.error("Error fetching DolarToday rates:", err);
			// Fallback a tasas por defecto si falla la API
			exchangeRates.value.USD = {
				id: `fallback_usd_${Date.now()}`,
				fromCurrency: "BS" as any,
				toCurrency: "USD" as any,
				rate: 36.5,
				source: "FALLBACK",
				date: new Date().toISOString().split("T")[0] || new Date().toISOString(),
				isValid: true,
				createdAt: new Date().toISOString()
			};
			exchangeRates.value.EUR = {
				id: `fallback_eur_${Date.now()}`,
				fromCurrency: "BS" as any,
				toCurrency: "EUR" as any,
				rate: 31.0,
				source: "FALLBACK",
				date: new Date().toISOString().split("T")[0] || new Date().toISOString(),
				isValid: true,
				createdAt: new Date().toISOString()
			};
		}
	};

	// Actualizar tasas manualmente
	const updateManualRate = async (from: string, to: string, rate: number) => {
		const key = `${from}_${to}`;
		exchangeRates.value[key] = {
			id: `manual_${key}`,
			fromCurrency: from as "BS" | "USD" | "EUR",
			toCurrency: to as "BS" | "USD" | "EUR",
			rate,
			source: "MANUAL",
			date: new Date().toISOString().split("T")[0] || new Date().toISOString(),
			isValid: true,
			createdAt: new Date().toISOString()
		};

		// Guardar en base de datos
		await saveExchangeRate(from, to, rate, "manual");
	};

	// Obtener historial de tasas
	const getRateHistory = async (from: string, to: string, days: number = 30) => {
		try {
			const { query } = useDatabase();

			// Obtener historial de las últimas N días
			const result = await query(`
				SELECT 
					rate,
					source,
					date,
					created_at
				FROM exchange_rates 
				WHERE from_currency = ? AND to_currency = ?
				AND date >= date('now', '-${days} days')
				ORDER BY created_at DESC
			`, [from, to]);

			return result.rows.map((row: any) => ({
				rate: Number.parseFloat(row.rate),
				source: row.source,
				date: row.date,
				createdAt: row.created_at
			}));
		} catch (error) {
			console.error("Error getting rate history:", error);
			return [];
		}
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

	// Cargar tasas más recientes desde base de datos
	const loadLatestRatesFromDB = async () => {
		try {
			const { query } = useDatabase();

			// Obtener las tasas más recientes para cada par de monedas
			const result = await query(`
				SELECT 
					from_currency,
					to_currency,
					rate,
					source,
					date,
					created_at
				FROM exchange_rates 
				WHERE is_valid = 1
				AND created_at = (
					SELECT MAX(created_at) 
					FROM exchange_rates e2 
					WHERE e2.from_currency = exchange_rates.from_currency 
					AND e2.to_currency = exchange_rates.to_currency
				)
				ORDER BY created_at DESC
			`);

			result.rows.forEach((row: any) => {
				const key = row.to_currency;
				exchangeRates.value[key] = {
					id: `db_${key}`,
					fromCurrency: row.from_currency as "BS" | "USD" | "EUR",
					toCurrency: row.to_currency as "BS" | "USD" | "EUR",
					rate: Number.parseFloat(row.rate),
					source: row.source,
					date: row.date,
					isValid: true,
					createdAt: row.created_at
				};
			});

			console.log("✅ Latest rates loaded from database");
		} catch (error) {
			console.error("Error loading latest rates from DB:", error);
		}
	};

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
		getRateHistory,
		loadLatestRatesFromDB,
		saveExchangeRate
	};
}
