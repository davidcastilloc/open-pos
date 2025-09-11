export default defineNuxtPlugin(async () => {
	const { initialize } = useDatabase();

	// Inicializar base de datos cuando la aplicación se carga
	await initialize();
});
