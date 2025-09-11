export default defineNuxtPlugin({
	name: "currency",
	async setup() {
		const { fetchCurrentRates } = useCurrency();

		// Cargar tasas de cambio cuando la aplicación se carga
		await fetchCurrentRates();
	}
});
