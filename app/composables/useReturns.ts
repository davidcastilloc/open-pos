import type {
	Return,
	ReturnItem,
	ReturnStatusHistory,
	ReturnStatusValue
} from "~/database/schema/returns";
import { z } from "zod";
import { useDatabase } from "./useDatabase";
import { useInventoryMovements } from "./useInventoryMovements";
import { useNotifications } from "./useNotifications";
import { useTransactions } from "./useTransactions";
import { useUser } from "./useUser";

// Esquemas de validación
export const ReturnTypeSchema = z.enum(["partial", "total"]);
export const ReturnStatusSchema = z.enum(["pending", "approved", "rejected", "completed"]);

export const CreateReturnSchema = z.object({
	originalSaleId: z.string().min(1),
	customerId: z.string().optional(),
	returnType: ReturnTypeSchema,
	reason: z.string().min(1),
	items: z.array(z.object({
		originalSaleItemId: z.string().min(1),
		productId: z.string().min(1),
		quantity: z.number().positive(),
		originalQuantity: z.number().positive(),
		price: z.number().positive(),
		reason: z.string().optional()
	})),
	notes: z.string().optional()
});

export const UpdateReturnStatusSchema = z.object({
	returnId: z.string().min(1),
	newStatus: ReturnStatusSchema,
	reason: z.string().optional(),
	notes: z.string().optional()
});

export type CreateReturnInput = z.infer<typeof CreateReturnSchema>;
export type UpdateReturnStatusInput = z.infer<typeof UpdateReturnStatusSchema>;

// Interfaz para items de devolución con información del producto
export interface ReturnItemWithProduct extends ReturnItem {
	productName: string
	productSku: string
	originalSaleItemTotal: number
}

// Interfaz para devolución completa con items y historial
export interface ReturnWithDetails extends Return {
	items: ReturnItemWithProduct[]
	statusHistory: ReturnStatusHistory[]
	originalSale: {
		id: string
		total: number
		currency: string
		createdAt: string
		customerName?: string
	}
}

