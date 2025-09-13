import { computed, readonly, ref } from "vue";
import { useDatabase } from "./useDatabase";

export interface Account {
	id: string
	tenantId: string
	name: string
	type: "cash" | "bank" | "credit" | "other"
	currency: "BS" | "USD" | "EUR"
	bankName?: string
	accountNumber?: string
	isActive: boolean
	balance: number
	minBalance: number
	maxBalance?: number
	createdAt: string
	updatedAt: string
}

export function useAccounts() {
	const { query, execute } = useDatabase();
	const accounts = ref<Account[]>([]);
	const isLoading = ref(false);
	const error = ref<string | null>(null);

	// Cargar todas las cuentas
	const loadAccounts = async () => {
		isLoading.value = true;
		error.value = null;

		try {
			const sql = "SELECT * FROM accounts WHERE tenant_id = ? ORDER BY name";
			const results = await query<any>(sql, ["default"]);

			accounts.value = results.map((row: any) => ({
				id: row.id,
				tenantId: row.tenant_id,
				name: row.name,
				type: row.type,
				currency: row.currency,
				bankName: row.bank_name,
				accountNumber: row.account_number,
				isActive: Boolean(row.is_active),
				balance: row.balance,
				minBalance: row.min_balance,
				maxBalance: row.max_balance,
				createdAt: row.created_at,
				updatedAt: row.updated_at
			}));

			console.log("✅ Cuentas cargadas:", accounts.value.length);
		} catch (err) {
			error.value = "Error al cargar cuentas";
			console.error("Error loading accounts:", err);
		} finally {
			isLoading.value = false;
		}
	};

	// Crear nueva cuenta
	const createAccount = async (accountData: Omit<Account, "id" | "tenantId" | "createdAt" | "updatedAt">) => {
		try {
			const id = `account_${accountData.type}_${accountData.currency.toLowerCase()}_${Date.now()}`;

			const sql = `
        INSERT INTO accounts 
        (id, tenant_id, name, type, currency, bank_name, account_number, is_active, balance, min_balance, max_balance, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
      `;

			await execute(sql, [
				id,
				"default",
				accountData.name,
				accountData.type,
				accountData.currency,
				accountData.bankName || null,
				accountData.accountNumber || null,
				accountData.isActive ? 1 : 0,
				accountData.balance,
				accountData.minBalance,
				accountData.maxBalance || null
			]);

			// Recargar cuentas
			await loadAccounts();

			console.log("✅ Cuenta creada:", accountData.name);
		} catch (err) {
			error.value = "Error al crear cuenta";
			console.error("Error creating account:", err);
		}
	};

	// Actualizar cuenta
	const updateAccount = async (id: string, updates: Partial<Account>) => {
		try {
			const setClause = [];
			const values = [];

			if (updates.name !== undefined) {
				setClause.push("name = ?");
				values.push(updates.name);
			}
			if (updates.type !== undefined) {
				setClause.push("type = ?");
				values.push(updates.type);
			}
			if (updates.currency !== undefined) {
				setClause.push("currency = ?");
				values.push(updates.currency);
			}
			if (updates.bankName !== undefined) {
				setClause.push("bank_name = ?");
				values.push(updates.bankName);
			}
			if (updates.accountNumber !== undefined) {
				setClause.push("account_number = ?");
				values.push(updates.accountNumber);
			}
			if (updates.isActive !== undefined) {
				setClause.push("is_active = ?");
				values.push(updates.isActive ? 1 : 0);
			}
			if (updates.balance !== undefined) {
				setClause.push("balance = ?");
				values.push(updates.balance);
			}
			if (updates.minBalance !== undefined) {
				setClause.push("min_balance = ?");
				values.push(updates.minBalance);
			}
			if (updates.maxBalance !== undefined) {
				setClause.push("max_balance = ?");
				values.push(updates.maxBalance);
			}

			setClause.push("updated_at = datetime(\"now\")");
			values.push(id);

			const sql = `UPDATE accounts SET ${setClause.join(", ")} WHERE id = ?`;
			await execute(sql, values);

			// Recargar cuentas
			await loadAccounts();

			console.log("✅ Cuenta actualizada:", id);
		} catch (err) {
			error.value = "Error al actualizar cuenta";
			console.error("Error updating account:", err);
		}
	};

	// Obtener cuenta por ID
	const getAccountById = (id: string) => {
		return accounts.value.find((account) => account.id === id);
	};

	// Obtener cuentas por tipo
	const getAccountsByType = (type: Account["type"]) => {
		return accounts.value.filter((account) => account.type === type);
	};

	// Obtener cuentas por moneda
	const getAccountsByCurrency = (currency: Account["currency"]) => {
		return accounts.value.filter((account) => account.currency === currency);
	};

	// Obtener cuentas activas
	const getActiveAccounts = computed(() => {
		return accounts.value.filter((account) => account.isActive);
	});

	// Obtener cuentas de efectivo
	const getCashAccounts = computed(() => {
		return accounts.value.filter((account) => account.type === "cash" && account.isActive);
	});

	// Obtener cuentas bancarias
	const getBankAccounts = computed(() => {
		return accounts.value.filter((account) => account.type === "bank" && account.isActive);
	});

	// Obtener saldo total por moneda
	const getTotalBalanceByCurrency = computed(() => {
		const totals: Record<string, number> = {};

		accounts.value.forEach((account) => {
			if (account.isActive) {
				totals[account.currency] = (totals[account.currency] || 0) + account.balance;
			}
		});

		return totals;
	});

	return {
		accounts: readonly(accounts),
		isLoading: readonly(isLoading),
		error: readonly(error),
		loadAccounts,
		createAccount,
		updateAccount,
		getAccountById,
		getAccountsByType,
		getAccountsByCurrency,
		getActiveAccounts,
		getCashAccounts,
		getBankAccounts,
		getTotalBalanceByCurrency
	};
}
