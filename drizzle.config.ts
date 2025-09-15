import { defineConfig } from "drizzle-kit";

export default defineConfig({
	schema: "./app/database/schema/*",
	out: "./src-tauri/database/migrations",
	dialect: "sqlite",
	dbCredentials: {
		url: "./src-tauri/database/pos.db"
	},
	verbose: true,
	strict: false
});
