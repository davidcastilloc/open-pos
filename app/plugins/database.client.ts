export default defineNuxtPlugin({
	name: "database",
	async setup() {
		console.log("🔌 Plugin de base de datos iniciando...");
		const { initialize, error, isInitialized } = useDatabase();

		// Inicializar base de datos cuando la aplicación se carga
		try {
			await initialize();

			// Verificar si la inicialización fue exitosa
			if (isInitialized.value) {
				console.log("✅ Plugin de base de datos: inicialización exitosa");
			} else if (error.value) {
				console.warn("⚠️ Plugin de base de datos: inicialización con errores:", error.value);
			}
		} catch (error) {
			console.error("❌ Plugin de base de datos: error crítico en inicialización:", error);

			// Intentar inicialización alternativa
			console.log("🔄 Intentando inicialización alternativa...");
			try {
				await new Promise((resolve) => setTimeout(resolve, 2000)); // Esperar 2 segundos
				await initialize();
				console.log("✅ Plugin de base de datos: inicialización alternativa exitosa");
			} catch (retryError) {
				console.error("❌ Plugin de base de datos: error en inicialización alternativa:", retryError);
				// No lanzar el error para permitir que la aplicación continúe
			}
		}
	}
});
