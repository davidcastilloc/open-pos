export default defineNuxtPlugin(async () => {
	const { fetchCurrentRates } = useCurrency();

	// Cargar tasas de cambio cuando la aplicación se carga
	await fetchCurrentRates();
});
