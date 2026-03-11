# Architecture

**Analysis Date:** 2026-03-11

## Pattern Overview

**Overall:** Client-heavy Nuxt SPA packaged as a Tauri desktop app, with domain logic implemented in composables and persistence handled through SQLite (Tauri SQL plugin + Drizzle schema).

**Key Characteristics:**
- Single frontend codebase under `app/` used for both web dev (`pnpm dev`) and desktop (`pnpm tauri:dev`) entry flows via `package.json` scripts.
- Layered domain organization: UI (`app/pages/`, `app/components/`) delegates behavior to composables (`app/composables/use*.ts`).
- Local-first persistence through SQLite loaded from `app/database/connection.ts` (`Database.load("sqlite:pos.db")`).
- Desktop shell and OS integrations are provided by Rust + Tauri plugin setup in `src-tauri/src/lib.rs`.

## Layers

**Presentation Layer:**
- Purpose: Render screens, collect user interaction, and orchestrate page-level UI behavior.
- Contains: route pages (`app/pages/pos.vue`, `app/pages/products.vue`), reusable components (`app/components/ProductForm.vue`, `app/components/NotificationContainer.vue`), layouts (`app/layouts/pos.vue`).
- Depends on: domain composables and Nuxt UI components.
- Used by: Nuxt runtime initialized through `app/app.vue` (`<NuxtLayout><NuxtPage/></NuxtLayout>`).

**Domain/State Layer (Composables):**
- Purpose: Encapsulate POS business workflows and reusable app state.
- Contains: feature composables such as `app/composables/usePOS.ts`, `app/composables/useCashClosing.ts`, `app/composables/useTransactions.ts`, `app/composables/useCurrency.ts`.
- Depends on: data access helpers (`useDatabase`), domain schemas (`app/schemas/*.ts`), and other composables.
- Used by: pages/components and startup plugins (`app/plugins/*.client.ts`).

**Data Access Layer:**
- Purpose: Centralize DB connection, SQL execution, and schema typing.
- Contains: connection bootstrap in `app/database/connection.ts`, typed schema modules in `app/database/schema/*.ts`, migration helpers in `app/database/migrate.ts`.
- Depends on: `@tauri-apps/plugin-sql` and Drizzle (`drizzle-orm/sqlite-proxy`).
- Used by: domain composables (`app/composables/useDatabase.ts`, `app/composables/usePOS.ts`).

**Platform Integration Layer:**
- Purpose: Bridge Nuxt app with Tauri APIs and environment-specific bootstrapping.
- Contains: Nuxt module auto-import bridge in `app/modules/tauri.ts`, client bootstrap plugins such as `app/plugins/database.client.ts`, `app/plugins/user.client.ts`, `app/plugins/currency.client.ts`.
- Depends on: Tauri JS APIs (`@tauri-apps/api/*`, `@tauri-apps/plugin-*`).
- Used by: UI/domain layers via auto-imported `useTauri*` functions and plugin setup hooks.

**Desktop Runtime Layer (Rust Host):**
- Purpose: Start native shell, register native plugins, and configure tray/window lifecycle.
- Contains: binary entry `src-tauri/src/main.rs`, runtime builder and plugin registration in `src-tauri/src/lib.rs`, desktop config in `src-tauri/tauri.conf.json`.
- Depends on: Tauri runtime and Rust plugin crates.
- Used by: Desktop execution path `pnpm tauri:dev` / `pnpm tauri:build`.

## Data Flow

**POS Sale Flow (UI -> Domain -> DB):**

1. User opens POS screen routed by file-based Nuxt routing at `app/pages/pos.vue`.
2. Page actions trigger domain operations in `app/composables/usePOS.ts` (e.g., add items, apply discounts, process sale).
3. `usePOS` calls `useDatabase` methods from `app/composables/useDatabase.ts`.
4. `useDatabase` delegates to SQLite connection helpers in `app/database/connection.ts`.
5. SQL statements run against `sqlite:pos.db`; transactional writes commit/rollback in `useDatabase.transaction`.
6. UI reacts to updated state and renders totals, cart, and operational feedback.

**Startup Initialization Flow:**

