export default defineNuxtConfig({
	modules: [
		"@nuxt/ui",
		"@vueuse/nuxt",
		"nuxt-svgo",
		"reka-ui/nuxt",
		"@nuxt/eslint",
		"@pinia/nuxt"
	],
	app: {
		head: {
			title: "POS Venezuela - Sistema de Punto de Venta",
			charset: "utf-8",
			viewport: "width=device-width, initial-scale=1",
			meta: [
				{ name: "format-detection", content: "no" },
				{ name: "description", content: "Sistema POS moderno para Venezuela con soporte multi-moneda" }
			]
		},
		pageTransition: {
			name: "page",
			mode: "default"
		},
		layoutTransition: {
			name: "layout",
			mode: "default"
		}
	},
	css: [
		"@/assets/css/main.css"
	],
	icon: {
		customCollections: [
			{
				prefix: "local",
				dir: "./app/assets/icons"
			}
		]
	},
	svgo: {
		autoImportPath: "@/assets/"
	},
	ssr: false,
	dir: {
		modules: "app/modules"
	},
	imports: {
		presets: [
			{
				from: "zod",
				imports: [
					"z",
					{
						name: "infer",
						as: "zInfer",
						type: true
					}
				]
			}
		]
	},
	devServer: {
		host: "0.0.0.0"
	},
	router: {
		options: {
			scrollBehaviorType: "smooth"
		}
	},
	eslint: {
		config: {
			standalone: false
		}
	},
	devtools: {
		enabled: false
	},

	// Configuración específica para Nuxt UI
	ui: {
		global: true,
		icons: ["heroicons"],
		primary: "green",
		neutral: "zinc"
	},
	experimental: {
		typedPages: true
	},
	compatibilityDate: "2025-07-01",

	// Configuración específica para POS
	runtimeConfig: {
		// Variables privadas (solo en servidor)
		databaseUrl: process.env.DATABASE_URL || "sqlite:./pos.db",
		encryptionKey: process.env.ENCRYPTION_KEY || "default-key-change-in-production",

		// Variables públicas (disponibles en cliente)
		public: {
			appName: "POS Venezuela",
			appVersion: "1.0.0",
			apiBaseUrl: process.env.API_BASE_URL || "http://localhost:3000/api",
			bcvApiUrl: "https://api.bcv.org.ve",
			dolarTodayApiUrl: "https://s3.amazonaws.com/dolartoday",
			supportedCurrencies: ["BS", "USD", "EUR"],
			defaultCurrency: "BS"
		}
	},

	// Configuración de Nitro para el servidor
	nitro: {
		experimental: {
			wasm: true
		}
	},

	vite: {
		clearScreen: false,
		envPrefix: ["VITE_", "TAURI_"],
		server: {
			strictPort: true,
			hmr: {
				protocol: "ws",
				host: "0.0.0.0",
				port: 3001
			},
			watch: {
				ignored: ["**/src-tauri/**"]
			}
		}
	}
});
