import { defineEventHandler, getMethod, readBody } from "h3";
import { useBusiness } from "~/composables/useBusiness";

// GET /api/settings/business - Obtener datos del negocio
export default defineEventHandler(async (event) => {
	const method = getMethod(event);
	const { businessData, updateBusiness } = useBusiness();

	if (method === "GET") {
		return {
			success: true,
			data: businessData.value
		};
	}

	if (method === "PUT") {
		const body = await readBody(event);

		try {
			await updateBusiness(body);
			return {
				success: true,
				message: "Datos actualizados correctamente",
				data: businessData.value
			};
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error ? error.message : "Error desconocido"
			};
		}
	}

	return {
		success: false,
		error: "Método no permitido"
	};
});
