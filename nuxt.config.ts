export default defineNuxtConfig({
	modules: [
		"@vueuse/nuxt",
		"@nuxt/ui",
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
			mode: "out-in"
		},
		layoutTransition: {
			name: "layout",
			mode: "out-in"
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
	}
});
