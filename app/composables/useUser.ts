import type { User } from "~/database/schema";
import { computed, ref } from "vue";

// Estado global del usuario actual
const currentUser = ref<User | null>(null);
const isInitialized = ref(false);

export function useUser() {
	const { query, execute } = useDatabase();

	// Crear usuario por defecto
	const createDefaultUser = async () => {
		try {
			await execute(`
				INSERT OR IGNORE INTO users (
					id, username, email, first_name, last_name, 
					role, is_active, password_hash, created_at, updated_at
				) VALUES (
					'admin-user-001',
					'admin',
					'admin@pos.local',
					'Administrador',
					'Sistema',
					'admin',
					1,
					'default_hash',
					CURRENT_TIMESTAMP,
					CURRENT_TIMESTAMP
				)
			`);

			// Obtener el usuario creado
			const result = await query<User>(
				"SELECT * FROM users WHERE username = 'admin' LIMIT 1"
			);

			if (result.rows.length > 0) {
				currentUser.value = result.rows[0] || null;
			}
		} catch (error) {
			console.error("Error creating default user:", error);
		}
	};

	// Inicializar usuario por defecto
	const initializeUser = async () => {
		if (isInitialized.value) return;

		try {
			// Intentar obtener el usuario admin por defecto
			const result = await query<User>(
				"SELECT * FROM users WHERE username = 'admin' AND is_active = 1 LIMIT 1"
			);

			if (result.rows.length > 0) {
				currentUser.value = result.rows[0] || null;
			} else {
				// Si no existe, crear usuario por defecto
				await createDefaultUser();
			}
		} catch (error) {
			console.error("Error initializing user:", error);
			// Fallback: crear usuario temporal
			currentUser.value = {
				id: "temp-admin",
				username: "admin",
				email: "admin@pos.local",
				firstName: "Administrador",
				lastName: "Sistema",
				role: "admin",
				isActive: true,
				passwordHash: "default_hash",
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString()
			};
		}

		isInitialized.value = true;
	};

	// Obtener usuario actual
	const getCurrentUser = () => currentUser.value;

	// Obtener información del cajero para transacciones
	const getCashierInfo = computed(() => {
		if (!currentUser.value) {
			return {
				cashierId: "admin",
				cashierName: "Administrador"
			};
		}

		return {
			cashierId: currentUser.value.id,
			cashierName: `${currentUser.value.firstName} ${currentUser.value.lastName}`
		};
	});

	// Verificar si el usuario es admin
	const isAdmin = computed(() => {
		return currentUser.value?.role === "admin";
	});

	// Verificar si el usuario es cajero
	const isCashier = computed(() => {
		return currentUser.value?.role === "cashier" || currentUser.value?.role === "admin";
	});

	// Obtener nombre completo
	const fullName = computed(() => {
		if (!currentUser.value) return "Usuario";
		return `${currentUser.value.firstName} ${currentUser.value.lastName}`;
	});

	// Obtener nombre de usuario
	const username = computed(() => {
		return currentUser.value?.username || "admin";
	});

	// Cambiar usuario (para futuras implementaciones de login)
	const setCurrentUser = (user: User | null) => {
		currentUser.value = user;
	};

	// Obtener todos los usuarios (para gestión)
	const getAllUsers = async () => {
		try {
			const result = await query<User>("SELECT * FROM users WHERE is_active = 1 ORDER BY first_name, last_name");
			return result.rows;
		} catch (error) {
			console.error("Error getting users:", error);
			return [];
		}
	};

	// Crear nuevo usuario
	const createUser = async (userData: Omit<User, "id" | "createdAt" | "updatedAt">) => {
		try {
			const id = crypto.randomUUID();
			await execute(`
				INSERT INTO users (
					id, username, email, first_name, last_name, 
					role, is_active, password_hash, created_at, updated_at
				) VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
			`, [
				id,
				userData.username,
				userData.email,
				userData.firstName,
				userData.lastName,
				userData.role,
				userData.isActive ? 1 : 0,
				userData.passwordHash
			]);

			return id;
		} catch (error) {
			console.error("Error creating user:", error);
			throw error;
		}
	};

	// Actualizar usuario
	const updateUser = async (id: string, userData: Partial<Omit<User, "id" | "createdAt">>) => {
		try {
			const fields = [];
			const values = [];

			if (userData.username) {
				fields.push("username = ?");
				values.push(userData.username);
			}
			if (userData.email) {
				fields.push("email = ?");
				values.push(userData.email);
			}
			if (userData.firstName) {
				fields.push("first_name = ?");
				values.push(userData.firstName);
			}
			if (userData.lastName) {
				fields.push("last_name = ?");
				values.push(userData.lastName);
			}
			if (userData.role) {
				fields.push("role = ?");
				values.push(userData.role);
			}
			if (userData.isActive !== undefined) {
				fields.push("is_active = ?");
				values.push(userData.isActive ? 1 : 0);
			}

			fields.push("updated_at = CURRENT_TIMESTAMP");
			values.push(id);

			await execute(
				`UPDATE users SET ${fields.join(", ")} WHERE id = ?`,
				values
			);

			// Actualizar usuario actual si es el mismo
			if (currentUser.value?.id === id) {
				const result = await query<User>("SELECT * FROM users WHERE id = ? LIMIT 1", [id]);
				if (result.rows.length > 0) {
					currentUser.value = result.rows[0];
				}
			}
		} catch (error) {
			console.error("Error updating user:", error);
			throw error;
		}
	};

	return {
		// Estado
		currentUser: readonly(currentUser),
		isInitialized: readonly(isInitialized),

		// Computed
		getCashierInfo,
		isAdmin,
		isCashier,
		fullName,
		username,

		// Métodos
		initializeUser,
		getCurrentUser,
		setCurrentUser,
		getAllUsers,
		createUser,
		updateUser
	};
}
