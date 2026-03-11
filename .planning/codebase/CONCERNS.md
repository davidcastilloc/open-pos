# Codebase Concerns

**Analysis Date:** 2026-03-11

## Tech Debt

**Database initialization and migration strategy is split and conflicting:**
- Issue: Schema changes happen in three places: generated SQL migrations, runtime table creation/ALTERs, and ad-hoc migration helpers.
- Why: Features were added incrementally with compatibility patches instead of enforcing a single migration source.
- Impact: High risk of schema drift, inconsistent environments, and hard-to-reproduce startup behavior.
- Fix approach: Make `src-tauri/database/migrations/` the only schema authority; remove runtime DDL from app boot path and keep only migration runner + verification.
- Evidence: `src-tauri/database/migrations/0002_add_cash_closing_tables.sql`, `src-tauri/database/migrations/0002_inventory_movements.sql`, `src-tauri/database/migrations/0003_add_payment_method_to_transactions.sql`, `src-tauri/database/migrations/0003_add_tx_fields.sql`, `src-tauri/database/migrations/0008_add_users_table.sql`, `src-tauri/database/migrations/0008_strong_liz_osborn.sql`, `app/database/connection.ts:87`, `app/database/migrate.ts:10`, `docs/database.md:129`

**Type safety is intentionally bypassed in core data/UI flows:**
- Issue: Widespread `any` usage in composables/pages and broad result coercions.
- Why: Fast iteration with mixed raw SQL and evolving schemas.
- Impact: Silent runtime bugs, unsafe refactors, and weaker IDE/typecheck protections in critical money/data flows.
- Fix approach: Introduce typed query wrappers per table/use-case and enforce incremental `any` burn-down on high-risk modules (`usePOS`, `useReturns`, `useProducts`).
- Evidence: `app/pages/returns.vue:488`, `app/pages/products.vue:460`, `app/pages/pos.vue:714`, `app/composables/useReturns.ts:427`, `app/composables/useProducts.ts:68`, `app/composables/useDatabase.ts:34`

**Production code contains extensive debug logging and diagnostics noise:**
- Issue: Verbose logs (including SQL payloads and full object dumps) are embedded throughout runtime paths.
- Why: Troubleshooting was left in place after debugging sessions.
- Impact: Performance overhead, noisy telemetry, and leakage of operational/context data in logs.
- Fix approach: Gate debug logs behind environment flags and remove high-volume dumps from hot paths.
- Evidence: `app/composables/useProducts.ts:53`, `app/composables/useProducts.ts:131`, `app/composables/useProducts.ts:181`, `app/composables/useDatabase.ts:36`, `app/pages/pos.vue:838`

## Known Bugs

**Returns flow is functionally incomplete from UI actions:**
- Symptoms: Reject/complete actions show “pending feature” notifications and do not execute business flow.
- Trigger: User clicks reject or complete in returns screen.
- Workaround: None in UI; only approval path is wired.
- Root cause: TODO placeholders were left in handlers.
- Blocked by: Missing modal/forms for rejection reason and refund account selection.
- Evidence: `app/pages/returns.vue:628`, `app/pages/returns.vue:633`

**Internal diagnostic pages appear to rely on outdated `query` return shape:**
- Symptoms: Code treats `query(...)` results as arrays (`tables.length`, direct iteration) while documented contract is `{ rows }`.
- Trigger: Running route-level diagnostic actions in `/database-test` and `/test`.
- Workaround: Manually adjust scripts/page code per call site.
- Root cause: Mixed legacy/new contract usage after API normalization.
- Evidence: `app/composables/useDatabase.ts:34`, `docs/database.md:67`, `app/pages/database-test.vue:176`, `app/pages/database-test.vue:177`, `app/pages/test.vue:358`, `app/pages/test.vue:359`

## Security Considerations

