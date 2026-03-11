import { defineEventHandler, getMethod, getRouterParam, readBody } from "h3";
import { z } from "zod";
import { useUser } from "~/composables/useUser";

const userUpdateSchema = z.object({
	username: z.string().min(3, "El nombre de usuario debe tener al menos 3 caracteres").optional(),
	email: z.string().email("Email inválido").optional(),
	firstName: z.string().min(1, "El nombre es requerido").optional(),
	lastName: z.string().min(1, "El apellido es requerido").optional(),
	role: z.enum(["admin", "manager", "cashier"]).optional(),
	password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres").optional()
});

export default defineEventHandler(async (event) => {
	const method = getMethod(event);
	const id = getRouterParam(event, "id");
	const { getUserById, updateUser, deleteUser, canManageUsers, canCreateAdmin } = useUser();

	if (!id) {
		return {
			success: false,
			error: "ID de usuario no proporcionado"
		};
	}

	if (method === "GET") {
		try {
			if (!canManageUsers.value) {
				return {
					success: false,
					error: "No tienes permiso para ver este usuario"
				};
			}

			const user = await getUserById(id);
			if (!user) {
				return {
					success: false,
					error: "Usuario no encontrado"
				};
			}

			return {
				success: true,
				data: user
			};
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error ? error.message : "Error desconocido"
			};
		}
	}

	if (method === "PUT") {
		try {
			if (!canManageUsers.value) {
				return {
					success: false,
					error: "No tienes permiso para editar usuarios"
				};
			}

			const body = await readBody(event);
			const validation = userUpdateSchema.safeParse(body);

			if (!validation.success) {
				const errorMessage = validation.error.issues?.[0]?.message || "Error de validación";
				return {
					success: false,
					error: errorMessage
				};
			}

			const data = validation.data;

			if (data.role === "admin" && !canCreateAdmin.value) {
				return {
					success: false,
					error: "Solo los administradores pueden asignar el rol de administrador"
				};
			}

			await updateUser(id, data);

			return {
				success: true,
				message: "Usuario actualizado correctamente"
			};
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error ? error.message : "Error desconocido"
			};
		}
	}

	if (method === "DELETE") {
		try {
			if (!canManageUsers.value) {
				return {
					success: false,
					error: "No tienes permiso para eliminar usuarios"
				};
			}

			await deleteUser(id);

			return {
				success: true,
				message: "Usuario eliminado correctamente"
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
