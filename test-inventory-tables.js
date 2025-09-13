// Script para verificar que las tablas de inventario existen
const fs = require("node:fs");
const path = require("node:path");

const dbPath = path.join(__dirname, "src-tauri", "pos.db");

console.log("🔍 Verificando base de datos...");
console.log("Ruta de la base de datos:", dbPath);

if (fs.existsSync(dbPath)) {
	console.log("✅ Base de datos existe");

	// Leer el archivo de la base de datos para verificar su tamaño
	const stats = fs.statSync(dbPath);
	console.log("Tamaño de la base de datos:", stats.size, "bytes");

	// Verificar si el archivo no está vacío
	if (stats.size > 0) {
		console.log("✅ Base de datos no está vacía");
	} else {
		console.log("❌ Base de datos está vacía");
	}
} else {
	console.log("❌ Base de datos no existe");
}

console.log("📋 Verificando archivos de migración...");
const migrationsPath = path.join(__dirname, "src-tauri", "database", "migrations");
if (fs.existsSync(migrationsPath)) {
	const files = fs.readdirSync(migrationsPath);
	console.log("Archivos de migración encontrados:", files);
} else {
	console.log("❌ Directorio de migraciones no existe");
}