**Arbitrary shell execution is exposed through a UI route plus permissive capability:**
- Risk: Command injection / full local command execution from app UI.
- Current mitigation: Regex validator `\S+` only ensures non-empty input, not command safety.
- Recommendations: Remove command UI from production build, disable `shell:allow-execute` for `sh -c`, and use allowlisted fixed commands only.
- Evidence: `app/pages/commands.vue:51`, `src-tauri/capabilities/main.json:20`, `src-tauri/capabilities/main.json:24`, `src-tauri/src/lib.rs:29`

**Desktop app disables CSP and grants broad capability surface:**
- Risk: Increased blast radius if any webview/XSS vulnerability occurs.
- Current mitigation: None visible in config (CSP is explicitly null).
- Recommendations: Enforce CSP, split capabilities by window role, and remove unneeded `core:webview:*` / `core:window:*` permissions.
- Evidence: `src-tauri/tauri.conf.json:54`, `src-tauri/tauri.conf.json:55`, `src-tauri/capabilities/main.json:48`, `src-tauri/capabilities/main.json:67`

**Authentication model is effectively default-admin bootstrap with weak credential semantics:**
- Risk: Privilege misuse and weak local access control.
- Current mitigation: None robust; default admin inserted with placeholder hash.
- Recommendations: Implement real login/session flow, hash+salt enforcement, first-run credential rotation, and route-level auth middleware.
- Evidence: `app/database/connection.ts:669`, `app/database/connection.ts:683`, `app/composables/useUser.ts:19`, `app/composables/useUser.ts:52`, `app/middleware/sidebar.global.ts:1`

## Performance Bottlenecks

**Every DB call opens/closes a new SQLite connection:**
- Problem: `query/execute/get` and Drizzle proxy repeatedly call `Database.load("sqlite:pos.db")` and close immediately.
- Measurement: No p95 instrumentation found in repo; architecture indicates avoidable connection churn on every operation.
- Cause: Connection lifecycle tied to each query helper invocation.
- Improvement path: Introduce shared pooled/singleton connection with scoped transaction ownership and explicit shutdown.
- Evidence: `app/composables/useDatabase.ts:37`, `app/composables/useDatabase.ts:39`, `app/composables/useDatabase.ts:52`, `app/database/connection.ts:30`, `app/database/connection.ts:53`

**Product loading path does heavy synchronous logging/stringification:**
- Problem: Serializing full product arrays and repeated diagnostic logs on each load.
- Measurement: No benchmark metrics committed; code does repeated `JSON.stringify(products.value)` and large console output.
- Cause: Debug instrumentation left in runtime path.
- Improvement path: Remove/guard logs and keep only concise error telemetry.
- Evidence: `app/composables/useProducts.ts:162`, `app/composables/useProducts.ts:181`, `app/composables/useProducts.ts:183`

## Fragile Areas

**Migration error handling explicitly continues on failure during startup:**
- Why fragile: Failed migrations do not stop initialization, enabling partially migrated runtime states.
- Common failures: Table/column mismatch, missing assumptions after silent migration errors.
- Safe modification: Fail fast on migration error in non-dev and add post-migration schema assertions.
- Test coverage: No migration integration tests found.
- Evidence: `app/database/migrate.ts:161`, `app/database/migrate.ts:164`, `test/transactions.spec.ts:1`

**Monolithic POS transaction flow combines multiple critical side effects in one function:**
- Why fragile: Sale insert, stock update, accounting movement, and customer history writes are tightly coupled in one block.
- Common failures: Partial business regressions when editing payment/account logic; high cognitive load for safe changes.
- Safe modification: Split into validated domain steps with contract tests around each side effect.
- Test coverage: No direct tests for `usePOS.processSale`.
- Evidence: `app/composables/usePOS.ts:196`, `app/composables/usePOS.ts:208`, `app/composables/usePOS.ts:244`, `app/composables/usePOS.ts:273`, `test/transactions.spec.ts:25`

## Scaling Limits

