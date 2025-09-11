import { ref, computed } from "vue";
import { useDatabase } from "./useDatabase";

export interface Category {
	id: string;
	tenantId: string;
	name: string;
	description?: string;
	isActive: boolean;
	productCount?: number;
	createdAt: string;
	updatedAt: string;
}

export function useCategories() {
	const { query, execute } = useDatabase();

	// Estado
	const categories = ref<Category[]>([]);
	const isLoading = ref(false);
	const error = ref<string | null>(null);

	// Cargar categorías
	const loadCategories = async () => {
		isLoading.value = true;
		error.value = null;

		try {
			const results = await query<any>(
				`SELECT c.*, COUNT(p.id) as product_count
				 FROM categories c
				 LEFT JOIN products p ON c.id = p.category_id AND p.is_active = 1
				 WHERE c.tenant_id = ?
				 GROUP BY c.id
				 ORDER BY c.name`,
				["default"]
			);

			categories.value = results.map((row: any) => ({
				id: row.id,
				tenantId: row.tenant_id,
				name: row.name,
				description: row.description,
				isActive: Boolean(row.is_active),
				productCount: row.product_count || 0,
				createdAt: row.created_at,
				updatedAt: row.updated_at
			} as Category));

			console.log(`✅ Categorías cargadas: ${categories.value.length}`);
		} catch (err) {
			error.value = "Error al cargar categorías";
			console.error("Error loading categories:", err);
		} finally {
			isLoading.value = false;
		}
	};

	// Crear nueva categoría
	const createCategory = async (categoryData: Omit<Category, "id" | "tenantId" | "createdAt" | "updatedAt">) => {
		try {
			const id = `category_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

			await execute(
				`INSERT INTO categories 
				 (id, tenant_id, name, description, is_active, created_at, updated_at)
				 VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
				[
					id,
					"default",
					categoryData.name,
					categoryData.description || null,
					categoryData.isActive ? 1 : 0
				]
			);

			// Recargar categorías
			await loadCategories();

			console.log("✅ Categoría creada:", categoryData.name);
			return id;
		} catch (err) {
			error.value = "Error al crear categoría";
			console.error("Error creating category:", err);
			throw err;
		}
	};

	// Actualizar categoría
	const updateCategory = async (id: string, updates: Partial<Category>) => {
		try {
			const setClause = [];
			const values = [];

			if (updates.name !== undefined) {
				setClause.push("name = ?");
				values.push(updates.name);
			}
			if (updates.description !== undefined) {
				setClause.push("description = ?");
				values.push(updates.description);
			}
			if (updates.isActive !== undefined) {
				setClause.push("is_active = ?");
				values.push(updates.isActive ? 1 : 0);
			}

			setClause.push("updated_at = datetime('now')");
			values.push(id);

			const sql = `UPDATE categories SET ${setClause.join(", ")} WHERE id = ?`;
			await execute(sql, values);

			// Recargar categorías
			await loadCategories();

			console.log("✅ Categoría actualizada:", id);
		} catch (err) {
			error.value = "Error al actualizar categoría";
			console.error("Error updating category:", err);
			throw err;
		}
	};

	// Eliminar categoría
	const deleteCategory = async (id: string) => {
		try {
			// Primero, actualizar productos que tengan esta categoría
			await execute(
				"UPDATE products SET category_id = NULL WHERE category_id = ?",
				[id]
			);

			// Luego eliminar la categoría
			await execute("DELETE FROM categories WHERE id = ?", [id]);

			// Recargar categorías
			await loadCategories();

			console.log("✅ Categoría eliminada:", id);
		} catch (err) {
			error.value = "Error al eliminar categoría";
			console.error("Error deleting category:", err);
			throw err;
		}
	};

	// Obtener categoría por ID
	const getCategoryById = async (id: string): Promise<Category | null> => {
		try {
			const results = await query<any>(
				"SELECT * FROM categories WHERE id = ? AND tenant_id = ?",
				[id, "default"]
			);

			if (results.length === 0) {
				return null;
			}

			const row = results[0];
			return {
				id: row.id,
				tenantId: row.tenant_id,
				name: row.name,
				description: row.description,
				isActive: Boolean(row.is_active),
				createdAt: row.created_at,
				updatedAt: row.updated_at
			} as Category;
		} catch (err) {
			console.error("Error getting category by ID:", err);
			return null;
		}
	};

	// Computed properties
	const activeCategories = computed(() => {
		return categories.value.filter((cat) => cat.isActive);
	});

	const inactiveCategories = computed(() => {
		return categories.value.filter((cat) => !cat.isActive);
	});

	const categoriesWithProducts = computed(() => {
		return categories.value.filter((cat) => (cat.productCount || 0) > 0);
	});

	const emptyCategories = computed(() => {
		return categories.value.filter((cat) => (cat.productCount || 0) === 0);
	});

	return {
		// Estado
		categories: readonly(categories),
		isLoading: readonly(isLoading),
		error: readonly(error),

		// Computed
		activeCategories,
		inactiveCategories,
		categoriesWithProducts,
		emptyCategories,

		// Métodos
		loadCategories,
		createCategory,
		updateCategory,
		deleteCategory,
		getCategoryById
	};
}
