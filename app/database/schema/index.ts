export * from "./accounts";
export * from "./config";
export * from "./inventory";
// Exportar todos los esquemas
export * from "./products";
export * from "./sales";

// Re-exportar tipos principales
export type {
	Account,
	CashClosing,
	Category,
	Customer,
	ExchangeRate,
	InventoryMovement,
	InventoryStats,
	NewAccount,
	NewCashClosing,
	NewCategory,
	NewCustomer,
	NewExchangeRate,
	NewInventoryMovement,
	NewInventoryStats,
	NewProduct,
	NewSale,
	NewSaleItem,
	NewSyncQueue,
	NewSystemConfig,
	NewTransaction,
	Product,
	Sale,
	SaleItem,
	SyncQueue,
	SystemConfig,
	Transaction
} from "./products";
