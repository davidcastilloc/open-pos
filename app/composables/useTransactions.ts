import { z } from "zod";
import { useDatabase } from "./useDatabase";
import { mapPaymentMethodToBackend } from "./usePaymentMethods";

// Tipos y validaciones
export const TransactionTypeSchema = z.enum(["sale", "expense", "transfer", "adjustment"]);
export type TransactionType = z.infer<typeof TransactionTypeSchema>;

export const CurrencySchema = z.enum(["BS", "USD", "EUR"]);
export type CurrencyCode = z.infer<typeof CurrencySchema>;

const baseTxInput = {
	accountId: z.string().min(1),
	amount: z.number().positive(),
	currency: CurrencySchema,
	reference: z.string().optional(),
	description: z.string().optional(),
	exchangeRate: z.number().positive().optional(),
	cashierId: z.string().optional(),
	paymentMethod: z.string().optional()
};

export const CreateSaleTxSchema = z.object({
	...baseTxInput,
	type: z.literal("sale")
});
export type CreateSaleTxInput = z.infer<typeof CreateSaleTxSchema>;

export const CreateExpenseTxSchema = z.object({
	...baseTxInput,
	type: z.literal("expense")
});
export type CreateExpenseTxInput = z.infer<typeof CreateExpenseTxSchema>;

export interface TransactionRecord {
	id: string
	tenantId: string
	accountId: string
	type: TransactionType
	amount: number
	currency: CurrencyCode
	exchangeRate?: number | null
	reference?: string | null
	description?: string | null
	cashier_id?: string | null
	payment_method?: string | null
	createdAt: string
}

