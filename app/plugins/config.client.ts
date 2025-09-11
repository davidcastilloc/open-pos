export default defineNuxtPlugin(async () => {
	const { loadConfig } = useConfig();

	// Cargar configuración cuando la aplicación se carga
	await loadConfig();
});
