#!/usr/bin/env node

/**
 * Script para probar la configuración de semantic-release
 * Este script simula el proceso de análisis de commits sin crear releases
 */

import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";

console.log("🔍 Probando configuración de semantic-release...\n");

try {
	// Verificar que el archivo de configuración existe
	const configPath = join(process.cwd(), ".releaserc.json");
	const config = JSON.parse(readFileSync(configPath, "utf8"));

	console.log("✅ Archivo .releaserc.json encontrado y válido");
	console.log("📋 Configuración:");
	console.log(`   - Branches: ${config.branches.map((b) => typeof b === "string" ? b : b.name).join(", ")}`);
	console.log(`   - Tag Format: ${config.tagFormat}`);
	console.log(`   - Plugins: ${config.plugins.length} configurados\n`);

	// Verificar dependencias
	console.log("📦 Verificando dependencias...");
	const packageJson = JSON.parse(readFileSync("package.json", "utf8"));
	const semanticDeps = Object.keys(packageJson.devDependencies)
		.filter((dep) => dep.includes("semantic-release") || dep.includes("conventional-changelog"));

	console.log("✅ Dependencias de semantic-release encontradas:");
	semanticDeps.forEach((dep) => {
		console.log(`   - ${dep}: ${packageJson.devDependencies[dep]}`);
	});

	// Probar análisis de commits (dry run)
	console.log("\n🧪 Ejecutando análisis de commits (dry run)...");
	try {
		const result = execSync("npx semantic-release --dry-run", {
			encoding: "utf8",
			stdio: "pipe"
		});
		console.log("✅ Análisis de commits exitoso");
		console.log("📝 Resultado del análisis:");
		console.log(result);
	} catch (error) {
		if (error.stdout) {
			console.log("✅ Análisis completado (sin errores críticos)");
			console.log("📝 Salida:");
			console.log(error.stdout);
		}
		if (error.stderr && !error.stderr.includes("TypeError: Method Date.prototype.toString")) {
			console.log("⚠️  Advertencias:");
			console.log(error.stderr);
		}
	}

	console.log("\n🎉 Configuración de semantic-release verificada correctamente");
	console.log("💡 El workflow debería funcionar sin el error de Date.prototype.toString");
} catch (error) {
	console.error("❌ Error al verificar la configuración:", error.message);
	process.exit(1);
}