1. Nuxt starts from `app/app.vue`.
2. Client plugins run (for example `app/plugins/database.client.ts`).
3. `useDatabase().initialize()` invokes `initDatabase()` in `app/database/connection.ts`.
4. Tables/default data are ensured and app state flag `database.isInitialized` is set.

**State Management:**
- Global/shared state is mostly composable-driven with Nuxt state keys (`useState("database.isInitialized")` in `app/composables/useDatabase.ts`).
- Session-like UI state is local reactive state in composables (`ref`, `computed`) such as cart handling in `app/composables/usePOS.ts`.
- Persistent state is SQLite-backed (`sqlite:pos.db`) through Tauri SQL plugin and migration files in `src-tauri/database/migrations/*.sql`.

## Key Abstractions

**Composable-as-Service:**
- Purpose: Treat composables as feature services combining state + behavior.
- Examples: `usePOS`, `useProducts`, `useCashClosing`, `useTransactions` in `app/composables/`.
- Pattern: Composition API module functions returning reactive state and methods.

**Schema Modules:**
- Purpose: Define and centralize DB table contracts.
- Examples: `app/database/schema/products.ts`, `app/database/schema/sales.ts`, `app/database/schema/users.ts`.
- Pattern: Drizzle schema definitions aggregated via `app/database/schema/index.ts`.

**Client Bootstrap Plugins:**
- Purpose: Initialize cross-feature capabilities at app startup.
- Examples: `app/plugins/database.client.ts`, `app/plugins/config.client.ts`, `app/plugins/inventory.client.ts`.
- Pattern: Nuxt plugin lifecycle hooks (`defineNuxtPlugin`) with async initialization.

**Nuxt-Tauri Auto-import Bridge:**
- Purpose: Expose Tauri APIs with app-specific prefixed composable names.
- Examples: `app/modules/tauri.ts` generates imports like `useTauriApp*`, `useTauriFs*` through `addImports`.
- Pattern: Nuxt module + auto-import generation.

## Entry Points

**Web Dev Entry:**
- Location: `package.json` script `dev` -> `nuxt dev`.
- Triggers: local web development run.
- Responsibilities: Start Nuxt client app with routing/layout/plugin lifecycle.

**Desktop Dev/Build Entry:**
- Location: `package.json` scripts `tauri:dev` / `tauri:build`; Rust binary entry in `src-tauri/src/main.rs`.
- Triggers: desktop app development or packaging.
- Responsibilities: Launch Rust host, connect frontend (`devUrl` / `frontendDist`) as configured in `src-tauri/tauri.conf.json`.

**App Composition Entry:**
- Location: `app/app.vue`.
- Triggers: every Nuxt app render cycle.
- Responsibilities: Wrap app in `UApp`, apply active layout, mount page component.

## Error Handling

**Strategy:** Localized try/catch in composables/plugins with explicit logging and conservative fallback behavior.

**Patterns:**
- Initialization and query wrappers in `app/composables/useDatabase.ts` catch errors, set reactive error state, and rethrow or soften idempotent migration-like failures.
- Transactional integrity uses explicit `BEGIN`/`COMMIT`/`ROLLBACK` in `useDatabase.transaction`.
- Startup plugin guards errors at bootstrap (`app/plugins/database.client.ts`) to avoid hard crash during client initialization.
- Rust runtime uses `.expect("error while running tauri application")` in `src-tauri/src/lib.rs` for unrecoverable host startup failures.

## Cross-Cutting Concerns

**Logging:**
- Predominantly `console.log`/`console.error` in composables and plugins (for example `app/composables/useDatabase.ts`, `app/plugins/database.client.ts`).

**Validation:**
- Domain validation modules exist in `app/schemas/` (e.g., `app/schemas/product.ts`, `app/schemas/customer.ts`) and Zod is globally auto-imported via `nuxt.config.ts` (`imports.presets`).

**Persistence and Migration:**
- Runtime DB bootstrap in `app/database/connection.ts`; versioned SQL migrations in `src-tauri/database/migrations/`.

**Desktop Capability/Security Boundary:**
- Tauri host permissions/capabilities are declared in `src-tauri/capabilities/main.json` and generated capability schemas in `src-tauri/gen/schemas/`.

---

*Architecture analysis: 2026-03-11*
*Update when major patterns change*
