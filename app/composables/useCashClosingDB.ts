import { createId } from "@paralleldrive/cuid2";
import { useDatabase } from "~/composables/useDatabase";
import { runMigrations } from "~/database/migrate";

export interface CashSession {
	id: string
	tenant_id: string
	cashier_id: string
	cashier_name: string
	start_time: string
	end_time?: string
	initial_balances: string // JSON string
	status: string
	created_at: string
	updated_at: string
}

export interface CashClosing {
	id: string
	tenant_id: string
	session_id: string
	cashier_id: string
	cashier_name: string
	start_time: string
	end_time: string
	shift_duration: string
	initial_balances: string // JSON string
	final_balances: string // JSON string
	balance_differences: string // JSON string
	total_transactions: number
	sales_by_currency: string // JSON string
	sales_by_payment_method: string // JSON string
	total_sales_amount: number
	expenses: string // JSON string
	adjustments: string // JSON string
	observations?: string
	status: string
	audited_by?: string
	audited_at?: string
	created_at: string
	updated_at: string
}

export interface CashSessionData {
	cashierId: string
	cashierName: string
	initialBalances: Record<string, number>
}

export interface CashClosingDBData {
	sessionId: string
	cashierId: string
	cashierName: string
	startTime: Date
	endTime: Date
	shiftDuration: string
	initialBalances: Record<string, number>
	finalBalances: Record<string, number>
	balanceDifferences: Record<string, number>
	totalTransactions: number
	salesByCurrency: Record<string, number>
	salesByPaymentMethod: Record<string, number>
	totalSalesAmount: number
	expenses?: Record<string, number>
	adjustments?: Record<string, number>
	observations?: string
}

export interface CashReport {
	id: string
	tenant_id: string
	session_id: string
	cashier_id: string
	cashier_name: string
	report_type: string
	report_data: string // JSON string
	file_name?: string
	file_path?: string
	generated_at: string
	created_at: string
}

export interface CashReportData {
	sessionId: string
	cashierId: string
	cashierName: string
	reportType: string
	reportData: Record<string, any>
	fileName?: string
	filePath?: string
}

