# External Integrations

**Analysis Date:** 2026-03-11

## APIs & External Services

**Payment Processing:**
- None detected in current codebase.
  - Evidence: No Stripe/PayPal/etc dependencies in `package.json`; no payment gateway SDK imports in `app/`.

**Email/SMS:**
- None detected.
  - Evidence: No email/SMS provider dependencies or provider imports in `package.json` and `app/`.

**External APIs:**
- Banco Central de Venezuela (BCV) API - Exchange-rate ingestion for currency conversion.
  - Integration method: HTTP GET via Nuxt `$fetch` in client composable.
  - Auth: No API key/token shown; custom `User-Agent` header used.
  - Endpoint used: `https://bcv.org.ve/api/exchange`.
  - Evidence: `app/composables/useCurrency.ts`, `docs/currency-apis.md`, `env.example` (`BCV_API_URL`).
- DolarToday JSON API - Parallel-market exchange-rate ingestion.
  - Integration method: HTTP GET via `$fetch`.
  - Auth: No explicit auth in code.
  - Endpoint used: `https://s3.amazonaws.com/dolartoday/data.json`.
  - Evidence: `app/composables/useCurrency.ts`, `docs/currency-apis.md`, `env.example` (`DOLAR_TODAY_API_URL`).
- GitHub API (release automation path) - Semantic release publishing.
  - Integration method: `cycjimmy/semantic-release-action` using GitHub token.
  - Auth: `GITHUB_TOKEN` from GitHub Actions secrets.
  - Endpoints used: implicit via `@semantic-release/github` plugin.
  - Evidence: `.github/workflows/release.yml`, `.releaserc.json`, `package.json`.

## Data Storage

**Databases:**
- SQLite (local, embedded) - Primary operational store for POS domain data.
  - Connection: Tauri SQL plugin DSN `sqlite:pos.db`.
  - Client: `@tauri-apps/plugin-sql` + `drizzle-orm/sqlite-proxy`.
  - Migrations: Drizzle migrations under `src-tauri/database/migrations/`; CLI config in `drizzle.config.ts`.
  - Evidence: `app/database/connection.ts`, `src-tauri/tauri.conf.json` (`plugins.sql.preload`), `drizzle.config.ts`, `src-tauri/database/migrations/`.

**File Storage:**
- Local filesystem via Tauri FS plugin (desktop-native storage/file access capability).
  - SDK/Client: `@tauri-apps/plugin-fs`.
  - Auth: OS-level app permissions/capabilities, not cloud credentials.
  - Evidence: `app/modules/tauri.ts`, `src-tauri/src/lib.rs`, `src-tauri/capabilities/main.json`.

**Caching:**
- Tauri Store plugin for local key-value persistence.
  - Client: `@tauri-apps/plugin-store` + Rust `tauri-plugin-store`.
  - Scope: local app store (not remote cache like Redis).
  - Evidence: `app/modules/tauri.ts`, `src-tauri/src/lib.rs`, `src-tauri/Cargo.toml`.

## Authentication & Identity

**Auth Provider:**
- No external identity provider detected (no OAuth/Auth0/Supabase Auth/etc).
  - Implementation: Local user records in SQLite; default admin bootstrap logic.
  - Token/session management: Not using external token/session provider in current code.
  - Evidence: `app/composables/useUser.ts` (creates/selects default local admin), `app/database/connection.ts` (users table), `package.json` (no external auth SDK).

**OAuth Integrations:**
- None detected.
  - Evidence: no OAuth dependencies/imports in `package.json` and `app/`.

## Monitoring & Observability

**Error Tracking:**
- None detected (no Sentry/Bugsnag/Rollbar SDK integration).
  - Evidence: `package.json` dependency list; logging appears via console in app composables (`app/composables/useDatabase.ts`, `app/composables/useCurrency.ts`).

**Analytics:**
- None detected.
  - Evidence: no analytics SDK in `package.json`; no telemetry client usage in `app/`.

**Logs:**
- Local stdout/stderr style logging from web app and Tauri host.
  - Integration: `console.log/error` in TS layer and `println!` in Rust tray/menu handler.
  - Evidence: `app/composables/useDatabase.ts`, `app/composables/useCurrency.ts`, `src-tauri/src/lib.rs`.

## CI/CD & Deployment

**Hosting:**
- Desktop binary distribution via Tauri build pipeline (no cloud app host config committed here).
  - Deployment artifact path: built via `tauri build` from generated Nuxt output.
  - Environment vars: runtime values supplied through env + CI context.
  - Evidence: `package.json` scripts (`tauri:build`, `generate`), `src-tauri/tauri.conf.json` (`frontendDist`, `beforeBuildCommand`).

**CI Pipeline:**
- GitHub Actions release workflow on self-hosted runner.
  - Workflow: semantic-release job for `main` branch pushes.
  - Secrets: `GITHUB_TOKEN`.
  - Evidence: `.github/workflows/release.yml`, `.releaserc.json`, `scripts/test-semantic-release.js`.

## Environment Configuration

**Development:**
- Required env vars used/documented: `DATABASE_URL`, `ENCRYPTION_KEY`, `API_BASE_URL`, `BCV_API_URL`, `DOLAR_TODAY_API_URL`, currency/tax/sync/backup keys.
- Secrets location: local `.env` copied from `env.example` (repository guidance).
- Mock/stub behavior: currency module includes default/fallback rates when external APIs fail.
- Evidence: `env.example`, `docs/env.md`, `nuxt.config.ts`, `app/composables/useCurrency.ts`.

**Staging:**
- No explicit staging environment config found in repository files.
  - Evidence: only production-targeted workflow shown in `.github/workflows/release.yml`; no staging workflow/config file present.

**Production:**
- Secrets management in CI: GitHub Actions secret context for release token.
- Desktop runtime secrets/config likely injected via environment at build/run time (`runtimeConfig` reads `process.env`).
- Evidence: `.github/workflows/release.yml`, `nuxt.config.ts`, `docs/env.md`.

## Webhooks & Callbacks

**Incoming:**
- None detected (no webhook endpoints/routes in current repository).

**Outgoing:**
- None in application runtime besides direct HTTP polling/fetch to currency endpoints.
  - Evidence: `app/composables/useCurrency.ts`.

## Native Platform Integrations (Tauri)

- Shell execution capability (scoped command permissions) via Tauri shell plugin.
  - Evidence: `src-tauri/src/lib.rs` plugin registration, `src-tauri/capabilities/main.json` (`shell:allow-open`, `shell:allow-execute`), `app/modules/tauri.ts`.
- OS metadata access via Tauri OS plugin.
  - Evidence: `app/modules/tauri.ts`, `src-tauri/src/lib.rs`.
- Native notifications with runtime permission check/request in UI flow.
  - Evidence: `app/pages/notifications.vue`, `app/modules/tauri.ts`, `src-tauri/src/lib.rs`.

---

*Integration audit: 2026-03-11*
*Update when adding/removing external or native platform integrations*
