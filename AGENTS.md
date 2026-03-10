# Repository Guidelines

## Product Scope and Current State
This repository is an open POS system for Venezuela built with Nuxt 4, Vue 3, Tauri 2, Drizzle ORM, SQLite, and Zod. The current implemented core includes POS sales flow, product and inventory management, customer management, cash opening/closing, returns, multi-currency support (`BS`, `USD`, `EUR`), user roles, and in-app notifications. According to the project analysis docs, cloud sync, advanced analytics, multi-branch SaaS features, external payment SaaS integrations, and AI features are still pending and should not be described as complete.

Primary documentation lives in `README.md` and `docs/`. The most relevant references are:
- `docs/project-structure.md`
- `docs/database.md`
- `docs/testing.md`
- `docs/ui-guidelines.md`
- `docs/tauri.md`
- `docs/versioning.md`
- `ESTADO-ACTUAL-PROYECTO.md`
- `ANALISIS-PRD-vs-ESTADO.md`

## Local Agent Skills
All agents working in this repository must check the local skills under `.agents/skills/` before starting substantial UI, UX, content, or frontend quality work. These skills are repository-local guidance and take priority over generic style instincts.

Use the matching local skill when the task fits:
- `adapt`: responsive behavior, cross-device or cross-context adaptation
- `animate`: motion and micro-interactions
- `audit`: interface quality audits
- `bolder` / `quieter`: visual intensity adjustments
- `clarify`: UX copy and messaging
- `colorize`: color strategy improvements
- `critique`: UX/design evaluation
- `distill`: simplify and reduce complexity
- `extract`: pull reusable patterns/components from existing UI
- `frontend-design`: core frontend design principles and anti-patterns
- `harden`: edge cases, overflow, resilience, i18n
- `normalize`: align work to the design system
- `onboard`: onboarding and first-run UX
- `optimize`: frontend performance
- `polish`: final detail pass
- `teach-impeccable`: one-time design context capture

Do not claim these skills were used unless you actually opened the corresponding `.agents/skills/<name>/SKILL.md` and followed it. When multiple skills apply, use the minimum relevant set and prefer `.agents/skills` over external skill collections for frontend-facing work.

## Project Structure & Module Organization
The Nuxt app lives in `app/`: pages in `app/pages`, shared UI in `app/components`, reusable logic in `app/composables`, plugins in `app/plugins`, Zod schemas in `app/schemas`, and Drizzle schema plus DB helpers in `app/database`. Static assets are under `app/assets` and `public/`. The desktop shell is in `src-tauri/`, with Rust code in `src-tauri/src`, capabilities in `src-tauri/capabilities`, and SQL migrations in `src-tauri/database/migrations`. Tests live in `test/`.

Follow existing naming patterns: `PascalCase.vue` for components, `useX.ts` for composables, and domain files such as `products.ts`, `customers.ts`, `returns.ts`.

## Build, Test, and Development Commands
Use `pnpm` only; the repo blocks other package managers.

- `pnpm install`: install dependencies and run Nuxt preparation.
- `pnpm dev`: run the web app locally.
- `pnpm tauri:dev`: run the desktop app with Tauri.
- `pnpm lint`: run ESLint with autofix.
- `pnpm type-check`: run Nuxt type checking.
- `pnpm test` and `pnpm test:ui`: run Vitest.
- `pnpm db:generate`, `pnpm db:migrate`, `pnpm db:studio`: manage Drizzle migrations and inspect the database.
- `pnpm generate`: generate the Nuxt output.
- `pnpm tauri:build` or `pnpm tauri:build:debug`: build desktop binaries.
- `pnpm test:semantic-release`: validate release automation locally.

## Coding Style & UI Rules
TypeScript is strict, ESM-only, and `any` should be avoided. ESLint enforces tabs, double quotes, semicolons, and `template` -> `script` -> `style` block order in Vue SFCs. Prefer Composition API with `<script setup lang="ts">` and `async/await`.

UI rules are stricter than the typical Nuxt app:
- Do not use explicit Tailwind colors such as `text-gray-900`, `bg-white`, or `text-red-600`.
- Use semantic Nuxt UI colors only where supported: `primary`, `secondary`, `success`, `warning`, `error`, `info`, `neutral`.
- For modal work, always use `v-model:open`, wrap content in `<template #content>`, and place a `UCard` inside.

## Database, Tauri, and Configuration
Database changes must keep `app/database/schema/` and `src-tauri/database/migrations/` in sync. Avoid manual SQL edits unless the migration system requires a compatibility fix. `useDatabase` is the shared access layer and should remain the main integration point for CRUD and transactions.

Encapsulate Tauri APIs behind Nuxt composables or modules instead of scattering direct plugin calls through pages. If a change affects permissions, review `src-tauri/capabilities/main.json` and generated schemas under `src-tauri/gen/schemas/`.

Start local configuration from `env.example`. Never commit secrets, local SQLite files, or generated build artifacts.

## Testing, Commits, and Pull Requests
Vitest uses `jsdom` with shared setup from `test/setup.ts`. Add specs under `test/*.spec.ts`, and prefer covering critical business logic such as sales, inventory movements, returns, cash closing, and currency conversion. For composables, test both valid and invalid flows.

Commits must follow Conventional Commits because `semantic-release` drives versioning and changelogs: `feat(scope): ...`, `fix(scope): ...`, `docs(scope): ...`, `refactor(scope): ...`, `test(scope): ...`, `chore(scope): ...`, `build(scope): ...`, `ci(scope): ...`. For pull requests, include a clear summary, linked issue when applicable, and screenshots for UI or Tauri workflow changes. Run `pnpm lint`, `pnpm type-check`, and `pnpm test` before opening the PR.
