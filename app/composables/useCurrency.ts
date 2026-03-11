import { computed, readonly, ref } from "vue";

import { z } from "zod";

// Schema para tasas de cambio
export const ExchangeRateSchema = z.object({
	id: z.string(),
	fromCurrency: z.enum(["BS", "USD", "EUR"]),
	toCurrency: z.enum(["BS", "USD", "EUR"]),
	rate: z.number().positive(),
	source: z.enum(["BCV", "DOLAR_API", "MANUAL"]),
	date: z.string(),
	isValid: z.boolean().default(true),
	createdAt: z.string()
});

export type ExchangeRate = z.infer<typeof ExchangeRateSchema>;

type DolarApiOfficialResponse = {
	fuente: string;
	nombre: string;
	moneda?: string;
	compra: number | null;
	venta: number | null;
	promedio: number;
	fechaActualizacion: string;
};

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
			// En el futuro esto vendrá de las APIs del BCV y DolarAPI
			const rates: ExchangeRate[] = [
				{
					id: "1",
					fromCurrency: "USD",
					toCurrency: "BS",
					rate: 36.5,
					source: "BCV",
					date: new Date().toISOString().split("T")[0] as string,
					isValid: true,
					createdAt: new Date().toISOString()
				},
				{
					id: "2",
					fromCurrency: "EUR",
					toCurrency: "BS",
					rate: 40.2,
					source: "BCV",
					date: new Date().toISOString().split("T")[0] as string,
					isValid: true,
					createdAt: new Date().toISOString()
				},
				{
					id: "3",
					fromCurrency: "EUR",
					toCurrency: "USD",
					rate: 1.1,
					source: "BCV",
					date: new Date().toISOString().split("T")[0] as string,
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
				new Date().toISOString().split("T")[0] as string,
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
			const response = await $fetch("https://bcv.org.ve/api/exchange", {
				method: "GET",
				headers: {
					Accept: "application/json",
					"User-Agent": "POS-Venezuela/1.0"
				},
				timeout: 10000 // 10 segundos timeout
			}) as any;

			if (response && response.USD) {
				const usdRate = Number.parseFloat(response.USD.replace(",", "."));

				// Actualizar tasas en el estado
				exchangeRates.value.USD = {
					id: `bcv_usd_${Date.now()}`,
					fromCurrency: "BS" as any,
					toCurrency: "USD" as any,
					rate: usdRate,
					source: "BCV" as any,
					date: new Date().toISOString().split("T")[0] as string,
					isValid: true,
					createdAt: new Date().toISOString()
				};
				exchangeRates.value.EUR = {
					id: `bcv_eur_${Date.now()}`,
					fromCurrency: "BS" as any,
					toCurrency: "EUR" as any,
					rate: usdRate * 0.85,
					source: "BCV" as any,
					date: new Date().toISOString().split("T")[0] as string,
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
				source: "FALLBACK" as any,
				date: new Date().toISOString().split("T")[0] as string,
				isValid: true,
				createdAt: new Date().toISOString()
			};
			exchangeRates.value.EUR = {
				id: `fallback_eur_${Date.now()}`,
				fromCurrency: "BS" as any,
				toCurrency: "EUR" as any,
				rate: 31.0,
				source: "FALLBACK" as any,
				date: new Date().toISOString().split("T")[0] as string,
				isValid: true,
				createdAt: new Date().toISOString()
			};
		}
	};

	// Obtener tasas desde DolarAPI
	const fetchDolarApiRates = async () => {
		try {
			console.log("Fetching DolarAPI rates...");

			const [usdResponse, eurResponse] = await Promise.all([
				$fetch<DolarApiOfficialResponse>("https://ve.dolarapi.com/v1/dolares/oficial", {
					method: "GET",
					headers: {
						Accept: "application/json",
						"User-Agent": "POS-Venezuela/1.0"
					},
					timeout: 10000
				}),
				$fetch<DolarApiOfficialResponse>("https://ve.dolarapi.com/v1/euros/oficial", {
					method: "GET",
					headers: {
						Accept: "application/json",
						"User-Agent": "POS-Venezuela/1.0"
					},
					timeout: 10000
				})
			]);

			if (Number.isFinite(usdResponse.promedio) && Number.isFinite(eurResponse.promedio)) {
				const usdRate = Number(usdResponse.promedio);
				const eurRate = Number(eurResponse.promedio);

				// Actualizar tasas en el estado
				exchangeRates.value.USD = {
					id: `dolarapi_usd_${Date.now()}`,
					fromCurrency: "BS" as any,
					toCurrency: "USD" as any,
					rate: usdRate,
					source: "DOLAR_API" as any,
					date: new Date().toISOString().split("T")[0] as string,
					isValid: true,
					createdAt: new Date().toISOString()
				};
				exchangeRates.value.EUR = {
					id: `dolarapi_eur_${Date.now()}`,
					fromCurrency: "BS" as any,
					toCurrency: "EUR" as any,
					rate: eurRate,
					source: "DOLAR_API" as any,
					date: new Date().toISOString().split("T")[0] as string,
					isValid: true,
					createdAt: new Date().toISOString()
				};

				// Guardar en base de datos
				await saveExchangeRate("BS", "USD", usdRate, "DolarAPI");
				await saveExchangeRate("BS", "EUR", eurRate, "DolarAPI");

				console.log("✅ DolarAPI rates updated:", { USD: usdRate, EUR: eurRate });
			}
		} catch (err) {
			console.error("Error fetching DolarAPI rates:", err);
			// Fallback a tasas por defecto si falla la API
			exchangeRates.value.USD = {
				id: `fallback_usd_${Date.now()}`,
				fromCurrency: "BS" as any,
				toCurrency: "USD" as any,
				rate: 36.5,
				source: "FALLBACK" as any,
				date: new Date().toISOString().split("T")[0] as string,
				isValid: true,
				createdAt: new Date().toISOString()
			};
			exchangeRates.value.EUR = {
				id: `fallback_eur_${Date.now()}`,
				fromCurrency: "BS" as any,
				toCurrency: "EUR" as any,
				rate: 31.0,
				source: "FALLBACK" as any,
				date: new Date().toISOString().split("T")[0] as string,
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
			fromCurrency: from as any,
			toCurrency: to as any,
			rate,
			source: "MANUAL",
			date: new Date().toISOString().split("T")[0] as string,
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
					fromCurrency: row.from_currency as any,
					toCurrency: row.to_currency as any,
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
		fetchDolarApiRates,
		updateManualRate,
		getRateHistory,
		loadLatestRatesFromDB,
		saveExchangeRate
	};
}
