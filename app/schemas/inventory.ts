import { z } from "zod";

// Tipos de movimientos de inventario
export const movementTypes = ["entry", "exit", "adjustment", "transfer", "sale", "return"] as const;

// Schema para movimientos de inventario
export const inventoryMovementSchema = z.object({
	productId: z.string()
		.min(1, "El ID del producto es requerido"),

	movementType: z.enum(movementTypes),

	quantity: z.number()
		.min(-99999, "La cantidad no puede ser menor a -99,999")
		.max(99999, "La cantidad no puede ser mayor a 99,999")
		.int("La cantidad debe ser un número entero")
		.refine((val) => val !== 0, "La cantidad no puede ser cero"),

	previousStock: z.number()
		.min(0, "El stock previo debe ser mayor o igual a 0")
		.int("El stock previo debe ser un número entero"),

	newStock: z.number()
		.min(0, "El nuevo stock debe ser mayor or igual a 0")
		.int("El nuevo stock debe ser un número entero"),

	unitCost: z.number()
		.min(0, "El costo unitario debe ser mayor o igual a 0")
		.max(999999.99, "El costo unitario no puede exceder 999,999.99")
		.optional(),

	totalCost: z.number()
		.min(0, "El costo total debe ser mayor o igual a 0")
		.max(9999999.99, "El costo total no puede exceder 9,999,999.99")
		.optional(),

	reason: z.string()
		.min(1, "La razón del movimiento es requerida")
		.max(500, "La razón no puede exceder 500 caracteres"),

	referenceDocument: z.string()
		.max(100, "El documento de referencia no puede exceder 100 caracteres")
		.optional(),

	notes: z.string()
		.max(1000, "Las notas no pueden exceder 1,000 caracteres")
		.optional(),

	createdBy: z.string()
		.min(1, "El usuario que creó el movimiento es requerido")
		.max(100, "El usuario no puede exceder 100 caracteres")
		.default("system")
});

// Tipo inferido del schema
export type InventoryMovement = z.infer<typeof inventoryMovementSchema>;

// Schema para ajustes de inventario (múltiples productos)
export const inventoryAdjustmentSchema = z.object({
	reason: z.string()
		.min(1, "La razón del ajuste es requerida")
		.max(500, "La razón no puede exceder 500 caracteres"),

	adjustments: z.array(z.object({
		productId: z.string().min(1),
		currentStock: z.number().int().min(0),
		newStock: z.number().int().min(0),
		difference: z.number().int(),
		unitCost: z.number().min(0).optional(),
		notes: z.string().max(500).optional()
	})).min(1, "Debe incluir al menos un ajuste"),

	createdBy: z.string()
		.min(1, "El usuario es requerido")
		.default("system")
});

export type InventoryAdjustment = z.infer<typeof inventoryAdjustmentSchema>;

// Schema para consultas de movimientos
export const movementFiltersSchema = z.object({
	productId: z.string().optional(),
	movementType: z.enum(movementTypes).optional(),
	dateFrom: z.string().optional(),
	dateTo: z.string().optional(),
	createdBy: z.string().optional(),
	minQuantity: z.number().optional(),
	maxQuantity: z.number().optional(),
	page: z.number().min(1).default(1),
	limit: z.number().min(1).max(100).default(20)
});

export type MovementFilters = z.infer<typeof movementFiltersSchema>;

// Schema para estadísticas de inventario
export const inventoryStatsSchema = z.object({
	totalProducts: z.number().int().min(0),
	totalStock: z.number().int().min(0),
	totalValue: z.number().min(0),
	lowStockCount: z.number().int().min(0),
	outOfStockCount: z.number().int().min(0),
	lastMovementDate: z.string().nullable(),
	topMovedProducts: z.array(z.object({
		productId: z.string(),
		productName: z.string(),
		totalMovements: z.number().int(),
		netQuantity: z.number().int()
	})).default([])
});

export type InventoryStats = z.infer<typeof inventoryStatsSchema>;

// Funciones de validación
export function validateInventoryMovement(data: unknown) {
	try {
		const result = inventoryMovementSchema.safeParse(data);
		return {
			success: result.success,
			data: result.success ? result.data : undefined,
			errors: result.success ? {} : formatZodErrors(result.error)
		};
	} catch (error) {
		console.error("Error validando movimiento de inventario:", error);
		return {
			success: false,
			data: undefined,
			errors: { general: ["Error interno de validación"] }
		};
	}
}

export function validateInventoryAdjustment(data: unknown) {
	try {
		const result = inventoryAdjustmentSchema.safeParse(data);
		return {
			success: result.success,
			data: result.success ? result.data : undefined,
			errors: result.success ? {} : formatZodErrors(result.error)
		};
	} catch (error) {
		console.error("Error validando ajuste de inventario:", error);
		return {
			success: false,
			data: undefined,
			errors: { general: ["Error interno de validación"] }
		};
	}
}

// Función auxiliar para formatear errores de Zod
function formatZodErrors(error: z.ZodError): Record<string, string[]> {
	const formattedErrors: Record<string, string[]> = {};

	error.issues.forEach((issue) => {
		const path = issue.path.join(".");
		if (!formattedErrors[path]) {
			formattedErrors[path] = [];
		}
		formattedErrors[path].push(issue.message);
	});

	return formattedErrors;
}

// Constantes para la UI
export const MOVEMENT_TYPE_LABELS: Record<typeof movementTypes[number], string> = {
	entry: "Entrada",
	exit: "Salida",
	adjustment: "Ajuste",
	transfer: "Transferencia",
	sale: "Venta",
	return: "Devolución"
};

export const MOVEMENT_TYPE_COLORS: Record<typeof movementTypes[number], string> = {
	entry: "success",
	exit: "error",
	adjustment: "warning",
	transfer: "info",
	sale: "primary",
	return: "secondary"
};

// Razones predefinidas para movimientos
export const COMMON_MOVEMENT_REASONS = {
	entry: [
		"Compra a proveedor",
		"Devolución de cliente",
		"Ajuste por inventario físico",
		"Transferencia desde otra sucursal",
		"Corrección de error"
	],
	exit: [
		"Venta a cliente",
		"Devolución a proveedor",
		"Producto dañado/vencido",
		"Transferencia a otra sucursal",
		"Muestra gratuita",
		"Merma"
	],
	adjustment: [
		"Inventario físico",
		"Corrección de error",
		"Producto encontrado",
		"Producto perdido",
		"Daño en almacén"
	]
};
