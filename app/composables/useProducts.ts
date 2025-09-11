import { computed, ref } from "vue";
import { useCurrency } from "./useCurrency";
import { useDatabase } from "./useDatabase";

export interface Product {
	id: string
	tenantId: string
	name: string
	description?: string
	sku: string
	barcode?: string
	price: number
	cost: number
	categoryId?: string
	categoryName?: string
	stock: number
	minStock: number
	images?: string[]
	isActive: boolean
	createdAt: string
	updatedAt: string
}

export interface ProductFilters {
	category?: string
	minPrice?: number
	maxPrice?: number
	inStock?: boolean
	search?: string
}

export function useProducts() {
	const { query, execute } = useDatabase();
	const { convertAmount, formatCurrency } = useCurrency();

	// Estado
	const products = ref<Product[]>([]);
	const categories = ref<Array<{ id: string, name: string }>>([]);
	const isLoading = ref(false);
	const error = ref<string | null>(null);
	const currentPage = ref(1);
	const itemsPerPage = ref(20);
	const totalItems = ref(0);
	const filters = ref<ProductFilters>({});
	const currentCurrency = ref<string>("BS");

	// Cargar productos
	const loadProducts = async (page: number = 1, searchFilters: ProductFilters = {}) => {
		isLoading.value = true;
		error.value = null;
		currentPage.value = page;
		filters.value = { ...searchFilters };

		try {
			let sql = `
        SELECT p.*, c.name as category_name
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.tenant_id = ? AND p.is_active = 1
      `;
			const params: any[] = ["default"];

			// Aplicar filtros
			if (filters.value.search) {
				sql += " AND (p.name LIKE ? OR p.sku LIKE ? OR p.barcode LIKE ?)";
				const searchTerm = `%${filters.value.search}%`;
				params.push(searchTerm, searchTerm, searchTerm);
			}

			if (filters.value.category) {
				sql += " AND p.category_id = ?";
				params.push(filters.value.category);
			}

			if (filters.value.minPrice !== undefined) {
				sql += " AND p.price >= ?";
				params.push(filters.value.minPrice);
			}

			if (filters.value.maxPrice !== undefined) {
				sql += " AND p.price <= ?";
				params.push(filters.value.maxPrice);
			}

			if (filters.value.inStock) {
				sql += " AND p.stock > 0";
			}

			// Contar total de items
			const countSql = sql.replace("SELECT p.*, c.name as category_name", "SELECT COUNT(*) as total");
			const countResult = await query<any>(countSql, params);
			totalItems.value = countResult[0]?.total || 0;

			// Aplicar paginación
			const offset = (page - 1) * itemsPerPage.value;
			sql += " ORDER BY p.name LIMIT ? OFFSET ?";
			params.push(itemsPerPage.value, offset);

			const results = await query<any>(sql, params);

			// Convertir precios a la moneda actual
			const convertedProducts = results.map((row: any) => {
				const convertedPrice = convertAmount(
					row.price,
					"BS", // Asumiendo que los precios están en BS
					currentCurrency.value
				);

				return {
					id: row.id,
					tenantId: row.tenant_id,
					name: row.name,
					description: row.description,
					sku: row.sku,
					barcode: row.barcode,
					price: convertedPrice,
					cost: row.cost,
					categoryId: row.category_id,
					categoryName: row.category_name,
					stock: row.stock,
					minStock: row.min_stock,
					images: row.images ? JSON.parse(row.images) : [],
					isActive: Boolean(row.is_active),
					createdAt: row.created_at,
					updatedAt: row.updated_at
				} as Product;
			});

			products.value = convertedProducts;
			console.log(`✅ Productos cargados: ${convertedProducts.length}`);
		} catch (err) {
			error.value = "Error al cargar productos";
			console.error("Error loading products:", err);
		} finally {
			isLoading.value = false;
		}
	};

	// Cargar categorías
	const loadCategories = async () => {
		try {
			const results = await query<any>(
				"SELECT id, name FROM categories WHERE tenant_id = ? AND is_active = 1 ORDER BY name",
				["default"]
			);

			categories.value = results.map((row: any) => ({
				id: row.id,
				name: row.name
			}));

			console.log(`✅ Categorías cargadas: ${categories.value.length}`);
		} catch (err) {
			console.error("Error loading categories:", err);
		}
	};

	// Buscar producto por código de barras
	const findProductByBarcode = async (barcode: string): Promise<Product | null> => {
		try {
			const results = await query<any>(
				"SELECT * FROM products WHERE barcode = ? AND is_active = 1",
				[barcode]
			);

			if (results.length === 0) {
				return null;
			}

			const row = results[0];
			const convertedPrice = convertAmount(
				row.price,
				"BS",
				currentCurrency.value
			);

			return {
				id: row.id,
				tenantId: row.tenant_id,
				name: row.name,
				description: row.description,
				sku: row.sku,
				barcode: row.barcode,
				price: convertedPrice,
				cost: row.cost,
				categoryId: row.category_id,
				stock: row.stock,
				minStock: row.min_stock,
				images: row.images ? JSON.parse(row.images) : [],
				isActive: Boolean(row.is_active),
				createdAt: row.created_at,
				updatedAt: row.updated_at
			} as Product;
		} catch (err) {
			console.error("Error finding product by barcode:", err);
			return null;
		}
	};

	// Buscar producto por SKU
	const findProductBySku = async (sku: string): Promise<Product | null> => {
		try {
			const results = await query<any>(
				"SELECT * FROM products WHERE sku = ? AND is_active = 1",
				[sku]
			);

			if (results.length === 0) {
				return null;
			}

			const row = results[0];
			const convertedPrice = convertAmount(
				row.price,
				"BS",
				currentCurrency.value
			);

			return {
				id: row.id,
				tenantId: row.tenant_id,
				name: row.name,
				description: row.description,
				sku: row.sku,
				barcode: row.barcode,
				price: convertedPrice,
				cost: row.cost,
				categoryId: row.category_id,
				stock: row.stock,
				minStock: row.min_stock,
				images: row.images ? JSON.parse(row.images) : [],
				isActive: Boolean(row.is_active),
				createdAt: row.created_at,
				updatedAt: row.updated_at
			} as Product;
		} catch (err) {
			console.error("Error finding product by SKU:", err);
			return null;
		}
	};

	// Crear nuevo producto
	const createProduct = async (productData: Omit<Product, "id" | "tenantId" | "createdAt" | "updatedAt">) => {
		try {
			const id = `product_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

			await execute(
				`INSERT INTO products 
         (id, tenant_id, name, description, sku, barcode, price, cost, category_id, stock, min_stock, images, is_active, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
				[
					id,
					"default",
					productData.name,
					productData.description || null,
					productData.sku,
					productData.barcode || null,
					productData.price,
					productData.cost,
					productData.categoryId || null,
					productData.stock,
					productData.minStock,
					productData.images ? JSON.stringify(productData.images) : null,
					productData.isActive ? 1 : 0
				]
			);

			// Recargar productos
			await loadProducts(currentPage.value, filters.value);

			console.log("✅ Producto creado:", productData.name);
			return id;
		} catch (err) {
			error.value = "Error al crear producto";
			console.error("Error creating product:", err);
			throw err;
		}
	};

	// Actualizar producto
	const updateProduct = async (id: string, updates: Partial<Product>) => {
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
			if (updates.sku !== undefined) {
				setClause.push("sku = ?");
				values.push(updates.sku);
			}
			if (updates.barcode !== undefined) {
				setClause.push("barcode = ?");
				values.push(updates.barcode);
			}
			if (updates.price !== undefined) {
				setClause.push("price = ?");
				values.push(updates.price);
			}
			if (updates.cost !== undefined) {
				setClause.push("cost = ?");
				values.push(updates.cost);
			}
			if (updates.categoryId !== undefined) {
				setClause.push("category_id = ?");
				values.push(updates.categoryId);
			}
			if (updates.stock !== undefined) {
				setClause.push("stock = ?");
				values.push(updates.stock);
			}
			if (updates.minStock !== undefined) {
				setClause.push("min_stock = ?");
				values.push(updates.minStock);
			}
			if (updates.images !== undefined) {
				setClause.push("images = ?");
				values.push(updates.images ? JSON.stringify(updates.images) : null);
			}
			if (updates.isActive !== undefined) {
				setClause.push("is_active = ?");
				values.push(updates.isActive ? 1 : 0);
			}

			setClause.push("updated_at = datetime(\"now\")");
			values.push(id);

			const sql = `UPDATE products SET ${setClause.join(", ")} WHERE id = ?`;
			await execute(sql, values);

			// Recargar productos
			await loadProducts(currentPage.value, filters.value);

			console.log("✅ Producto actualizado:", id);
		} catch (err) {
			error.value = "Error al actualizar producto";
			console.error("Error updating product:", err);
			throw err;
		}
	};

	// Eliminar producto
	const deleteProduct = async (id: string) => {
		try {
			await execute("DELETE FROM products WHERE id = ?", [id]);

			// Recargar productos
			await loadProducts(currentPage.value, filters.value);

			console.log("✅ Producto eliminado:", id);
		} catch (err) {
			error.value = "Error al eliminar producto";
			console.error("Error deleting product:", err);
			throw err;
		}
	};

	// Cambiar moneda
	const changeCurrency = async (newCurrency: string) => {
		currentCurrency.value = newCurrency;
		await loadProducts(currentPage.value, filters.value);
	};

	// Formatear precio
	const formatPrice = (amount: number, currency: string = currentCurrency.value) => {
		return formatCurrency(amount, currency);
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

	const lowStockProducts = computed(() => {
		return products.value.filter((product) => product.stock <= product.minStock);
	});

	return {
		// Estado
		products: readonly(products),
		categories: readonly(categories),
		isLoading: readonly(isLoading),
		error: readonly(error),
		currentPage: readonly(currentPage),
		totalItems: readonly(totalItems),
		filters: readonly(filters),
		currentCurrency: readonly(currentCurrency),

		// Computed
		totalPages,
		hasNextPage,
		hasPreviousPage,
		lowStockProducts,

		// Métodos
		loadProducts,
		loadCategories,
		findProductByBarcode,
		findProductBySku,
		createProduct,
		updateProduct,
		deleteProduct,
		changeCurrency,
		formatPrice
	};
}
