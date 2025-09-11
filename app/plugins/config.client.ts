export default defineNuxtPlugin({
	name: "config",
	async setup() {
		const { loadConfig } = useConfig();

		// Cargar configuración cuando la aplicación se carga
		await loadConfig();
	}
});
