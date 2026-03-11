# Codebase Structure

**Analysis Date:** 2026-03-11

## Directory Layout

```
open-pos/
├── app/                    # Nuxt application source (UI, domain composables, DB client layer)
│   ├── components/         # Reusable Vue components (forms, layout elements, notifications)
│   ├── composables/        # Feature/domain logic (`usePOS`, `useDatabase`, etc.)
│   ├── database/           # SQLite/Drizzle connection and schema definitions
│   ├── layouts/            # Named Nuxt layouts (`default`, `home`, `pos`, `blank`)
│   ├── modules/            # Custom Nuxt module(s), including Tauri auto-import bridge
│   ├── pages/              # File-based routes (POS, products, inventory, returns, etc.)
│   ├── plugins/            # Client startup plugins (db/config/currency/user initialization)
│   └── schemas/            # Zod domain schemas
├── src-tauri/              # Tauri 2 Rust host project
│   ├── src/                # Rust entry points (`main.rs`, `lib.rs`)
│   ├── database/migrations/# SQL migrations for local SQLite lifecycle
│   ├── capabilities/       # Tauri capability/permission definitions
│   └── gen/schemas/        # Generated capability schemas
├── scripts/                # Utility and maintenance scripts (release, migrations, checks)
├── docs/                   # Canonical project docs and historical docs
├── public/                 # Static assets served by Nuxt (images, icons, screenshots)
├── test/                   # Vitest setup + integration specs
├── types/                  # Shared type declarations
├── .planning/codebase/     # Generated architectural/codebase reference docs
└── package.json            # Scripts, dependencies, and project metadata
```

## Directory Purposes

**`app/`:**
- Purpose: Main Nuxt frontend application and most business logic.
- Contains: `.vue` routes/components, `use*.ts` composables, DB bridge code, startup plugins.
- Key files: `app/app.vue`, `app/pages/pos.vue`, `app/composables/usePOS.ts`, `app/database/connection.ts`.
- Subdirectories: `components/`, `composables/`, `database/`, `layouts/`, `pages/`, `plugins/`, `schemas/`, `modules/`.

**`src-tauri/`:**
- Purpose: Native desktop wrapper runtime for the Nuxt app.
- Contains: Rust app bootstrap, tray/menu setup, plugin registration, and desktop config/migrations.
- Key files: `src-tauri/src/main.rs`, `src-tauri/src/lib.rs`, `src-tauri/tauri.conf.json`, `src-tauri/Cargo.toml`.
- Subdirectories: `src/`, `database/migrations/`, `capabilities/`, `gen/schemas/`, `icons/`.

**`docs/`:**
- Purpose: Canonical developer documentation and process guidance.
- Contains: architecture/structure/testing/database docs plus historical materials.
- Key files: `docs/CANONICAL-DOCS.md`, `docs/project-structure.md`, `docs/testing.md`, `docs/tauri.md`.
- Subdirectories: `old/` (historical/non-canonical docs).

**`scripts/`:**
- Purpose: Operational and maintenance scripts outside runtime app code.
- Contains: shell/Node/TS scripts for migrations, release checks, Linux prerequisite checks.
- Key files: `scripts/check-tauri-linux-prereqs.sh`, `scripts/test-semantic-release.js`, `scripts/update-version.ts`.
- Subdirectories: flat script set (no nested structure currently).

**`test/`:**
- Purpose: Automated test entry area.
- Contains: Vitest setup and scenario specs.
- Key files: `test/setup.ts`, `test/transactions.spec.ts`.
- Subdirectories: none currently.

**`types/`:**
- Purpose: Global/shared ambient type declarations.
- Contains: `.d.ts` declaration files.
- Key files: `types/global.d.ts`.
- Subdirectories: none currently.

## Key File Locations

**Entry Points:**
- `app/app.vue`: Nuxt app shell entry composing `UApp`, `NuxtLayout`, and `NuxtPage`.
- `src-tauri/src/main.rs`: Rust binary entry calling `nuxtor_lib::run()`.
- `src-tauri/src/lib.rs`: Tauri builder setup, tray/menu registration, plugin wiring.
- `package.json`: runtime entry scripts (`dev`, `tauri:dev`, `tauri:build`, `test`, `type-check`).

**Configuration:**
- `nuxt.config.ts`: Nuxt modules, client behavior, runtime config, Tauri dev-server integration.
- `src-tauri/tauri.conf.json`: desktop window/bundle settings, frontend bridge, SQL preload.
- `tsconfig.json` and `tsconfig.app.json`: TS project/compiler settings.
- `vitest.config.ts`: test runner config.
- `eslint.config.mjs`: lint rule composition.
- `drizzle.config.ts`: Drizzle migration/generation config.
- `env.example`: environment variable template.

