# Coding Conventions

**Analysis Date:** 2026-03-11

## Naming Patterns

**Files:**
- Vue SFC components use PascalCase filenames (examples: `app/components/ProductForm.vue`, `app/components/ReturnModal.vue`, `app/components/Site/Navbar.vue`).
- Composables use `useXxx.ts` camel-Pascal hybrid naming (examples: `app/composables/useProducts.ts`, `app/composables/useTransactions.ts`, `app/composables/useDatabase.ts`).
- Schema/domain modules use lowercase nouns per area (examples: `app/schemas/product.ts`, `app/database/schema/products.ts`, `app/database/schema/returns.ts`).
- Route pages are primarily kebab-case or semantic names, with Nuxt dynamic route syntax where needed (examples: `app/pages/cash-closing.vue`, `app/pages/consultar-productos.vue`, `app/pages/[...all].vue`).

**Functions:**
- Functions and methods use camelCase (examples: `loadProducts`, `findProductByBarcode`, `createSaleTx`, `runMigrations` in `app/composables/useProducts.ts`, `app/composables/useTransactions.ts`, `app/database/migrate.ts`).
- Composable entry points are named `useXxx` and export a function returning reactive state + operations (`app/composables/usePOS.ts`, `app/composables/useDatabase.ts`).
- Event handlers in Vue templates typically use `handleXxx` naming (`handleSubmit`, `handleSearch` in `app/components/ProductForm.vue`, `app/pages/pos.vue`).

**Variables:**
- Variables use camelCase (examples: `currentCurrency`, `discountAmount`, `formattedErrors`, `mobileItems` in `app/composables/usePOS.ts`, `app/schemas/product.ts`, `app/components/Site/Navbar.vue`).
- Constants that represent schemas/validators use PascalCase + `Schema` suffix (examples: `TransactionTypeSchema`, `CreateSaleTxSchema` in `app/composables/useTransactions.ts`).
- No underscore prefix convention for private variables is used in TypeScript/Vue modules.

**Types:**
- Interfaces and type aliases use PascalCase, no `I` prefix (examples: `Product`, `ProductFilters`, `TransactionRecord` in `app/composables/useProducts.ts`, `app/composables/useTransactions.ts`).
- Runtime schemas are paired with inferred TS types via `z.infer` (examples: `CreateSaleTxInput`, `CurrencyCode` in `app/composables/useTransactions.ts`; `Product` in `app/schemas/product.ts`).
- Drizzle schema files export inferred DB types with `NewXxx` and model names (examples: `NewProduct`, `Category` in `app/database/schema/products.ts`).

## Code Style

**Formatting:**
- ESLint is the canonical formatter/linter source via Antfu config (`eslint.config.mjs`).
- Indentation is tabs (`stylistic.indent: "tab"` and `style/indent: ["error", "tab"]` in `eslint.config.mjs`).
- String quotes are double quotes in TS/JS (`stylistic.quotes: "double"` in `eslint.config.mjs`; reflected in files like `app/composables/useDatabase.ts`, `vitest.config.ts`).
- Semicolons are required (`"style/semi": ["error", "always"]` in `eslint.config.mjs`).
- Trailing commas are discouraged (`"style/comma-dangle": ["warn", "never"]` in `eslint.config.mjs`).

**Linting:**
- Lint command is `pnpm lint` (`package.json` script: `eslint . --ext .js,.jsx,.ts,.tsx,.vue --fix`).
- `no-console` is intentionally disabled, and extensive `console.log/error/warn` is accepted in current code (`eslint.config.mjs`; examples in `app/composables/useProducts.ts`, `app/composables/useDatabase.ts`, `app/database/connection.ts`).
- Vue block ordering is enforced (`template`, `script`, `style`) via `vue/block-order` rule in `eslint.config.mjs`.

## Import Organization

**Order:**
1. External packages first (examples: `import { z } from "zod";` in `app/composables/useTransactions.ts`, `import { defineConfig } from "vitest/config";` in `vitest.config.ts`).
2. Internal alias imports (`~/` or `@/`) next when used (examples: `import { useTransactions } from "~/composables/useTransactions";` in `test/transactions.spec.ts`, CSS alias in `nuxt.config.ts`).
3. Relative imports (`./`) are common inside composable/schema layers (examples: `app/composables/useProducts.ts`, `app/database/schema/products.ts`).

