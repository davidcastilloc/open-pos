import { computed, ref } from "vue";
import { useDatabase } from "./useDatabase";
import type { 
	InventoryMovement, 
	InventoryAdjustment, 
	MovementFilters,
	InventoryStats
} from "~/schemas/inventory";
import { 
	validateInventoryMovement, 
	validateInventoryAdjustment,
	movementTypes,
	MOVEMENT_TYPE_LABELS
} from "~/schemas/inventory";

export interface InventoryMovementRecord extends InventoryMovement {
	id: string;
	productName: string;
	productSku: string;
	tenantId: string;
	createdAt: string;
}

export function useInventoryMovements() {
	const { query, execute } = useDatabase();

	// Estado
	const movements = ref<InventoryMovementRecord[]>([]);
	const stats = ref<InventoryStats | null>(null);
	const isLoading = ref(false);
	const error = ref<string | null>(null);
	const currentPage = ref(1);
	const totalItems = ref(0);
	const itemsPerPage = ref(20);

	// Registrar movimiento de inventario
	const recordMovement = async (movementData: Omit<InventoryMovement, "newStock" | "previousStock">) => {
		const validation = validateInventoryMovement({
			...movementData,
			previousStock: 0,
			newStock: 0
		});

		if (!validation.success) {
			error.value = Object.values(validation.errors).flat().join(", ");
			throw new Error(error.value);
		}

		try {
			// Obtener stock actual del producto
			const productResult = await query<any>(
				"SELECT stock FROM products WHERE id = ? AND tenant_id = ?",
				[movementData.productId, "default"]
			);

			if (productResult.length === 0) {
				throw new Error("Producto no encontrado");
			}

			const currentStock = productResult[0].stock;
			const newStock = currentStock + movementData.quantity;

			// Validar que el nuevo stock no sea negativo
			if (newStock < 0) {
				throw new Error(`Stock insuficiente. Stock actual: ${currentStock}, cantidad solicitada: ${Math.abs(movementData.quantity)}`);
			}

			const movementId = `mov_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
			const now = new Date().toISOString();

			// Iniciar transacción
			await execute("BEGIN TRANSACTION");

			try {
				// Registrar movimiento
				await execute(
					`INSERT INTO inventory_movements 
					(id, tenant_id, product_id, movement_type, quantity, previous_stock, new_stock, 
					 unit_cost, total_cost, reason, reference_document, notes, created_by, created_at)
					VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
					[
						movementId,
						"default",
						movementData.productId,
						movementData.movementType,
						movementData.quantity,
						currentStock,
						newStock,
						movementData.unitCost || null,
						movementData.totalCost || null,
						movementData.reason,
						movementData.referenceDocument || null,
						movementData.notes || null,
						movementData.createdBy || "system",
						now
					]
				);

				// Actualizar stock del producto
				await execute(
					"UPDATE products SET stock = ?, updated_at = ? WHERE id = ? AND tenant_id = ?",
					[newStock, now, movementData.productId, "default"]
				);

				// Si hay costo unitario, actualizar el costo promedio del producto
				if (movementData.unitCost && movementData.quantity > 0) {
					await updateAverageCost(movementData.productId, movementData.unitCost, movementData.quantity);
				}

				await execute("COMMIT");

				console.log(`✅ Movimiento registrado: ${movementData.movementType} - ${movementData.quantity} unidades`);
				return movementId;

			} catch (error) {
				await execute("ROLLBACK");
				throw error;
			}

		} catch (err) {
			error.value = err instanceof Error ? err.message : "Error al registrar movimiento";
			console.error("Error recording movement:", err);
			throw err;
		}
	};

	// Actualizar costo promedio del producto
	const updateAverageCost = async (productId: string, newUnitCost: number, quantity: number) => {
		try {
			const productResult = await query<any>(
				"SELECT cost, stock FROM products WHERE id = ? AND tenant_id = ?",
				[productId, "default"]
			);

			if (productResult.length === 0) return;

			const currentCost = productResult[0].cost || 0;
			const currentStock = productResult[0].stock || 0;
			
			// Calcular costo promedio ponderado
			const totalCostValue = (currentCost * currentStock) + (newUnitCost * quantity);
			const totalQuantity = currentStock + quantity;
			const averageCost = totalQuantity > 0 ? totalCostValue / totalQuantity : newUnitCost;

			await execute(
				"UPDATE products SET cost = ? WHERE id = ? AND tenant_id = ?",
				[averageCost, productId, "default"]
			);

		} catch (err) {
			console.error("Error updating average cost:", err);
		}
	};

	// Realizar ajuste masivo de inventario
	const performInventoryAdjustment = async (adjustmentData: InventoryAdjustment) => {
		const validation = validateInventoryAdjustment(adjustmentData);

		if (!validation.success) {
			error.value = Object.values(validation.errors).flat().join(", ");
			throw new Error(error.value);
		}

		try {
			await execute("BEGIN TRANSACTION");

			const adjustmentId = `adj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
			const movementIds: string[] = [];

			for (const adjustment of adjustmentData.adjustments) {
				if (adjustment.difference !== 0) {
					const movementId = await recordMovement({
						productId: adjustment.productId,
						movementType: "adjustment",
						quantity: adjustment.difference,
						reason: `Ajuste de inventario: ${adjustmentData.reason}`,
						referenceDocument: adjustmentId,
						notes: adjustment.notes,
						unitCost: adjustment.unitCost,
						totalCost: adjustment.unitCost ? Math.abs(adjustment.difference) * adjustment.unitCost : undefined,
						createdBy: adjustmentData.createdBy
					});
					movementIds.push(movementId);
				}
			}

			await execute("COMMIT");
			
			console.log(`✅ Ajuste de inventario completado: ${movementIds.length} productos ajustados`);
			return { adjustmentId, movementIds };

		} catch (err) {
			await execute("ROLLBACK");
			error.value = err instanceof Error ? err.message : "Error al realizar ajuste";
			console.error("Error performing inventory adjustment:", err);
			throw err;
		}
	};

	// Cargar movimientos con filtros
	const loadMovements = async (filters: Partial<MovementFilters> = {}) => {
		isLoading.value = true;
		error.value = null;
		currentPage.value = filters.page || 1;

		try {
			let sql = `
				SELECT 
					im.id, im.product_id, im.movement_type, im.quantity,
					im.previous_stock, im.new_stock, im.unit_cost, im.total_cost,
					im.reason, im.reference_document, im.notes, im.created_by, im.created_at,
					p.name as product_name, p.sku as product_sku
				FROM inventory_movements im
				JOIN products p ON im.product_id = p.id
				WHERE im.tenant_id = ?
			`;
			const params: any[] = ["default"];

			// Aplicar filtros
			if (filters.productId) {
				sql += " AND im.product_id = ?";
				params.push(filters.productId);
			}

			if (filters.movementType) {
				sql += " AND im.movement_type = ?";
				params.push(filters.movementType);
			}

			if (filters.dateFrom) {
				sql += " AND date(im.created_at) >= ?";
				params.push(filters.dateFrom);
			}

			if (filters.dateTo) {
				sql += " AND date(im.created_at) <= ?";
				params.push(filters.dateTo);
			}

			if (filters.createdBy) {
				sql += " AND im.created_by = ?";
				params.push(filters.createdBy);
			}

			if (filters.minQuantity !== undefined) {
				sql += " AND ABS(im.quantity) >= ?";
				params.push(Math.abs(filters.minQuantity));
			}

			if (filters.maxQuantity !== undefined) {
				sql += " AND ABS(im.quantity) <= ?";
				params.push(Math.abs(filters.maxQuantity));
			}

			// Contar total de items
			const countSql = sql.replace("SELECT im.id, im.product_id, im.movement_type, im.quantity, im.previous_stock, im.new_stock, im.unit_cost, im.total_cost, im.reason, im.reference_document, im.notes, im.created_by, im.created_at, p.name as product_name, p.sku as product_sku", "SELECT COUNT(*) as total");
			const countResult = await query<any>(countSql, params);
			totalItems.value = countResult[0]?.total || 0;

			// Aplicar paginación
			const limit = filters.limit || itemsPerPage.value;
			const offset = (currentPage.value - 1) * limit;
			sql += " ORDER BY im.created_at DESC LIMIT ? OFFSET ?";
			params.push(limit, offset);

			const results = await query<any>(sql, params);

			movements.value = results.map((row: any) => ({
				id: row.id,
				productId: row.product_id,
				productName: row.product_name,
				productSku: row.product_sku,
				movementType: row.movement_type,
				quantity: row.quantity,
				previousStock: row.previous_stock,
				newStock: row.new_stock,
				unitCost: row.unit_cost,
				totalCost: row.total_cost,
				reason: row.reason,
				referenceDocument: row.reference_document,
				notes: row.notes,
				createdBy: row.created_by,
				tenantId: "default",
				createdAt: row.created_at
			}));

			console.log(`✅ Movimientos cargados: ${movements.value.length}`);

		} catch (err) {
			error.value = "Error al cargar movimientos";
			console.error("Error loading movements:", err);
		} finally {
			isLoading.value = false;
		}
	};

	// Cargar estadísticas de inventario
	const loadInventoryStats = async () => {
		try {
			// Estadísticas básicas de productos
			const basicStats = await query<any>(`
				SELECT 
					COUNT(*) as total_products,
					SUM(stock) as total_stock,
					SUM(stock * price) as total_value,
					COUNT(CASE WHEN stock <= min_stock AND stock > 0 THEN 1 END) as low_stock_count,
					COUNT(CASE WHEN stock = 0 THEN 1 END) as out_of_stock_count
				FROM products 
				WHERE tenant_id = ? AND is_active = 1
			`, ["default"]);

			// Último movimiento
			const lastMovement = await query<any>(`
				SELECT MAX(created_at) as last_movement_date
				FROM inventory_movements 
				WHERE tenant_id = ?
			`, ["default"]);

			// Productos con más movimientos
			const topMovedProducts = await query<any>(`
				SELECT 
					im.product_id,
					p.name as product_name,
					COUNT(*) as total_movements,
					SUM(im.quantity) as net_quantity
				FROM inventory_movements im
				JOIN products p ON im.product_id = p.id
				WHERE im.tenant_id = ?
					AND im.created_at >= date('now', '-30 days')
				GROUP BY im.product_id, p.name
				ORDER BY total_movements DESC
				LIMIT 5
			`, ["default"]);

			const basicData = basicStats[0] || {};
			
			stats.value = {
				totalProducts: basicData.total_products || 0,
				totalStock: basicData.total_stock || 0,
				totalValue: basicData.total_value || 0,
				lowStockCount: basicData.low_stock_count || 0,
				outOfStockCount: basicData.out_of_stock_count || 0,
				lastMovementDate: lastMovement[0]?.last_movement_date || null,
				topMovedProducts: topMovedProducts.map((row: any) => ({
					productId: row.product_id,
					productName: row.product_name,
					totalMovements: row.total_movements,
					netQuantity: row.net_quantity
				}))
			};

			console.log("✅ Estadísticas de inventario cargadas");

		} catch (err) {
			console.error("Error loading inventory stats:", err);
		}
	};

	// Obtener historial de un producto específico
	const getProductMovementHistory = async (productId: string, limit: number = 50) => {
		try {
			const results = await query<any>(`
				SELECT 
					im.*, p.name as product_name, p.sku as product_sku
				FROM inventory_movements im
				JOIN products p ON im.product_id = p.id
				WHERE im.product_id = ? AND im.tenant_id = ?
				ORDER BY im.created_at DESC
				LIMIT ?
			`, [productId, "default", limit]);

			return results.map((row: any) => ({
				id: row.id,
				productId: row.product_id,
				productName: row.product_name,
				productSku: row.product_sku,
				movementType: row.movement_type,
				quantity: row.quantity,
				previousStock: row.previous_stock,
				newStock: row.new_stock,
				unitCost: row.unit_cost,
				totalCost: row.total_cost,
				reason: row.reason,
				referenceDocument: row.reference_document,
				notes: row.notes,
				createdBy: row.created_by,
				tenantId: "default",
				createdAt: row.created_at
			}));

		} catch (err) {
			console.error("Error getting product movement history:", err);
			return [];
		}
	};

	// Computed properties
	const totalPages = computed(() => {
		return Math.ceil(totalItems.value / itemsPerPage.value);
	});

	const hasNextPage = computed(() => {
		return currentPage.value < totalPages.value;
	});

	const hasPreviousPage = computed(() => {
		return currentPage.value > 1;
	});

	const recentMovements = computed(() => {
		return movements.value.slice(0, 10);
	});

	// Helpers para la UI
	const getMovementTypeLabel = (type: string) => {
		return MOVEMENT_TYPE_LABELS[type as keyof typeof MOVEMENT_TYPE_LABELS] || type;
	};

	const formatMovementQuantity = (quantity: number, type: string) => {
		const sign = quantity > 0 ? "+" : "";
		return `${sign}${quantity}`;
	};

	return {
		// Estado
		movements: readonly(movements),
		stats: readonly(stats),
		isLoading: readonly(isLoading),
		error: readonly(error),
		currentPage: readonly(currentPage),
		totalItems: readonly(totalItems),
		itemsPerPage: readonly(itemsPerPage),

		// Computed
		totalPages,
		hasNextPage,
		hasPreviousPage,
		recentMovements,

		// Métodos
		recordMovement,
		performInventoryAdjustment,
		loadMovements,
		loadInventoryStats,
		getProductMovementHistory,
		updateAverageCost,

		// Helpers
		getMovementTypeLabel,
		formatMovementQuantity,

		// Constantes
		movementTypes: readonly(movementTypes)
	};
}