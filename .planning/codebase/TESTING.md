# Testing Patterns

**Analysis Date:** 2026-03-11

## Test Framework

**Runner:**
- Vitest 2.x (`"vitest": "^2.1.8"` in `package.json`).
- Config lives at root in `vitest.config.ts`.
- Test environment is browser-like `jsdom` with globals enabled (`vitest.config.ts`).
- Global setup file is `test/setup.ts` (`setupFiles: ["./test/setup.ts"]` in `vitest.config.ts`).

**Assertion Library:**
- Vitest built-in `expect` and matchers are used (`test/transactions.spec.ts`).
- Observed matcher usage includes `resolves.toBeUndefined()` and `rejects.toBeTruthy()` (`test/transactions.spec.ts`).

**Run Commands:**
```bash
pnpm test                   # Run test suite (Vitest CLI)
pnpm test -- --watch        # Watch mode via Vitest args
pnpm test -- test/transactions.spec.ts  # Single spec file
pnpm test:ui                # Vitest UI mode
pnpm type-check             # Nuxt/TS type validation alongside tests
pnpm lint                   # Lint/style validation alongside tests
```
Evidence: `package.json` scripts, `docs/testing.md`.

## Test File Organization

**Location:**
- Current automated tests are under a top-level `test/` directory (examples: `test/transactions.spec.ts`, `test/setup.ts`).
- No strong evidence of colocated `*.test.ts` near source modules in current tree.

**Naming:**
- Spec naming uses `*.spec.ts` (example: `test/transactions.spec.ts`).
- Setup uses descriptive utility naming (`test/setup.ts`).

**Structure:**
```text
test/
  setup.ts
  transactions.spec.ts
app/
  composables/
    useTransactions.ts   # source under test
```

## Test Structure

**Suite Organization:**
```ts
describe("useTransactions", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("crea transacción de venta y actualiza saldo", async () => {
		// arrange/act/assert compact style
	});
});
```
Evidence: `test/transactions.spec.ts`.

**Patterns:**
- `describe` + `it` style with behavior-focused test names in Spanish (`test/transactions.spec.ts`).
- `beforeEach` resets mocks (`vi.clearAllMocks()`) to isolate examples (`test/transactions.spec.ts`).
- Async assertions use `await expect(promise).resolves/...` and `rejects/...` pattern (`test/transactions.spec.ts`).

## Mocking

**Framework:**
- Vitest mocking API (`vi.mock`, `vi.fn`, `vi.clearAllMocks`) is standard (`test/transactions.spec.ts`).

**Patterns:**
```ts
vi.mock("~/composables/useDatabase", () => {
	const execute = vi.fn();
	const query = vi.fn();
	const transaction = async (cb: any) => cb({
		select: vi.fn().mockResolvedValue([{ id: "acc1", currency: "BS", is_active: 1 }]),
		execute: vi.fn().mockResolvedValue(undefined)
	});
	return { useDatabase: () => ({ query, execute, transaction }) };
});
```
Evidence: `test/transactions.spec.ts`.

**What to Mock:**
- Externalized DB composable dependencies are mocked for composable unit tests (`~/composables/useDatabase` in `test/transactions.spec.ts`).
- Transaction callback dependencies (`db.select`, `db.execute`) are mocked per test module.

**What NOT to Mock (current intent):**
- Core business behavior in the target composable is exercised directly (e.g., `createSaleTx`, `createExpenseTx` in `useTransactions`), while only DB boundary is stubbed (`test/transactions.spec.ts`).

## Fixtures and Factories

**Test Data:**
- No centralized fixtures/factories directory is established yet.
- Inline literals are used for focused test data (`{ accountId: "acc1", amount: 100, currency: "BS" }` in `test/transactions.spec.ts`).

**Location:**
- Fixtures are currently local to each test file (inlined in spec bodies).

## Coverage

**Requirements:**
- No explicit coverage threshold or CI gate is defined in `package.json` scripts or `vitest.config.ts`.

**Configuration:**
- No coverage reporter/threshold config currently present in `vitest.config.ts`.

**View Coverage:**
```bash
pnpm test -- --coverage
```
Note: this is Vitest CLI capability; project does not currently define a dedicated `test:coverage` script.

## Test Types

**Unit Tests:**
- Primary current type: composable-level tests with mocked dependencies (`test/transactions.spec.ts` against `app/composables/useTransactions.ts`).

**Integration Tests:**
- Integration-light behavior is validated within unit-style tests by exercising transaction callback flows in-memory (`test/transactions.spec.ts`).
- No dedicated integration test directory or naming convention is currently established.

**E2E Tests:**
- No Playwright/Cypress e2e framework or e2e directory found in current root file set.

## Common Patterns

**Async Testing:**
```ts
await expect(createSaleTx(input as any)).resolves.toBeUndefined();
await expect(createExpenseTx(input as any)).rejects.toBeTruthy();
```
Evidence: `test/transactions.spec.ts`.

**Error Testing:**
- Error cases are validated with rejection matchers rather than try/catch boilerplate (`test/transactions.spec.ts`).
- Domain validation errors are surfaced through thrown errors from source (`app/composables/useTransactions.ts`).

**Snapshot Testing:**
- Snapshot tests are not currently used in discovered test files.

---

*Testing analysis: 2026-03-11*
*Update when test patterns change*
