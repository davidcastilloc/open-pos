export default defineNuxtPlugin({
	name: "ui-colors",
	setup() {
		// Configuración de colores para el tema del POS
		const _primaryColor = "green";
		const _neutralColor = "zinc";

		// Inyectar CSS personalizado para los colores del tema
		if (import.meta.client) {
			const style = document.createElement("style");
			style.textContent = `
				/* Colores primarios del tema */
				:root {
					--color-primary-50: rgb(240 253 244);
					--color-primary-100: rgb(220 252 231);
					--color-primary-200: rgb(187 247 208);
					--color-primary-300: rgb(134 239 172);
					--color-primary-400: rgb(74 222 128);
					--color-primary-500: rgb(34 197 94);
					--color-primary-600: rgb(22 163 74);
					--color-primary-700: rgb(21 128 61);
					--color-primary-800: rgb(22 101 52);
					--color-primary-900: rgb(20 83 45);
					--color-primary-950: rgb(5 46 22);
				}

				/* Colores neutrales del tema */
				:root {
					--color-neutral-50: rgb(250 250 250);
					--color-neutral-100: rgb(244 244 245);
					--color-neutral-200: rgb(228 228 231);
					--color-neutral-300: rgb(212 212 216);
					--color-neutral-400: rgb(161 161 170);
					--color-neutral-500: rgb(113 113 122);
					--color-neutral-600: rgb(82 82 91);
					--color-neutral-700: rgb(63 63 70);
					--color-neutral-800: rgb(39 39 42);
					--color-neutral-900: rgb(24 24 27);
					--color-neutral-950: rgb(9 9 11);
				}

				/* Aplicar colores primarios a elementos de Nuxt UI */
				.bg-primary-50 { background-color: var(--color-primary-50); }
				.bg-primary-100 { background-color: var(--color-primary-100); }
				.bg-primary-500 { background-color: var(--color-primary-500); }
				.bg-primary-600 { background-color: var(--color-primary-600); }
				.bg-primary-700 { background-color: var(--color-primary-700); }
				.text-primary-600 { color: var(--color-primary-600); }
				.text-primary-700 { color: var(--color-primary-700); }
				.border-primary-500 { border-color: var(--color-primary-500); }
				.border-primary-600 { border-color: var(--color-primary-600); }
				
				/* Estados hover y focus */
				.hover\\:bg-primary-600:hover { background-color: var(--color-primary-600); }
				.hover\\:bg-primary-700:hover { background-color: var(--color-primary-700); }
				.focus\\:ring-primary-500:focus { --tw-ring-color: var(--color-primary-500); }
				.focus\\:border-primary-500:focus { border-color: var(--color-primary-500); }

				/* Colores neutros para texto y fondos */
				.text-neutral-400 { color: var(--color-neutral-400); }
				.text-neutral-500 { color: var(--color-neutral-500); }
				.text-neutral-600 { color: var(--color-neutral-600); }
				.text-neutral-700 { color: var(--color-neutral-700); }
				.text-neutral-900 { color: var(--color-neutral-900); }
				.bg-neutral-50 { background-color: var(--color-neutral-50); }
				.bg-neutral-100 { background-color: var(--color-neutral-100); }
				.bg-neutral-800 { background-color: var(--color-neutral-800); }
				.border-neutral-200 { border-color: var(--color-neutral-200); }
				.border-neutral-300 { border-color: var(--color-neutral-300); }
			`;

			document.head.appendChild(style);
		}
	}
});
