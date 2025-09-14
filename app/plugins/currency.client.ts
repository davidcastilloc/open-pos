export default defineNuxtPlugin({
	name: "currency",
	async setup() {
		const { fetchCurrentRates, fetchBCVRates, fetchDolarTodayRates } = useCurrency();

		// Intento inicial de actualización desde APIs externas (con fallback a tasas actuales)
		try {
			await fetchBCVRates();
		} catch (err) {
			console.error("Error fetching BCV rates on init:", err);
		}
		try {
			await fetchDolarTodayRates();
		} catch (err) {
			console.error("Error fetching DolarToday rates on init:", err);
		}
		await fetchCurrentRates();

		// Actualización automática cada 15 minutos
		const UPDATE_INTERVAL_MS = 15 * 60 * 1000;
		setInterval(async () => {
			try {
				await fetchBCVRates();
			} catch (err) {
				console.error("Error fetching BCV rates:", err);
			}
			try {
				await fetchDolarTodayRates();
			} catch (err) {
				console.error("Error fetching DolarToday rates:", err);
			}
			await fetchCurrentRates();
		}, UPDATE_INTERVAL_MS);
	}
});
