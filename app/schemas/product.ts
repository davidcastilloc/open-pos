import { z } from "zod";

export const productSchema = z.object({
	name: z.string()
		.min(1, "El nombre del producto es requerido")
		.max(100, "El nombre no puede exceder 100 caracteres"),

	description: z.string()
		.max(500, "La descripción no puede exceder 500 caracteres")
		.optional(),

	sku: z.string()
		.min(1, "El SKU es requerido")
		.max(50, "El SKU no puede exceder 50 caracteres")
		.regex(/^[A-Z0-9-_]+$/, "El SKU solo puede contener letras mayúsculas, números, guiones y guiones bajos"),

	barcode: z.string()
		.max(50, "El código de barras no puede exceder 50 caracteres")
		.optional()
		.or(z.literal("")),

	price: z.number()
		.min(0, "El precio debe ser mayor o igual a 0")
		.max(999999.99, "El precio no puede exceder 999,999.99"),

	cost: z.number()
		.min(0, "El costo debe ser mayor o igual a 0")
		.max(999999.99, "El costo no puede exceder 999,999.99")
		.optional()
		.or(z.literal(0)),

	currency: z.enum(["BS", "USD", "EUR"]),

	categoryId: z.string()
		.min(1, "La categoría es requerida")
		.max(100, "El ID de categoría no puede exceder 100 caracteres"),

	stock: z.number()
		.min(0, "El stock debe ser mayor o igual a 0")
		.max(99999, "El stock no puede exceder 99,999 unidades")
		.int("El stock debe ser un número entero"),

	minStock: z.number()
		.min(0, "El stock mínimo debe ser mayor o igual a 0")
		.max(99999, "El stock mínimo no puede exceder 99,999 unidades")
		.int("El stock mínimo debe ser un número entero")
		.optional()
		.or(z.literal(0)),

	images: z.array(z.string().url("Cada imagen debe ser una URL válida"))
		.max(10, "No puedes agregar más de 10 imágenes")
		.optional()
		.default([]),

	isActive: z.boolean()
		.default(true)
});

// Tipo inferido del esquema
export type Product = z.infer<typeof productSchema>;

// Función de validación
export function validateProduct(data: unknown) {
	try {
		const result = productSchema.safeParse(data);
		return {
			success: result.success,
			data: result.success ? result.data : undefined,
			errors: result.success ? {} : formatZodErrors(result.error)
		};
	} catch (error) {
		console.error("Error validando producto:", error);
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
