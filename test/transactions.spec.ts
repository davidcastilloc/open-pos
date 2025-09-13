import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("~/composables/useDatabase", () => {
	const execute = vi.fn();
	const query = vi.fn();
	const transaction = async (cb: any) => {
		const db = {
			select: vi.fn().mockResolvedValue([{ id: "acc1", currency: "BS", is_active: 1 }]),
			execute: vi.fn().mockResolvedValue(undefined)
		};
		return cb(db);
	};
	return {
		useDatabase: () => ({ query, execute, transaction })
	};
});

import { useTransactions } from "~/composables/useTransactions";

describe("useTransactions", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("crea transacción de venta y actualiza saldo", async () => {
		const { createSaleTx } = useTransactions();
		await expect(createSaleTx({
			type: "sale",
			accountId: "acc1",
			amount: 100,
			currency: "BS",
			reference: "sale_1"
		} as any)).resolves.toBeUndefined();
	});

	it("lanza error si moneda no coincide en egreso", async () => {
		const { createExpenseTx } = useTransactions();
		await expect(createExpenseTx({
			type: "expense",
			accountId: "acc1",
			amount: 50,
			currency: "USD"
		} as any)).rejects.toBeTruthy();
	});
});