**Core Logic:**
- `app/composables/`: feature logic (`usePOS.ts`, `useCashClosing.ts`, `useProducts.ts`, `useTransactions.ts`).
- `app/database/`: persistence (`connection.ts`, `schema/*.ts`, `migrate.ts`).
- `app/pages/`: operational screens (`pos.vue`, `inventory.vue`, `cash-closing.vue`, `returns.vue`).
- `app/plugins/`: startup bootstrapping (`database.client.ts`, `currency.client.ts`, `user.client.ts`).
- `app/modules/tauri.ts`: Tauri API auto-import adaptation into Nuxt.

**Testing:**
- `test/setup.ts`: Vitest setup/bootstrap.
- `test/transactions.spec.ts`: transaction-focused test coverage.

**Documentation:**
- `README.md`: project intro and operational commands.
- `docs/CANONICAL-DOCS.md`: canonical docs index.
- `docs/project-structure.md`: structure and conventions reference.
- `docs/testing.md`: testing commands and practices.

## Naming Conventions

**Files:**
- `PascalCase.vue` for components: `app/components/ProductForm.vue`, `app/components/ReturnModal.vue`.
- `use<Name>.ts` for composables: `app/composables/usePOS.ts`, `app/composables/useDatabase.ts`.
- `kebab-case.vue` for route files: `app/pages/cash-closing.vue`, `app/pages/consultar-productos.vue`.
- `*.client.ts` for client-only plugins: `app/plugins/database.client.ts`, `app/plugins/currency.client.ts`.
- `*.spec.ts` for tests: `test/transactions.spec.ts`.

**Directories:**
- Lowercase directory names with clear domain groupings: `app/composables`, `app/database`, `src-tauri/database/migrations`.
- Pluralized collection directories are standard: `components/`, `composables/`, `pages/`, `plugins/`, `schemas/`.

**Special Patterns:**
- Nuxt file-based routing under `app/pages/` including catch-all route `app/pages/[...all].vue`.
- DB schema split by entity in `app/database/schema/*.ts` plus aggregator `app/database/schema/index.ts`.
- Migration artifacts as ordered SQL files in `src-tauri/database/migrations/`.

## Where to Add New Code

**New Feature (POS/business workflow):**
- Primary code: `app/composables/` (new `useFeatureName.ts`) + relevant route in `app/pages/`.
- UI components: `app/components/` (feature-specific modal/form/list components).
- Tests: `test/` (new `*.spec.ts` aligned to feature behavior).
- Validation: `app/schemas/` when adding/adjusting domain inputs.

**New Component/Module:**
- Implementation: `app/components/` (PascalCase component file).
- Shared logic: `app/composables/` if stateful/reusable.
- Types: `types/` for global declarations or local interfaces in composable/component files.
- Tests: `test/` (component/composable behavior tests as needed).

**New Route/Command:**
- Route definition: add `.vue` under `app/pages/`.
- Route-level orchestration: use composables in `app/composables/`.
- Desktop/native behavior needed: extend Tauri host in `src-tauri/src/lib.rs` and config in `src-tauri/tauri.conf.json`.
- Tests: add route/composable assertions in `test/`.

**Utilities:**
- Frontend reusable helpers: colocate in `app/composables/` when they depend on Nuxt/Vue context.
- Project/tooling scripts: `scripts/` for standalone CLI maintenance tasks.
- DB evolution: SQL migration file in `src-tauri/database/migrations/` plus matching schema updates in `app/database/schema/`.

## Special Directories

**`.nuxt/`:**
- Purpose: Nuxt generated build/dev artifacts.
- Source: auto-generated by `nuxt dev`/`nuxt prepare`.
- Committed: No (`.gitignore`/build artifact behavior).

**`src-tauri/target/`:**
- Purpose: Rust/Tauri compilation output.
- Source: generated by Cargo/Tauri build commands.
- Committed: No (build artifacts).

**`.planning/codebase/`:**
- Purpose: generated codebase mapping docs for planning workflows.
- Source: maintained by mapping/planning agents and contributors.
- Committed: Yes (planning documentation).

**`docs/old/`:**
- Purpose: historical/legacy docs retained for reference.
- Source: prior project documentation versions.
- Committed: Yes, but treated as non-canonical per `README.md` and `docs/CANONICAL-DOCS.md`.

---

*Structure analysis: 2026-03-11*
*Update when directory structure changes*
