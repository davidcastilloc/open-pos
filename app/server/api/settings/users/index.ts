import { defineEventHandler, getMethod, readBody } from "h3";
import { z } from "zod";
import { useUser } from "~/composables/useUser";

const userCreateSchema = z.object({
	username: z.string().min(3, "El nombre de usuario debe tener al menos 3 caracteres"),
	email: z.string().email("Email inválido"),
	firstName: z.string().min(1, "El nombre es requerido"),
	lastName: z.string().min(1, "El apellido es requerido"),
	role: z.enum(["admin", "manager", "cashier"]),
	password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres")
});

export default defineEventHandler(async (event) => {
	const method = getMethod(event);
	const { getAllUsers, createUser, canManageUsers, canCreateAdmin } = useUser();

	if (method === "GET") {
		try {
			if (!canManageUsers.value) {
				return {
					success: false,
					error: "No tienes permiso para ver la lista de usuarios"
				};
			}

			const users = await getAllUsers();
			return {
				success: true,
				data: users
			};
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error ? error.message : "Error desconocido"
			};
		}
	}

	if (method === "POST") {
		try {
			if (!canManageUsers.value) {
				return {
					success: false,
					error: "No tienes permiso para crear usuarios"
				};
			}

			const body = await readBody(event);
			const validation = userCreateSchema.safeParse(body);

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
					error: "Solo los administradores pueden crear otros administradores"
				};
			}

			const passwordHash = `hashed_${data.password}`;

			const userId = await createUser({
				username: data.username,
				email: data.email,
				firstName: data.firstName,
				lastName: data.lastName,
				role: data.role,
				isActive: true,
				passwordHash
			});

			return {
				success: true,
				message: "Usuario creado correctamente",
				data: { id: userId }
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