**Grouping:**
- Typically one import per line, with occasional blank line separation between external and internal groups (example: `test/transactions.spec.ts`).
- Strict alphabetical sorting is not consistently applied (e.g., `app/composables/usePOS.ts` import order is semantic, not alphabetical).

**Path Aliases:**
- `~/` is used for app-root imports (examples: `test/transactions.spec.ts`, `app/database/migrate.ts`).
- `@/` is used in Nuxt config/module paths (example: `nuxt.config.ts` CSS and SVGO path config).
- Relative imports are preferred within closely related modules (`app/composables/useTransactions.ts`, `app/database/connection.ts`).

## Error Handling

**Patterns:**
- Business rule failures throw `Error` directly (examples: currency/account checks in `app/composables/useTransactions.ts`; empty cart check in `app/composables/usePOS.ts`).
- Operational boundaries catch errors, set reactive `error` state, and log details (examples: `loadProducts` in `app/composables/useProducts.ts`, `initialize/query/execute` in `app/composables/useDatabase.ts`).
- Database migration/init logic often continues on idempotent or non-critical failures after logging warnings (examples: `runMigrations` in `app/database/migrate.ts`; `initDatabase` in `app/database/connection.ts`).

**Error Types:**
- Custom error classes are not a project-wide pattern currently; plain `Error` and string messages are standard (`app/composables/useTransactions.ts`, `app/composables/usePOS.ts`).
- Form/schema validation uses Zod parse/safeParse with normalized error maps (`app/schemas/product.ts`).
- Expected idempotent DB failures are downgraded to warnings in some paths (`duplicate column`, `already exists` handling in `app/composables/useDatabase.ts`).

## Logging

**Framework:**
- Logging uses native console methods (`console.log`, `console.warn`, `console.error`) across frontend and DB utilities.
- No centralized structured logger (e.g., pino/winston) is configured in current source.

**Patterns:**
- Verbose progress/debug logs with emoji prefixes are common in core flows (examples: `app/composables/useProducts.ts`, `app/composables/useDatabase.ts`, `app/database/connection.ts`).
- Error paths generally log full error objects before rethrowing or returning (`app/composables/useDatabase.ts`, `app/database/connection.ts`).
- Logs are used at service/composable boundaries more than inside tiny pure helpers.

## Comments

**When to Comment:**
- Comments are used to mark section intent in Spanish (examples: `// Estado`, `// Cargar productos`, `// Inicializar base de datos` in `app/composables/useProducts.ts`, `app/composables/useDatabase.ts`).
- Inline comments explain business intent or migration intent (examples in `app/composables/usePOS.ts`, `app/database/migrate.ts`).

**JSDoc/TSDoc:**
- JSDoc/TSDoc is not a dominant convention in current TS code; section comments are preferred.

**TODO Comments:**
- No repository-wide formal TODO annotation pattern is evident from sampled core files.

## Function Design

**Size:**
- Functions can be medium/large in composables when they orchestrate UI + DB operations (`loadProducts` in `app/composables/useProducts.ts`, `runMigrations` in `app/database/migrate.ts`).
- Helper functions are extracted for repeated logic (examples: `formatZodErrors` in `app/schemas/product.ts`, `isSelectQuery` in `app/database/connection.ts`).

**Parameters:**
- Simple operations use positional parameters (`query(sql, params)` in `app/composables/useDatabase.ts`).
- More complex API methods use object parameters for extensibility (`listByAccount(params)` and `listByDateRange(params)` in `app/composables/useTransactions.ts`).

**Return Values:**
- Composables generally return a plain object exposing state refs/computed and methods (`useDatabase`, `useTransactions`, `usePOS`).
- Guard clauses are used early for invalid states (examples: `if (!acc) throw ...`, `if (cart.value.length === 0) throw ...` in `app/composables/useTransactions.ts`, `app/composables/usePOS.ts`).

## Module Design

**Exports:**
- Named exports are the default in TS modules (examples: `export function useTransactions`, `export const productSchema`, `export type CurrencyCode`).
- Vue SFCs rely on `<script setup>` and implicit default component export (`app/components/ProductForm.vue`, `app/pages/pos.vue`).

**Barrel Files:**
- DB schema uses a local barrel (`app/database/schema/index.ts` exists and is imported by `app/database/connection.ts`).
- Beyond schema, most domains import directly from source files instead of heavy barrel layering.

---

*Convention analysis: 2026-03-11*
*Update when patterns change*