**Single-tenant assumptions are hardcoded across data layer:**
- Current capacity: Effectively one tenant (`default`) in active code paths.
- Limit: Multi-tenant isolation cannot be introduced safely without broad refactor.
- Symptoms at limit: Cross-tenant data mixing risk and inability to onboard multiple businesses cleanly.
- Scaling path: Introduce tenant context provider, enforce tenant scoping in query helpers, and migrate hardcoded literals.
- Evidence: `app/composables/useProducts.ts:68`, `app/composables/useCashClosingDB.ts:95`, `app/composables/useAccounts.ts:33`, `app/database/connection.ts:628`, `docs/ANALISIS-UNIFICADO-PRD.md:31`

**Local SQLite + desktop-only assumptions cap horizontal growth:**
- Current capacity: Local single-node storage with no implemented sync layer.
- Limit: No built-in replication/conflict strategy for multi-device or centralized SaaS operation.
- Symptoms at limit: Data divergence between devices and manual operational reconciliation.
- Scaling path: Add sync queue + conflict resolution + remote API contract before multi-device rollout.
- Evidence: `drizzle.config.ts:8`, `src-tauri/tauri.conf.json:39`, `docs/ANALISIS-UNIFICADO-PRD.md:31`, `docs/ISSUES-MILESTONES.md:57`

## Dependencies at Risk

**Local file dependency on external plugin path:**
- Risk: Build/install instability outside author’s local workspace (`../tauri-plugin-mcp`).
- Impact: CI or contributors may fail dependency resolution.
- Migration plan: Publish/consume versioned package or gate behind optional feature flag.
- Evidence: `package.json` (`"tauri-plugin-mcp": "file:../tauri-plugin-mcp"`)

**Cutting-edge runtime requirement narrows contributor/runtime compatibility:**
- Risk: Requiring Node `>=23` may reduce ecosystem compatibility and CI availability.
- Impact: Contributor setup friction and avoidable environment failures.
- Migration plan: Validate against active LTS and document strict rationale if bleeding-edge is required.
- Evidence: `package.json` (`"node": ">=23"`), `README.md:11`

## Missing Critical Features

**No real access-control boundary for sensitive utility routes:**
- Problem: Sensitive pages (`commands`, `database-test`, `test`, `webview`) are routable without auth middleware.
- Current workaround: Operational discipline only.
- Blocks: Secure production desktop distribution and least-privilege posture.
- Implementation complexity: Medium (route guards + build-time gating + capability pruning).
- Evidence: `app/pages/commands.vue:1`, `app/pages/database-test.vue:1`, `app/pages/test.vue:1`, `app/pages/webview.vue:1`, `app/middleware/sidebar.global.ts:1`

**PRD-critical deliverables remain pending in implemented product:**
- Problem: Ticket/printing, export workflows, and end-to-end closure audit are still listed as gaps.
- Current workaround: Manual processes outside system.
- Blocks: Operational completeness for many POS deployments.
- Implementation complexity: Medium to high depending on printer/export stack.
- Evidence: `docs/ANALISIS-UNIFICADO-PRD.md:44`, `docs/ANALISIS-UNIFICADO-PRD.md:88`, `docs/ISSUES-MILESTONES.md:16`, `docs/ISSUES-MILESTONES.md:26`, `docs/ISSUES-MILESTONES.md:35`

## Test Coverage Gaps

**Core business modules are mostly untested:**
- What's not tested: POS sale processing, returns lifecycle, migration safety, auth/role behaviors, shell/capability boundaries.
- Risk: Regressions in money movement, stock integrity, and security-sensitive behavior may ship unnoticed.
- Priority: High
- Difficulty to test: Medium; requires DB fixtures and transaction-aware integration tests.
- Evidence: `test/transactions.spec.ts:1`, `test/setup.ts:1`, `app/composables/usePOS.ts:196`, `app/composables/useReturns.ts:102`, `app/database/migrate.ts:3`

**Test suite breadth is currently minimal vs code surface:**
- What's not tested: Majority of 19 composables and 19 pages have no direct automated tests.
- Risk: UI/data workflow breakages during refactor are likely.
- Priority: High
- Difficulty to test: Medium-high due mixed raw SQL + UI interactions.
- Evidence: `app/composables/`, `app/pages/`, `test/`

---

*Concerns audit: 2026-03-11*
*Update as issues are fixed or new ones discovered*
