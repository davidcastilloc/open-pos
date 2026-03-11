export * from "./accounts";
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
export * from "./config";
export type {
	Customer,
	CustomerSale,
	NewCustomer,
	NewCustomerSale
} from "./customers";
export * from "./inventory";
export * from "./products";
export type {
	Category,
	NewCategory,
	NewProduct,
	Product
} from "./products";

export * from "./returns";
// Re-exportar tipos de devoluciones
export type {
	NewReturn,
	NewReturnItem,
	NewReturnStatusHistory,
	NewReturnTransaction,
	Return,
	ReturnItem,
	ReturnStatusHistory,
	ReturnTransaction
} from "./returns";
export * from "./sales";

export * from "./users";

// Re-exportar tipos de usuarios
export type {
	NewUser,
	User
} from "./users";
