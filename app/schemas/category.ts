import { z } from "zod";

// Esquema de validación para categorías
export const categorySchema = z.object({
	name: z.string()
		.min(1, "El nombre de la categoría es requerido")
		.max(100, "El nombre no puede exceder 100 caracteres")
		.regex(/^[a-záéíóúñ\s]+$/i, "El nombre solo puede contener letras y espacios"),

	description: z.string()
		.max(500, "La descripción no puede exceder 500 caracteres")
		.optional()
		.or(z.literal("")),

	isActive: z.boolean()
		.default(true)
});

// Tipo inferido del esquema
export type Category = z.infer<typeof categorySchema>;

// Función de validación
export function validateCategory(data: unknown) {
	try {
		const result = categorySchema.safeParse(data);
		return {
			success: result.success,
			data: result.success ? result.data : undefined,
			errors: result.success ? {} : formatZodErrors(result.error)
		};
	} catch (error) {
		console.error("Error validando categoría:", error);
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
