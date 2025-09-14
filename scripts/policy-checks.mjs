#!/usr/bin/env node
/*
 Policy checks for UI rules:
 - No explicit Tailwind color classes in HTML (text-*, bg-*, border-*) except text-error|text-warning|text-success; allow border-*, but only non-color variants like border, border-2, border-dashed, etc.
 - Nuxt UI Modals must use v-model:open, contain <template #content> wrapping a UCard, and must not use :ui on UModal.
*/

import { promises as fs } from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const targetDirs = [path.join(repoRoot, "app")];

/** Recursively collect files with given extensions */
async function collectFiles(dir, exts, out = []) {
	const entries = await fs.readdir(dir, { withFileTypes: true });
	for (const entry of entries) {
		const full = path.join(dir, entry.name);
		if (entry.isDirectory()) {
			await collectFiles(full, exts, out);
		} else if (exts.includes(path.extname(entry.name))) {
			out.push(full);
		}
	}
	return out;
}

function findAllIndices(haystack, needle) {
	const indices = [];
	let idx = haystack.indexOf(needle);
	while (idx !== -1) {
		indices.push(idx);
		idx = haystack.indexOf(needle, idx + needle.length);
	}
	return indices;
}

function report(file, message, snippet) {
	return { file, message, snippet };
}

function checkColorClasses(file, content) {
	const violations = [];
	// Ban explicit text/bg/border color classes except text-error|text-warning|text-success and border structural variants
	// Matches: text-foo, bg-foo, border-foo (but not border, border-2, border-dashed, etc.)
	const regex = /\b(?:text|bg|border)-(?!error\b|warning\b|success\b|\d\b|\d\d\b|\d\d\d\b|dashed\b|solid\b|double\b|none\b|\[)[a-z][a-z0-9-]*\b/g;
	for (const m of content.matchAll(regex)) {
		const token = m[0];
		// Allow text-error/warning/success only
		if (token === "text-error" || token === "text-warning" || token === "text-success") continue;
		violations.push(report(file, `Clase de color explícito prohibida: ${token}`, extractSnippet(content, m.index)));
	}
	return violations;
}

function extractSnippet(content, index, span = 120) {
	const start = Math.max(0, index - Math.floor(span / 2));
	const end = Math.min(content.length, index + Math.floor(span / 2));
	return content.slice(start, end).replace(/\n/g, "\n");
}

function checkUModalConventions(file, content) {
	const violations = [];
	const tag = "<UModal";
	const indices = findAllIndices(content, tag);
	for (const i of indices) {
		const openEnd = content.indexOf(">", i);
		if (openEnd === -1) {
			violations.push(report(file, "UModal sin cierre de etiqueta de apertura", extractSnippet(content, i)));
			continue;
		}
		const openTag = content.slice(i, openEnd + 1);
		// Must use v-model:open, not v-model
		if (/\bv-model="/.test(openTag)) {
			violations.push(report(file, "UModal usa v-model en lugar de v-model:open", openTag));
		}
		if (!/\bv-model:open=/.test(openTag)) {
			violations.push(report(file, "UModal sin v-model:open", openTag));
		}
		// Must NOT use :ui on UModal
		if (/\s:ui=/.test(openTag)) {
			violations.push(report(file, "UModal no debe usar :ui en el componente", openTag));
		}
		// Extract inner content up to closing tag
		const closeIdx = content.indexOf("</UModal>", openEnd + 1);
		if (closeIdx === -1) {
			violations.push(report(file, "UModal sin etiqueta de cierre </UModal>", extractSnippet(content, i)));
			continue;
		}
		const inner = content.slice(openEnd + 1, closeIdx);
		if (!/<template\s+#content\b/.test(inner)) {
			violations.push(report(file, "UModal sin <template #content>", extractSnippet(inner, 0)));
		} else {
			// Ensure UCard exists inside content slot
			// naive: check for <UCard in inner
			if (!/<UCard\b/.test(inner)) {
				violations.push(report(file, "UModal debe envolver contenido en UCard dentro de #content", extractSnippet(inner, 0)));
			}
		}
	}
	return violations;
}

async function main() {
	const files = [];
	for (const dir of targetDirs) {
		try {
			const list = await collectFiles(dir, [".vue"]);
			files.push(...list);
		} catch {}
	}
	const allViolations = [];
	for (const file of files) {
		const content = await fs.readFile(file, "utf8");
		allViolations.push(...checkColorClasses(file, content));
		allViolations.push(...checkUModalConventions(file, content));
	}
	if (allViolations.length) {
		console.error("⛔ Política UI: Se encontraron violaciones:");
		for (const v of allViolations) {
			console.error(`\n• Archivo: ${path.relative(repoRoot, v.file)}\n  Mensaje: ${v.message}\n  Contexto: ${v.snippet}`);
		}
		process.exit(1);
	} else {
		console.log("✅ Checks de políticas UI pasaron sin violaciones.");
	}
}

main().catch((err) => {
	console.error("Error en policy-checks:", err);
	process.exit(1);
});
