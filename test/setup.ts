import { afterAll, beforeAll } from "vitest";

// Setup global para tests
beforeAll(() => {
	// Configuración inicial para tests
	console.log("🧪 Configurando entorno de testing...");
});

afterAll(() => {
	// Limpieza después de tests
	console.log("🧹 Limpiando entorno de testing...");
});