export function useReturns() {
	const { query, transaction } = useDatabase();
	const { createExpenseTx } = useTransactions();
	const { getCashierInfo } = useUser();
	const notifications = useNotifications();
	const { createMovement } = useInventoryMovements();

	// Crear una nueva devolución
	const createReturn = async (input: CreateReturnInput) => {
		const parsed = CreateReturnSchema.parse(input);
		const cashierId = getCashierInfo.value.cashierId;

		if (!cashierId) {
			throw new Error("No hay información de cajero disponible");
		}

		// Validar que la venta original existe
		const originalSale = await query<any>(
			`SELECT s.*, c.name as customer_name 
			 FROM sales s 
			 LEFT JOIN customers c ON s.customer_id = c.id 
			 WHERE s.id = ?`,
			[parsed.originalSaleId]
		);

		if (!originalSale.rows || originalSale.rows.length === 0) {
			throw new Error("Venta original no encontrada");
		}

		const saleData = originalSale.rows[0];

		// Calcular totales de la devolución
		const subtotal = parsed.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
		const tax = subtotal * 0.18; // IVA 16% + ISLR 2%
		const total = subtotal + tax;

		const returnId = `return_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

		await transaction(async (db) => {
			// Crear la devolución principal
			await db.execute(
				`INSERT INTO returns 
				 (id, tenant_id, original_sale_id, customer_id, return_type, reason, status, 
				  subtotal, tax, discount, total, currency, cashier_id, notes, created_at, updated_at)
				 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
				[
					returnId,
					"default",
					parsed.originalSaleId,
					parsed.customerId || saleData.customer_id,
					parsed.returnType,
					parsed.reason,
					"pending",
					subtotal,
					tax,
					0,
					total,
					saleData.currency || "BS",
					cashierId,
					parsed.notes || null
				]
			);

			// Crear items de devolución
			for (const item of parsed.items) {
				const itemId = `return_item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
				await db.execute(
					`INSERT INTO return_items 
					 (id, return_id, original_sale_item_id, product_id, quantity, original_quantity, 
					  price, total, reason, created_at)
					 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
					[
						itemId,
						returnId,
						item.originalSaleItemId,
						item.productId,
						item.quantity,
						item.originalQuantity,
						item.price,
						item.price * item.quantity,
						item.reason || null
					]
				);
			}

			// Registrar cambio de estado inicial
			await db.execute(
				`INSERT INTO return_status_history 
				 (id, return_id, new_status, changed_by, reason, created_at)
				 VALUES (?, ?, ?, ?, ?, datetime('now'))`,
				[
					`status_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
					returnId,
					"pending",
					cashierId,
					"Devolución creada",
					"now"
				]
			);
		});

		notifications.success("Devolución creada", "La devolución ha sido registrada y está pendiente de aprobación");
		return returnId;
	};

	// Aprobar una devolución
	const approveReturn = async (returnId: string, reason?: string) => {
		const cashierId = getCashierInfo.value.cashierId;

		if (!cashierId) {
			throw new Error("No hay información de cajero disponible");
		}

		await transaction(async (db) => {
			// Obtener datos de la devolución
			const returnData = await query<any>(
				`SELECT r.*, s.currency, s.payment_method, s.cashier_id as original_cashier_id
				 FROM returns r
				 JOIN sales s ON r.original_sale_id = s.id
				 WHERE r.id = ?`,
				[returnId]
			);

			if (!returnData.rows || returnData.rows.length === 0) {
				throw new Error("Devolución no encontrada");
			}

			const returnInfo = returnData.rows[0];

			// Obtener items de la devolución
			const items = await query<any>(
				`SELECT ri.*, p.name as product_name, p.sku as product_sku
				 FROM return_items ri
				 JOIN products p ON ri.product_id = p.id
				 WHERE ri.return_id = ?`,
				[returnId]
			);

			// Actualizar estado de la devolución
			await db.execute(
				`UPDATE returns 
				 SET status = 'approved', authorized_by = ?, authorized_at = datetime('now'), 
				     updated_at = datetime('now')
				 WHERE id = ?`,
				[cashierId, returnId]
			);

			// Registrar cambio de estado
			await db.execute(
				`INSERT INTO return_status_history 
				 (id, return_id, previous_status, new_status, changed_by, reason, created_at)
				 VALUES (?, ?, ?, ?, ?, ?, datetime('now'))`,
				[
					`status_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
					returnId,
					"pending",
					"approved",
					cashierId,
					reason || "Devolución aprobada"
				]
			);

			// Procesar devolución de stock
			for (const item of items.rows) {
				await createMovement({
					type: "return",
					productId: item.product_id,
					quantity: item.quantity,
					reason: `Devolución de venta ${returnInfo.original_sale_id}`,
					reference: returnId
				});
			}
		});

		notifications.success("Devolución aprobada", "La devolución ha sido aprobada y el stock ha sido restaurado");
	};

	// Completar una devolución (procesar reembolso)
	const completeReturn = async (returnId: string, paymentAccountId: string) => {
		const cashierId = getCashierInfo.value.cashierId;

		if (!cashierId) {
			throw new Error("No hay información de cajero disponible");
		}

		await transaction(async (db) => {
			// Obtener datos de la devolución
			const returnData = await query<any>(
				`SELECT r.*, s.currency, s.payment_method
				 FROM returns r
				 JOIN sales s ON r.original_sale_id = s.id
				 WHERE r.id = ? AND r.status = 'approved'`,
				[returnId]
			);

			if (!returnData.rows || returnData.rows.length === 0) {
				throw new Error("Devolución no encontrada o no aprobada");
			}

			const returnInfo = returnData.rows[0];

			// Crear transacción contable de reembolso
			const txId = `tx_return_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

			await createExpenseTx({
				type: "expense",
				accountId: paymentAccountId,
				amount: returnInfo.total,
				currency: returnInfo.currency,
				description: `Reembolso devolución ${returnId}`,
				reference: returnId
			});

			// Registrar transacción de devolución
			await db.execute(
				`INSERT INTO return_transactions 
				 (id, return_id, transaction_id, account_id, amount, currency, description, created_at)
				 VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
				[
					`rt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
					returnId,
					txId,
					paymentAccountId,
					returnInfo.total,
					returnInfo.currency,
					`Reembolso devolución ${returnId}`
				]
			);

			// Actualizar estado a completado
			await db.execute(
				`UPDATE returns 
				 SET status = 'completed', completed_at = datetime('now'), updated_at = datetime('now')
				 WHERE id = ?`,
				[returnId]
			);

			// Registrar cambio de estado
			await db.execute(
				`INSERT INTO return_status_history 
				 (id, return_id, previous_status, new_status, changed_by, reason, created_at)
				 VALUES (?, ?, ?, ?, ?, ?, datetime('now'))`,
				[
					`status_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
					returnId,
					"approved",
					"completed",
					cashierId,
					"Devolución completada y reembolsada"
				]
			);
		});

		notifications.success("Devolución completada", "La devolución ha sido procesada y el reembolso realizado");
	};

	// Rechazar una devolución
	const rejectReturn = async (returnId: string, reason: string) => {
		const cashierId = getCashierInfo.value.cashierId;

		if (!cashierId) {
			throw new Error("No hay información de cajero disponible");
		}

		await transaction(async (db) => {
			// Actualizar estado
			await db.execute(
				`UPDATE returns 
				 SET status = 'rejected', updated_at = datetime('now')
				 WHERE id = ?`,
				[returnId]
			);

			// Registrar cambio de estado
			await db.execute(
				`INSERT INTO return_status_history 
				 (id, return_id, previous_status, new_status, changed_by, reason, created_at)
				 VALUES (?, ?, ?, ?, ?, ?, datetime('now'))`,
				[
					`status_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
					returnId,
					"pending",
					"rejected",
					cashierId,
					reason
				]
			);
		});

		notifications.info("Devolución rechazada", "La devolución ha sido rechazada");
	};

	// Obtener devolución con detalles completos
	const getReturnWithDetails = async (returnId: string): Promise<ReturnWithDetails | null> => {
		const returnData = await query<any>(
			`SELECT r.*, s.total as original_total, s.currency as original_currency, 
			        s.created_at as original_created_at, c.name as customer_name
			 FROM returns r
			 JOIN sales s ON r.original_sale_id = s.id
			 LEFT JOIN customers c ON r.customer_id = c.id
			 WHERE r.id = ?`,
			[returnId]
		);

		if (!returnData.rows || returnData.rows.length === 0) {
			return null;
		}

		const returnInfo = returnData.rows[0];

		// Obtener items con información del producto
		const items = await query<any>(
			`SELECT ri.*, p.name as product_name, p.sku as product_sku, si.total as original_sale_item_total
			 FROM return_items ri
			 JOIN products p ON ri.product_id = p.id
			 JOIN sale_items si ON ri.original_sale_item_id = si.id
			 WHERE ri.return_id = ?
			 ORDER BY ri.created_at`,
			[returnId]
		);

		// Obtener historial de estados
		const statusHistory = await query<any>(
			`SELECT rsh.*, 
			        CASE 
			            WHEN u.first_name IS NOT NULL AND u.last_name IS NOT NULL 
			            THEN u.first_name || ' ' || u.last_name
			            ELSE u.username
			        END as changed_by_name
			 FROM return_status_history rsh
			 LEFT JOIN users u ON rsh.changed_by = u.id
			 WHERE rsh.return_id = ?
			 ORDER BY rsh.created_at`,
			[returnId]
		);

		return {
			...returnInfo,
			items: items.rows.map((item: any) => ({
				...item,
				originalSaleItemTotal: item.original_sale_item_total
			})),
			statusHistory: statusHistory.rows,
			originalSale: {
				id: returnInfo.original_sale_id,
				total: returnInfo.original_total,
				currency: returnInfo.original_currency,
				createdAt: returnInfo.original_created_at,
				customerName: returnInfo.customer_name
			}
		};
	};

	// Listar devoluciones por rango de fechas
	const listReturns = async (params: {
		from?: string
		to?: string
		status?: ReturnStatusValue
		customerId?: string
		limit?: number
		offset?: number
	}) => {
		const clauses: string[] = [];
		const values: any[] = [];

		if (params.from) {
			clauses.push("r.created_at >= ?");
			values.push(params.from);
		}
		if (params.to) {
			clauses.push("r.created_at <= ?");
			values.push(params.to);
		}
		if (params.status) {
			clauses.push("r.status = ?");
			values.push(params.status);
		}
		if (params.customerId) {
			clauses.push("r.customer_id = ?");
			values.push(params.customerId);
		}

		const where = clauses.length > 0 ? `WHERE ${clauses.join(" AND ")}` : "";
		const limit = params.limit || 50;
		const offset = params.offset || 0;

		const sql = `
			SELECT r.*, s.total as original_total, s.currency as original_currency,
			       c.name as customer_name, 
			       CASE 
			           WHEN u.first_name IS NOT NULL AND u.last_name IS NOT NULL 
			           THEN u.first_name || ' ' || u.last_name
			           ELSE u.username
			       END as cashier_name
			FROM returns r
			JOIN sales s ON r.original_sale_id = s.id
			LEFT JOIN customers c ON r.customer_id = c.id
			LEFT JOIN users u ON r.cashier_id = u.id
			${where}
			ORDER BY r.created_at DESC
			LIMIT ? OFFSET ?
		`;

		const rows = await query<any>(sql, [...values, limit, offset]);
		return rows.rows || [];
	};

	// Obtener items de una venta para devolución
	const getSaleItemsForReturn = async (saleId: string) => {
		const items = await query<any>(
			`SELECT si.*, p.name as product_name, p.sku as product_sku, p.stock as current_stock
			 FROM sale_items si
			 JOIN products p ON si.product_id = p.id
			 WHERE si.sale_id = ?
			 ORDER BY si.created_at`,
			[saleId]
		);

		return items.rows || [];
	};

	// Obtener estadísticas de devoluciones
	const getReturnStats = async (params: {
		from?: string
		to?: string
		cashierId?: string
	}) => {
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
		if (params.cashierId) {
			clauses.push("cashier_id = ?");
			values.push(params.cashierId);
		}

		const where = clauses.length > 0 ? `WHERE ${clauses.join(" AND ")}` : "";

		const stats = await query<any>(
			`SELECT 
				COUNT(*) as total_returns,
				SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_returns,
				SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved_returns,
				SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_returns,
				SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected_returns,
				SUM(CASE WHEN status = 'completed' THEN total ELSE 0 END) as total_refunded,
				AVG(CASE WHEN status = 'completed' THEN total ELSE NULL END) as avg_refund_amount
			 FROM returns ${where}`,
			values
		);

		return stats.rows[0] || {};
	};

	return {
		createReturn,
		approveReturn,
		completeReturn,
		rejectReturn,
		getReturnWithDetails,
		listReturns,
		getSaleItemsForReturn,
		getReturnStats
	};
}
