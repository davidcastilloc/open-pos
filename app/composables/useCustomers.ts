import type { Customer, CustomerSale, NewCustomer } from "~/database/schema";
import type { CreateCustomerInput, CustomerStats, UpdateCustomerInput } from "~/schemas/customer";
import { computed, readonly, ref } from "vue";
import { useDatabase } from "./useDatabase";

export const useCustomers = () => {
	const { execute } = useDatabase();
	const customers = ref<Customer[]>([]);
	const loading = ref(false);
	const error = ref<string | null>(null);

	// Generar ID único para cliente
	const generateCustomerId = () => {
		return `customer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
	};

	// Obtener todos los clientes
	const getCustomers = async (activeOnly: boolean = true): Promise<Customer[]> => {
		loading.value = true;
		error.value = null;

		try {
			const query = activeOnly
				? "SELECT * FROM customers WHERE is_active = 1 ORDER BY name ASC"
				: "SELECT * FROM customers ORDER BY name ASC";

			const result = await execute(query);
			customers.value = result.rows as Customer[];
			return customers.value;
		} catch (err) {
			error.value = err instanceof Error ? err.message : "Error al obtener clientes";
			throw err;
		} finally {
			loading.value = false;
		}
	};

	// Crear cliente
	const createCustomer = async (data: CreateCustomerInput): Promise<Customer> => {
		loading.value = true;
		error.value = null;

		try {
			const customerId = generateCustomerId();
			const now = new Date().toISOString();

			const newCustomer: NewCustomer = {
				id: customerId,
				tenantId: data.tenantId || "default",
				name: data.name,
				email: data.email || null,
				phone: data.phone || null,
				address: data.address || null,
				loyaltyPoints: 0,
				isActive: data.isActive ?? true,
				createdAt: now,
				updatedAt: now,
				documentType: data.documentType || null,
				documentNumber: data.documentNumber || null,
				birthDate: data.birthDate || null,
				notes: data.notes || null
			};

			await execute(
				`INSERT INTO customers (id, tenant_id, name, email, phone, address, loyalty_points, is_active, created_at, updated_at, document_type, document_number, birth_date, notes)
				 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
				[
					newCustomer.id,
					newCustomer.tenantId,
					newCustomer.name,
					newCustomer.email,
					newCustomer.phone,
					newCustomer.address,
					0, // loyalty_points default value
					newCustomer.isActive ? 1 : 0,
					newCustomer.createdAt,
					newCustomer.updatedAt,
					newCustomer.documentType,
					newCustomer.documentNumber,
					newCustomer.birthDate,
					newCustomer.notes
				]
			);

			// Recargar lista de clientes
			await getCustomers();
			return newCustomer as Customer;
		} catch (err) {
			error.value = err instanceof Error ? err.message : "Error al crear cliente";
			throw err;
		} finally {
			loading.value = false;
		}
	};

	// Obtener cliente por ID
	const getCustomer = async (id: string): Promise<Customer | null> => {
		loading.value = true;
		error.value = null;

		try {
			const result = await execute(
				"SELECT * FROM customers WHERE id = ?",
				[id]
			);

			if (result.rows.length === 0) {
				return null;
			}

			return result.rows[0] as Customer;
		} catch (err) {
			error.value = err instanceof Error ? err.message : "Error al obtener cliente";
			throw err;
		} finally {
			loading.value = false;
		}
	};

	// Actualizar cliente
	const updateCustomer = async (id: string, data: UpdateCustomerInput): Promise<Customer> => {
		loading.value = true;
		error.value = null;

		try {
			const now = new Date().toISOString();

			// Construir query dinámicamente
			const updates: string[] = [];
			const values: any[] = [];

			if (data.name !== undefined) {
				updates.push("name = ?");
				values.push(data.name);
			}
			if (data.email !== undefined) {
				updates.push("email = ?");
				values.push(data.email || null);
			}
			if (data.phone !== undefined) {
				updates.push("phone = ?");
				values.push(data.phone || null);
			}
			if (data.address !== undefined) {
				updates.push("address = ?");
				values.push(data.address || null);
			}
			if (data.documentType !== undefined) {
				updates.push("document_type = ?");
				values.push(data.documentType || null);
			}
			if (data.documentNumber !== undefined) {
				updates.push("document_number = ?");
				values.push(data.documentNumber || null);
			}
			if (data.birthDate !== undefined) {
				updates.push("birth_date = ?");
				values.push(data.birthDate || null);
			}
			if (data.notes !== undefined) {
				updates.push("notes = ?");
				values.push(data.notes || null);
			}
			if (data.isActive !== undefined) {
				updates.push("is_active = ?");
				values.push(data.isActive ? 1 : 0);
			}

			updates.push("updated_at = ?");
			values.push(now);
			values.push(id);

			await execute(
				`UPDATE customers SET ${updates.join(", ")} WHERE id = ?`,
				values
			);

			// Recargar lista de clientes
			await getCustomers();

			// Retornar cliente actualizado
			const updatedCustomer = await getCustomer(id);
			if (!updatedCustomer) {
				throw new Error("Cliente no encontrado después de la actualización");
			}
			return updatedCustomer;
		} catch (err) {
			error.value = err instanceof Error ? err.message : "Error al actualizar cliente";
			throw err;
		} finally {
			loading.value = false;
		}
	};

	// Eliminar cliente (soft delete)
	const deleteCustomer = async (id: string): Promise<void> => {
		loading.value = true;
		error.value = null;

		try {
			await execute(
				"UPDATE customers SET is_active = 0, updated_at = ? WHERE id = ?",
				[new Date().toISOString(), id]
			);

			// Recargar lista de clientes
			await getCustomers();
		} catch (err) {
			error.value = err instanceof Error ? err.message : "Error al eliminar cliente";
			throw err;
		} finally {
			loading.value = false;
		}
	};

	// Buscar clientes
	const searchCustomers = async (query: string, activeOnly: boolean = true): Promise<Customer[]> => {
		loading.value = true;
		error.value = null;

		try {
			const searchQuery = activeOnly
				? `SELECT * FROM customers 
				   WHERE is_active = 1 AND (
					   name LIKE ? OR 
					   email LIKE ? OR 
					   phone LIKE ? OR 
					   document_number LIKE ?
				   ) 
				   ORDER BY name ASC`
				: `SELECT * FROM customers 
				   WHERE name LIKE ? OR 
					   email LIKE ? OR 
					   phone LIKE ? OR 
					   document_number LIKE ?
				   ORDER BY name ASC`;

			const searchTerm = `%${query}%`;
			const result = await execute(searchQuery, [searchTerm, searchTerm, searchTerm, searchTerm]);

			return result.rows as Customer[];
		} catch (err) {
			error.value = err instanceof Error ? err.message : "Error al buscar clientes";
			throw err;
		} finally {
			loading.value = false;
		}
	};

	// Obtener ventas de un cliente
	const getCustomerSales = async (customerId: string): Promise<CustomerSale[]> => {
		loading.value = true;
		error.value = null;

		try {
			const result = await execute(
				"SELECT * FROM customer_sales WHERE customer_id = ? ORDER BY created_at DESC",
				[customerId]
			);

			return result.rows as CustomerSale[];
		} catch (err) {
			error.value = err instanceof Error ? err.message : "Error al obtener ventas del cliente";
			throw err;
		} finally {
			loading.value = false;
		}
	};

	// Obtener estadísticas de un cliente
	const getCustomerStats = async (customerId: string): Promise<CustomerStats> => {
		loading.value = true;
		error.value = null;

		try {
			const result = await execute(
				`SELECT 
					COUNT(*) as totalSales,
					COALESCE(SUM(total_amount), 0) as totalAmount,
					COALESCE(AVG(total_amount), 0) as averageTicket,
					MAX(created_at) as lastSaleDate
				 FROM customer_sales 
				 WHERE customer_id = ?`,
				[customerId]
			);

			const stats = result.rows[0] as any;
			return {
				customerId,
				totalSales: stats.totalSales || 0,
				totalAmount: stats.totalAmount || 0,
				averageTicket: stats.averageTicket || 0,
				lastSaleDate: stats.lastSaleDate || null,
				currency: "BS" // Por defecto, se puede mejorar para soportar múltiples monedas
			};
		} catch (err) {
			error.value = err instanceof Error ? err.message : "Error al obtener estadísticas del cliente";
			throw err;
		} finally {
			loading.value = false;
		}
	};

	// Agregar venta a cliente
	const addCustomerSale = async (customerId: string, saleId: string, totalAmount: number, currency: string): Promise<void> => {
		loading.value = true;
		error.value = null;

		try {
			const customerSaleId = `cs_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
			const now = new Date().toISOString();

			await execute(
				`INSERT INTO customer_sales (id, customer_id, sale_id, total_amount, currency, created_at)
				 VALUES (?, ?, ?, ?, ?, ?)`,
				[customerSaleId, customerId, saleId, totalAmount, currency, now]
			);
		} catch (err) {
			error.value = err instanceof Error ? err.message : "Error al agregar venta al cliente";
			throw err;
		} finally {
			loading.value = false;
		}
	};

	// Computed properties
	const activeCustomers = computed(() => customers.value.filter((c) => c.isActive));
	const inactiveCustomers = computed(() => customers.value.filter((c) => !c.isActive));
	const totalCustomers = computed(() => customers.value.length);

	return {
		// State
		customers: readonly(customers),
		loading: readonly(loading),
		error: readonly(error),

		// Computed
		activeCustomers,
		inactiveCustomers,
		totalCustomers,

		// Methods
		createCustomer,
		getCustomers,
		getCustomer,
		updateCustomer,
		deleteCustomer,
		searchCustomers,
		getCustomerSales,
		getCustomerStats,
		addCustomerSale
	};
};
