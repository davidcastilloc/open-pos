export default defineNuxtPlugin({
	name: "database",
	async setup() {
		console.log("🔌 Plugin de base de datos iniciando...");
		const { initialize } = useDatabase();

		// Inicializar base de datos cuando la aplicación se carga
		try {
			await initialize();
			console.log("✅ Plugin de base de datos: inicialización exitosa");
		} catch (error) {
			console.error("❌ Plugin de base de datos: error en inicialización:", error);
		}
	}
});
