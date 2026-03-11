# Technology Stack

**Analysis Date:** 2026-03-11

## Languages

**Primary:**
- TypeScript 5.8.x - Main application logic, Nuxt app code, composables, schemas, and build config (`package.json`, `app/composables/useDatabase.ts`, `app/database/connection.ts`, `nuxt.config.ts`).
- Vue SFC (`.vue`) - UI layer with Composition API (`app/pages/pos.vue`, `app/pages/notifications.vue`, `app/components/NotificationContainer.vue`).

**Secondary:**
- Rust (edition 2021) - Desktop host shell for Tauri runtime and plugin wiring (`src-tauri/Cargo.toml`, `src-tauri/src/lib.rs`).
- SQL (SQLite dialect) - Schema/migrations and runtime table creation (`src-tauri/database/migrations/*.sql`, `drizzle.config.ts`, `app/database/connection.ts`).
- JavaScript (Node ESM/CJS scripts) - Project automation and release/migration utilities (`scripts/test-semantic-release.js`, `scripts/simple-db.js`, `scripts/run-returns-migration.cjs`).

## Runtime

**Environment:**
- Node.js >=23 required for tooling/dev runtime (`package.json` `engines.node`, `.github/workflows/release.yml` `node-version: 23`).
- Browser/WebView client runtime (Nuxt SSR disabled) (`nuxt.config.ts` `ssr: false`).
- Tauri 2 desktop runtime for packaged app (`src-tauri/Cargo.toml`, `src-tauri/tauri.conf.json`).

**Package Manager:**
- pnpm 10.16.1 enforced (`package.json` `packageManager`, `preinstall` script `npx only-allow pnpm`).
- Lockfile: `pnpm-lock.yaml` present.

## Frameworks

**Core:**
- Nuxt 4 (`nuxt` ^4.0.0) - App framework and build/dev orchestration (`package.json`, `nuxt.config.ts`).
- Vue 3 (`vue` ^3.5.17) + Vue Router 4 (`vue-router` ^4.5.1) - UI/component runtime (`package.json`, `app/router.options.ts`).
- Tauri 2 (`@tauri-apps/*` v2 + `tauri` crate 2.6.x) - Desktop container with native plugins (`package.json`, `src-tauri/Cargo.toml`, `src-tauri/src/lib.rs`).

**Testing:**
- Vitest 2.1.x - Unit/integration tests (`package.json` `test`, `vitest.config.ts`, `test/transactions.spec.ts`).
- Vue Test Utils - Vue component test support (`package.json` `@vue/test-utils`).
- JSDOM - Browser-like test environment (`package.json` `jsdom`, `test/setup.ts`).

**Build/Dev:**
- Vite (through Nuxt) - Dev server/HMR and bundling (`nuxt.config.ts` `vite.server`, `vite.envPrefix`).
- TypeScript compiler (`typescript` ^5.8.3) - Type system and project typing (`package.json`, `tsconfig.json`, `tsconfig.app.json`).
- ESLint 9 + Nuxt/Antfu config - Linting (`eslint.config.mjs`, `package.json`).
- Drizzle Kit - Migration generation/execution for SQLite schema (`package.json` scripts `db:*`, `drizzle.config.ts`).

## Key Dependencies

**Critical:**
- `nuxt` ^4.0.0 - Application runtime/framework entrypoint (`package.json`, `nuxt.config.ts`).
- `@tauri-apps/api` + Tauri plugins (`plugin-sql`, `plugin-store`, `plugin-notification`, `plugin-fs`, `plugin-os`, `plugin-shell`) - Native OS bridges used by app modules (`package.json`, `app/modules/tauri.ts`, `src-tauri/src/lib.rs`).
- `drizzle-orm` ^0.44.5 - Typed ORM over SQLite proxy (`package.json`, `app/database/connection.ts`).
- `@nuxt/ui` ^3.3.3 - Component/UI system (`package.json`, `nuxt.config.ts`, `app/pages/*.vue`).
- `pinia` + `@pinia/nuxt` - State management integration (`package.json`, `nuxt.config.ts`).
- `zod` ^4.0.5 - Validation schemas for domain/form contracts (`package.json`, `app/schemas/*.ts`, `app/pages/notifications.vue`).

**Infrastructure:**
- `drizzle-kit` - Migration CLI outputting to Tauri DB migration folder (`package.json`, `drizzle.config.ts`).
- `better-sqlite3` - Script-time/local DB tooling and native build dependency (`package.json`, `scripts/simple-db.js`).
- `semantic-release` + plugins - Automated versioning/changelog/release publishing (`package.json`, `.releaserc.json`, `.github/workflows/release.yml`).

## Configuration

**Environment:**
- Env-driven runtime config via `process.env` and `runtimeConfig` (`nuxt.config.ts`).
- Documented env template includes DB path, encryption key, currency API URLs, and app metadata (`env.example`, `docs/env.md`).
- Tauri dev host + Vite env prefixes coordinated for desktop dev mode (`nuxt.config.ts` `devServer.host`, `vite.envPrefix`).

**Build:**
- Nuxt app config: `nuxt.config.ts`.
- TypeScript configs: `tsconfig.json`, `tsconfig.app.json`.
- Lint config: `eslint.config.mjs`.
- Tauri packaging/runtime config: `src-tauri/tauri.conf.json`, `src-tauri/Cargo.toml`.
- DB migration config: `drizzle.config.ts`, `src-tauri/database/migrations/`.

## Platform Requirements

**Development:**
- Cross-platform desktop development supported by Tauri targets (`src-tauri/tauri.conf.json` `bundle.targets: all`, platform schemas in `src-tauri/gen/schemas/`).
- Rust toolchain/Tauri prerequisites required for desktop mode (`docs/README.md`, `docs/tauri.md`, script `scripts/check-tauri-linux-prereqs.sh`).
- Node.js >=23 + pnpm required (`package.json`, `.github/workflows/release.yml`).

**Production:**
- Primary deliverable is packaged desktop app binaries via Tauri (`package.json` scripts `tauri:build`, `src-tauri/tauri.conf.json`).
- Optional static web output via `nuxt generate` to `dist` (used by Tauri `frontendDist`) (`package.json`, `src-tauri/tauri.conf.json`).
- Automated release flow is GitHub Actions + semantic-release from `main` branch (`.github/workflows/release.yml`, `.releaserc.json`).

---

*Stack analysis: 2026-03-11*
*Update after major dependency or runtime changes*
