export * from "./accounts";
export * from "./config";
export * from "./customers";
export * from "./inventory";
// Exportar todos los esquemas
export * from "./products";
export * from "./sales";

// Re-exportar tipos principales de cuentas y cierres de caja
export type {
	Account,
	CashClosing,
	CashSession,
	NewAccount,
	NewCashClosing,
	NewCashSession,
	NewTransaction,
	Transaction
} from "./accounts";

// Re-exportar tipos de productos (solo los que existen)
export type {
	Category,
	NewCategory,
	NewProduct,
	Product
} from "./products";

// Re-exportar tipos de clientes
export type {
	Customer,
	CustomerSale,
	NewCustomer,
	NewCustomerSale
} from "./customers";
