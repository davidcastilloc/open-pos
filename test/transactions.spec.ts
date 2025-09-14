import { beforeEach, describe, expect, it, vi } from "vitest";

// import { useTransactions } from "~/composables/useTransactions";

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

describe("useTransactions", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("crea transacción de venta y actualiza saldo", async () => {
		// TODO: Implementar useTransactions
		expect(true).toBe(true);
	});

	it("lanza error si moneda no coincide en egreso", async () => {
		// TODO: Implementar useTransactions
		expect(true).toBe(true);
	});
});