export function useCashClosingDB() {
	const { query, execute, get, initialize } = useDatabase();
	const tenantId = "default"; // Por ahora fijo, en el futuro se puede obtener del contexto de usuario

	// Inicializar base de datos si es necesario
	const ensureTablesExist = async () => {
		try {
			await initialize();
			await runMigrations();
		} catch (error) {
			console.error("Error initializing database:", error);
		}
	};

	// ===== SESIONES DE CAJA =====

	/**
	 * Crear una nueva sesión de caja
	 */
	const createCashSession = async (data: CashSessionData): Promise<CashSession> => {
		try {
			await ensureTablesExist();

			const id = createId();
			const now = new Date().toISOString();

			const sql = `
				INSERT INTO cash_sessions (
					id, tenant_id, cashier_id, cashier_name, 
					start_time, initial_balances, status, created_at, updated_at
				) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
			`;

			const params = [
				id,
				tenantId,
				data.cashierId,
				data.cashierName,
				now,
				JSON.stringify(data.initialBalances),
				"open",
				now,
				now
			];

			await execute(sql, params);

			// Devolver la sesión creada
			const createdSession = await get<CashSession>(
				"SELECT * FROM cash_sessions WHERE id = ?",
				[id]
			);

			if (!createdSession) {
				throw new Error("Error retrieving created session");
			}

			return createdSession;
		} catch (error) {
			console.error("Error creating cash session:", error);
			throw error;
		}
	};

	/**
	 * Obtener la sesión de caja activa
	 */
	const getActiveCashSession = async (): Promise<CashSession | null> => {
		try {
			await ensureTablesExist();
			const sql = `
				SELECT * FROM cash_sessions 
				WHERE tenant_id = ? AND status = ? 
				ORDER BY created_at DESC 
				LIMIT 1
			`;

			const session = await get<CashSession>(sql, [tenantId, "open"]);

			if (session) {
				// Debug: Verificar datos de la sesión (snake_case)
				console.log("Sesión recuperada de BD:", {
					id: session.id,
					start_time: session.start_time,
					start_time_type: typeof session.start_time,
					cashier_id: session.cashier_id,
					cashier_name: session.cashier_name
				});
			}

			return session || null;
		} catch (error) {
			console.error("Error getting active cash session:", error);
			return null;
		}
	};

	/**
	 * Cerrar una sesión de caja
	 */
	const closeCashSession = async (sessionId: string): Promise<boolean> => {
		try {
			const now = new Date().toISOString();
			const sql = `
				UPDATE cash_sessions 
				SET end_time = ?, status = ?, updated_at = ?
				WHERE id = ?
			`;

			await execute(sql, [now, "closed", now, sessionId]);
			return true;
		} catch (error) {
			console.error("Error closing cash session:", error);
			return false;
		}
	};

	/**
	 * Crear un nuevo cierre de caja
	 */
	const createCashClosing = async (data: CashClosingDBData): Promise<CashClosing> => {
		try {
			// Debug: Verificar datos recibidos
			console.log("Datos recibidos en createCashClosing:", {
				sessionId: data.sessionId,
				cashierId: data.cashierId,
				cashierName: data.cashierName,
				startTime: data.startTime,
				startTimeType: typeof data.startTime,
				endTime: data.endTime,
				endTimeType: typeof data.endTime
			});

			const id = createId();
			const now = new Date().toISOString();

			const sql = `
				INSERT INTO cash_closings (
					id, tenant_id, session_id, cashier_id, cashier_name,
					start_time, end_time, shift_duration,
					initial_balances, final_balances, balance_differences,
					total_transactions, sales_by_currency, sales_by_payment_method,
					total_sales_amount, expenses, adjustments, observations,
					status, created_at, updated_at
				) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
			`;

			// Validar fechas antes de convertir a ISO string
			if (!(data.startTime instanceof Date) || Number.isNaN(data.startTime.getTime())) {
				throw new TypeError(`startTime inválida: ${data.startTime}`);
			}
			if (!(data.endTime instanceof Date) || Number.isNaN(data.endTime.getTime())) {
				throw new TypeError(`endTime inválida: ${data.endTime}`);
			}

			const params = [
				id,
				tenantId,
				data.sessionId,
				data.cashierId,
				data.cashierName,
				data.startTime.toISOString(),
				data.endTime.toISOString(),
				data.shiftDuration,
				JSON.stringify(data.initialBalances),
				JSON.stringify(data.finalBalances),
				JSON.stringify(data.balanceDifferences),
				data.totalTransactions,
				JSON.stringify(data.salesByCurrency),
				JSON.stringify(data.salesByPaymentMethod),
				data.totalSalesAmount,
				JSON.stringify(data.expenses || {}),
				JSON.stringify(data.adjustments || {}),
				data.observations,
				"closed",
				now,
				now
			];

			await execute(sql, params);

			// Devolver el cierre creado
			const createdClosing = await get<CashClosing>(
				"SELECT * FROM cash_closings WHERE id = ?",
				[id]
			);

			if (!createdClosing) {
				throw new Error("Error retrieving created closing");
			}

			return createdClosing;
		} catch (error) {
			console.error("Error creating cash closing:", error);
			throw error;
		}
	};

	/**
	 * Verificar si hay una sesión de caja abierta
	 */
	const hasActiveCashSession = async (): Promise<boolean> => {
		const session = await getActiveCashSession();
		return session !== null;
	};

	// ===== REPORTES =====

	/**
	 * Crear un nuevo reporte
	 */
	const createCashReport = async (data: CashReportData): Promise<CashReport> => {
		try {
			await ensureTablesExist();

			// Debug: Verificar datos recibidos
			console.log("Datos recibidos en createCashReport:", {
				sessionId: data.sessionId,
				cashierId: data.cashierId,
				cashierName: data.cashierName,
				reportType: data.reportType
			});

			// Validar datos requeridos
			if (!data.sessionId) {
				throw new Error("sessionId es requerido");
			}
			if (!data.cashierId) {
				throw new Error("cashierId es requerido");
			}
			if (!data.cashierName) {
				throw new Error("cashierName es requerido");
			}

			const id = createId();
			const now = new Date().toISOString();

			const sql = `
				INSERT INTO cash_reports (
					id, tenant_id, session_id, cashier_id, cashier_name,
					report_type, report_data, file_name, file_path,
					generated_at, created_at
				) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
			`;

			const params = [
				id,
				tenantId,
				data.sessionId,
				data.cashierId,
				data.cashierName,
				data.reportType,
				JSON.stringify(data.reportData),
				data.fileName,
				data.filePath,
				now,
				now
			];

			console.log("Ejecutando SQL con parámetros:", params);
			await execute(sql, params);

			// Devolver el reporte creado
			const createdReport = await get<CashReport>(
				"SELECT * FROM cash_reports WHERE id = ?",
				[id]
			);

			if (!createdReport) {
				throw new Error("Error retrieving created report");
			}

			return createdReport;
		} catch (error) {
			console.error("Error creating cash report:", error);
			throw error;
		}
	};

	/**
	 * Obtener reportes por sesión
	 */
	const getReportsBySession = async (sessionId: string): Promise<CashReport[]> => {
		try {
			await ensureTablesExist();

			const sql = `
				SELECT * FROM cash_reports 
				WHERE session_id = ? 
				ORDER BY generated_at DESC
			`;

			const reports = await query<CashReport>(sql, [sessionId]);
			return reports;
		} catch (error) {
			console.error("Error getting reports by session:", error);
			return [];
		}
	};

	/**
	 * Obtener reportes por cajero
	 */
	const getReportsByCashier = async (cashierId: string, limit = 50): Promise<CashReport[]> => {
		try {
			await ensureTablesExist();

			const sql = `
				SELECT * FROM cash_reports 
				WHERE cashier_id = ? 
				ORDER BY generated_at DESC 
				LIMIT ?
			`;

			const reports = await query<CashReport>(sql, [cashierId, limit]);
			return reports;
		} catch (error) {
			console.error("Error getting reports by cashier:", error);
			return [];
		}
	};

	/**
	 * Parsear datos JSON de la base de datos
	 */
	const parseJsonField = <T>(jsonString: string | null, fallback: T): T => {
		if (!jsonString) return fallback;
		try {
			return JSON.parse(jsonString) as T;
		} catch (error) {
			console.error("Error parsing JSON field:", error);
			return fallback;
		}
	};

	return {
		// Inicialización
		ensureTablesExist,

		// Sesiones de caja
		createCashSession,
		getActiveCashSession,
		closeCashSession,
		hasActiveCashSession,

		// Cierres de caja
		createCashClosing,

		// Reportes
		createCashReport,
		getReportsBySession,
		getReportsByCashier,

		// Utilidades
		parseJsonField
	};
}
