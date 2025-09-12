export default defineNuxtPlugin({
	name: "database",
	async setup() {
		const { initialize } = useDatabase();

		// Inicializar base de datos cuando la aplicación se carga
		await initialize();
	}
});