export function useTransactions() {
	const { query, transaction } = useDatabase();

	// Crear transacción de venta y actualizar saldo (+amount)
	const createSaleTx = async (input: CreateSaleTxInput) => {
		const parsed = CreateSaleTxSchema.parse(input);

		await transaction(async (db) => {
			// Validar cuenta activa
			const account = await db.select("SELECT * FROM accounts WHERE id = ? AND is_active = 1", [parsed.accountId]);
			const acc = account[0];
			if (!acc) throw new Error("Cuenta no encontrada o inactiva");

			// Validar moneda (MVP: debe coincidir)
			if (acc.currency !== parsed.currency) {
				throw new Error(`La moneda del pago (${parsed.currency}) no coincide con la cuenta (${acc.currency})`);
			}

			const id = `tx_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
			const backendPaymentMethod = parsed.paymentMethod ? mapPaymentMethodToBackend(parsed.paymentMethod) : null;
			await db.execute(
				`INSERT INTO transactions (id, tenant_id, account_id, type, amount, currency, exchange_rate, reference, description, cashier_id, payment_method, created_at)
				 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
				[
					id,
					"default",
					parsed.accountId,
					"sale",
					parsed.amount,
					parsed.currency,
					parsed.exchangeRate ?? null,
					parsed.reference ?? null,
					parsed.description ?? null,
					parsed.cashierId ?? null,
					backendPaymentMethod
				]
			);

			// Actualizar saldo (+)
			await db.execute("UPDATE accounts SET balance = balance + ?, updated_at = datetime('now') WHERE id = ?", [parsed.amount, parsed.accountId]);
		});
	};

	// Crear transacción de egreso y actualizar saldo (-amount)
	const createExpenseTx = async (input: CreateExpenseTxInput) => {
		const parsed = CreateExpenseTxSchema.parse(input);

		await transaction(async (db) => {
			const account = await db.select("SELECT * FROM accounts WHERE id = ? AND is_active = 1", [parsed.accountId]);
			const acc = account[0];
			if (!acc) throw new Error("Cuenta no encontrada o inactiva");
			if (acc.currency !== parsed.currency) {
				throw new Error(`La moneda del egreso (${parsed.currency}) no coincide con la cuenta (${acc.currency})`);
			}

			const id = `tx_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
			const backendPaymentMethod = parsed.paymentMethod ? mapPaymentMethodToBackend(parsed.paymentMethod) : null;
			await db.execute(
				`INSERT INTO transactions (id, tenant_id, account_id, type, amount, currency, exchange_rate, reference, description, cashier_id, payment_method, created_at)
				 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
				[
					id,
					"default",
					parsed.accountId,
					"expense",
					parsed.amount,
					parsed.currency,
					parsed.exchangeRate ?? null,
					parsed.reference ?? null,
					parsed.description ?? null,
					parsed.cashierId ?? null,
					backendPaymentMethod
				]
			);

			// Actualizar saldo (-)
			await db.execute("UPDATE accounts SET balance = balance - ?, updated_at = datetime('now') WHERE id = ?", [parsed.amount, parsed.accountId]);
		});
	};

	// Listar transacciones por cuenta y rango de fechas opcional
	const listByAccount = async (params: { accountId: string, from?: string, to?: string, types?: TransactionType[] }) => {
		const clauses: string[] = ["account_id = ?"];
		const values: any[] = [params.accountId];
		if (params.from) {
			clauses.push("created_at >= ?");
			values.push(params.from);
		}
		if (params.to) {
			clauses.push("created_at <= ?");
			values.push(params.to);
		}
		if (params.types && params.types.length > 0) {
			clauses.push(`type IN (${params.types.map(() => "?").join(", ")})`);
			values.push(...params.types);
		}

		const sql = `SELECT * FROM transactions WHERE ${clauses.join(" AND ")} ORDER BY created_at ASC`;
		const rows = await query<TransactionRecord>(sql, values);
		return rows;
	};

	// Listar transacciones por rango de fechas opcionalmente filtradas por cajero y tipo
	const listByDateRange = async (params: { from?: string, to?: string, types?: TransactionType[], cashierId?: string }) => {
		const clauses: string[] = [];
		const values: any[] = [];
		if (params.from) {
			clauses.push("created_at >= ?");
			values.push(params.from);
		}
		if (params.to) {
			clauses.push("created_at <= ?");
			values.push(params.to);
		}
		if (params.types && params.types.length > 0) {
			clauses.push(`type IN (${params.types.map(() => "?").join(", ")})`);
			values.push(...params.types);
		}
		if (params.cashierId) {
			clauses.push("cashier_id = ?");
			values.push(params.cashierId);
		}
		const where = clauses.length > 0 ? `WHERE ${clauses.join(" AND ")}` : "";
		const sql = `SELECT * FROM transactions ${where} ORDER BY created_at ASC`;
		const rows = await query<TransactionRecord>(sql, values);
		return rows;
	};

	// Listar transacciones de "hoy" según zona local
	const listToday = async (params?: { cashierId?: string }) => {
		const clauses: string[] = ["date(created_at, 'localtime') = date('now', 'localtime')"];
		const values: any[] = [];
		if (params?.cashierId) {
			clauses.push("cashier_id = ?");
			values.push(params.cashierId);
		}
		const sql = `SELECT * FROM transactions WHERE ${clauses.join(" AND ")} ORDER BY created_at ASC`;
		return await query<TransactionRecord>(sql, values);
	};

	// Listar ventas de "hoy"
	const listTodaySales = async (params?: { cashierId?: string }) => {
		const clauses: string[] = [
			"date(created_at, 'localtime') = date('now', 'localtime')",
			"type = 'sale'"
		];
		const values: any[] = [];
		if (params?.cashierId) {
			clauses.push("cashier_id = ?");
			values.push(params.cashierId);
		}
		const sql = `SELECT * FROM transactions WHERE ${clauses.join(" AND ")} ORDER BY created_at ASC`;
		return await query<TransactionRecord>(sql, values);
	};

	return {
		createSaleTx,
		createExpenseTx,
		listByAccount,
		listByDateRange,
		listToday,
		listTodaySales
	};
}
